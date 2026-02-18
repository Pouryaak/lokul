/**
 * MessageList Component - Scrollable message list container
 *
 * Displays all messages in the conversation with auto-scroll to bottom,
 * streaming message support, and the streaming indicator.
 */

import { useRef, useEffect } from "react";
import { MessageBubble } from "./MessageBubble";
import { StreamingIndicator } from "./StreamingIndicator";
import { useChat } from "@/hooks/useChat";
import type { Message } from "@/types/index";

/**
 * Create a streaming message object for display
 */
function createStreamingMessage(content: string): Message {
  return {
    id: "streaming",
    role: "assistant",
    content,
    timestamp: Date.now(),
    conversationId: "current",
  };
}

/**
 * MessageList component
 *
 * @example
 * ```tsx
 * <MessageList />
 * ```
 */
export function MessageList() {
  const { messages, isStreaming, streamingContent, stopGeneration } = useChat();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  /**
   * Auto-scroll to bottom when messages change or streaming content updates
   */
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, streamingContent]);

  const hasMessages = messages.length > 0;

  return (
    <div
      ref={scrollContainerRef}
      className="flex-1 overflow-y-auto px-4 py-4"
    >
      <div className="mx-auto max-w-3xl">
        {hasMessages ? (
          <>
            {/* Render all messages */}
            {messages.map((message, index) => (
              <MessageBubble
                key={message.id}
                message={message}
                isLast={index === messages.length - 1}
              />
            ))}

            {/* Streaming message */}
            {isStreaming && streamingContent && (
              <MessageBubble
                message={createStreamingMessage(streamingContent)}
                isStreaming={true}
                isLast={true}
              />
            )}

            {/* Streaming indicator (thinking state) */}
            {isStreaming && !streamingContent && (
              <div className="py-4">
                <StreamingIndicator onStop={stopGeneration} />
              </div>
            )}
          </>
        ) : null}

        {/* Bottom anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
