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
    <div className={`bg-card w-72 rounded-lg border p-4 shadow-lg ${className}`}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="text-primary h-5 w-5" />
          <h3 className="text-card-foreground font-semibold">Performance</h3>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="hover:bg-muted rounded-md p-1 transition-colors"
            aria-label="Close performance panel"
          >
            <X className="text-muted-foreground h-4 w-4" />
          </button>
        )}
      </div>

      {/* Health Indicator */}
      <div className={`mb-4 rounded-md border p-2 ${healthColors.bg} ${healthColors.border}`}>
        <div className="flex items-center justify-between">
          <span className={`text-sm font-medium ${healthColors.text}`}>System Health</span>
          <span className={`text-sm font-semibold ${healthColors.text}`}>
            {getHealthLabel(data.health)}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="space-y-3">
        {/* GPU Status */}
        <div className="flex items-start gap-3">
          <Cpu className="text-muted-foreground mt-0.5 h-4 w-4" />
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-sm">GPU Status</div>
            <div className="flex items-center gap-2">
              <GPUStatusIcon status={data.gpuStatus} />
              <span className="text-card-foreground text-sm font-medium">
                {getGPUStatusLabel(data.gpuStatus)}
              </span>
            </div>
            {data.gpuName && data.gpuName !== "WebGPU Available" && (
              <div className="text-muted-foreground mt-0.5 truncate text-xs">{data.gpuName}</div>
            )}
          </div>
        </div>

        {/* Memory Usage */}
        <div className="flex items-start gap-3">
          <HardDrive className="text-muted-foreground mt-0.5 h-4 w-4" />
          <div className="min-w-0 flex-1">
            <div className="text-muted-foreground text-sm">Memory</div>
            <div className="text-card-foreground font-mono text-sm font-medium">
              {formatMemoryDetail(data.memoryUsedMB, data.memoryTotalMB)}
            </div>
            {data.memoryTotalMB !== null && (
              <MemoryBar used={data.memoryUsedMB} total={data.memoryTotalMB} />
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-muted-foreground mt-4 border-t pt-3 text-center text-xs">
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
      <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
        <div
          className={`h-full ${barColor} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="text-muted-foreground mt-0.5 text-xs">{percentage}% used</div>
    </div>
  );
}
