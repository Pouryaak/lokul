import { useEffect, useState } from "react";
import { CheckCircle2, Download, Wifi, WifiOff } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useInstallEligibility } from "@/hooks/useInstallEligibility";

/**
 * Status state for the indicator
 */
type StatusState = "online" | "offline" | "offline-ready" | "installed";

/**
 * Props for StatusIndicator component
 */
interface StatusIndicatorProps {
  /** Optional className for styling overrides */
  className?: string;
}

/**
 * StatusIndicator displays the app's offline capability status.
 *
 * Shows a fixed badge at the bottom-left indicating whether
 * the app is ready to work offline or requires an internet connection.
 *
 * @example
 * ```tsx
 * <StatusIndicator />
 * ```
 */
export function StatusIndicator({ className = "" }: StatusIndicatorProps) {
  const [status, setStatus] = useState<StatusState>(navigator.onLine ? "online" : "offline");
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isEligible, isInstalled, promptInstall } = useInstallEligibility();

  const {
    offlineReady: [offlineReady],
  } = useRegisterSW({
    onRegisteredSW(_swUrl: string, r: ServiceWorkerRegistration | undefined) {
      if (r) {
        setStatus(navigator.onLine ? "offline-ready" : "offline");
      }
    },
    onRegisterError(_error: Error) {
      setStatus(navigator.onLine ? "online" : "offline");
    },
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setStatus(offlineReady ? "offline-ready" : "online");
    };

    const handleOffline = () => {
      setIsOnline(false);
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [offlineReady]);

  useEffect(() => {
    if (isInstalled) {
      setStatus("installed");
      return;
    }

    if (!isOnline) {
      setStatus("offline");
      return;
    }

    setStatus(offlineReady ? "offline-ready" : "online");
  }, [isInstalled, isOnline, offlineReady]);

  const handleInstall = async () => {
    await promptInstall();
  };

  const statusConfig: Record<
    StatusState,
    { label: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    online: { label: "Online", icon: Wifi },
    offline: { label: "Offline", icon: WifiOff },
    "offline-ready": { label: "Offline Ready", icon: CheckCircle2 },
    installed: { label: "Installed", icon: CheckCircle2 },
  };

  const currentStatus = statusConfig[status];
  const StatusIcon = currentStatus.icon;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
          status === "offline"
            ? "border-amber-300 bg-amber-50 text-amber-700"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        )}
        title={currentStatus.label}
      >
        <StatusIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{currentStatus.label}</span>
      </div>

      {isEligible && (
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={handleInstall}
          aria-label="Install Lokul app"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Install</span>
        </Button>
      )}
    </div>
  );
}
