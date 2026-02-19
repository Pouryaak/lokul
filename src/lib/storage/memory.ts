import { db } from "./db";
import {
  abortedError,
  isAppError,
  memoryError,
  memoryQuotaExceededError,
  type AppError,
} from "@/lib/utils/errors";
import { runMemoryMaintenance } from "@/lib/memory/eviction";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";
import { err, ok, type Result } from "@/types/result";

interface MemoryOperationOptions {
  signal?: AbortSignal;
}

function assertNotAborted(options: MemoryOperationOptions = {}): void {
  if (options.signal?.aborted) {
    throw abortedError(options.signal.reason);
  }
}

function toMemoryError(error: unknown, message: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "QuotaExceededError" || error.message.toLowerCase().includes("quota")) {
      return memoryQuotaExceededError(error.message, error);
    }

    return memoryError(message, error.message, error);
  }

  return memoryError(message, undefined, error);
}

async function runMaintenanceAfterWrite(signal?: AbortSignal): Promise<void> {
  const maintenanceResult = await runMemoryMaintenance({ signal });

  if (maintenanceResult.kind === "err") {
    if (import.meta.env.DEV) {
      console.warn("[Memory] Maintenance failed after write", maintenanceResult.error);
    }
    return;
  }

  if (import.meta.env.DEV) {
    const { pruned, evicted, remaining } = maintenanceResult.value;
    console.info(
      `[Memory] Maintenance complete after write: pruned=${pruned}, evicted=${evicted}, remaining=${remaining}`
    );
  }
}

export function normalizeFactText(text: string): string {
  return text.trim().replace(/\s+/g, " ").toLowerCase();
}

export function isExactDuplicate(fact1: string, fact2: string): boolean {
  return normalizeFactText(fact1) === normalizeFactText(fact2);
}

export function mergeFacts(existing: MemoryFact, newFact: Omit<MemoryFact, "id">): MemoryFact {
  return {
    ...existing,
    confidence: Math.min(1, Math.max(existing.confidence, newFact.confidence) + 0.15),
    mentionCount: existing.mentionCount + 1,
    lastSeen: Math.max(existing.lastSeen, newFact.lastSeen),
    lastSeenConversationId: newFact.lastSeenConversationId,
    category: newFact.category,
    updatesFactId: newFact.updatesFactId,
  };
}

export async function saveMemoryFact(
  fact: Omit<MemoryFact, "id">,
  options: MemoryOperationOptions = {}
): Promise<Result<MemoryFact, AppError>> {
  try {
    assertNotAborted(options);

    const result = await db.transaction("rw", db.memory, async () => {
      assertNotAborted(options);
      const existingFacts = await db.memory.toArray();
      assertNotAborted(options);

      const duplicate = existingFacts.find((current) => isExactDuplicate(current.fact, fact.fact));
      if (duplicate) {
        const merged = mergeFacts(duplicate, fact);
        await db.memory.put(merged);

        if (import.meta.env.DEV) {
          console.info(`[Memory] Merged duplicate fact: ${duplicate.id}`);
        }

        return merged;
      }

      const nextFact: MemoryFact = {
        id: crypto.randomUUID(),
        ...fact,
      };

      await db.memory.put(nextFact);

      if (import.meta.env.DEV) {
        console.info(`[Memory] Saved fact: ${nextFact.id}`);
      }

      return nextFact;
    });

    await runMaintenanceAfterWrite(options.signal);
    return ok(result);
  } catch (error) {
    return err(toMemoryError(error, "Failed to save memory fact"));
  }
}

export async function getMemoryFacts(
  options: { category?: MemoryCategory; signal?: AbortSignal } = {}
): Promise<Result<MemoryFact[], AppError>> {
  try {
    assertNotAborted(options);

    const facts = options.category
      ? await db.memory.where("category").equals(options.category).toArray()
      : await db.memory.orderBy("lastSeen").reverse().toArray();

    assertNotAborted(options);
    return ok(facts);
  } catch (error) {
    return err(toMemoryError(error, "Failed to get memory facts"));
  }
}

export async function getMemoryFact(
  id: string,
  options: MemoryOperationOptions = {}
): Promise<Result<MemoryFact | undefined, AppError>> {
  try {
    assertNotAborted(options);
    const fact = await db.memory.get(id);
    assertNotAborted(options);
    return ok(fact);
  } catch (error) {
    return err(toMemoryError(error, `Failed to get memory fact: ${id}`));
  }
}

export async function updateMemoryFact(
  id: string,
  updates: Partial<Omit<MemoryFact, "id">>,
  options: MemoryOperationOptions = {}
): Promise<Result<MemoryFact, AppError>> {
  try {
    assertNotAborted(options);

    const existing = await db.memory.get(id);
    if (!existing) {
      return err(memoryError(`Memory fact not found: ${id}`));
    }

    const updated: MemoryFact = {
      ...existing,
      ...updates,
      id,
    };

    await db.memory.put(updated);

    if (import.meta.env.DEV) {
      console.info(`[Memory] Updated fact: ${id}`);
    }

    return ok(updated);
  } catch (error) {
    return err(toMemoryError(error, `Failed to update memory fact: ${id}`));
  }
}

export async function deleteMemoryFact(
  id: string,
  options: MemoryOperationOptions = {}
): Promise<Result<void, AppError>> {
  try {
    assertNotAborted(options);
    await db.memory.delete(id);

    if (import.meta.env.DEV) {
      console.info(`[Memory] Deleted fact: ${id}`);
    }

    return ok(undefined);
  } catch (error) {
    return err(toMemoryError(error, `Failed to delete memory fact: ${id}`));
  }
}

export async function clearAllMemory(
  options: MemoryOperationOptions = {}
): Promise<Result<void, AppError>> {
  try {
    assertNotAborted(options);
    await db.memory.clear();

    if (import.meta.env.DEV) {
      console.info("[Memory] Cleared all memory facts");
    }

    return ok(undefined);
  } catch (error) {
    return err(toMemoryError(error, "Failed to clear memory facts"));
  }
}
