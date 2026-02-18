/**
 * AIChatInterface Component - Main chat container using AI SDK UI
 *
 * Composes chat components using AI SDK UI patterns:
 * - ai-elements/message components for message display
 * - MessageInput for typing messages
 * - ChatToolbar for actions (regenerate, clear)
 * - WelcomeScreen for empty state with suggestions
 */

import { useCallback, useRef, useState } from "react";
import { User, Bot, Copy, Check, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Message,
  MessageContent,
  MessageActions,
  MessageAction,
  MessageAvatar,
} from "@/components/ai-elements/message";
import { MarkdownMessage } from "@/components/Chat/MarkdownMessage";
import { MessageInput } from "@/components/Chat/MessageInput";
import { WelcomeScreen } from "@/components/Chat/WelcomeScreen";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";
import type { Message as MessageType } from "@/types/index";

/**
 * Props for the AIChatInterface component
 */
interface AIChatInterfaceProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * Copy text to clipboard with toast feedback
 */
async function copyToClipboard(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Failed to copy");
  }
}

/**
 * Individual message component with actions
 */
interface ChatMessageProps {
  message: MessageType;
  isLast: boolean;
  isStreaming: boolean;
  onRegenerate?: () => void;
}

function ChatMessage({
  message,
  isLast,
  isStreaming,
  onRegenerate,
}: ChatMessageProps) {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === "user";

  const handleCopy = useCallback(async () => {
    await copyToClipboard(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [message.content]);

  return (
    <Message from={message.role}>
      <MessageAvatar>{isUser ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-gray-600" />}</MessageAvatar>
      
      <div className="flex max-w-[80%] flex-col gap-1">
        <MessageContent>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {message.content}
            </p>
          ) : (
            <div className="text-sm">
              <MarkdownMessage content={message.content} />
            </div>
          )}
        </MessageContent>

        <MessageActions className={isLast ? "opacity-100" : ""}>
          <MessageAction
            onClick={handleCopy}
            tooltip={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </MessageAction>

          {!isUser && isLast && onRegenerate && (
            <MessageAction
              onClick={onRegenerate}
              tooltip="Regenerate response"
              disabled={isStreaming}
            >
              <RefreshCw className="h-4 w-4" />
            </MessageAction>
          )}
        </MessageActions>
      </div>
    </Message>
  );
}

/**
 * AIChatInterface component - Main chat container with AI SDK UI patterns
 *
 * @example
 * ```tsx
 * <AIChatInterface />
 * ```
 */
export function AIChatInterface({ className }: AIChatInterfaceProps) {
  const {
    messages,
    isStreaming,
    streamingContent,
    sendMessage,
    clearChat,
    regenerateMessage,
    error,
  } = useChat();

  const hasMessages = messages.length > 0;
  const lastMessageIsAI = messages[messages.length - 1]?.role === "assistant";
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  /**
   * Handle sending a message
   */
  const handleSend = useCallback(
    async (content: string) => {
      if (!content.trim()) return;
      await sendMessage(content);
    },
    [sendMessage]
  );

  /**
   * Handle suggestion click from WelcomeScreen
   */
  const handleSuggestionClick = useCallback(
    async (suggestion: string) => {
      await sendMessage(suggestion);
    },
    [sendMessage]
  );

  /**
   * Handle clearing the conversation with confirmation
   */
  const handleClear = useCallback(() => {
    if (confirm("Clear this conversation? This cannot be undone.")) {
      clearChat();
      toast.info("Conversation cleared");
    }
  }, [clearChat]);

  /**
   * Handle regenerating the last AI response
   */
  const handleRegenerate = useCallback(async () => {
    if (!lastMessageIsAI || isStreaming) return;
    await regenerateMessage();
  }, [lastMessageIsAI, isStreaming, regenerateMessage]);

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
          {error}
          <button
            onClick={clearChat}
            className="ml-2 underline hover:no-underline"
          >
            Clear chat
          </button>
        </div>
      )}

      {/* Message Area */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {hasMessages ? (
            <>
              {/* Render all messages */}
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  isStreaming={isStreaming}
                  onRegenerate={handleRegenerate}
                />
              ))}

              {/* Streaming message */}
              {isStreaming && streamingContent && (
                <Message from="assistant">
                  <MessageAvatar>
                    <Bot className="h-4 w-4 text-gray-600" />
                  </MessageAvatar>
                  <MessageContent>
                    <div className="text-sm">
                      <MarkdownMessage content={streamingContent} />
                      <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-gray-400" />
                    </div>
                  </MessageContent>
                </Message>
              )}
            </>
          ) : (
            <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {/* Toolbar with Clear button */}
          {hasMessages && (
            <div className="flex items-center justify-end gap-2 border-b border-gray-100 pb-2 mb-2">
              {/* Regenerate Button */}
              <button
                onClick={handleRegenerate}
                disabled={!lastMessageIsAI || isStreaming}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
                  "disabled:pointer-events-none disabled:opacity-40"
                )}
                aria-label="Regenerate response"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Regenerate</span>
              </button>

              {/* Clear Chat Button */}
              <button
                onClick={handleClear}
                disabled={isStreaming}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  "text-gray-600 hover:bg-red-50 hover:text-red-600",
                  "disabled:pointer-events-none disabled:opacity-40"
                )}
                aria-label="Clear conversation"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear chat</span>
              </button>
            </div>
          )}

          {/* Input */}
          <MessageInput
            onSend={handleSend}
            isDisabled={isStreaming}
            placeholder="Message Lokul..."
          />

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
