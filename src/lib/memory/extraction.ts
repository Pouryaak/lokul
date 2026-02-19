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
  /"fact"\s*:\s*"((?:\\.|[^"\\])*)"[\s\S]*?"category"\s*:\s*"(identity|preference|project)"[\s\S]*?"confidence"\s*:\s*("high"|"medium"|"low"|-?\d+(?:\.\d+)?)/gi;

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

      if (!isValidCategory(fact.category)) {
        return null;
      }

      const confidence = toConfidence(fact.confidence);
      if (confidence === null) {
        return null;
      }

      return {
        fact: fact.fact.trim(),
        category: fact.category,
        confidence,
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
    const category = match[2];
    const rawConfidence = match[3].replace(/^"|"$/g, "");
    const confidence = toConfidence(rawConfidence);

    if (!isValidCategory(category) || confidence === null) {
      continue;
    }

    const fact = decodeQuotedText(rawFact).trim();
    if (!fact) {
      continue;
    }

    const tail = content.slice(match.index, match.index + match[0].length + 80);
    const updatesPrevious = /"updates_previous"\s*:\s*(true|"true")/i.test(tail);

    facts.push({
      fact,
      category,
      confidence,
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
  const systemPrompt =
    "Extract memorable facts from this conversation. " +
    'Return ONLY minified JSON with format: {"facts":[{"fact":"...","category":"identity|preference|project","confidence":0.0-1.0,"updates_previous":false}]}. ' +
    "Never include prose, markdown, code fences, or explanations. " +
    "Rules: include at most 3 high-confidence facts stated directly by the user; identity = personal info, preference = likes/dislikes and style, project = current work/goals/tasks; set updates_previous to true for contradictions.";

  const transcript = messages
    .slice(-10)
    .map((message) => `${message.role.toUpperCase()}: ${message.content}`)
    .join("\n\n");

  return [
    { role: "system", content: systemPrompt },
    {
      role: "user",
      content:
        "Conversation transcript:\n" +
        transcript +
        "\n\nReturn ONLY the JSON object. Do not add prose.",
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
      response_format: { type: "json_object" },
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
