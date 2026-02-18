/**
 * useAIChat Hook
 *
 * Wrapper hook that configures useChat from @ai-sdk/react with the WebLLM transport.
 * This is the bridge between the existing model store and AI SDK UI.
 * Includes automatic persistence to IndexedDB.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import type { TextUIPart } from "ai";
import { WebLLMTransport } from "@/lib/ai/webllm-transport";
import {
  createConversation,
  getConversation,
  saveConversationWithVersion,
} from "@/lib/storage/conversations";
import { debounce } from "@/lib/utils/debounce";
import {
  abortedError,
  getUserMessage,
  isAppError,
  toAppError,
  type AppError,
  type ErrorCode,
} from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import type { CancellationReason, Message } from "@/types/index";

const PERSISTENCE_DEBOUNCE_MS = 500;
const NEW_CONVERSATION_TITLE = "New Conversation";
const CONVERSATION_TITLE_MAX_LENGTH = 50;
const MAX_PERSISTENCE_RETRIES = 2;
const PERSISTENCE_FALLBACK_MESSAGE =
  "Your response was generated, but we could not save this conversation yet.";

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

function getMessageFingerprint(messages: UIMessage[]): string {
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    return "empty";
  }

  const content = getTextFromMessage(lastMessage);
  const tail = content.slice(-32);
  return `${messages.length}:${lastMessage.id}:${tail}`;
}

function buildIdempotencyKey(conversationId: string, messages: UIMessage[]): string {
  return `${conversationId}:${getMessageFingerprint(messages)}`;
}

function shouldRetryPersistence(error: unknown): boolean {
  return isAppError(error) && error.code === "PERSISTENCE_CONFLICT";
}

function toCancellationReason(reason: unknown): CancellationReason {
  if (
    reason === "user_stop" ||
    reason === "route_change" ||
    reason === "model_switch" ||
    reason === "shutdown"
  ) {
    return reason;
  }

  return "user_stop";
}

function isDismissablePersistenceError(error: AppError): boolean {
  return error.code !== "ABORTED";
}

function getRecoveryErrorCode(error: AppError): ErrorCode {
  return error.code;
}

export interface PersistenceRecoveryState {
  message: string;
  fallbackMessage: string;
  canRetry: boolean;
  canDismiss: boolean;
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
  const [persistenceRecovery, setPersistenceRecovery] = useState<PersistenceRecoveryState | null>(
    null
  );

  const pendingPersistenceMessagesRef = useRef<UIMessage[] | null>(null);
  const persistenceControllerRef = useRef<AbortController | null>(null);

  // Create WebLLM transport instance with the specified model
  const transport = useMemo(() => new WebLLMTransport({ modelId }), [modelId]);

  // Configure useChat with the WebLLM transport
  const chatHelpers = useChat({
    id: conversationId,
    transport,
    messages: initialMessages,
  });

  const { messages } = chatHelpers;

  const clearPersistenceRecovery = useCallback(() => {
    setPersistenceRecovery(null);
  }, []);

  const abortPersistence = useCallback((reason: unknown) => {
    if (!persistenceControllerRef.current) {
      return;
    }

    persistenceControllerRef.current.abort(reason);
    persistenceControllerRef.current = null;
  }, []);

  const createPersistenceScope = useCallback(
    (reason: unknown) => {
      abortPersistence(reason);
      const controller = new AbortController();
      persistenceControllerRef.current = controller;
      return controller;
    },
    [abortPersistence]
  );

  const persistMessages = useCallback(
    async (
      nextMessages: UIMessage[],
      signal: AbortSignal,
      cancelReason: unknown
    ): Promise<Result<void, AppError>> => {
      try {
        const operationReason = toCancellationReason(cancelReason);
        let conversation = await getConversation(conversationId, {
          signal,
          cancelReason: operationReason,
        });
        const idempotencyKey = buildIdempotencyKey(conversationId, nextMessages);
        let attempts = 0;

        if (!conversation) {
          conversation = createConversation(modelId, conversationId);
        }

        while (attempts <= MAX_PERSISTENCE_RETRIES) {
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

          const result = await saveConversationWithVersion(conversation, {
            expectedVersion: conversation.version,
            idempotencyKey,
            signal,
            cancelReason: operationReason,
          });

          if (result.kind === "ok") {
            return ok(undefined);
          }

          if (result.error.code === "PERSISTENCE_IDEMPOTENT_REPLAY") {
            return ok(undefined);
          }

          if (!shouldRetryPersistence(result.error)) {
            return err(result.error);
          }

          attempts += 1;

          if (attempts > MAX_PERSISTENCE_RETRIES) {
            return err(result.error);
          }

          const latest = await getConversation(conversationId, {
            signal,
            cancelReason: operationReason,
          });
          conversation = latest ?? createConversation(modelId, conversationId);
        }

        return err(abortedError(operationReason));
      } catch (error) {
        return err(toAppError(error));
      }
    },
    [conversationId, modelId]
  );

  const handlePersistenceResult = useCallback((result: Result<void, AppError>) => {
    if (result.kind === "ok") {
      setPersistenceRecovery(null);
      pendingPersistenceMessagesRef.current = null;
      return;
    }

    if (result.error.code === "ABORTED") {
      return;
    }

    setPersistenceRecovery({
      message: getUserMessage(result.error),
      fallbackMessage: PERSISTENCE_FALLBACK_MESSAGE,
      canRetry: getRecoveryErrorCode(result.error) !== "PERSISTENCE_IDEMPOTENT_REPLAY",
      canDismiss: isDismissablePersistenceError(result.error),
    });
  }, []);

  const persistWithScope = useCallback(
    async (nextMessages: UIMessage[], reason: unknown) => {
      pendingPersistenceMessagesRef.current = nextMessages;
      const controller = createPersistenceScope(reason);
      const result = await persistMessages(nextMessages, controller.signal, reason);

      if (persistenceControllerRef.current === controller) {
        persistenceControllerRef.current = null;
      }

      handlePersistenceResult(result);
    },
    [createPersistenceScope, handlePersistenceResult, persistMessages]
  );

  const debouncedPersistMessages = useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const [nextMessages] = args as [UIMessage[]];
        void persistWithScope(nextMessages, "debounced_persist");
      }, PERSISTENCE_DEBOUNCE_MS),
    [persistWithScope]
  );

  const retryPersistence = useCallback(async () => {
    const pending = pendingPersistenceMessagesRef.current;

    if (!pending) {
      return;
    }

    await persistWithScope(pending, "retry_persistence");
  }, [persistWithScope]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    debouncedPersistMessages(messages);

    return () => {
      abortPersistence("route_change");
      debouncedPersistMessages.cancel();
    };
  }, [messages, debouncedPersistMessages, abortPersistence]);

  const stop = useCallback(() => {
    abortPersistence("user_stop");
    chatHelpers.stop();
  }, [abortPersistence, chatHelpers]);

  const dismissPersistenceRecovery = useCallback(() => {
    setPersistenceRecovery(null);
  }, []);

  useEffect(() => {
    clearPersistenceRecovery();
  }, [conversationId, modelId, clearPersistenceRecovery]);

  return {
    ...chatHelpers,
    stop,
    persistenceRecovery,
    retryPersistence,
    dismissPersistenceRecovery,
  };
}
