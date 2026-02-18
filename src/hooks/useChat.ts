/**
 * useChat Hook - Chat state and operations
 *
 * Provides a convenient hook for accessing chat state and operations.
 * Combines multiple store selectors into a single hook.
 */

import {
  useMessages,
  useIsStreaming,
  useStreamingContent,
  useChatError,
  useSendMessage,
  useRegenerateMessage,
  useClearConversation,
  useStopGeneration,
} from "@/store/chatStore";

/**
 * Hook return type
 */
interface UseChatReturn {
  /** Messages in the current conversation */
  messages: import("@/types/index").Message[];
  /** Whether AI is currently generating a response */
  isStreaming: boolean;
  /** Streaming content being received */
  streamingContent: string;
  /** Error message if something went wrong */
  error: string | null;
  /** Send a new message */
  sendMessage: (content: string) => Promise<void>;
  /** Regenerate the last AI response */
  regenerateMessage: () => Promise<void>;
  /** Clear the current conversation */
  clearConversation: () => void;
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
  const messages = useMessages();
  const isStreaming = useIsStreaming();
  const streamingContent = useStreamingContent();
  const error = useChatError();
  const sendMessage = useSendMessage();
  const regenerateMessage = useRegenerateMessage();
  const clearConversation = useClearConversation();
  const stopGeneration = useStopGeneration();

  return {
    messages,
    isStreaming,
    streamingContent,
    error,
    sendMessage,
    regenerateMessage,
    clearConversation,
    stopGeneration,
  };
}
