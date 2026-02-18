/**
 * ChatInterface Component - Main chat container
 *
 * Composes all chat components into a cohesive interface:
 * - MessageList for displaying messages
 * - WelcomeScreen for empty state
 * - ChatToolbar for actions
 * - MessageInput for typing messages
 */

import { useCallback } from "react";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { ChatToolbar } from "./ChatToolbar";
import { WelcomeScreen } from "./WelcomeScreen";
import { useChat } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

/**
 * Props for the ChatInterface component
 */
interface ChatInterfaceProps {
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChatInterface component - Main chat container
 *
 * @example
 * ```tsx
 * <ChatInterface />
 * ```
 */
export function ChatInterface({ className }: ChatInterfaceProps) {
  const {
    messages,
    isStreaming,
    sendMessage,
    clearChat,
    regenerateMessage,
    error,
  } = useChat();

  const hasMessages = messages.length > 0;
  const lastMessageIsAI = messages[messages.length - 1]?.role === "assistant";

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
      <div className="flex-1 overflow-hidden">
        {hasMessages ? (
          <MessageList />
        ) : (
          <WelcomeScreen onSuggestionClick={handleSuggestionClick} />
        )}
      </div>

      {/* Bottom Section */}
      <div className="border-t border-gray-200 bg-white px-4 py-4">
        <div className="mx-auto max-w-3xl">
          {/* Toolbar */}
          {hasMessages && (
            <ChatToolbar
              onRegenerate={regenerateMessage}
              onClear={clearChat}
              canRegenerate={lastMessageIsAI && !isStreaming}
              isStreaming={isStreaming}
            />
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
