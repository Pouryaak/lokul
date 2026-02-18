/**
 * useConversations Hook - Conversation list management
 */

import { useState, useEffect, useCallback, type Dispatch, type SetStateAction } from "react";
import {
  getAllConversations,
  deleteConversation as deleteConversationStorage,
  updateConversationTitle,
} from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";

interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  editTitle: (id: string, title: string) => Promise<void>;
}

export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetchConversations = useConversationLoader(setConversations, setIsLoading, setError);
  const actions = useConversationActions(fetchConversations, setError);

  useEffect(() => {
    void fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    isLoading,
    error,
    deleteConversation: actions.deleteConversation,
    refreshConversations: actions.refreshConversations,
    editTitle: actions.editTitle,
  };
}

function useConversationLoader(
  setConversations: Dispatch<SetStateAction<Conversation[]>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  setError: Dispatch<SetStateAction<string | null>>
) {
  return useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const allConversations = await getAllConversations();
      const seenIds = new Map<string, Conversation>();

      for (const conversation of allConversations) {
        if (seenIds.has(conversation.id) && import.meta.env.DEV) {
          console.warn(`[useConversations] Duplicate conversation ID found: ${conversation.id}`);
        }
        seenIds.set(conversation.id, conversation);
      }

      setConversations(Array.from(seenIds.values()));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, [setConversations, setError, setIsLoading]);
}

function useConversationActions(
  fetchConversations: () => Promise<void>,
  setError: Dispatch<SetStateAction<string | null>>
) {
  const runMutation = useCallback(
    async (mutation: () => Promise<void>, fallbackMessage: string): Promise<void> => {
      setError(null);
      try {
        await mutation();
        await fetchConversations();
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackMessage);
        throw err;
      }
    },
    [fetchConversations, setError]
  );

  const deleteConversation = useCallback(
    async (id: string): Promise<void> =>
      runMutation(() => deleteConversationStorage(id), "Failed to delete conversation"),
    [runMutation]
  );

  const refreshConversations = useCallback(async (): Promise<void> => {
    await fetchConversations();
  }, [fetchConversations]);

  const editTitle = useCallback(
    async (id: string, title: string): Promise<void> =>
      runMutation(() => updateConversationTitle(id, title), "Failed to update title"),
    [runMutation]
  );

  return { deleteConversation, refreshConversations, editTitle };
}
