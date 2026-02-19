import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import type { Message } from "@/types/index";
import { abortedError, memoryExtractionError, type AppError } from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import type { ExtractedFact } from "./types";

interface ParsedExtractionPayload {
  facts?: Array<{
    fact?: unknown;
    category?: unknown;
    confidence?: unknown;
    updates_previous?: unknown;
  }>;
}

function isValidCategory(value: unknown): value is ExtractedFact["category"] {
  return value === "identity" || value === "preference" || value === "project";
}

function normalizeExtractedFacts(payload: ParsedExtractionPayload): ExtractedFact[] {
  if (!Array.isArray(payload.facts)) {
    return [];
  }

  return payload.facts
    .map((fact): ExtractedFact | null => {
      if (typeof fact.fact !== "string") {
        return null;
      }

      if (!isValidCategory(fact.category)) {
        return null;
      }

      if (typeof fact.confidence !== "number") {
        return null;
      }

      return {
        fact: fact.fact.trim(),
        category: fact.category,
        confidence: Math.max(0, Math.min(1, fact.confidence)),
        updatesPrevious: fact.updates_previous === true,
      };
    })
    .filter((fact): fact is ExtractedFact => fact !== null && fact.fact.length > 0);
}

function tryParseExtraction(content: string): ExtractedFact[] {
  try {
    const parsed = JSON.parse(content) as ParsedExtractionPayload;
    return normalizeExtractedFacts(parsed);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("[Memory] Extraction JSON parse failed", error);
    }

    return [];
  }
}

function toPromptMessages(
  messages: Message[]
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  return messages.slice(-10).map((message) => ({
    role: message.role,
    content: message.content,
  }));
}

export function createExtractionPrompt(
  messages: Message[]
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const systemPrompt =
    "Extract memorable facts from this conversation. " +
    'Return ONLY a JSON object with format: {"facts": [{"fact": "...", "category": "identity|preference|project", "confidence": 0.0-1.0, "updates_previous": false}]}. ' +
    "Rules: only include high-confidence facts stated directly by the user; identity = personal info, preference = likes/dislikes and style, project = current work/goals/tasks; set updates_previous to true for contradictions.";

  return [{ role: "system", content: systemPrompt }, ...toPromptMessages(messages)];
}

export async function extractFacts(
  engine: MLCEngineInterface,
  messages: Message[],
  options: {
    minConfidence?: number;
    signal?: AbortSignal;
  } = {}
): Promise<Result<ExtractedFact[], AppError>> {
  const minConfidence = options.minConfidence ?? 0.75;

  if (messages.length < 2) {
    return ok([]);
  }

  if (options.signal?.aborted) {
    return err(abortedError(options.signal.reason));
  }

  try {
    const completion = await engine.chat.completions.create({
      messages: createExtractionPrompt(messages),
      temperature: 0.1,
      max_tokens: 500,
      stream: false,
    });

    if (options.signal?.aborted) {
      return err(abortedError(options.signal.reason));
    }

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return ok([]);
    }

    const parsedFacts = tryParseExtraction(content);
    const filtered = parsedFacts.filter((fact) => fact.confidence >= minConfidence);
    return ok(filtered);
  } catch (error) {
    return err(memoryExtractionError("Failed to extract facts from conversation", error));
  }
}
