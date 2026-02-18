/**
 * useAIChat Hook
 *
 * Wrapper hook that configures useChat from @ai-sdk/react with the WebLLM transport.
 * This is the bridge between the existing model store and AI SDK UI.
 * Includes automatic persistence to IndexedDB.
 */

import { useCallback, useEffect, useMemo } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import type { TextUIPart } from "ai";
import { WebLLMTransport } from "@/lib/ai/webllm-transport";
import { getConversation, saveConversation, createConversation } from "@/lib/storage/conversations";
import { debounce } from "@/lib/utils/debounce";
import type { Message } from "@/types/index";

const PERSISTENCE_DEBOUNCE_MS = 500;
const NEW_CONVERSATION_TITLE = "New Conversation";
const CONVERSATION_TITLE_MAX_LENGTH = 50;

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextUIPart => part.type === "text")
    .map((part) => part.text)
    .join("");
}

function getConversationTitle(messages: UIMessage[]): string | null {
  const firstUserMessage = messages.find((message) => message.role === "user");

  if (!firstUserMessage) {
    return null;
  }

  const textContent = getTextFromMessage(firstUserMessage);

  if (!textContent) {
    return null;
  }

  if (textContent.length <= CONVERSATION_TITLE_MAX_LENGTH) {
    return textContent;
  }

  return `${textContent.slice(0, CONVERSATION_TITLE_MAX_LENGTH)}...`;
}

function toStorageMessage(message: UIMessage, conversationId: string, timestamp: number): Message {
  return {
    id: message.id,
    role: message.role,
    content: getTextFromMessage(message),
    timestamp,
    conversationId,
  };
}

/**
 * Options for the useAIChat hook
 */
export interface UseAIChatOptions {
  /** Unique identifier for the conversation/chat session */
  conversationId: string;
  /** The model ID to use for inference */
  modelId: string;
  /** Initial messages to populate the chat */
  initialMessages?: UIMessage[];
}

/**
 * Custom hook for AI chat using WebLLM transport
 *
 * Wraps useChat from @ai-sdk/react with the WebLLM custom transport.
 * This enables true streaming from local WebLLM inference through
 * AI SDK UI's state management.
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, sendMessage, status, error } = useAIChat({
 *     conversationId: 'conv-123',
 *     modelId: 'phi-2-q4f16_1-MLC',
 *   });
 *
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <Message key={msg.id} message={msg} />
 *       ))}
 *       <input onChange={handleInputChange} value={input} />
 *       <button onClick={() => sendMessage(input)}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options for the chat
 * @returns useChat helpers (messages, sendMessage, status, error, etc.)
 */
export function useAIChat(options: UseAIChatOptions) {
  const { conversationId, modelId, initialMessages } = options;

  // Create WebLLM transport instance with the specified model
  const transport = useMemo(() => new WebLLMTransport({ modelId }), [modelId]);

  // Configure useChat with the WebLLM transport
  const chatHelpers = useChat({
    id: conversationId,
    transport,
    messages: initialMessages,
  });

  const { messages } = chatHelpers;

  const persistMessages = useCallback(
    async (nextMessages: UIMessage[]) => {
      try {
        let conversation = await getConversation(conversationId);

        if (!conversation) {
          conversation = createConversation(modelId, conversationId);
        }

        if (conversation.title === NEW_CONVERSATION_TITLE) {
          const title = getConversationTitle(nextMessages);
          if (title) {
            conversation.title = title;
          }
        }

        const timestamp = Date.now();
        conversation.messages = nextMessages.map((message) =>
          toStorageMessage(message, conversationId, timestamp)
        );
        conversation.updatedAt = timestamp;

        await saveConversation(conversation);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error("Failed to persist conversation:", error);
        }
      }
    },
    [conversationId, modelId]
  );

  const debouncedPersistMessages = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const [nextMessages] = args as [UIMessage[]];
        void persistMessages(nextMessages);
      }, PERSISTENCE_DEBOUNCE_MS),
    [persistMessages]
  );

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    debouncedPersistMessages(messages);

    return () => {
      debouncedPersistMessages.cancel();
    };
  }, [messages, debouncedPersistMessages]);

  return chatHelpers;
}
