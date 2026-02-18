/**
 * useConversations Hook - Conversation list management
 */

import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { useLiveQuery } from "dexie-react-hooks";
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
  const liveConversations = useLiveQuery(loadConversationsSnapshot, []);
  const [error, setError] = useState<string | null>(null);
  const conversations = useMemo(() => liveConversations ?? [], [liveConversations]);
  const actions = useConversationActions(setError);

  return {
    conversations,
    isLoading: liveConversations === undefined,
    error,
    deleteConversation: actions.deleteConversation,
    refreshConversations: actions.refreshConversations,
    editTitle: actions.editTitle,
  };
}

async function loadConversationsSnapshot(): Promise<Conversation[]> {
  const allConversations = await getAllConversations();
  const dedupedConversations = new Map<string, Conversation>();

  for (const conversation of allConversations) {
    if (dedupedConversations.has(conversation.id) && import.meta.env.DEV) {
      console.warn(`[useConversations] Duplicate conversation ID found: ${conversation.id}`);
    }

    dedupedConversations.set(conversation.id, conversation);
  }

  return Array.from(dedupedConversations.values());
}

function useConversationActions(setError: Dispatch<SetStateAction<string | null>>) {
  const runMutation = useCallback(
    async (mutation: () => Promise<void>, fallbackMessage: string): Promise<void> => {
      setError(null);
      try {
        await mutation();
      } catch (err) {
        setError(err instanceof Error ? err.message : fallbackMessage);
        throw err;
      }
    },
    [setError]
  );

  const deleteConversation = useCallback(
    async (id: string): Promise<void> =>
      runMutation(() => deleteConversationStorage(id), "Failed to delete conversation"),
    [runMutation]
  );

  const refreshConversations = useCallback(async (): Promise<void> => {
    setError(null);
  }, [setError]);

  const editTitle = useCallback(
    async (id: string, title: string): Promise<void> =>
      runMutation(() => updateConversationTitle(id, title), "Failed to update title"),
    [runMutation]
  );

  return { deleteConversation, refreshConversations, editTitle };
}
