import * as tokenlens from "tokenlens";
import type { Message as InferenceMessage } from "@/lib/ai/inference";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";

const DEFAULT_SYSTEM_PROMPT = "You are Lokul, a privacy-first AI assistant.";
const OUTPUT_RESERVE_TOKENS = 1000;
const MEMORY_MIN_TOKENS = 150;
const MEMORY_MAX_TOKENS = 500;
const MEMORY_STOP_MARGIN_TOKENS = 50;

const CONTEXT_WINDOW_FALLBACK: Record<string, number> = {
  "phi-2-q4f16_1-MLC": 2048,
  "Llama-3.2-3B-Instruct-q4f16_1-MLC": 8192,
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC": 8192,
  "Llama-3.1-8B-Instruct-q4f16_1-MLC": 8192,
  "Llama-3.1-8B-Instruct-q4f32_1-MLC": 8192,
};

type TokenlensApi = {
  modelMeta?: (modelId: string) => { contextWindow?: number } | undefined;
  percentOfContextUsed?: (...args: unknown[]) => number;
};

interface BuildContextOptions {
  currentMessage?: string;
  baseSystemPrompt?: string;
}

interface BuildContextResult {
  messages: InferenceMessage[];
  memoryTokens: number;
  totalTokens: number;
  percentUsed: number;
}

function getModelContextWindow(modelId: string): number {
  const api = tokenlens as TokenlensApi;
  const fromMeta = api.modelMeta?.(modelId)?.contextWindow;

  if (typeof fromMeta === "number" && fromMeta > 0) {
    return fromMeta;
  }

  return CONTEXT_WINDOW_FALLBACK[modelId] ?? 4096;
}

function categoryPriority(category: MemoryCategory): number {
  if (category === "project") {
    return 3;
  }

  if (category === "preference") {
    return 2;
  }

  return 1;
}

function computeKeywordBoost(fact: MemoryFact, currentMessage?: string): number {
  if (!currentMessage || currentMessage.trim().length === 0) {
    return 0;
  }

  const query = currentMessage.toLowerCase();
  const words = fact.fact
    .toLowerCase()
    .split(/\W+/)
    .filter((word) => word.length > 3);
  const matches = words.filter((word) => query.includes(word)).length;
  return Math.min(matches * 0.05, 0.25);
}

function getMemoryScore(fact: MemoryFact, currentMessage?: string): number {
  const pinnedBoost = fact.pinned ? 5 : 0;
  const priorityBoost = categoryPriority(fact.category);
  const confidenceBoost = Math.max(0, Math.min(fact.confidence, 1));
  const recencyBoost = fact.lastSeen / 1_000_000_000_000;
  const keywordBoost = computeKeywordBoost(fact, currentMessage);

  return pinnedBoost + priorityBoost + confidenceBoost + recencyBoost + keywordBoost;
}

function countConversationTokens(messages: InferenceMessage[]): number {
  return messages.reduce((sum, message) => sum + estimateTokens(message.content), 0);
}

function calculatePercentUsed(modelId: string, totalTokens: number): number {
  const api = tokenlens as TokenlensApi;

  if (typeof api.percentOfContextUsed === "function") {
    try {
      const percent = api.percentOfContextUsed(modelId, totalTokens);
      if (typeof percent === "number" && Number.isFinite(percent)) {
        return Math.max(0, Math.min(100, percent));
      }
    } catch {
      // Fall back to static context window calculation.
    }
  }

  const contextWindow = getModelContextWindow(modelId);
  return Math.max(0, Math.min(100, (totalTokens / contextWindow) * 100));
}

export function estimateTokens(text: string): number {
  if (!text) {
    return 0;
  }

  return Math.ceil(text.length / 4);
}

export function calculateMemoryBudget(
  modelId: string,
  conversationTokens: number,
  reserveOutput: number = OUTPUT_RESERVE_TOKENS
): number {
  const contextWindow = getModelContextWindow(modelId);
  const available = Math.max(0, contextWindow - conversationTokens - reserveOutput);
  const idealBudget = Math.floor(available * 0.25);

  return Math.max(MEMORY_MIN_TOKENS, Math.min(MEMORY_MAX_TOKENS, idealBudget));
}

export function selectMemoriesForInjection(
  memories: MemoryFact[],
  budgetTokens: number,
  currentMessage?: string
): MemoryFact[] {
  const sorted = [...memories].sort(
    (left, right) => getMemoryScore(right, currentMessage) - getMemoryScore(left, currentMessage)
  );

  const selected: MemoryFact[] = [];
  let runningTokens = 0;

  for (const memory of sorted) {
    const memoryTokens = estimateTokens(memory.fact) + 2;
    if (runningTokens + memoryTokens > budgetTokens - MEMORY_STOP_MARGIN_TOKENS) {
      break;
    }

    selected.push(memory);
    runningTokens += memoryTokens;
  }

  return selected;
}

export function formatMemoryForPrompt(memories: MemoryFact[]): string {
  if (memories.length === 0) {
    return "";
  }

  const grouped = memories.reduce<Record<MemoryCategory, MemoryFact[]>>(
    (acc, memory) => {
      acc[memory.category].push(memory);
      return acc;
    },
    { project: [], preference: [], identity: [] }
  );

  const lines = ["## What you know about this user", ""];

  if (grouped.project.length > 0) {
    lines.push("Current work:");
    grouped.project.forEach((fact) => lines.push(`- ${fact.fact}`));
    lines.push("");
  }

  if (grouped.preference.length > 0) {
    lines.push("Preferences:");
    grouped.preference.forEach((fact) => lines.push(`- ${fact.fact}`));
    lines.push("");
  }

  if (grouped.identity.length > 0) {
    lines.push("About user:");
    grouped.identity.forEach((fact) => lines.push(`- ${fact.fact}`));
    lines.push("");
  }

  return lines.join("\n").trim();
}

export function buildContextWithMemory(
  messages: InferenceMessage[],
  memories: MemoryFact[],
  modelId: string,
  options: BuildContextOptions = {}
): BuildContextResult {
  const conversationMessages = messages.filter((message) => message.role !== "system");
  const conversationTokens = countConversationTokens(conversationMessages);
  const memoryBudget = calculateMemoryBudget(modelId, conversationTokens);
  const selectedMemories = selectMemoriesForInjection(
    memories,
    memoryBudget,
    options.currentMessage
  );
  const memoryPrompt = formatMemoryForPrompt(selectedMemories);
  const baseSystemPrompt = options.baseSystemPrompt?.trim() || DEFAULT_SYSTEM_PROMPT;
  const systemPrompt = memoryPrompt ? `${baseSystemPrompt}\n\n${memoryPrompt}` : baseSystemPrompt;

  const finalMessages: InferenceMessage[] = [
    { role: "system", content: systemPrompt },
    ...conversationMessages,
  ];
  const memoryTokens = estimateTokens(memoryPrompt);
  const totalTokens = countConversationTokens(finalMessages);

  return {
    messages: finalMessages,
    memoryTokens,
    totalTokens,
    percentUsed: calculatePercentUsed(modelId, totalTokens),
  };
}
