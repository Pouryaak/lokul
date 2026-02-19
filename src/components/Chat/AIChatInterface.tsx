/**
 * AIChatInterface Component - Main chat container using AI SDK UI
 */

import { useCallback, useEffect, useState } from "react";
import type { UIMessage } from "@ai-sdk/react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";
import { ConversationMessages, EmptyChatState, ErrorBanner, InputSection } from "./ai-chat-parts";

interface AIChatInterfaceProps {
  conversationId: string;
  modelId: string;
  initialMessages?: UIMessage[];
  className?: string;
}

function useErrorToasts(error: Error | undefined, onResetDismissed: () => void): void {
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  useEffect(() => {
    if (error?.message) {
      onResetDismissed();
    }
  }, [error?.message, onResetDismissed]);
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

  const hasMessages = messages.length > 0;
  const chatErrorMessage =
    error?.message && dismissedError !== error.message ? error.message : null;
  const persistenceErrorMessage =
    persistenceRecovery?.message && dismissedError !== persistenceRecovery.message
      ? persistenceRecovery.message
      : null;
  const activeError = persistenceErrorMessage ?? chatErrorMessage;

  const handleSubmit = useSubmitHandler(sendMessage);

  const handleStop = useCallback(() => {
    stop();
  }, [stop]);

  const resetDismissedError = useCallback(() => {
    setDismissedError(null);
  }, []);

  useErrorToasts(error, resetDismissedError);

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
        <ConversationContent className="pb-40">
          {hasMessages ? (
            <ConversationMessages messages={messages} />
          ) : (
            <ConversationEmptyState
              icon={<EmptyChatState />}
              title="Start a conversation"
              description="Type a message below to begin chatting with Lokul"
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <InputSection
        className="absolute inset-x-0 bottom-0 z-20"
        conversationId={conversationId}
        status={status}
        onSubmit={handleSubmit}
        onStop={handleStop}
      />
    </div>
  );
}
