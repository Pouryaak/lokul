/**
 * Performance Metrics - System health and performance tracking
 *
 * Provides utilities for calculating system health based on GPU status
 * and memory usage. Used by PerformancePanel and StatusIndicator.
 */

import { checkWebGPUSupport } from "./gpu-detection";
import { getMemoryInfo } from "./memory-monitor";

/**
 * System health status levels
 */
export type SystemHealth = "healthy" | "warning" | "critical";

/**
 * GPU status for display
 */
export type GPUStatus = "active" | "inactive" | "unsupported";

/**
 * Performance metrics for display in PerformancePanel
 */
export interface PerformanceMetrics {
  /** GPU status for AI inference */
  gpuStatus: GPUStatus;

  /** GPU device name if available */
  gpuName: string | null;

  /** Memory used in MB */
  memoryUsedMB: number;

  /** Total memory available in MB (null if not detectable) */
  memoryTotalMB: number | null;

  /** Overall system health */
  health: SystemHealth;
}

/**
 * Memory thresholds for health calculation (in MB)
 */
const MEMORY_THRESHOLDS = {
  /** Warning threshold: 1GB used */
  WARNING_MB: 1024,
  /** Critical threshold: 2GB used */
  CRITICAL_MB: 2048,
  /** Warning percentage: 80% of available */
  WARNING_PERCENT: 0.8,
  /** Critical percentage: 90% of available */
  CRITICAL_PERCENT: 0.9,
};

/**
 * Get the current system health based on GPU and memory status.
 *
 * Health calculation:
 * - healthy: GPU active + memory usage normal
 * - warning: GPU active but memory usage high (>80% or >1GB)
 * - critical: No GPU support OR memory critical (>90% or >2GB)
 *
 * @returns SystemHealth status level
 *
 * @example
 * ```ts
 * const health = getSystemHealth();
 * if (health === "critical") {
 *   showWarning("System resources are critically low");
 * }
 * ```
 */
export function getSystemHealth(): SystemHealth {
  const gpuInfo = checkWebGPUSupport();
  const memoryInfo = getMemoryInfo();

  // Critical: No GPU support
  if (!gpuInfo.supported) {
    return "critical";
  }

  // Calculate memory health
  const memoryStatus = getMemoryHealthStatus(memoryInfo);

  // Critical: Memory is critically high
  if (memoryStatus === "critical") {
    return "critical";
  }

  // Warning: Memory is high but not critical
  if (memoryStatus === "warning") {
    return "warning";
  }

  // Healthy: GPU active and memory normal
  return "healthy";
}

/**
 * Get comprehensive performance metrics.
 *
 * Combines GPU detection and memory monitoring into a single
 * metrics object for display in the PerformancePanel.
 *
 * @returns PerformanceMetrics with current system state
 *
 * @example
 * ```ts
 * const metrics = getPerformanceMetrics();
 * console.log(`GPU: ${metrics.gpuName} (${metrics.gpuStatus})`);
 * console.log(`Memory: ${metrics.memoryUsedMB} MB used`);
 * console.log(`Health: ${metrics.health}`);
 * ```
 */
export function getPerformanceMetrics(): PerformanceMetrics {
  const gpuInfo = checkWebGPUSupport();
  const memoryInfo = getMemoryInfo();
  const health = getSystemHealth();

  // Determine GPU status
  let gpuStatus: GPUStatus;
  if (!gpuInfo.supported) {
    gpuStatus = "unsupported";
  } else if (gpuInfo.deviceName && gpuInfo.deviceName !== "WebGPU Available") {
    gpuStatus = "active";
  } else {
    gpuStatus = "inactive";
  }

  return {
    gpuStatus,
    gpuName: gpuInfo.deviceName,
    memoryUsedMB: memoryInfo.used,
    memoryTotalMB: memoryInfo.total,
    health,
  };
}

/**
 * Calculate memory health status based on usage.
 *
 * @param memoryInfo - Memory information from getMemoryInfo()
 * @returns Health status for memory specifically
 */
function getMemoryHealthStatus(memoryInfo: { used: number; total: number | null }): SystemHealth {
  const { used, total } = memoryInfo;

  // Check absolute thresholds
  if (used >= MEMORY_THRESHOLDS.CRITICAL_MB) {
    return "critical";
  }

  if (used >= MEMORY_THRESHOLDS.WARNING_MB) {
    // If we have total, check percentage too
    if (total !== null) {
      const usagePercent = used / total;
      if (usagePercent >= MEMORY_THRESHOLDS.CRITICAL_PERCENT) {
        return "critical";
      }
    }
    return "warning";
  }

  // Check percentage thresholds if total is available
  if (total !== null) {
    const usagePercent = used / total;

    if (usagePercent >= MEMORY_THRESHOLDS.CRITICAL_PERCENT) {
      return "critical";
    }

    if (usagePercent >= MEMORY_THRESHOLDS.WARNING_PERCENT) {
      return "warning";
    }
  }

  return "healthy";
}

/**
 * Get a human-readable label for GPU status.
 *
 * @param status - GPUStatus value
 * @returns Display label
 */
export function getGPUStatusLabel(status: GPUStatus): string {
  const labels: Record<GPUStatus, string> = {
    active: "Active",
    inactive: "Inactive",
    unsupported: "Not Supported",
  };
  return labels[status];
}

/**
 * Get a human-readable label for system health.
 *
 * @param health - SystemHealth value
 * @returns Display label
 */
export function getHealthLabel(health: SystemHealth): string {
  const labels: Record<SystemHealth, string> = {
    healthy: "Healthy",
    warning: "Warning",
    critical: "Critical",
  };
  return labels[health];
}

/**
 * Get CSS color classes for health status.
 *
 * @param health - SystemHealth value
 * @returns Object with bg and text color classes
 */
export function getHealthColorClasses(health: SystemHealth): {
  bg: string;
  text: string;
  border: string;
} {
  const classes: Record<SystemHealth, { bg: string; text: string; border: string }> = {
    healthy: {
      bg: "bg-green-100",
      text: "text-green-800",
      border: "border-green-200",
    },
    warning: {
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      border: "border-yellow-200",
    },
    critical: {
      bg: "bg-red-100",
      text: "text-red-800",
      border: "border-red-200",
    },
  };
  return classes[health];
}
