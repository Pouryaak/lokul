/**
 * useConversations Hook - Conversation list management
 *
 * Handles storage-backed conversation listing and metadata updates.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAllConversations,
  deleteConversation as deleteConversationStorage,
  updateConversationTitle,
} from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";

/**
 * Hook return type
 */
interface UseConversationsReturn {
  conversations: Conversation[];
  isLoading: boolean;
  error: string | null;
  deleteConversation: (id: string) => Promise<void>;
  refreshConversations: () => Promise<void>;
  editTitle: (id: string, title: string) => Promise<void>;
}

/**
 * Custom hook for managing the conversation list
 *
 * @returns Conversation list state and actions
 *
 * @example
 * ```tsx
 * const { conversations, deleteConversation, editTitle } = useConversations();
 *
 * // Delete a conversation
 * await deleteConversation("conv-id");
 *
 * // Update title
 * await editTitle("conv-id", "New title");
 * ```
 */
export function useConversations(): UseConversationsReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      setConversations(await getAllConversations());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load conversations");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      setError(null);
      try {
        await deleteConversationStorage(id);
        await loadConversations();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete conversation");
        throw err;
      }
    },
    [loadConversations]
  );

  const refreshConversations = useCallback(async (): Promise<void> => {
    await loadConversations();
  }, [loadConversations]);

  const editTitle = useCallback(
    async (id: string, title: string): Promise<void> => {
      setError(null);
      try {
        await updateConversationTitle(id, title);
        await loadConversations();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update title");
        throw err;
      }
    },
    [loadConversations]
  );

  return {
    conversations,
    isLoading,
    error,
    deleteConversation,
    refreshConversations,
    editTitle,
  };
}
