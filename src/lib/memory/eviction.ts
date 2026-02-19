import { db } from "@/lib/storage/db";
import { abortedError, memoryError, type AppError } from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import type { MemoryCategory, MemoryFact } from "./types";

const HARD_CAP = 150;
const PRUNE_THRESHOLD = 120;
const MAX_PINNED = 10;

const CATEGORY_EXPIRY: Record<MemoryCategory, number> = {
  project: 60 * 24 * 60 * 60 * 1000,
  preference: 180 * 24 * 60 * 60 * 1000,
  identity: 365 * 24 * 60 * 60 * 1000,
};

const CATEGORY_WEIGHTS: Record<MemoryCategory, number> = {
  project: 0.8,
  preference: 0.3,
  identity: 0.5,
};

function assertNotAborted(signal?: AbortSignal): void {
  if (signal?.aborted) {
    throw abortedError(signal.reason);
  }
}

export function calculateEvictionScore(fact: MemoryFact): number {
  const ageInDays = Math.max(0, (Date.now() - fact.lastSeen) / (24 * 60 * 60 * 1000));
  const weight = CATEGORY_WEIGHTS[fact.category];
  const confidence = Math.max(fact.confidence, 0.01);
  return (ageInDays * weight) / confidence;
}

export async function evictFactsIfNeeded(
  options: { signal?: AbortSignal } = {}
): Promise<Result<{ evicted: number; remaining: number }, AppError>> {
  try {
    assertNotAborted(options.signal);
    const allFacts = await db.memory.toArray();
    assertNotAborted(options.signal);

    if (allFacts.length <= PRUNE_THRESHOLD) {
      return ok({ evicted: 0, remaining: allFacts.length });
    }

    const pinned = allFacts.filter((fact) => fact.pinned);
    const nonPinned = allFacts
      .filter((fact) => !fact.pinned)
      .sort((left, right) => calculateEvictionScore(right) - calculateEvictionScore(left));

    if (import.meta.env.DEV && pinned.length > MAX_PINNED) {
      console.warn(
        `[Memory] Pinned facts exceed soft cap (${pinned.length}/${MAX_PINNED}); skipping pinned eviction.`
      );
    }

    const targetRemovals = Math.max(0, allFacts.length - HARD_CAP);
    const idsToDelete = nonPinned.slice(0, targetRemovals).map((fact) => fact.id);

    if (idsToDelete.length > 0) {
      await db.memory.bulkDelete(idsToDelete);
    }

    const remaining = Math.max(0, allFacts.length - idsToDelete.length);
    return ok({ evicted: idsToDelete.length, remaining });
  } catch (error) {
    return err(memoryError("Failed to evict memory facts", undefined, error));
  }
}

export async function pruneExpiredFacts(
  options: { signal?: AbortSignal } = {}
): Promise<Result<number, AppError>> {
  try {
    assertNotAborted(options.signal);
    const now = Date.now();
    const facts = await db.memory.toArray();
    assertNotAborted(options.signal);

    const expiredIds = facts
      .filter((fact) => {
        if (fact.pinned) {
          return false;
        }

        const expiryWindow = CATEGORY_EXPIRY[fact.category];
        return now - fact.lastSeen > expiryWindow;
      })
      .map((fact) => fact.id);

    if (expiredIds.length > 0) {
      await db.memory.bulkDelete(expiredIds);
    }

    return ok(expiredIds.length);
  } catch (error) {
    return err(memoryError("Failed to prune expired memory facts", undefined, error));
  }
}
