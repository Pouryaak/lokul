import { useState, useEffect, useCallback } from "react";
import { Activity, Cpu, HardDrive, Zap, X, Wifi, WifiOff, CheckCircle2, Download } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useInstallEligibility } from "@/hooks/useInstallEligibility";
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

interface PerformanceData {
  gpuStatus: GPUStatus;
  gpuName: string | null;
  memoryUsedMB: number;
  memoryTotalMB: number | null;
  health: SystemHealth;
  gpuDetails: GPUInfo | null;
}

type ConnectionStatus = "online" | "offline" | "offline-ready" | "installed";

function getHealthBadgeColor(health: SystemHealth): string {
  switch (health) {
    case "healthy":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    case "warning":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "critical":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function getGPUStatusColor(status: GPUStatus): string {
  switch (status) {
    case "active":
      return "text-emerald-400";
    case "inactive":
      return "text-amber-400";
    case "unsupported":
      return "text-red-400";
    default:
      return "text-muted-foreground";
  }
}

function getConnectionBadgeColor(status: ConnectionStatus): string {
  switch (status) {
    case "offline":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "online":
    case "offline-ready":
    case "installed":
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function CircularHealthIndicator({ health, percentage }: { health: SystemHealth; percentage?: number }) {
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (percentage ?? 0) * circumference;

  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 40 40">
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          className="text-muted/30"
        />
        <circle
          cx="20"
          cy="20"
          r="18"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={cn(
            "transition-all duration-500",
            health === "healthy" && "text-emerald-500",
            health === "warning" && "text-amber-500",
            health === "critical" && "text-red-500"
          )}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className={cn(
          "h-5 w-5",
          health === "healthy" && "text-emerald-400",
          health === "warning" && "text-amber-400",
          health === "critical" && "text-red-400"
        )} />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  status,
  children,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  status?: "healthy" | "warning" | "critical" | "neutral";
  children?: React.ReactNode;
}) {
  return (
    <div className="relative overflow-hidden rounded-xl bg-muted/30 p-3">
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
          status === "healthy" && "bg-emerald-500/10 text-emerald-400",
          status === "warning" && "bg-amber-500/10 text-amber-400",
          status === "critical" && "bg-red-500/10 text-red-400",
          status === "neutral" && "bg-[#FF6B35]/10 text-[#FF6B35]",
          !status && "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="truncate text-sm font-semibold text-[var(--chat-text-primary)]">{value}</p>
          {subtext && <p className="truncate text-[10px] text-muted-foreground">{subtext}</p>}
          {children}
        </div>
      </div>
    </div>
  );
}

function MemoryBar({ used, total }: { used: number; total: number }) {
  const percentage = Math.min(100, Math.round((used / total) * 100));

  let colorClass = "bg-emerald-500";
  if (percentage > 70) colorClass = "bg-amber-500";
  if (percentage > 85) colorClass = "bg-red-500";

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
        <span>{percentage}% used</span>
        <span>{formatMemoryDetail(used, total)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={cn("h-full transition-all duration-500", colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function PerformanceButton() {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<PerformanceData>({
    gpuStatus: "inactive",
    gpuName: null,
    memoryUsedMB: 0,
    memoryTotalMB: null,
    health: "healthy",
    gpuDetails: null,
  });

  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(
    navigator.onLine ? "online" : "offline"
  );
  const { isEligible, isInstalled, promptInstall } = useInstallEligibility();
  const {
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(_swUrl: string, r: ServiceWorkerRegistration | undefined) {
      if (r) {
        setConnectionStatus(navigator.onLine ? "offline-ready" : "offline");
      }
    },
    onRegisterError(_error: Error) {
      setConnectionStatus(navigator.onLine ? "online" : "offline");
    },
  });

  const refreshData = useCallback(async () => {
    const metrics = getPerformanceMetrics();
    const memoryInfo = getMemoryInfo();
    const gpuInfo = checkWebGPUSupport();

    let detailedInfo: GPUInfo | null = null;
    try {
      detailedInfo = await getGPUInfo();
    } catch {
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

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, [refreshData]);

  useEffect(() => {
    const handleOnline = () => setConnectionStatus(offlineReady ? "offline-ready" : "online");
    const handleOffline = () => setConnectionStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineReady]);

  useEffect(() => {
    if (isInstalled) {
      setConnectionStatus("installed");
    }
  }, [isInstalled]);

  const healthColors = getHealthColorClasses(data.health);
  const healthPercentage = data.memoryTotalMB
    ? Math.min(100, Math.round((data.memoryUsedMB / data.memoryTotalMB) * 100))
    : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Performance status"
        >
          <Activity className="h-4 w-4" />
          <span
            className={cn(
              "absolute bottom-1 right-1 h-2 w-2 rounded-full border border-[var(--chat-header-bg)]",
              data.health === "healthy" && "bg-emerald-500",
              data.health === "warning" && "bg-amber-500",
              data.health === "critical" && "bg-red-500"
            )}
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[340px] border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--chat-border-subtle)] px-4 py-3">
          <div className="flex items-center gap-3">
            <CircularHealthIndicator health={data.health} percentage={healthPercentage} />
            <div>
              <h3 className="text-sm font-semibold text-[var(--chat-text-primary)]">Performance</h3>
              <p className="text-[10px] text-muted-foreground">
                {getHealthLabel(data.health)} · Updates every 5s
              </p>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close performance panel"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-3 space-y-3">
          {/* Health Badge */}
          <div
            className={cn(
              "flex items-center justify-between rounded-lg border px-3 py-2",
              getHealthBadgeColor(data.health)
            )}
          >
            <span className="text-xs font-medium">System Status</span>
            <span className="text-xs font-semibold">{getHealthLabel(data.health)}</span>
          </div>

          {/* Stats Grid */}
          <div className="grid gap-2">
            <StatCard
              icon={Cpu}
              label="GPU"
              value={getGPUStatusLabel(data.gpuStatus)}
              subtext={data.gpuName && data.gpuName !== "WebGPU Available" ? data.gpuName : undefined}
              status={data.gpuStatus === "active" ? "healthy" : data.gpuStatus === "inactive" ? "warning" : "critical"}
            />

            <StatCard
              icon={HardDrive}
              label="Memory"
              value={data.memoryTotalMB ? `${Math.round((data.memoryUsedMB / data.memoryTotalMB) * 100)}%` : "--"}
              subtext={formatMemoryDetail(data.memoryUsedMB, data.memoryTotalMB)}
              status="neutral"
            >
              {data.memoryTotalMB !== null && (
                <MemoryBar used={data.memoryUsedMB} total={data.memoryTotalMB} />
              )}
            </StatCard>

            <StatCard
              icon={connectionStatus === "offline" ? WifiOff : Wifi}
              label="Connection"
              value={connectionStatus === "offline-ready" ? "Offline Ready" : connectionStatus === "installed" ? "Installed" : connectionStatus}
              subtext={offlineReady ? "Works offline" : "Online only"}
              status={connectionStatus === "offline" ? "warning" : "healthy"}
            />
          </div>

          {/* Install Button */}
          {isEligible && (
            <button
              onClick={promptInstall}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B35]/10 px-4 py-2.5 text-sm font-medium text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/20"
            >
              <Download className="h-4 w-4" />
              Install Lokul
            </button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
