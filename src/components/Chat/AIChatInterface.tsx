/**
 * AIChatInterface Component - Main chat container using AI SDK UI
 *
 * Composes ai-elements components with useAIChat hook for streaming inference.
 * Uses AI SDK UI patterns for message display and input handling.
 */

import { useCallback, useEffect } from "react";
import { User, Bot, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import {
  Conversation,
  ConversationContent,
  ConversationEmptyState,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
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
  className,
}: AIChatInterfaceProps) {
  const { messages, sendMessage, status, error } = useAIChat({
    conversationId,
    modelId,
  });

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
        console.error("Send error:", err);
      }
    },
    [sendMessage]
  );

  /**
   * Handle stopping generation
   */
  const handleStop = useCallback(() => {
    // TODO: Implement abort in useAIChat/WebLLMTransport
    console.log("Stop requested");
  }, []);

  // Show error toast when error occurs
  useEffect(() => {
    if (error) {
      toast.error(error.message || "An error occurred");
    }
  }, [error]);

  return (
    <div
      className={cn(
        "flex h-full flex-col bg-[#FFF8F0]",
        className
      )}
    >
      {/* Error Banner */}
      {error && (
        <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
          {error.message}
          <button
            onClick={() => window.location.reload()}
            className="ml-2 underline hover:no-underline"
          >
            Reload
          </button>
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
                        .filter((part): part is { type: "text"; text: string } =>
                          part.type === "text"
                        )
                        .map((part, i) => (
                          <MessageResponse key={i}>
                            {part.text}
                          </MessageResponse>
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
          <PromptInput
            onSubmit={handleSubmit}
          >
            <PromptInputTextarea
              placeholder="Message Lokul..."
              className="min-h-[60px]"
            />
            <PromptInputSubmit
              status={status}
              onStop={handleStop}
            />
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
