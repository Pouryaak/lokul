import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";
import type { UIMessage } from "@ai-sdk/react";
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
import type { TextUIPart } from "ai";

const PERSISTENCE_DEBOUNCE_MS = 500;
const NEW_CONVERSATION_TITLE = "New Conversation";
const CONVERSATION_TITLE_MAX_LENGTH = 50;
const MAX_PERSISTENCE_RETRIES = 2;
const PERSISTENCE_FALLBACK_MESSAGE =
  "Your response was generated, but we could not save this conversation yet.";

export interface PersistenceRecoveryState {
  message: string;
  fallbackMessage: string;
  canRetry: boolean;
  canDismiss: boolean;
}

interface UseChatPersistenceOptions {
  conversationId: string;
  modelId: string;
  messages: UIMessage[];
  stopChat: () => void;
}

interface UseChatPersistenceResult {
  stop: () => void;
  persistenceRecovery: PersistenceRecoveryState | null;
  retryPersistence: () => Promise<void>;
  dismissPersistenceRecovery: () => void;
}

function getTextFromMessage(message: UIMessage): string {
  return message.parts
    .filter((part): part is TextUIPart => part.type === "text")
    .map((part) => part.text)
    .join("");
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

function getConversationTitle(messages: UIMessage[]): string | null {
  const firstUserMessage = messages.find((message) => message.role === "user");
  const text = firstUserMessage ? getTextFromMessage(firstUserMessage) : "";

  if (!text) {
    return null;
  }

  if (text.length <= CONVERSATION_TITLE_MAX_LENGTH) {
    return text;
  }

  return `${text.slice(0, CONVERSATION_TITLE_MAX_LENGTH)}...`;
}

function buildIdempotencyKey(conversationId: string, messages: UIMessage[]): string {
  const lastMessage = messages[messages.length - 1];

  if (!lastMessage) {
    return `${conversationId}:empty`;
  }

  const content = getTextFromMessage(lastMessage);
  const tail = content.slice(-32);
  return `${conversationId}:${messages.length}:${lastMessage.id}:${tail}`;
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

function toRecoveryState(error: AppError): PersistenceRecoveryState {
  const code = error.code as ErrorCode;

  return {
    message: getUserMessage(error),
    fallbackMessage: PERSISTENCE_FALLBACK_MESSAGE,
    canRetry: code !== "PERSISTENCE_IDEMPOTENT_REPLAY",
    canDismiss: code !== "ABORTED",
  };
}

function assignConversationSnapshot(
  conversationId: string,
  nextMessages: UIMessage[],
  conversation: ReturnType<typeof createConversation>
): void {
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
}

async function persistWithRetry(
  conversationId: string,
  modelId: string,
  nextMessages: UIMessage[],
  signal: AbortSignal,
  cancelReason: CancellationReason
): Promise<Result<void, AppError>> {
  let conversation = await getConversation(conversationId, { signal, cancelReason });
  const idempotencyKey = buildIdempotencyKey(conversationId, nextMessages);
  let attempts = 0;

  if (!conversation) {
    conversation = createConversation(modelId, conversationId);
  }

  while (attempts <= MAX_PERSISTENCE_RETRIES) {
    assignConversationSnapshot(conversationId, nextMessages, conversation);
    const result = await saveConversationWithVersion(conversation, {
      expectedVersion: conversation.version,
      idempotencyKey,
      signal,
      cancelReason,
    });

    if (result.kind === "ok" || result.error.code === "PERSISTENCE_IDEMPOTENT_REPLAY") {
      return ok(undefined);
    }

    if (!shouldRetryPersistence(result.error) || attempts >= MAX_PERSISTENCE_RETRIES) {
      return err(result.error);
    }

    attempts += 1;
    conversation =
      (await getConversation(conversationId, { signal, cancelReason })) ??
      createConversation(modelId, conversationId);
  }

  return err(abortedError(cancelReason));
}

export function useChatPersistence(options: UseChatPersistenceOptions): UseChatPersistenceResult {
  const { conversationId, modelId, messages, stopChat } = options;
  const {
    persistenceRecovery,
    setPersistenceRecovery,
    pendingMessagesRef,
    handlePersistenceResult,
  } = usePersistenceRecoveryState();
  const { abortPersistence, persistMessages } = usePersistenceController(conversationId, modelId);

  const persistOperation = useCallback(
    async (nextMessages: UIMessage[], reason: unknown) => {
      pendingMessagesRef.current = nextMessages;
      const result = await persistMessages(nextMessages, reason);
      handlePersistenceResult(result);
    },
    [handlePersistenceResult, pendingMessagesRef, persistMessages]
  );

  const debouncedPersist = useDebouncedPersistence(persistOperation);
  const retryPersistence = useRetryPersistence(pendingMessagesRef, persistOperation);
  usePersistenceEffects(
    messages,
    conversationId,
    modelId,
    debouncedPersist,
    abortPersistence,
    setPersistenceRecovery
  );

  const stop = useCallback(() => {
    abortPersistence("user_stop");
    stopChat();
  }, [abortPersistence, stopChat]);

  const dismissPersistenceRecovery = useCallback(() => {
    setPersistenceRecovery(null);
  }, [setPersistenceRecovery]);

  return { stop, persistenceRecovery, retryPersistence, dismissPersistenceRecovery };
}

function usePersistenceRecoveryState() {
  const [persistenceRecovery, setPersistenceRecovery] = useState<PersistenceRecoveryState | null>(
    null
  );
  const pendingMessagesRef = useRef<UIMessage[] | null>(null);

  const handlePersistenceResult = useCallback((result: Result<void, AppError>) => {
    if (result.kind === "ok") {
      setPersistenceRecovery(null);
      pendingMessagesRef.current = null;
      return;
    }

    if (result.error.code !== "ABORTED") {
      setPersistenceRecovery(toRecoveryState(result.error));
    }
  }, []);

  return {
    persistenceRecovery,
    setPersistenceRecovery,
    pendingMessagesRef,
    handlePersistenceResult,
  };
}

function usePersistenceController(conversationId: string, modelId: string) {
  const controllerRef = useRef<AbortController | null>(null);

  const abortPersistence = useCallback((reason: unknown) => {
    if (!controllerRef.current) {
      return;
    }

    controllerRef.current.abort(reason);
    controllerRef.current = null;
  }, []);

  const persistMessages = useCallback(
    async (nextMessages: UIMessage[], reason: unknown): Promise<Result<void, AppError>> => {
      const cancelReason = toCancellationReason(reason);
      try {
        const controller = new AbortController();
        abortPersistence(cancelReason);
        controllerRef.current = controller;
        const result = await persistWithRetry(
          conversationId,
          modelId,
          nextMessages,
          controller.signal,
          cancelReason
        );

        if (controllerRef.current === controller) {
          controllerRef.current = null;
        }

        return result;
      } catch (error) {
        return err(toAppError(error));
      }
    },
    [abortPersistence, conversationId, modelId]
  );

  return { abortPersistence, persistMessages };
}

function useDebouncedPersistence(
  persistOperation: (nextMessages: UIMessage[], reason: unknown) => Promise<void>
) {
  return useMemo(
    () =>
      debounce((...args: unknown[]) => {
        const [nextMessages] = args as [UIMessage[]];
        void persistOperation(nextMessages, "user_stop");
      }, PERSISTENCE_DEBOUNCE_MS),
    [persistOperation]
  );
}

function useRetryPersistence(
  pendingMessagesRef: RefObject<UIMessage[] | null>,
  persistOperation: (nextMessages: UIMessage[], reason: unknown) => Promise<void>
) {
  return useCallback(async () => {
    const pending = pendingMessagesRef.current;
    if (!pending) {
      return;
    }

    await persistOperation(pending, "user_stop");
  }, [pendingMessagesRef, persistOperation]);
}

function usePersistenceEffects(
  messages: UIMessage[],
  conversationId: string,
  modelId: string,
  debouncedPersist: ReturnType<typeof useDebouncedPersistence>,
  abortPersistence: (reason: unknown) => void,
  setPersistenceRecovery: Dispatch<SetStateAction<PersistenceRecoveryState | null>>
) {
  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    debouncedPersist(messages);
    return () => {
      abortPersistence("route_change");
      debouncedPersist.cancel();
    };
  }, [abortPersistence, debouncedPersist, messages]);

  useEffect(() => {
    setPersistenceRecovery(null);
  }, [conversationId, modelId, setPersistenceRecovery]);
}
