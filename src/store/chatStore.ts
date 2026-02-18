/**
 * Chat Store - Reactive state management for chat conversations
 *
 * Manages chat messages, streaming state, and conversation persistence.
 * Integrates with inferenceManager for AI generation and auto-saves to IndexedDB.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { inferenceManager } from "@/lib/ai/inference";
import {
  saveConversation,
  createConversation,
  addMessageToConversation,
  generateConversationTitle,
} from "@/lib/storage/conversations";
import { useModelStore } from "./modelStore";
import type { Message, Conversation } from "@/types/index";

/**
 * Chat performance metrics
 */
interface ChatMetrics {
  /** Tokens generated per second */
  tokensPerSecond: number;
  /** Total response time in milliseconds */
  responseTimeMs: number | null;
  /** Total tokens generated in current response */
  totalTokens: number;
}

/**
 * Chat state interface
 */
interface ChatState {
  // State
  /** All messages in current conversation */
  messages: Message[];
  /** Current conversation ID (null if new/unsaved) */
  currentConversationId: string | null;
  /** Whether AI is currently generating a response */
  isStreaming: boolean;
  /** Accumulated streaming content for current response */
  streamingContent: string;
  /** Error message if something went wrong */
  error: string | null;
  /** Performance metrics for current/last response */
  metrics: ChatMetrics;
  /** Current conversation object (for auto-save) */
  currentConversation: Conversation | null;
}

/**
 * Chat actions interface
 */
interface ChatActions {
  /** Send a message and start AI generation */
  sendMessage: (content: string) => Promise<void>;
  /** Append a token to streaming content */
  appendToken: (token: string) => void;
  /** Stop ongoing generation */
  stopGeneration: () => void;
  /** Clear chat and start new conversation */
  clearChat: () => void;
  /** Load an existing conversation */
  loadConversation: (conversation: Conversation) => void;
  /** Set error state */
  setError: (error: string | null) => void;
  /** Regenerate the last AI response */
  regenerateMessage: () => Promise<void>;
}

/**
 * Create a new message object
 */
function createMessage(
  role: Message["role"],
  content: string,
  conversationId: string
): Message {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    timestamp: Date.now(),
    conversationId,
  };
}

/**
 * Build messages array for inference from current conversation
 * Maps to the format expected by inferenceManager.generate()
 */
function buildInferenceMessages(messages: Message[]): Array<{
  role: "system" | "user" | "assistant";
  content: string;
}> {
  return messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));
}

/**
 * Chat store with Zustand
 *
 * Features:
 * - Message management with immutable updates
 * - Streaming response handling with token accumulation
 * - Auto-save to IndexedDB after message completion
 * - Performance metrics tracking
 */
export const useChatStore = create<ChatState & ChatActions>()(
  devtools(
    (set, get) => ({
      // Initial state
      messages: [],
      currentConversationId: null,
      isStreaming: false,
      streamingContent: "",
      error: null,
      metrics: {
        tokensPerSecond: 0,
        responseTimeMs: null,
        totalTokens: 0,
      },
      currentConversation: null,

      /**
       * Send a message and start AI generation
       * Handles the full lifecycle: user message, streaming response, auto-save
       */
      sendMessage: async (content: string) => {
        const state = get();

        // Validate content
        const trimmedContent = content.trim();
        if (!trimmedContent) {
          set({ error: "Message cannot be empty" });
          return;
        }

        // Check if model is loaded
        const modelState = useModelStore.getState();
        if (!modelState.currentModel) {
          set({ error: "No model loaded. Please load a model first." });
          return;
        }

        // Initialize conversation if needed
        let conversation = state.currentConversation;
        if (!conversation) {
          conversation = createConversation(modelState.currentModel.id);
        }

        // Create user message
        const userMessage = createMessage(
          "user",
          trimmedContent,
          conversation.id
        );

        // Add user message to conversation
        conversation = addMessageToConversation(conversation, userMessage);

        // Update state with user message
        set({
          messages: conversation.messages,
          currentConversationId: conversation.id,
          currentConversation: conversation,
          isStreaming: true,
          streamingContent: "",
          error: null,
          metrics: {
            tokensPerSecond: 0,
            responseTimeMs: null,
            totalTokens: 0,
          },
        });

        // Track generation start time
        const startTime = performance.now();
        let tokenCount = 0;

        try {
          // Build messages for inference
          const inferenceMessages = buildInferenceMessages(conversation.messages);

          // Generate streaming response
          const stream = inferenceManager.generate(inferenceMessages);

          // Accumulate streaming content
          let assistantContent = "";

          for await (const token of stream) {
            assistantContent += token;
            tokenCount++;

            // Update streaming content in state
            set({
              streamingContent: assistantContent,
              metrics: {
                ...get().metrics,
                totalTokens: tokenCount,
              },
            });
          }

          // Calculate metrics
          const endTime = performance.now();
          const responseTimeMs = endTime - startTime;
          const tokensPerSecond =
            responseTimeMs > 0 ? (tokenCount / responseTimeMs) * 1000 : 0;

          // Create assistant message
          const assistantMessage = createMessage(
            "assistant",
            assistantContent,
            conversation.id
          );

          // Add metadata
          assistantMessage.metadata = {
            tokenCount,
            generationTimeMs: responseTimeMs,
            modelId: modelState.currentModel.id,
          };

          // Add assistant message to conversation
          conversation = addMessageToConversation(conversation, assistantMessage);

          // Update title on first user message if it's still default
          if (
            conversation.messages.filter((m) => m.role === "user").length === 1 &&
            conversation.title === "New Conversation"
          ) {
            conversation.title = generateConversationTitle(trimmedContent);
          }

          // Auto-save to IndexedDB
          await saveConversation(conversation);

          // Update final state
          set({
            messages: conversation.messages,
            currentConversation: conversation,
            isStreaming: false,
            streamingContent: "",
            metrics: {
              tokensPerSecond: Math.round(tokensPerSecond * 10) / 10,
              responseTimeMs: Math.round(responseTimeMs),
              totalTokens: tokenCount,
            },
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to generate response";

          // Update state with error
          set({
            error: errorMessage,
            isStreaming: false,
            streamingContent: "",
          });

          if (import.meta.env.DEV) {
            console.error("[ChatStore] Generation error:", error);
          }
        }
      },

      /**
       * Append a token to streaming content
       * Used for manual token streaming if needed
       */
      appendToken: (token: string) => {
        set((state) => ({
          streamingContent: state.streamingContent + token,
        }));
      },

      /**
       * Stop ongoing generation
       */
      stopGeneration: () => {
        inferenceManager.abort();

        set({
          isStreaming: false,
          streamingContent: "",
        });
      },

      /**
       * Clear chat and start new conversation
       * Resets all chat state but keeps current model
       */
      clearChat: () => {
        inferenceManager.abort();

        set({
          messages: [],
          currentConversationId: null,
          isStreaming: false,
          streamingContent: "",
          error: null,
          metrics: {
            tokensPerSecond: 0,
            responseTimeMs: null,
            totalTokens: 0,
          },
          currentConversation: null,
        });
      },

      /**
       * Load an existing conversation
       */
      loadConversation: (conversation: Conversation) => {
        set({
          messages: conversation.messages,
          currentConversationId: conversation.id,
          currentConversation: conversation,
          isStreaming: false,
          streamingContent: "",
          error: null,
          metrics: {
            tokensPerSecond: 0,
            responseTimeMs: null,
            totalTokens: 0,
          },
        });
      },

      /**
       * Set error state
       */
      setError: (error: string | null) => {
        set({ error });
      },

      /**
       * Regenerate the last AI response
       * Finds the last user message, truncates messages to before it,
       * and re-sends the user message
       */
      regenerateMessage: async (): Promise<void> => {
        const state = get();
        const { messages: currentMessages } = state;

        // Find the last user message
        let lastUserIndex = -1;
        for (let i = currentMessages.length - 1; i >= 0; i--) {
          if (currentMessages[i].role === "user") {
            lastUserIndex = i;
            break;
          }
        }

        if (lastUserIndex === -1) {
          // No user message found
          return;
        }

        // Get the last user message content
        const lastUserMessage = currentMessages[lastUserIndex];

        // Truncate messages to before the last user message
        const truncatedMessages = currentMessages.slice(0, lastUserIndex);

        // Update the store with truncated messages
        set({
          messages: truncatedMessages,
          isStreaming: false,
          streamingContent: "",
          error: null,
        });

        // Update current conversation if exists
        if (state.currentConversation) {
          set({
            currentConversation: {
              ...state.currentConversation,
              messages: truncatedMessages,
            },
          });
        }

        // Re-send the user message
        await state.sendMessage(lastUserMessage.content);
      },
    }),
    { name: "ChatStore" }
  )
);

/**
 * Selector hooks for common state slices
 * These prevent unnecessary re-renders by selecting specific state
 */

/** Get all messages */
export const useMessages = () => useChatStore((state) => state.messages);

/** Get streaming state */
export const useIsStreaming = () => useChatStore((state) => state.isStreaming);

/** Get current streaming content */
export const useStreamingContent = () =>
  useChatStore((state) => state.streamingContent);

/** Get error message */
export const useChatError = () => useChatStore((state) => state.error);

/** Get performance metrics */
export const useChatMetrics = () => useChatStore((state) => state.metrics);

/** Get current conversation ID */
export const useCurrentConversationId = () =>
  useChatStore((state) => state.currentConversationId);

/** Get current conversation */
export const useCurrentConversation = () =>
  useChatStore((state) => state.currentConversation);

/** Get sendMessage action */
export const useSendMessage = () => useChatStore((state) => state.sendMessage);

/** Get stopGeneration action */
export const useStopGeneration = () =>
  useChatStore((state) => state.stopGeneration);

/** Get clearChat action */
export const useClearChat = () => useChatStore((state) => state.clearChat);

/** Get regenerateMessage action */
export const useRegenerateMessage = () =>
  useChatStore((state) => state.regenerateMessage);

/** Get loadConversation action */
export const useLoadConversationAction = () =>
  useChatStore((state) => state.loadConversation);

/** Get setError action */
export const useSetChatError = () => useChatStore((state) => state.setError);
