/**
 * MessageInput Component - Auto-resizing textarea with send button
 *
 * Provides an input field for typing messages with automatic height adjustment,
 * Enter-to-send functionality, and a send button.
 */

import { useRef, useCallback, useState, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Props for the MessageInput component
 */
interface MessageInputProps {
  /** Callback when a message is sent */
  onSend: (content: string) => void;
  /** Whether the input is disabled */
  isDisabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
}

/**
 * MessageInput component with auto-resizing textarea
 *
 * @example
 * ```tsx
 * <MessageInput
 *   onSend={(content) => console.log(content)}
 *   isDisabled={isStreaming}
 *   placeholder="Type a message..."
 * />
 * ```
 */
export function MessageInput({
  onSend,
  isDisabled = false,
  placeholder = "Message Lokul...",
}: MessageInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState("");

  /**
   * Adjust textarea height based on content
   */
  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to auto to get correct scrollHeight
    textarea.style.height = "auto";

    // Set height to scrollHeight, capped at 200px
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, []);

  /**
   * Adjust height when value changes
   */
  useEffect(() => {
    adjustHeight();
  }, [value, adjustHeight]);

  /**
   * Handle keydown events
   * Enter sends message, Shift+Enter adds newline
   */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [value, isDisabled]
  );

  /**
   * Handle sending the message
   */
  const handleSend = useCallback(() => {
    const trimmedContent = value.trim();

    if (!trimmedContent || isDisabled) {
      return;
    }

    onSend(trimmedContent);
    setValue("");

    // Reset height
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
    }
  }, [value, isDisabled, onSend]);

  /**
   * Handle input change
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
  }, []);

  const canSend = value.trim().length > 0 && !isDisabled;

  return (
    <div
      className={cn(
        "relative flex items-end gap-2 rounded-xl border bg-white p-3 shadow-sm",
        "transition-all duration-200",
        "focus-within:border-[#FF6B35] focus-within:ring-2 focus-within:ring-[#FF6B35]/20",
        isDisabled && "opacity-70"
      )}
    >
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={isDisabled}
        rows={1}
        className={cn(
          "flex-1 resize-none bg-transparent text-gray-900 placeholder:text-gray-400",
          "focus:outline-none",
          "min-h-[24px] max-h-[200px]",
          "py-1 px-1"
        )}
        style={{ overflow: "auto" }}
      />

      <Button
        onClick={handleSend}
        disabled={!canSend}
        size="icon"
        variant="primary"
        className={cn(
          "shrink-0 rounded-lg transition-all duration-200",
          !canSend && "opacity-50"
        )}
        aria-label={isDisabled ? "Generating..." : "Send message"}
      >
        {isDisabled ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}
