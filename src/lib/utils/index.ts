import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export * from "./errors";
export * from "./result";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

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
