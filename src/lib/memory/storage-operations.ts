import { db } from "@/lib/storage/db";
import { getMemoryFacts, saveMemoryFact } from "@/lib/storage/memory";
import { abortedError, memoryError, type AppError } from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import type { ExtractedFact, MemoryFact } from "./types";

interface OperationOptions {
  signal?: AbortSignal;
}

const CONFLICT_BASELINE_CONFIDENCE = 0.75;

function assertNotAborted(options: OperationOptions = {}): void {
  if (options.signal?.aborted) {
    throw abortedError(options.signal.reason);
  }
}

function buildMemoryFact(fact: ExtractedFact, conversationId: string): Omit<MemoryFact, "id"> {
  const now = Date.now();

  return {
    fact: fact.fact,
    category: fact.category,
    confidence: fact.confidence,
    mentionCount: 1,
    firstSeen: now,
    lastSeen: now,
    lastSeenConversationId: conversationId,
    pinned: false,
  };
}

function isDuplicate(existing: MemoryFact, extracted: ExtractedFact): boolean {
  return existing.fact.trim().toLowerCase() === extracted.fact.trim().toLowerCase();
}

function isPotentialConflict(existing: MemoryFact, extracted: ExtractedFact): boolean {
  return existing.category === extracted.category && !isDuplicate(existing, extracted);
}

export async function mergeDuplicateFact(
  existing: MemoryFact,
  newFact: ExtractedFact,
  conversationId: string,
  options: OperationOptions = {}
): Promise<Result<MemoryFact, AppError>> {
  try {
    assertNotAborted(options);

    const merged: MemoryFact = {
      ...existing,
      confidence: Math.min(1, existing.confidence + 0.15),
      mentionCount: existing.mentionCount + 1,
      lastSeen: Date.now(),
      lastSeenConversationId: conversationId,
      category: newFact.category,
    };

    await db.memory.put(merged);
    return ok(merged);
  } catch (error) {
    return err(memoryError("Failed to merge duplicate memory fact", undefined, error));
  }
}

export async function resolveConflictingFact(
  existingId: string,
  newFact: ExtractedFact,
  conversationId: string,
  options: OperationOptions = {}
): Promise<Result<MemoryFact, AppError>> {
  try {
    assertNotAborted(options);

    const now = Date.now();
    const replacement: MemoryFact = {
      id: crypto.randomUUID(),
      fact: newFact.fact,
      category: newFact.category,
      confidence: CONFLICT_BASELINE_CONFIDENCE,
      mentionCount: 1,
      firstSeen: now,
      lastSeen: now,
      lastSeenConversationId: conversationId,
      pinned: false,
      updatesFactId: existingId,
    };

    await db.transaction("rw", db.memory, async () => {
      await db.memory.delete(existingId);
      await db.memory.put(replacement);
    });

    return ok(replacement);
  } catch (error) {
    return err(memoryError("Failed to resolve conflicting memory fact", undefined, error));
  }
}

export async function processExtractedFacts(
  facts: ExtractedFact[],
  conversationId: string,
  options: OperationOptions = {}
): Promise<Result<MemoryFact[], AppError>> {
  try {
    assertNotAborted(options);

    const currentFactsResult = await getMemoryFacts({ signal: options.signal });
    if (currentFactsResult.kind === "err") {
      return err(currentFactsResult.error);
    }

    const results: MemoryFact[] = [];
    const currentFacts = [...currentFactsResult.value];

    for (const fact of facts) {
      assertNotAborted(options);

      if (fact.updatesPrevious) {
        const conflicting = currentFacts.find((existing) => isPotentialConflict(existing, fact));

        if (conflicting) {
          const resolved = await resolveConflictingFact(
            conflicting.id,
            fact,
            conversationId,
            options
          );

          if (resolved.kind === "err") {
            return err(resolved.error);
          }

          results.push(resolved.value);
          continue;
        }
      }

      const duplicate = currentFacts.find((existing) => isDuplicate(existing, fact));
      if (duplicate) {
        const merged = await mergeDuplicateFact(duplicate, fact, conversationId, options);
        if (merged.kind === "err") {
          return err(merged.error);
        }

        results.push(merged.value);
        continue;
      }

      const saved = await saveMemoryFact(buildMemoryFact(fact, conversationId), options);
      if (saved.kind === "err") {
        return err(saved.error);
      }

      results.push(saved.value);
    }

    return ok(results);
  } catch (error) {
    return err(memoryError("Failed to process extracted memory facts", undefined, error));
  }
}
