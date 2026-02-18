/**
 * useConversations Hook - Conversation list management
 *
 * Provides functionality for loading, listing, and managing conversations.
 * Integrates with IndexedDB storage and chatStore for conversation loading.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getAllConversations,
  deleteConversation as deleteConversationStorage,
  updateConversationTitle,
} from "@/lib/storage/conversations";
import { useChatStore, useChatMetrics } from "@/store/chatStore";
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
  /** Edit a conversation title */
  editTitle: (id: string, title: string) => Promise<void>;
  /** Current memory usage in MB (null if not available) */
  memoryUsageMB: number | null;
  /** Whether memory usage exceeds 75% */
  memoryWarning: boolean;
  /** Performance suggestion message (null if none) */
  performanceSuggestion: string | null;
  /** Clear the performance suggestion */
  clearPerformanceSuggestion: () => void;
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

  // Performance monitoring state
  const [memoryUsageMB, setMemoryUsageMB] = useState<number | null>(null);
  const [memoryWarning, setMemoryWarning] = useState<boolean>(false);
  const [performanceSuggestion, setPerformanceSuggestion] = useState<string | null>(null);

  // Refs for performance tracking
  const lowTpsCountRef = useRef<number>(0);
  const lastMetricsRef = useRef<{ tokensPerSecond: number; timestamp: number } | null>(null);

  // Subscribe to conversation ID changes
  useEffect(() => {
    const unsubscribe = chatStore.subscribe((state) => {
      setActiveConversationId(state.currentConversationId);
    });
    return () => unsubscribe();
  }, []);

  // Get chat metrics for performance monitoring
  const chatMetrics = useChatMetrics();

  /**
   * Memory monitoring effect
   * Polls memory usage every 5 seconds (Chrome only)
   */
  useEffect(() => {
    const checkMemory = () => {
      const perf = performance as Performance & {
        memory?: {
          usedJSHeapSize: number;
          totalJSHeapSize: number;
          jsHeapSizeLimit: number;
        };
      };

      if (perf.memory) {
        const usedMB = Math.round(perf.memory.usedJSHeapSize / (1024 * 1024));
        const limitMB = Math.round(perf.memory.jsHeapSizeLimit / (1024 * 1024));
        const usagePercent = (usedMB / limitMB) * 100;

        setMemoryUsageMB(usedMB);
        setMemoryWarning(usagePercent > 75);
      }
    };

    // Check immediately
    checkMemory();

    // Poll every 5 seconds
    const interval = setInterval(checkMemory, 5000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Performance degradation detection
   * Tracks tokens per second and suggests Quick Mode if TPS is consistently low
   */
  useEffect(() => {
    // Only check when we have metrics and not currently streaming
    if (chatMetrics.tokensPerSecond === 0) {
      return;
    }

    const now = Date.now();
    const tps = chatMetrics.tokensPerSecond;

    // Check if TPS is below threshold
    if (tps < 5 && tps > 0) {
      // Increment low TPS counter
      lowTpsCountRef.current += 1;

      // If we've had 3+ consecutive low TPS readings, suggest Quick Mode
      if (lowTpsCountRef.current >= 3) {
        setPerformanceSuggestion(
          "Performance is slow. Consider switching to Quick Mode for faster responses."
        );
      }
    } else {
      // Reset counter if TPS is good
      lowTpsCountRef.current = 0;
    }

    // Store current metrics for next comparison
    lastMetricsRef.current = {
      tokensPerSecond: tps,
      timestamp: now,
    };
  }, [chatMetrics.tokensPerSecond]);

  /**
   * Clear performance suggestion
   */
  const clearPerformanceSuggestion = useCallback(() => {
    setPerformanceSuggestion(null);
    lowTpsCountRef.current = 0;
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

  /**
   * Edit a conversation title
   */
  const editTitle = useCallback(
    async (id: string, title: string): Promise<void> => {
      setError(null);

      try {
        await updateConversationTitle(id, title);

        // Refresh the list to show updated title
        await loadConversations();
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update title";
        setError(errorMessage);

        if (import.meta.env.DEV) {
          console.error("[useConversations] Edit title error:", err);
        }
        throw err;
      }
    },
    [loadConversations]
  );

  return {
    conversations,
    isLoading,
    error,
    loadConversation,
    deleteConversation,
    refreshConversations,
    createNewConversation,
    editTitle,
    memoryUsageMB,
    memoryWarning,
    performanceSuggestion,
    clearPerformanceSuggestion,
  };
}
