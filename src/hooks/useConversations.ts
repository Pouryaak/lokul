/**
 * useConversations Hook - Conversation list management
 *
 * Provides functionality for loading, listing, and managing conversations.
 * Integrates with IndexedDB storage and chatStore for conversation loading.
 */

import { useState, useEffect, useCallback } from "react";
import {
  getAllConversations,
  deleteConversation as deleteConversationStorage,
} from "@/lib/storage/conversations";
import { useChatStore } from "@/store/chatStore";
import type { Conversation } from "@/types/index";

// Get the store instance for imperative operations
const chatStore = useChatStore;

/**
 * Hook return type
 */
interface UseConversationsReturn {
  /** List of all conversations */
  conversations: Conversation[];
  /** Whether conversations are loading */
  isLoading: boolean;
  /** Error message if loading failed */
  error: string | null;
  /** Load a conversation by ID into the chat */
  loadConversation: (id: string) => Promise<void>;
  /** Delete a conversation by ID */
  deleteConversation: (id: string) => Promise<void>;
  /** Refresh the conversation list */
  refreshConversations: () => Promise<void>;
  /** Create a new conversation (clears current chat) */
  createNewConversation: () => void;
}

/**
 * Custom hook for managing the conversation list
 *
 * @returns Conversation list state and actions
 *
 * @example
 * ```tsx
 * const { conversations, loadConversation, deleteConversation } = useConversations();
 *
 * // Load a conversation
 * await loadConversation("conv-id");
 *
 * // Delete a conversation
 * await deleteConversation("conv-id");
 * ```
 */
export function useConversations(): UseConversationsReturn {
  // State
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Track current conversation ID for delete comparison
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  // Subscribe to conversation ID changes
  useEffect(() => {
    const unsubscribe = chatStore.subscribe((state) => {
      setActiveConversationId(state.currentConversationId);
    });
    return () => unsubscribe();
  }, []);

  /**
   * Load all conversations from storage
   */
  const loadConversations = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const allConversations = await getAllConversations();
      setConversations(allConversations);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load conversations";
      setError(errorMessage);

      if (import.meta.env.DEV) {
        console.error("[useConversations] Load error:", err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Load conversations on mount
   */
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  /**
   * Load a specific conversation by ID into the chat store
   */
  const loadConversation = useCallback(
    async (id: string): Promise<void> => {
      setError(null);

      try {
        const conversation = conversations.find((c) => c.id === id);

        if (!conversation) {
          throw new Error(`Conversation not found: ${id}`);
        }

        // Load into chat store
        chatStore.getState().loadConversation(conversation);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load conversation";
        setError(errorMessage);

        if (import.meta.env.DEV) {
          console.error("[useConversations] Load conversation error:", err);
        }
        throw err;
      }
    },
    [conversations]
  );

  /**
   * Delete a conversation by ID
   */
  const deleteConversation = useCallback(
    async (id: string): Promise<void> => {
      setError(null);

      try {
        await deleteConversationStorage(id);

        // Refresh the list
        await loadConversations();

        // If the deleted conversation is currently loaded, clear the chat
        if (activeConversationId === id) {
          chatStore.getState().clearChat();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete conversation";
        setError(errorMessage);

        if (import.meta.env.DEV) {
          console.error("[useConversations] Delete error:", err);
        }
        throw err;
      }
    },
    [loadConversations, activeConversationId]
  );

  /**
   * Refresh the conversation list from storage
   */
  const refreshConversations = useCallback(async (): Promise<void> => {
    await loadConversations();
  }, [loadConversations]);

  /**
   * Create a new conversation by clearing the current chat
   */
  const createNewConversation = useCallback((): void => {
    chatStore.getState().clearChat();
  }, []);

  return {
    conversations,
    isLoading,
    error,
    loadConversation,
    deleteConversation,
    refreshConversations,
    createNewConversation,
  };
}
