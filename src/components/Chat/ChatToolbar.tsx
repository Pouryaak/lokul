/**
 * ChatToolbar Component - Toolbar with regenerate and clear buttons
 *
 * Provides action buttons for regenerating the last AI response and
 * clearing the current conversation.
 */

import { RotateCcw, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the ChatToolbar component
 */
interface ChatToolbarProps {
  /** Callback when regenerate button is clicked */
  onRegenerate?: () => void;
  /** Callback when clear button is clicked */
  onClear: () => void;
  /** Whether regeneration is possible (last message is from AI) */
  canRegenerate: boolean;
  /** Whether AI is currently streaming a response */
  isStreaming: boolean;
}

/**
 * ChatToolbar component
 *
 * @example
 * ```tsx
 * <ChatToolbar
 *   onRegenerate={regenerateMessage}
 *   onClear={clearConversation}
 *   canRegenerate={lastMessage?.role === "assistant"}
 *   isStreaming={isStreaming}
 * />
 * ```
 */
export function ChatToolbar({
  onRegenerate,
  onClear,
  canRegenerate,
  isStreaming,
}: ChatToolbarProps) {
  return (
    <div className="flex items-center justify-end gap-2 border-t border-gray-100 py-2">
      {/* Regenerate Button */}
      <button
        onClick={onRegenerate}
        disabled={!canRegenerate || isStreaming}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-200",
          "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
          "disabled:pointer-events-none disabled:opacity-40"
        )}
        aria-label="Regenerate response"
      >
        <RotateCcw className="h-4 w-4" />
        <span>Regenerate</span>
      </button>

      {/* Clear Chat Button */}
      <button
        onClick={onClear}
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
  );
}
