/**
 * Chat Store - Reactive state management for chat conversations
 *
 * Manages messages, conversation state, streaming responses, and
 * chat-related actions like send, regenerate, and clear.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Message } from "@/types/index";

/**
 * Chat state interface
 */
interface ChatState {
  // State
  /** Current conversation ID */
  currentConversationId: string | null;
  /** Messages in the current conversation */
  messages: Message[];
  /** Whether AI is currently generating a response */
  isStreaming: boolean;
  /** Streaming content being received */
  streamingContent: string;
  /** Error message if something went wrong */
  error: string | null;

  // Actions
  /** Send a new message */
  sendMessage: (content: string) => Promise<void>;
  /** Regenerate the last AI response */
  regenerateMessage: () => Promise<void>;
  /** Clear the current conversation */
  clearConversation: () => void;
  /** Stop the current generation */
  stopGeneration: () => void;
  /** Add a streaming chunk */
  appendStreamingContent: (chunk: string) => void;
  /** Finalize streaming message */
  finalizeStreamingMessage: () => void;
  /** Set error state */
  setError: (error: string | null) => void;
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Create a new message
 */
function createMessage(content: string, role: "user" | "assistant"): Message {
  return {
    id: generateId(),
    role,
    content,
    timestamp: Date.now(),
    conversationId: "current",
  };
}

/**
 * Chat store with Zustand
 */
export const useChatStore = create<ChatState>()(
  devtools(
    (set, get) => ({
      // Initial state
      currentConversationId: null,
      messages: [],
      isStreaming: false,
      streamingContent: "",
      error: null,

      /**
       * Send a new message
       */
      sendMessage: async (content: string) => {
        const trimmedContent = content.trim();
        if (!trimmedContent) return;

        // Add user message
        const userMessage = createMessage(trimmedContent, "user");
        set((state) => ({
          messages: [...state.messages, userMessage],
          isStreaming: true,
          streamingContent: "",
          error: null,
        }));

        // Simulate AI response (will be replaced with actual inference)
        // This is a placeholder for the actual AI integration
        setTimeout(() => {
          get().finalizeStreamingMessage();
        }, 1000);
      },

      /**
       * Regenerate the last AI response
       */
      regenerateMessage: async () => {
        const { messages } = get();
        if (messages.length === 0) return;

        // Remove the last assistant message if it exists
        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role === "assistant") {
          set((state) => ({
            messages: state.messages.slice(0, -1),
            isStreaming: true,
            streamingContent: "",
            error: null,
          }));
        }

        // Simulate regeneration
        setTimeout(() => {
          get().finalizeStreamingMessage();
        }, 1000);
      },

      /**
       * Clear the current conversation
       */
      clearConversation: () => {
        set({
          messages: [],
          isStreaming: false,
          streamingContent: "",
          error: null,
          currentConversationId: null,
        });
      },

      /**
       * Stop the current generation
       */
      stopGeneration: () => {
        set({
          isStreaming: false,
          streamingContent: "",
        });
      },

      /**
       * Append streaming content
       */
      appendStreamingContent: (chunk: string) => {
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
        }));
      },

      /**
       * Finalize streaming message
       */
      finalizeStreamingMessage: () => {
        const { streamingContent } = get();
        if (streamingContent.trim()) {
          const assistantMessage = createMessage(streamingContent, "assistant");
          set((state) => ({
            messages: [...state.messages, assistantMessage],
            streamingContent: "",
            isStreaming: false,
          }));
        } else {
          set({ isStreaming: false, streamingContent: "" });
        }
      },

      /**
       * Set error state
       */
      setError: (error: string | null) => {
        set({ error });
      },
    }),
    { name: "ChatStore" }
  )
);

/**
 * Selector hooks for common state slices
 */

/** Get current messages */
export const useMessages = () => useChatStore((state) => state.messages);

/** Get streaming state */
export const useIsStreaming = () => useChatStore((state) => state.isStreaming);

/** Get streaming content */
export const useStreamingContent = () => useChatStore((state) => state.streamingContent);

/** Get error state */
export const useChatError = () => useChatStore((state) => state.error);

/** Get sendMessage action */
export const useSendMessage = () => useChatStore((state) => state.sendMessage);

/** Get regenerateMessage action */
export const useRegenerateMessage = () => useChatStore((state) => state.regenerateMessage);

/** Get clearConversation action */
export const useClearConversation = () => useChatStore((state) => state.clearConversation);

/** Get stopGeneration action */
export const useStopGeneration = () => useChatStore((state) => state.stopGeneration);
