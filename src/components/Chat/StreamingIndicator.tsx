/**
 * StreamingIndicator Component - Visual indicator during AI generation
 *
 * Shows animated dots and "Thinking..." text while AI is generating a response.
 * Includes a stop button to cancel generation.
 */

import { Square } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Props for the StreamingIndicator component
 */
interface StreamingIndicatorProps {
  /** Callback when stop button is clicked */
  onStop: () => void;
}

/**
 * StreamingIndicator component
 *
 * @example
 * ```tsx
 * <StreamingIndicator onStop={stopGeneration} />
 * ```
 */
export function StreamingIndicator({ onStop }: StreamingIndicatorProps) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Animated dots */}
        <div className="flex gap-1">
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35]"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35]"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="h-2 w-2 animate-bounce rounded-full bg-[#FF6B35]"
            style={{ animationDelay: "300ms" }}
          />
        </div>

        <span className="text-sm text-gray-600">Thinking...</span>
      </div>

      {/* Stop button */}
      <button
        onClick={onStop}
        className={cn(
          "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
          "bg-red-50 text-red-600 hover:bg-red-100",
          "transition-colors duration-200"
        )}
        aria-label="Stop generating"
      >
        <Square className="h-3 w-3 fill-current" />
        <span>Stop</span>
      </button>
    </div>
  );
}
