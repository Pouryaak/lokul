/**
 * MessageBubble Component - Individual message with copy/regenerate actions
 *
 * Displays a single message with proper alignment, styling based on role,
 * and action buttons for copy and regenerate.
 */

import { useState, useCallback } from "react";
import { User, Bot, Copy, Check, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/types/index";

/**
 * Props for the MessageBubble component
 */
interface MessageBubbleProps {
  /** The message to display */
  message: Message;
  /** Whether this message is currently streaming */
  isStreaming?: boolean;
  /** Callback to regenerate this message (AI messages only) */
  onRegenerate?: () => void;
  /** Whether this is the last message in the conversation */
  isLast?: boolean;
}

/**
 * Format timestamp to HH:MM format
 */
function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

/**
 * MessageBubble component for displaying chat messages
 *
 * @example
 * ```tsx
 * <MessageBubble
 *   message={message}
 *   isLast={index === messages.length - 1}
 *   onRegenerate={handleRegenerate}
 * />
 * ```
 */
export function MessageBubble({
  message,
  isStreaming = false,
  onRegenerate,
  isLast = false,
}: MessageBubbleProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);

  /**
   * Handle copying message content to clipboard
   */
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Silently fail - clipboard might not be available
      if (import.meta.env.DEV) {
        console.error("Failed to copy to clipboard:", err);
      }
    }
  }, [message.content]);

  return (
    <div
      className={cn(
        "group flex gap-4 py-6",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          isUser ? "bg-[#FF6B35]" : "bg-gray-200"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-gray-600" />
        )}
      </div>

      {/* Message Content */}
      <div className="flex max-w-[80%] flex-col gap-1">
        {/* Bubble */}
        <div
          className={cn(
            "relative rounded-2xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-[#FF6B35] text-white"
              : "border border-gray-200 bg-white text-gray-900"
          )}
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {message.content}
            {isStreaming && (
              <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current" />
            )}
          </p>
        </div>

        {/* Actions Row */}
        <div
          className={cn(
            "flex items-center gap-2 transition-opacity duration-200",
            isLast ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
        >
          {/* Copy Button */}
          <button
            onClick={handleCopy}
            className={cn(
              "flex items-center gap-1 rounded-md p-1 text-xs text-gray-500 transition-colors hover:text-gray-700",
              isUser ? "flex-row-reverse" : "flex-row"
            )}
            aria-label={copied ? "Copied!" : "Copy message"}
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Regenerate Button (AI messages only) */}
          {!isUser && onRegenerate && (
            <button
              onClick={onRegenerate}
              className={cn(
                "flex items-center gap-1 rounded-md p-1 text-xs text-gray-500 transition-colors hover:text-gray-700"
              )}
              aria-label="Regenerate response"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Regenerate</span>
            </button>
          )}

          {/* Timestamp */}
          <span
            className={cn(
              "text-xs text-gray-400",
              isUser ? "mr-auto pl-2" : "ml-auto pr-2"
            )}
          >
            {formatTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
