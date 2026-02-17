/**
 * StatusIndicator - Offline/Online status badge
 *
 * Shows the current offline capability status of the app.
 * Fixed position at bottom-left of the screen.
 *
 * States:
 * - checking: Verifying offline capability
 * - offline-ready: App is cached and works offline
 * - online-required: First-time setup needs internet
 */

import { useEffect, useState } from "react";
import { Loader2, CheckCircle2, WifiOff } from "lucide-react";
// @ts-expect-error - virtual:pwa-register/react doesn't have types
import { useRegisterSW } from "virtual:pwa-register/react";

/**
 * Status state for the indicator
 */
type StatusState = "checking" | "offline-ready" | "online-required";

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
  const [status, setStatus] = useState<StatusState>("checking");
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Use vite-plugin-pwa's SW registration hook
  const { offlineReady } = useRegisterSW({
    onRegisteredSW(_swUrl: string, r: ServiceWorkerRegistration | undefined) {
      if (r) {
        // Service Worker is registered
        setStatus("offline-ready");
      }
    },
    onRegisterError(_error: Error) {
      setStatus("online-required");
    },
  });

  // Track online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check if SW is already registered
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then(() => {
        setStatus("offline-ready");
      }).catch(() => {
        setStatus("online-required");
      });
    } else {
      setStatus("online-required");
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Update status when offlineReady changes
  useEffect(() => {
    if (offlineReady) {
      setStatus("offline-ready");
    }
  }, [offlineReady]);

  // Render based on status
  if (status === "checking") {
    return (
      <div
        className={`fixed left-4 bottom-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-muted text-muted-foreground text-sm shadow-lg ${className}`}
        title="Verifying offline capability"
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Checking...</span>
      </div>
    );
  }

  if (status === "offline-ready") {
    return (
      <div
        className={`fixed left-4 bottom-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-green-50 text-green-700 text-sm shadow-lg border border-green-200 ${className}`}
        title="App cached for offline use"
      >
        <CheckCircle2 className="h-4 w-4" />
        <span>Works Offline</span>
        {!isOnline && (
          <span className="ml-1 text-xs opacity-75">(Offline Mode)</span>
        )}
      </div>
    );
  }

  // online-required status
  return (
    <div
      className={`fixed left-4 bottom-4 z-50 flex items-center gap-2 px-3 py-2 rounded-full bg-amber-50 text-amber-700 text-sm shadow-lg border border-amber-200 ${className}`}
      title="First-time setup needs internet"
    >
      <WifiOff className="h-4 w-4" />
      <span>Online Required</span>
    </div>
  );
}
