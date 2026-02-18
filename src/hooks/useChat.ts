/**
 * useChat Hook - Chat state and operations
 *
 * Provides a convenient hook for accessing chat state and operations.
 * Combines multiple store selectors into a single hook with memoized callbacks.
 */

import { useCallback } from "react";
import {
  useMessages,
  useIsStreaming,
  useStreamingContent,
  useChatError,
  useChatMetrics,
  useSendMessage,
  useClearChat,
  useStopGeneration,
  useRegenerateMessage,
} from "@/store/chatStore";
import type { Message } from "@/types/index";

/**
 * Hook return type
 */
interface UseChatReturn {
  /** Messages in the current conversation */
  messages: Message[];
  /** Whether AI is currently generating a response */
  isStreaming: boolean;
  /** Streaming content being received */
  streamingContent: string;
  /** Error message if something went wrong */
  error: string | null;
  /** Performance metrics for the last response */
  metrics: {
    tokensPerSecond: number;
    responseTimeMs: number | null;
    totalTokens: number;
  };
  /** Send a new message */
  sendMessage: (content: string) => Promise<void>;
  /** Regenerate the last AI response */
  regenerateMessage: () => Promise<void>;
  /** Clear the current conversation */
  clearChat: () => void;
  /** Stop the current generation */
  stopGeneration: () => void;
}

/**
 * Custom hook for managing chat state and operations
 *
 * @returns Chat state and actions
 *
 * @example
 * ```tsx
 * const { messages, sendMessage, isStreaming } = useChat();
 *
 * // Send a message
 * await sendMessage("Hello, AI!");
 *
 * // Check if streaming
 * if (isStreaming) {
 *   console.log("AI is thinking...");
 * }
 * ```
 */
export function useChat(): UseChatReturn {
  // State selectors
  const messages = useMessages();
  const isStreaming = useIsStreaming();
  const streamingContent = useStreamingContent();
  const error = useChatError();
  const metrics = useChatMetrics();

  // Action selectors
  const sendMessageAction = useSendMessage();
  const clearChatAction = useClearChat();
  const stopGenerationAction = useStopGeneration();
  const regenerateMessageAction = useRegenerateMessage();

  /**
   * Send a message wrapper
   */
  const sendMessage = useCallback(
    async (content: string): Promise<void> => {
      await sendMessageAction(content);
    },
    [sendMessageAction]
  );

  /**
   * Regenerate the last AI response
   */
  const regenerateMessage = useCallback(async (): Promise<void> => {
    await regenerateMessageAction();
  }, [regenerateMessageAction]);

  /**
   * Clear chat wrapper
   */
  const clearChat = useCallback((): void => {
    clearChatAction();
  }, [clearChatAction]);

  /**
   * Stop generation wrapper
   */
  const stopGeneration = useCallback((): void => {
    stopGenerationAction();
  }, [stopGenerationAction]);

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    metrics,
    sendMessage,
    regenerateMessage,
    clearChat,
    stopGeneration,
  };
}
