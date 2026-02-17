/**
 * Progress Component - Horizontal progress bar with label
 *
 * Displays download/upload progress with percentage and optional file size.
 */

import { cn } from "@/lib/utils";

/**
 * Props for the Progress component
 */
export interface ProgressProps {
  /** Current progress value (0-100) */
  value: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Whether to show percentage label */
  showLabel?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Current size in human-readable format (e.g., "1.8GB") */
  currentSize?: string;
  /** Total size in human-readable format (e.g., "2.8GB") */
  totalSize?: string;
  /** Additional CSS classes */
  className?: string;
  /** Current step label (e.g., "Downloading...") */
  stepLabel?: string;
}

/**
 * Progress bar component with optional labels
 *
 * @example
 * ```tsx
 * <Progress value={62} showLabel currentSize="1.8GB" totalSize="2.8GB" />
 * ```
 */
export function Progress({
  value,
  max = 100,
  showLabel = false,
  size = "md",
  currentSize,
  totalSize,
  className,
  stepLabel,
}: ProgressProps) {
  // Calculate percentage
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  // Size variants
  const sizeClasses = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar container */}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-gray-200",
          sizeClasses[size],
        )}
      >
        {/* Progress fill */}
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#FF6B35] to-[#FFB84D] transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Labels */}
      {(showLabel || currentSize || totalSize || stepLabel) && (
        <div className="mt-2 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {stepLabel && (
              <span className="text-gray-600">{stepLabel}</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            {currentSize && totalSize && (
              <span>
                {currentSize} / {totalSize}
              </span>
            )}
            {showLabel && (
              <span className="font-medium text-[#FF6B35]">
                {Math.round(percentage)}%
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Format bytes to human-readable string
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.8GB")
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format seconds to human-readable time estimate
 *
 * @param seconds - Number of seconds
 * @returns Formatted string (e.g., "About 3 minutes remaining")
 */
export function formatTimeEstimate(seconds: number): string {
  if (seconds < 60) {
    return `About ${Math.ceil(seconds)} seconds remaining`;
  }
  if (seconds < 3600) {
    const minutes = Math.ceil(seconds / 60);
    return `About ${minutes} minute${minutes > 1 ? "s" : ""} remaining`;
  }
  const hours = Math.ceil(seconds / 3600);
  return `About ${hours} hour${hours > 1 ? "s" : ""} remaining`;
}
