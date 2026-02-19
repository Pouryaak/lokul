import { useEffect, useState } from "react";
import * as tokenlens from "tokenlens";
import type { Message as InferenceMessage } from "@/lib/ai/inference";
import type { MemoryFact } from "@/lib/memory/types";
import {
  buildContextWithMemory,
  calculateMemoryBudget,
  estimateTokens,
} from "@/lib/memory/context-builder";

const COMPACTION_THRESHOLD = 0.8;
const MESSAGES_TO_KEEP_START = 2;
const MESSAGES_TO_KEEP_END = 6;

const CONTEXT_WINDOW_FALLBACK: Record<string, number> = {
  "phi-2-q4f16_1-MLC": 2048,
  "Llama-3.2-3B-Instruct-q4f16_1-MLC": 8192,
  "Mistral-7B-Instruct-v0.3-q4f16_1-MLC": 8192,
  "Llama-3.1-8B-Instruct-q4f16_1-MLC": 8192,
  "Llama-3.1-8B-Instruct-q4f32_1-MLC": 8192,
};

type TokenlensApi = {
  modelMeta?: (modelId: string) => { contextWindow?: number } | undefined;
};

interface CompactionSnapshot {
  stage: "stage1" | "stage2";
  savedTokens: number;
}

let lastCompactionSnapshot: CompactionSnapshot | null = null;
const listeners = new Set<(snapshot: CompactionSnapshot | null) => void>();

function getModelContextWindow(modelId: string): number {
  const api = tokenlens as TokenlensApi;
  const contextWindow = api.modelMeta?.(modelId)?.contextWindow;

  if (typeof contextWindow === "number" && contextWindow > 0) {
    return contextWindow;
  }

  return CONTEXT_WINDOW_FALLBACK[modelId] ?? 4096;
}

function publishCompaction(stage: "stage1" | "stage2", savedTokens: number): void {
  lastCompactionSnapshot = { stage, savedTokens };
  listeners.forEach((listener) => listener(lastCompactionSnapshot));
}

export function shouldCompact(totalTokens: number, contextWindow: number): boolean {
  if (contextWindow <= 0) {
    return false;
  }

  return totalTokens / contextWindow >= COMPACTION_THRESHOLD;
}

export function stageOneTrimHistory(messages: InferenceMessage[]): {
  messages: InferenceMessage[];
  trimmed: number;
} {
  if (messages.length <= MESSAGES_TO_KEEP_START + MESSAGES_TO_KEEP_END) {
    return { messages, trimmed: 0 };
  }

  const start = messages.slice(0, MESSAGES_TO_KEEP_START);
  const end = messages.slice(-MESSAGES_TO_KEEP_END);
  const trimmedMessages = [...start, ...end.filter((message) => !start.includes(message))];

  return {
    messages: trimmedMessages,
    trimmed: Math.max(0, messages.length - trimmedMessages.length),
  };
}

export function stageTwoReduceMemory(
  memories: MemoryFact[],
  targetBudget: number
): { memories: MemoryFact[]; reduction: number } {
  const pinned = memories.filter((fact) => fact.pinned);
  const projects = memories.filter((fact) => !fact.pinned && fact.category === "project");
  const highConfidencePreferences = memories
    .filter((fact) => !fact.pinned && fact.category === "preference" && fact.confidence > 0.8)
    .sort((left, right) => right.confidence - left.confidence || right.lastSeen - left.lastSeen);
  const preferencesToKeep = highConfidencePreferences.slice(
    0,
    Math.ceil(highConfidencePreferences.length / 2)
  );

  const prioritized = [...pinned, ...projects, ...preferencesToKeep];
  const kept: MemoryFact[] = [];
  let tokenCount = 0;

  for (const memory of prioritized) {
    const memoryTokens = estimateTokens(memory.fact) + 2;
    if (tokenCount + memoryTokens > targetBudget) {
      continue;
    }

    kept.push(memory);
    tokenCount += memoryTokens;
  }

  return {
    memories: kept,
    reduction: Math.max(0, memories.length - kept.length),
  };
}

export function compactContext(
  messages: InferenceMessage[],
  memories: MemoryFact[],
  modelId: string,
  options: {
    baseSystemPrompt?: string;
  } = {}
): {
  messages: InferenceMessage[];
  memories: MemoryFact[];
  stage: "none" | "stage1" | "stage2";
  memoryTokens: number;
  totalTokens: number;
  percentUsed: number;
} {
  const contextWindow = getModelContextWindow(modelId);
  const initial = buildContextWithMemory(messages, memories, modelId, {
    baseSystemPrompt: options.baseSystemPrompt,
  });

  if (!shouldCompact(initial.totalTokens, contextWindow)) {
    return { ...initial, memories, stage: "none" };
  }

  const trimmed = stageOneTrimHistory(messages);
  if (import.meta.env.DEV) {
    console.info(`[Memory] Stage 1 compaction trimmed ${trimmed.trimmed} messages`);
  }

  const stageOne = buildContextWithMemory(trimmed.messages, memories, modelId, {
    baseSystemPrompt: options.baseSystemPrompt,
  });
  publishCompaction("stage1", Math.max(0, initial.totalTokens - stageOne.totalTokens));

  if (!shouldCompact(stageOne.totalTokens, contextWindow)) {
    return { ...stageOne, memories, stage: "stage1" };
  }

  const memoryBudget = calculateMemoryBudget(modelId, stageOne.totalTokens);
  const reduced = stageTwoReduceMemory(memories, memoryBudget);
  if (import.meta.env.DEV) {
    console.info(`[Memory] Stage 2 compaction reduced ${reduced.reduction} memory facts`);
  }

  const stageTwo = buildContextWithMemory(trimmed.messages, reduced.memories, modelId, {
    baseSystemPrompt: options.baseSystemPrompt,
  });
  publishCompaction("stage2", Math.max(0, stageOne.totalTokens - stageTwo.totalTokens));

  return { ...stageTwo, memories: reduced.memories, stage: "stage2" };
}

export function useCompactionStatus(): {
  isCompacting: boolean;
  lastCompaction: { stage: string; savedTokens: number } | null;
} {
  const [snapshot, setSnapshot] = useState<CompactionSnapshot | null>(lastCompactionSnapshot);

  useEffect(() => {
    listeners.add(setSnapshot);
    return () => {
      listeners.delete(setSnapshot);
    };
  }, []);

  return {
    isCompacting: snapshot !== null,
    lastCompaction: snapshot,
  };
}
