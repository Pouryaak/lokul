/**
 * Memory Monitor - JavaScript heap memory tracking
 *
 * Provides utilities for monitoring memory usage in the browser.
 * Uses performance.memory API (Chrome/Edge) with graceful fallback.
 */

/**
 * Memory information structure
 */
export interface MemoryInfo {
  /** Memory used in MB */
  used: number;

  /** Total memory available in MB (null if not detectable) */
  total: number | null;
}

/**
 * Chrome/Edge memory API extension
 */
interface PerformanceMemory {
  /** Current JS heap size in bytes */
  usedJSHeapSize: number;

  /** Total JS heap size in bytes */
  totalJSHeapSize: number;

  /** JS heap size limit in bytes */
  jsHeapSizeLimit: number;
}

/**
 * Extended Performance interface with memory property
 */
interface ExtendedPerformance extends Performance {
  memory?: PerformanceMemory;
}

/**
 * Bytes per MB constant for conversion
 */
const BYTES_PER_MB = 1048576;

/**
 * Get current memory information.
 *
 * Uses performance.memory API if available (Chrome/Edge).
 * Falls back to null total if API is not available.
 *
 * @returns MemoryInfo with used and total memory in MB
 *
 * @example
 * ```ts
 * const memory = getMemoryInfo();
 * console.log(`Using ${memory.used} MB`);
 * if (memory.total) {
 *   console.log(`of ${memory.total} MB available`);
 * }
 * ```
 */
export function getMemoryInfo(): MemoryInfo {
  const perf = performance as ExtendedPerformance;

  // Check if memory API is available (Chrome/Edge)
  if (perf.memory) {
    const used = Math.round(perf.memory.usedJSHeapSize / BYTES_PER_MB);
    const total = Math.round(perf.memory.totalJSHeapSize / BYTES_PER_MB);

    return {
      used,
      total,
    };
  }

  // Fallback: return 0 used, null total
  // We can't detect memory usage on browsers without the API
  return {
    used: 0,
    total: null,
  };
}

/**
 * Format memory size for display.
 *
 * Converts MB to appropriate unit (MB or GB) with proper formatting.
 *
 * @param mb - Memory size in megabytes
 * @returns Formatted string (e.g., "512 MB" or "1.5 GB")
 *
 * @example
 * ```ts
 * formatMemory(512);   // "512 MB"
 * formatMemory(1536);  // "1.5 GB"
 * formatMemory(0);     // "0 MB"
 * ```
 */
export function formatMemory(mb: number): string {
  if (mb < 1024) {
    return `${Math.round(mb)} MB`;
  }

  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

/**
 * Format memory with full detail (used / total).
 *
 * @param usedMB - Memory used in MB
 * @param totalMB - Total memory available in MB (null if unknown)
 * @returns Formatted string for display
 *
 * @example
 * ```ts
 * formatMemoryDetail(512, 2048);  // "512 MB / 2.0 GB"
 * formatMemoryDetail(512, null);  // "512 MB used"
 * ```
 */
export function formatMemoryDetail(usedMB: number, totalMB: number | null): string {
  const used = formatMemory(usedMB);

  if (totalMB === null) {
    return `${used} used`;
  }

  const total = formatMemory(totalMB);
  return `${used} / ${total}`;
}

/**
 * Calculate memory usage percentage.
 *
 * @param usedMB - Memory used in MB
 * @param totalMB - Total memory available in MB
 * @returns Percentage (0-100) or null if total is unknown
 *
 * @example
 * ```ts
 * getMemoryPercentage(512, 1024);  // 50
 * getMemoryPercentage(512, null);  // null
 * ```
 */
export function getMemoryPercentage(usedMB: number, totalMB: number | null): number | null {
  if (totalMB === null || totalMB === 0) {
    return null;
  }

  return Math.round((usedMB / totalMB) * 100);
}

/**
 * Check if memory API is available in this browser.
 *
 * @returns true if performance.memory is available
 */
export function isMemoryAPIAvailable(): boolean {
  const perf = performance as ExtendedPerformance;
  return typeof perf.memory !== "undefined";
}

/**
 * Get a warning message if memory is running low.
 *
 * @returns Warning message or null if memory is OK
 */
export function getMemoryWarning(): string | null {
  const info = getMemoryInfo();

  if (info.total === null) {
    return null;
  }

  const percentage = (info.used / info.total) * 100;

  if (percentage > 90) {
    return "Memory usage is critically high. Consider closing other tabs.";
  }

  if (percentage > 80) {
    return "Memory usage is high. Performance may be affected.";
  }

  return null;
}
