/**
 * AIChatInterface Component - Main chat container using AI SDK UI
 *
 * Composes ai-elements components with useAIChat hook for streaming inference.
 * Uses AI SDK UI patterns for message display and input handling.
 */

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Bot, MessageSquare, RefreshCw, User, X } from "lucide-react";
import { toast } from "sonner";
import type { UIMessage } from "@ai-sdk/react";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
} from "@/components/ai-elements/prompt-input";
import { useAIChat } from "@/hooks/useAIChat";
import { cn } from "@/lib/utils";

/**
 * Props for the AIChatInterface component
 */
interface AIChatInterfaceProps {
  /** Conversation ID for this chat session */
  conversationId: string;
  /** Model ID to use for inference */
  modelId: string;
  /** Initial messages to populate the chat */
  initialMessages?: UIMessage[];
  /** Additional CSS classes */
  className?: string;
}

/**
 * AIChatInterface component - Main chat container with AI SDK UI patterns
 *
 * Uses ai-elements components for consistent AI chat UI:
 * - Conversation for scrollable message area with auto-scroll
 * - Message for displaying user/assistant messages
 * - PromptInput for auto-resizing input with submit
 * - useAIChat hook for streaming inference
 *
 * @example
 * ```tsx
 * <AIChatInterface
 *   conversationId="conv-123"
 *   modelId="phi-2-q4f16_1-MLC"
 * />
 * ```
 */
export function AIChatInterface({
  conversationId,
  modelId,
  initialMessages,
  className,
}: AIChatInterfaceProps) {
  const { messages, sendMessage, status, error } = useAIChat({
    conversationId,
    modelId,
    initialMessages,
  });
  const [dismissedError, setDismissedError] = useState<string | null>(null);

  const hasMessages = messages.length > 0;

  /**
   * Handle sending a message
   */
  const handleSubmit = useCallback(
    async (message: { text: string }) => {
      if (!message.text.trim()) return;

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

  /**
   * Handle stopping generation
   */
  const handleStop = useCallback(() => {
    toast.info("Stop is not available yet for this model.");
  }, []);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  useEffect(() => {
    if (error?.message) {
      setDismissedError(null);
    }
  }, [error?.message]);

  return (
    <div className={cn("flex h-full flex-col bg-[#FFF8F0]", className)}>
      {/* Error Banner */}
      {error && dismissedError !== error.message && (
        <div className="mx-4 mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="mt-1 text-sm text-red-600">{error.message}</p>

              <button
                onClick={() => window.location.reload()}
                className="mt-3 flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload
              </button>
            </div>

            <button
              onClick={() => setDismissedError(error.message)}
              className="shrink-0 rounded-lg p-1 text-red-400 hover:bg-red-100 hover:text-red-600"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Conversation Area */}
      <Conversation className="flex-1">
        <ConversationContent>
          {hasMessages ? (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={cn(
                  "group flex gap-4 py-6",
                  msg.role === "user" ? "flex-row-reverse" : "flex-row"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                    msg.role === "user" ? "bg-[#FF6B35]" : "bg-gray-200"
                  )}
                >
                  {msg.role === "user" ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-gray-600" />
                  )}
                </div>

                {/* Message */}
                <div className="flex max-w-[80%] flex-col gap-1">
                  <Message from={msg.role}>
                    <MessageContent>
                      {msg.parts
                        .filter(
                          (part): part is { type: "text"; text: string } => part.type === "text"
                        )
                        .map((part, i) => (
                          <MessageResponse key={i}>{part.text}</MessageResponse>
                        ))}
                    </MessageContent>
                  </Message>
                </div>
              </div>
            ))
          ) : (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12 text-[#FF6B35]" />}
              title="Start a conversation"
              description="Type a message below to begin chatting with Lokul"
            />
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          <PromptInput onSubmit={handleSubmit}>
            <PromptInputTextarea placeholder="Message Lokul..." className="min-h-[60px]" />
            <PromptInputSubmit status={status} onStop={handleStop} />
          </PromptInput>

          {/* Footer text */}
          <p className="mt-2 text-center text-xs text-gray-400">
            AI responses are generated locally on your device.{" "}
            <a
              href="#"
              className="text-[#FF6B35] hover:underline"
              onClick={(e) => {
                e.preventDefault();
                // TODO: Open privacy modal
              }}
            >
              Learn more
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
