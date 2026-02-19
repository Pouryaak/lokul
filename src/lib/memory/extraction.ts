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

const FACT_FALLBACK_REGEX =
  /"fact"\s*:\s*"((?:\\.|[^"\\])*)"[\s\S]*?"category"\s*:\s*"(identity|preference|project|identity\|preference\|project)"[\s\S]*?"confidence"\s*:\s*("high"|"medium"|"low"|-?\d+(?:\.\d+)?)/gi;

function inferCategoryFromFact(fact: string): ExtractedFact["category"] {
  const normalized = fact.toLowerCase();

  if (
    normalized.includes("my name") ||
    normalized.includes("i am") ||
    normalized.includes("i'm") ||
    normalized.includes("i live")
  ) {
    return "identity";
  }

  if (
    normalized.includes("project") ||
    normalized.includes("job") ||
    normalized.includes("career") ||
    normalized.includes("apply") ||
    normalized.includes("visa") ||
    normalized.includes("move") ||
    normalized.includes("goal") ||
    normalized.includes("planning")
  ) {
    return "project";
  }

  return "preference";
}

function toConfidence(value: unknown): number | null {
  if (typeof value === "number") {
    return Math.max(0, Math.min(1, value));
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "high") {
    return 0.9;
  }

  if (normalized === "medium") {
    return 0.6;
  }

  if (normalized === "low") {
    return 0.3;
  }

  const numeric = Number(normalized);
  if (Number.isNaN(numeric)) {
    return null;
  }

  return Math.max(0, Math.min(1, numeric));
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

      const normalizedFact = fact.fact.trim();
      const shouldInferCategory =
        typeof fact.category === "string" &&
        fact.category.toLowerCase() === "identity|preference|project";
      const category = isValidCategory(fact.category)
        ? fact.category
        : shouldInferCategory
          ? inferCategoryFromFact(normalizedFact)
          : null;

      if (!category) {
        return null;
      }

      const confidence = toConfidence(fact.confidence);
      if (confidence === null) {
        return null;
      }

      const normalizedConfidence = shouldInferCategory && confidence <= 0 ? 0.8 : confidence;

      return {
        fact: normalizedFact,
        category,
        confidence: normalizedConfidence,
        updatesPrevious: fact.updates_previous === true || fact.updates_previous === "true",
      };
    })
    .filter((fact): fact is ExtractedFact => fact !== null && fact.fact.length > 0);
}

function normalizePayload(candidate: unknown): ParsedExtractionPayload | null {
  if (Array.isArray(candidate)) {
    return { facts: candidate };
  }

  if (candidate && typeof candidate === "object") {
    return candidate as ParsedExtractionPayload;
  }

  return null;
}

function extractCodeFenceJSON(content: string): string | null {
  const match = content.match(/```(?:json)?\s*([\s\S]*?)```/i);
  return match?.[1]?.trim() ?? null;
}

function decodeQuotedText(value: string): string {
  try {
    return JSON.parse(`"${value}"`) as string;
  } catch {
    return value;
  }
}

function salvageFactsFromText(content: string): ExtractedFact[] {
  const facts: ExtractedFact[] = [];

  for (const match of content.matchAll(FACT_FALLBACK_REGEX)) {
    const rawFact = match[1];
    const categoryRaw = match[2];
    const rawConfidence = match[3].replace(/^"|"$/g, "");
    const confidence = toConfidence(rawConfidence);
    const fact = decodeQuotedText(rawFact).trim();
    const shouldInferCategory = categoryRaw.toLowerCase() === "identity|preference|project";
    const category = isValidCategory(categoryRaw)
      ? categoryRaw
      : shouldInferCategory
        ? inferCategoryFromFact(fact)
        : null;

    if (!category || confidence === null) {
      continue;
    }

    if (!fact) {
      continue;
    }

    const tail = content.slice(match.index, match.index + match[0].length + 80);
    const updatesPrevious = /"updates_previous"\s*:\s*(true|"true")/i.test(tail);

    facts.push({
      fact,
      category,
      confidence: shouldInferCategory && confidence <= 0 ? 0.8 : confidence,
      updatesPrevious,
    });
  }

  return facts;
}

function extractJSONSlice(content: string): string | null {
  const firstObject = content.indexOf("{");
  const firstArray = content.indexOf("[");
  const objectStart = firstObject >= 0 ? firstObject : Number.MAX_SAFE_INTEGER;
  const arrayStart = firstArray >= 0 ? firstArray : Number.MAX_SAFE_INTEGER;
  const start = Math.min(objectStart, arrayStart);

  if (start === Number.MAX_SAFE_INTEGER) {
    return null;
  }

  const objectEnd = content.lastIndexOf("}");
  const arrayEnd = content.lastIndexOf("]");
  const end = Math.max(objectEnd, arrayEnd);

  if (end < start) {
    return null;
  }

  return content.slice(start, end + 1).trim();
}

function tryParseExtraction(content: string): ExtractedFact[] {
  const trimmed = content.trim();
  const fenced = extractCodeFenceJSON(trimmed);
  const sliced = extractJSONSlice(trimmed);
  const candidates = [trimmed, fenced, sliced].filter(
    (value): value is string => typeof value === "string" && value.length > 0
  );

  for (const candidate of candidates) {
    try {
      const parsed = normalizePayload(JSON.parse(candidate));
      if (!parsed) {
        continue;
      }

      const facts = normalizeExtractedFacts(parsed);
      if (facts.length > 0) {
        return facts;
      }

      if (Array.isArray(parsed.facts) && parsed.facts.length === 0) {
        return [];
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[Memory] Extraction JSON parse failed", error);
      }
    }
  }

  const salvaged = salvageFactsFromText(trimmed);
  if (salvaged.length > 0) {
    if (import.meta.env.DEV) {
      console.info(`[Memory] Salvaged ${salvaged.length} fact(s) from non-JSON extraction output`);
    }
    return salvaged;
  }

  if (import.meta.env.DEV) {
    console.warn("[Memory] Extraction response did not include parseable facts", {
      preview: trimmed.slice(0, 200),
    });
  }

  return [];
}

export function createExtractionPrompt(
  messages: Message[]
): Array<{ role: "system" | "user" | "assistant"; content: string }> {
  const userTurns = messages
    .filter((message) => message.role === "user")
    .slice(-8)
    .map((message) => `- ${message.content.trim()}`)
    .filter((line) => line.length > 2)
    .join("\n");

  const systemPrompt =
    "You are a fact extractor. " +
    'Return ONLY minified JSON with this structure: {"facts":[{"fact":"short statement","category":"project","confidence":0.85,"updates_previous":false}]}. ' +
    'For each fact, category must be exactly one of "identity", "preference", or "project". ' +
    "Rules: use only user-authored statements, keep fact text under 12 words, extract at most 5 facts, and set updates_previous=true only for contradictions against earlier user statements. " +
    'If no reliable facts are present, return {"facts":[]}. ' +
    "Output raw JSON only. No prose, no markdown, no code fences.";

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content: `Extract memorable facts from these user messages:\n\n${userTurns}\n\nJSON:`,
    },
  ];
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
  const userMessageCount = messages.filter((message) => message.role === "user").length;

  if (userMessageCount < 2) {
    return ok([]);
  }

  if (options.signal?.aborted) {
    return err(abortedError(options.signal.reason));
  }

  const extractionPrompt = createExtractionPrompt(messages);

  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      const completion = await engine.chat.completions.create({
        messages: extractionPrompt,
        temperature: 0.1,
        max_tokens: 800,
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
      const rawMessage =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : typeof error === "string"
            ? error
            : JSON.stringify(error);
      const isTransient =
        rawMessage.includes("MessageOrderError") ||
        rawMessage.includes("Message error should not be 0");

      if (attempt === 0 && isTransient) {
        if (import.meta.env.DEV) {
          console.warn("[Memory] Transient extraction error, retrying once", rawMessage);
        }
        await new Promise((resolve) => {
          window.setTimeout(resolve, 120);
        });
        continue;
      }

      return err(memoryExtractionError("Failed to extract facts from conversation", error));
    }
  }

  return err(memoryExtractionError("Failed to extract facts from conversation"));
}
