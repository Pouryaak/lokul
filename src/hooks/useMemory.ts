import { useCallback, useMemo, useRef, useState } from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { toast } from "sonner";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";
import {
  clearAllMemory,
  deleteMemoryFact,
  getMemoryFacts,
  saveMemoryFact,
  updateMemoryFact,
} from "@/lib/storage/memory";

const DELETE_UNDO_MS = 4000;
const CLEAR_ALL_UNDO_MS = 8000;
const MAX_PINNED = 10;

interface UseMemoryReturn {
  facts: MemoryFact[];
  isLoading: boolean;
  error: string | null;
  count: number;
  optimisticClear: boolean;
  countByCategory: Record<MemoryCategory, number>;
  addFact: (fact: Omit<MemoryFact, "id">) => Promise<void>;
  updateFact: (id: string, updates: Partial<MemoryFact>) => Promise<void>;
  deleteFact: (id: string) => Promise<void>;
  pinFact: (id: string) => Promise<void>;
  unpinFact: (id: string) => Promise<void>;
  clearAllFacts: () => Promise<void>;
  undoDelete: () => Promise<void>;
  undoClearAll: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useMemory(): UseMemoryReturn {
  const [error, setError] = useState<string | null>(null);
  const [optimisticClear, setOptimisticClear] = useState(false);
  const [, setRefreshTick] = useState(0);
  const deletedFactsRef = useRef<MemoryFact[]>([]);
  const clearBackupRef = useRef<MemoryFact[]>([]);
  const clearTimerRef = useRef<number | null>(null);

  const liveFacts = useLiveQuery(async () => {
    const result = await getMemoryFacts();
    if (result.kind === "err") {
      throw new Error(result.error.message || "Failed to load memory");
    }
    return result.value;
  }, []);

  const facts = useMemo(() => {
    if (!liveFacts || optimisticClear) {
      return [];
    }
    return liveFacts;
  }, [liveFacts, optimisticClear]);

  const countByCategory = useMemo<Record<MemoryCategory, number>>(() => {
    const counts: Record<MemoryCategory, number> = {
      identity: 0,
      preference: 0,
      project: 0,
    };

    for (const fact of facts) {
      counts[fact.category] += 1;
    }

    return counts;
  }, [facts]);

  const count = facts.length;

  const addFact = useCallback(async (fact: Omit<MemoryFact, "id">) => {
    setError(null);
    const result = await saveMemoryFact(fact);
    if (result.kind === "err") {
      const message = result.error.message || "Could not save memory fact";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const updateFactById = useCallback(async (id: string, updates: Partial<MemoryFact>) => {
    setError(null);
    const result = await updateMemoryFact(id, updates);
    if (result.kind === "err") {
      const message = result.error.message || "Could not update memory fact";
      setError(message);
      throw new Error(message);
    }
  }, []);

  const restoreFact = useCallback(async (fact: MemoryFact) => {
    const result = await saveMemoryFact({
      fact: fact.fact,
      category: fact.category,
      confidence: fact.confidence,
      mentionCount: fact.mentionCount,
      firstSeen: fact.firstSeen,
      lastSeen: fact.lastSeen,
      lastSeenConversationId: fact.lastSeenConversationId,
      pinned: fact.pinned,
      updatesFactId: fact.updatesFactId,
    });

    if (result.kind === "err") {
      throw new Error(result.error.message || "Could not restore memory fact");
    }
  }, []);

  const undoDelete = useCallback(async () => {
    const fact = deletedFactsRef.current.pop();
    if (!fact) {
      return;
    }

    setError(null);
    try {
      await restoreFact(fact);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to restore deleted memory";
      setError(message);
      toast.error(message);
    }
  }, [restoreFact]);

  const deleteFactById = useCallback(
    async (id: string) => {
      const fact = facts.find((item) => item.id === id);
      if (!fact) {
        return;
      }

      setError(null);
      deletedFactsRef.current.push(fact);

      const result = await deleteMemoryFact(id);
      if (result.kind === "err") {
        deletedFactsRef.current.pop();
        const message = result.error.message || "Could not delete memory fact";
        setError(message);
        throw new Error(message);
      }

      toast("Memory deleted", {
        action: {
          label: "Undo",
          onClick: () => {
            void undoDelete();
          },
        },
        duration: DELETE_UNDO_MS,
      });
    },
    [facts, undoDelete]
  );

  const pinFact = useCallback(
    async (id: string) => {
      const alreadyPinned = facts.filter((fact) => fact.pinned).length;
      if (alreadyPinned >= MAX_PINNED) {
        const message = "You can pin up to 10 memories";
        setError(message);
        toast.error(message);
        return;
      }

      await updateFactById(id, { pinned: true });
    },
    [facts, updateFactById]
  );

  const unpinFact = useCallback(
    async (id: string) => {
      await updateFactById(id, { pinned: false });
    },
    [updateFactById]
  );

  const undoClearAll = useCallback(async () => {
    if (!optimisticClear) {
      return;
    }

    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    clearBackupRef.current = [];
    setOptimisticClear(false);
  }, [optimisticClear]);

  const clearAllFacts = useCallback(async () => {
    if (!liveFacts || liveFacts.length === 0) {
      return;
    }

    setError(null);

    if (clearTimerRef.current !== null) {
      window.clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }

    clearBackupRef.current = [...liveFacts];
    setOptimisticClear(true);

    clearTimerRef.current = window.setTimeout(async () => {
      const result = await clearAllMemory();

      if (result.kind === "err") {
        setError(result.error.message || "Could not clear memory");
      }

      clearBackupRef.current = [];
      clearTimerRef.current = null;
      setOptimisticClear(false);
    }, CLEAR_ALL_UNDO_MS);

    toast("Memory cleared", {
      action: {
        label: "Undo",
        onClick: () => {
          void undoClearAll();
        },
      },
      duration: CLEAR_ALL_UNDO_MS,
    });
  }, [liveFacts, undoClearAll]);

  const refresh = useCallback(async () => {
    setRefreshTick((current) => current + 1);
  }, []);

  return {
    facts,
    isLoading: liveFacts === undefined,
    error,
    count,
    optimisticClear,
    countByCategory,
    addFact,
    updateFact: updateFactById,
    deleteFact: deleteFactById,
    pinFact,
    unpinFact,
    clearAllFacts,
    undoDelete,
    undoClearAll,
    refresh,
  };
}
