/**
 * Utility functions for the Lokul application
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS classes with proper precedence
 *
 * Combines clsx for conditional classes with tailwind-merge
 * to handle Tailwind class conflicts properly.
 *
 * @param inputs - Class values to merge
 * @returns Merged class string
 *
 * @example
 * ```ts
 * cn("px-4 py-2", "bg-red-500", condition && "text-white")
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
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
