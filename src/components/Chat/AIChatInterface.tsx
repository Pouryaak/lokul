/**
 * AIChatInterface Component - Main chat container using AI SDK UI
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { UIMessage } from "@ai-sdk/react";
import { toast } from "sonner";
import { useStickToBottomContext } from "use-stick-to-bottom";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useAIChat } from "@/hooks/useAIChat";
import { useMemoryExtraction } from "@/hooks/useMemoryExtraction";
import type { Message, MessageRole } from "@/types/index";
import { cn } from "@/lib/utils";
import { ConversationMessages, EmptyChatState, ErrorBanner, InputSection } from "./ai-chat-parts";
import { useConversationHistoryWindow } from "./conversation-history-window";

interface AIChatInterfaceProps {
  conversationId: string;
  modelId: string;
  initialMessages?: UIMessage[];
  className?: string;
  startAtBottom?: boolean;
}

function isExtractableRole(role: string): role is MessageRole {
  return role === "user" || role === "assistant" || role === "system";
}

function getMessageText(message: UIMessage): string {
  const textFromParts = message.parts
    .filter((part): part is { type: "text"; text: string } => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();

  if (textFromParts.length > 0) {
    return textFromParts;
  }

  return "";
}

function useErrorToasts(error: Error | undefined, onResetDismissed: () => void): void {
  useEffect(() => {
    if (error) {
      onResetDismissed();
      toast.error(error.message || "An error occurred");
    }
  }, [error, onResetDismissed]);
}

function useSubmitHandler(sendMessage: (message: { text: string }) => Promise<void>) {
  return useCallback(
    async (message: { text: string }) => {
      if (!message.text.trim()) {
        return;
      }

      try {
        await sendMessage({ text: message.text });
      } catch (err) {
        toast.error("Failed to send message");
        if (import.meta.env.DEV) {
          console.error("Send error:", err);
        }
      }
    },
    [sendMessage]
  );
}

export function AIChatInterface({
  conversationId,
  modelId,
  initialMessages,
  className,
  startAtBottom = true,
}: AIChatInterfaceProps) {
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    persistenceRecovery,
    retryPersistence,
    dismissPersistenceRecovery,
  } = useAIChat({
    conversationId,
    modelId,
    initialMessages,
  });
  const [dismissedError, setDismissedError] = useState<string | null>(null);
  const extractionMessages = useMemo<Message[]>(() => {
    return messages
      .filter((message) => isExtractableRole(message.role))
      .map((message, index) => ({
        id: message.id,
        role: message.role,
        content: getMessageText(message),
        timestamp: index,
        conversationId,
      }))
      .filter((message) => message.content.length > 0);
  }, [conversationId, messages]);

  useMemoryExtraction(conversationId, extractionMessages, status);

  const hasMessages = messages.length > 0;
  const chatErrorMessage =
    error?.message && dismissedError !== error.message ? error.message : null;
  const persistenceErrorMessage =
    persistenceRecovery?.message && dismissedError !== persistenceRecovery.message
      ? persistenceRecovery.message
      : null;
  const activeError = chatErrorMessage ?? persistenceErrorMessage;

  const handleSubmit = useSubmitHandler(sendMessage);

  const resetDismissedError = useCallback(() => {
    setDismissedError(null);
  }, []);

  useErrorToasts(error, resetDismissedError);

  const historyResetKey = useMemo(() => {
    return `${conversationId}:${initialMessages?.length ?? 0}`;
  }, [conversationId, initialMessages?.length]);

  return (
    <div className={cn("relative flex h-full flex-col overflow-hidden bg-[#FFF8F0]", className)}>
      {activeError && (
        <ErrorBanner
          message={activeError}
          fallbackMessage={persistenceRecovery?.fallbackMessage}
          onRetry={persistenceRecovery?.canRetry ? () => void retryPersistence() : undefined}
          onDismiss={() => {
            setDismissedError(activeError);
            if (persistenceRecovery?.canDismiss) {
              dismissPersistenceRecovery();
            }
          }}
        />
      )}

      <Conversation className="flex-1">
        <ConversationHistoryContent
          messages={messages}
          status={status}
          hasMessages={hasMessages}
          startAtBottom={startAtBottom}
          historyResetKey={historyResetKey}
        />
        <ConversationScrollButton />
      </Conversation>

      <InputSection
        className="absolute inset-x-0 bottom-0 z-20"
        conversationId={conversationId}
        status={status}
        onSubmit={handleSubmit}
        onStop={stop}
      />
    </div>
  );
}

interface ConversationHistoryContentProps {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  hasMessages: boolean;
  startAtBottom: boolean;
  historyResetKey: string;
}

function ConversationHistoryContent({
  messages,
  status,
  hasMessages,
  startAtBottom,
  historyResetKey,
}: ConversationHistoryContentProps) {
  const { scrollRef, state } = useStickToBottomContext();
  const hasAttemptedTopLoadRef = useRef(false);
  const scrollElement = scrollRef.current;
  const { visibleMessages, hasOlderMessages, maybeLoadOlder } = useConversationHistoryWindow({
    messages,
    scrollElement,
    resetKey: historyResetKey,
    startAtBottom,
  });

  useEffect(() => {
    hasAttemptedTopLoadRef.current = false;
  }, [historyResetKey]);

  useEffect(() => {
    if (!scrollElement || !hasOlderMessages) {
      hasAttemptedTopLoadRef.current = false;
      return;
    }

    const scrollTop = state.scrollTop ?? scrollElement.scrollTop;
    if (scrollTop > 120) {
      hasAttemptedTopLoadRef.current = false;
      return;
    }

    if (hasAttemptedTopLoadRef.current) {
      return;
    }

    const loaded = maybeLoadOlder({
      scrollTop,
      scrollHeight: scrollElement.scrollHeight,
      clientHeight: scrollElement.clientHeight,
    });

    if (loaded) {
      hasAttemptedTopLoadRef.current = true;
    }
  }, [hasOlderMessages, maybeLoadOlder, scrollElement, state.scrollTop]);

  return (
    <ConversationContent className="pb-40">
      {hasMessages ? (
        <ConversationMessages messages={visibleMessages} status={status} />
      ) : (
        <ConversationEmptyState
          icon={<EmptyChatState />}
          title="Start a conversation"
          description="Type a message below to begin chatting with Lokul"
        />
      )}
    </ConversationContent>
  );
}
