/**
 * PerformancePanel - GPU and memory stats display
 *
 * Shows system performance metrics including:
 * - GPU status (Active/Inactive/Not Supported)
 * - GPU device name
 * - Memory usage (MB / total)
 * - System health indicator (Green/Yellow/Red)
 *
 * Updates every 5 seconds for real-time monitoring.
 */

import { useEffect, useState, useCallback } from "react";
import { Activity, Cpu, HardDrive, X } from "lucide-react";
import { checkWebGPUSupport, getGPUInfo } from "@/lib/performance/gpu-detection";
import { getMemoryInfo, formatMemoryDetail } from "@/lib/performance/memory-monitor";
import {
  getSystemHealth,
  getPerformanceMetrics,
  type SystemHealth,
  type GPUStatus,
  getGPUStatusLabel,
  getHealthLabel,
  getHealthColorClasses,
} from "@/lib/performance/metrics";
import type { GPUInfo } from "@/types/index";

/**
 * Props for PerformancePanel component
 */
interface PerformancePanelProps {
  /** Optional className for styling overrides */
  className?: string;

  /** Callback when panel is closed */
  onClose?: () => void;
}

/**
 * Panel data structure for state management
 */
interface PanelData {
  gpuStatus: GPUStatus;
  gpuName: string | null;
  memoryUsedMB: number;
  memoryTotalMB: number | null;
  health: SystemHealth;
  gpuDetails: GPUInfo | null;
}

/**
 * PerformancePanel displays system performance metrics.
 *
 * Shows GPU status, memory usage, and system health in a
 * compact card layout. Updates every 5 seconds.
 *
 * @example
 * ```tsx
 * <PerformancePanel onClose={() => setShowPanel(false)} />
 * ```
 */
export function PerformancePanel({ className = "", onClose }: PerformancePanelProps) {
  const [data, setData] = useState<PanelData>({
    gpuStatus: "inactive",
    gpuName: null,
    memoryUsedMB: 0,
    memoryTotalMB: null,
    health: "healthy",
    gpuDetails: null,
  });

  /**
   * Refresh all performance data
   */
  const refreshData = useCallback(async () => {
    const metrics = getPerformanceMetrics();
    const memoryInfo = getMemoryInfo();
    const gpuInfo = checkWebGPUSupport();

    // Get detailed GPU info asynchronously
    let detailedInfo: GPUInfo | null = null;
    try {
      detailedInfo = await getGPUInfo();
    } catch {
      // Use basic info if detailed fails
      detailedInfo = null;
    }

    setData({
      gpuStatus: metrics.gpuStatus,
      gpuName: detailedInfo?.deviceName || gpuInfo.deviceName,
      memoryUsedMB: memoryInfo.used,
      memoryTotalMB: memoryInfo.total,
      health: getSystemHealth(),
      gpuDetails: detailedInfo,
    });
  }, []);

  // Initial load and interval updates
  useEffect(() => {
    refreshData();

    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const healthColors = getHealthColorClasses(data.health);

  return (
    <div
      className={`bg-card border rounded-lg shadow-lg p-4 w-72 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-card-foreground">Performance</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Close performance panel"
          >
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Health Indicator */}
      <div className={`mb-4 p-2 rounded-md border ${healthColors.bg} ${healthColors.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${healthColors.text}`}>
            System Health
          </span>
          <span className={`text-sm font-semibold ${healthColors.text}`}>
            {getHealthLabel(data.health)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* GPU Status */}
        <div className="flex items-start gap-3">
          <Cpu className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">GPU Status</div>
            <div className="flex items-center gap-2">
              <GPUStatusIcon status={data.gpuStatus} />
              <span className="text-sm font-medium text-card-foreground">
                {getGPUStatusLabel(data.gpuStatus)}
              </span>
            </div>
            {data.gpuName && data.gpuName !== "WebGPU Available" && (
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {data.gpuName}
              </div>
            )}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-start gap-3">
          <HardDrive className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-muted-foreground">Memory</div>
            <div className="text-sm font-medium text-card-foreground font-mono">
              {formatMemoryDetail(data.memoryUsedMB, data.memoryTotalMB)}
            </div>
            {data.memoryTotalMB !== null && (
              <MemoryBar used={data.memoryUsedMB} total={data.memoryTotalMB} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t text-xs text-muted-foreground text-center">
        Updates every 5 seconds
      </div>
    </div>
  );
}

/**
 * GPU Status Icon component
 */
function GPUStatusIcon({ status }: { status: GPUStatus }) {
  switch (status) {
    case "active":
      return <div className="h-2 w-2 rounded-full bg-green-500" />;
    case "inactive":
      return <div className="h-2 w-2 rounded-full bg-yellow-500" />;
    case "unsupported":
      return <div className="h-2 w-2 rounded-full bg-red-500" />;
    default:
      return null;
  }
}

/**
 * Memory usage bar component
 */
function MemoryBar({ used, total }: { used: number; total: number }) {
  const percentage = Math.min(100, Math.round((used / total) * 100));

  let barColor = "bg-green-500";
  if (percentage > 80) barColor = "bg-yellow-500";
  if (percentage > 90) barColor = "bg-red-500";

  return (
    <div className="mt-1.5">
      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-xs text-muted-foreground mt-0.5">
        {percentage}% used
      </div>
    </div>
  );
}
