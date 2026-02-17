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
