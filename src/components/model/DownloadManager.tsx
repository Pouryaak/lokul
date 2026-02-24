import { useEffect, useMemo, useRef, useState } from "react";
import { Download, RefreshCw, Square, Check, X, Loader2 } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnimatedCircularProgressBar } from "@/components/ui/animated-circular-progress-bar";
import { MODELS } from "@/lib/ai/models";
import { useConversationModelStore, type DownloadLifecycle } from "@/store/conversationModelStore";
import { useModelStore } from "@/store/modelStore";
import { cn } from "@/lib/utils";

interface ModelRow {
  id: string;
  name: string;
  sizeMB: number;
  status: DownloadLifecycle | "Ready"; // Internal status for display
  displayStatus: DownloadLifecycle | "Not downloaded";
  progress: number | null;
  etaSeconds: number | null;
}

function getDisplayStatus(
  lifecycle: DownloadLifecycle | undefined,
  isLoadedModel: boolean
): DownloadLifecycle | "Not downloaded" {
  if (lifecycle) {
    return lifecycle;
  }
  if (isLoadedModel) {
    return "Ready";
  }
  return "Not downloaded";
}

function estimateRemainingSeconds(percentage: number, elapsedSeconds: number): number | null {
  if (percentage <= 0 || elapsedSeconds <= 0) {
    return null;
  }
  const remainingRatio = Math.max(0, (100 - percentage) / percentage);
  return Math.round(elapsedSeconds * remainingRatio);
}

function formatTime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds}s`;
  }
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}

function getProgressText(status: DownloadLifecycle, progress: number | null): string {
  if (status === "Compiling") {
    return "Loading into memory...";
  }
  if (status === "Downloading" && progress !== null) {
    return `Downloading... ${Math.round(progress)}%`;
  }
  return "Preparing...";
}

function StatusBadge({ status }: { status: DownloadLifecycle | "Not downloaded" }) {
  const isReady = status === "Ready";
  const isFailed = status === "Failed";
  const isDownloading = status === "Downloading";
  const isCompiling = status === "Compiling";
  const isQueued = status === "Queued";

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide",
        isReady && "bg-emerald-500/10 text-emerald-400",
        isFailed && "bg-red-500/10 text-red-400",
        (isDownloading || isCompiling) && "bg-[#FF6B35]/10 text-[#FF6B35]",
        isQueued && "bg-amber-500/10 text-amber-400",
        status === "Not downloaded" && "bg-muted text-muted-foreground"
      )}
    >
      {(isDownloading || isCompiling) && <Loader2 className="h-3 w-3 animate-spin" />}
      {isReady && <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
      {isFailed && <div className="h-1.5 w-1.5 rounded-full bg-red-400" />}
      {isQueued && <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />}
      {status === "Not downloaded" && <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />}
      {status === "Compiling" ? "Loading" : status}
    </div>
  );
}

function CircularStatusIndicator({
  progress,
  status,
}: {
  progress: number | null;
  status: DownloadLifecycle | "Not downloaded";
}) {
  const isReady = status === "Ready";
  const isDownloading = status === "Downloading" || status === "Compiling";
  const effectiveProgress = progress ?? 0;

  // Ready state: elegant green circle with checkmark
  if (isReady) {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20">
          <Check className="h-5 w-5 text-emerald-400" strokeWidth={2.5} />
        </div>
      </div>
    );
  }

  // Downloading/Compiling: animated circular progress
  if (isDownloading && progress !== null) {
    return (
      <div className="relative h-14 w-14">
        <AnimatedCircularProgressBar
          max={100}
          min={0}
          value={effectiveProgress}
          gaugePrimaryColor="#FF6B35"
          gaugeSecondaryColor="rgba(255, 107, 53, 0.15)"
          className="size-14 text-xs font-medium text-[#FF6B35]"
        />
      </div>
    );
  }

  // Queued: subtle pulsing ring
  if (status === "Queued") {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="absolute inset-0 animate-pulse rounded-full bg-amber-500/10" />
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/20">
          <span className="text-xs font-medium text-amber-400">--</span>
        </div>
      </div>
    );
  }

  // Failed: subtle red indicator
  if (status === "Failed") {
    return (
      <div className="relative flex h-14 w-14 items-center justify-center">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-500/20">
          <span className="text-xs font-medium text-red-400">!</span>
        </div>
      </div>
    );
  }

  // Not downloaded: empty state
  return (
    <div className="relative flex h-14 w-14 items-center justify-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
        <span className="text-xs font-medium text-muted-foreground">--</span>
      </div>
    </div>
  );
}

export function DownloadManager() {
  const [confirmModelId, setConfirmModelId] = useState<string | null>(null);
  const previousHasActivityRef = useRef(false);

  const isOpen = useConversationModelStore((state) => state.isDownloadManagerOpen);
  const openDownloadManager = useConversationModelStore((state) => state.openDownloadManager);
  const closeDownloadManager = useConversationModelStore((state) => state.closeDownloadManager);
  const lifecycleByModel = useConversationModelStore((state) => state.downloadLifecycleByModel);
  const loadingModelId = useConversationModelStore((state) => state.loadingModelId);
  const engineLoadedModelId = useConversationModelStore((state) => state.engineLoadedModelId);
  const retryModelDownload = useConversationModelStore((state) => state.retryModelDownload);
  const cancelModelDownload = useConversationModelStore((state) => state.cancelModelDownload);
  const downloadProgress = useModelStore((state) => state.downloadProgress);

  const rows = useMemo<ModelRow[]>(() => {
    return MODELS.map((model) => {
      // IMPORTANT: Don't default to "Ready" - use undefined to indicate no lifecycle state
      // This prevents hasActivity from becoming false during state transitions
      const status = lifecycleByModel[model.id];
      const displayStatus = getDisplayStatus(lifecycleByModel[model.id], engineLoadedModelId === model.id);
      const isActiveDownload =
        status === "Downloading" || (status === "Compiling" && downloadProgress?.step === "compiling");

      return {
        id: model.id,
        name: model.name,
        sizeMB: model.sizeMB,
        status: status ?? "Ready", // Internal status can default to Ready
        displayStatus,
        progress: isActiveDownload ? (downloadProgress?.percentage ?? 0) : displayStatus === "Ready" ? 100 : null,
        etaSeconds:
          isActiveDownload && downloadProgress
            ? estimateRemainingSeconds(downloadProgress.percentage, downloadProgress.timeElapsed)
            : null,
      };
    });
  }, [downloadProgress, engineLoadedModelId, lifecycleByModel]);

  // Check for activity using the raw lifecycle state, not the defaulted status
  const hasActivity = rows.some(
    (row) => {
      const rawLifecycle = lifecycleByModel[row.id];
      return rawLifecycle === "Queued" || rawLifecycle === "Downloading" || rawLifecycle === "Compiling";
    }
  );

  const activeDownloads = rows.filter((row) => row.status === "Downloading" || row.status === "Compiling");
  const completedDownloads = rows.filter((row) => row.status === "Ready");
  const queuedDownloads = rows.filter((row) => row.status === "Queued");

  useEffect(() => {
    const hadActivityBefore = previousHasActivityRef.current;

    if (isOpen && hadActivityBefore && !hasActivity) {
      closeDownloadManager();
    }

    previousHasActivityRef.current = hasActivity;
  }, [closeDownloadManager, hasActivity, isOpen]);

  return (
    <>
      <Popover
        open={isOpen}
        onOpenChange={(nextOpen) => {
          // Prevent closing if we have active downloads (Queued, Downloading, or Compiling)
          if (!nextOpen && hasActivity) {
            return;
          }

          if (nextOpen) {
            openDownloadManager();
          } else {
            closeDownloadManager();
          }
        }}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-expanded={isOpen}
            aria-label="Toggle download manager"
            className="relative h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            {hasActivity && (
              <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#FF6B35] opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[#FF6B35]" />
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          className="w-[360px] border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--chat-border-subtle)] px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#FF6B35]/10">
                <Download className="h-4 w-4 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--chat-text-primary)]">Models</h3>
                <p className="text-[10px] text-muted-foreground">
                  {completedDownloads.length} ready
                  {activeDownloads.length > 0 && ` · ${activeDownloads.length} loading`}
                  {queuedDownloads.length > 0 && ` · ${queuedDownloads.length} queued`}
                </p>
              </div>
            </div>
            <button
              onClick={closeDownloadManager}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Close download manager"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Model List */}
          <div className="max-h-[320px] overflow-y-auto p-2">
            <div className="space-y-1">
              {rows.map((row) => {
                const canRetry = row.status === "Failed";
                const canCancel =
                  row.status === "Queued" || row.status === "Downloading" || row.status === "Compiling";
                const isActive = row.status === "Downloading" || row.status === "Compiling";

                return (
                  <div
                    key={row.id}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl p-2 transition-colors",
                      isActive && "bg-[#FF6B35]/5",
                      !isActive && "hover:bg-muted/50"
                    )}
                  >
                    {/* Circular Progress / Status */}
                    <CircularStatusIndicator progress={row.progress} status={row.displayStatus} />

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate text-sm font-medium text-[var(--chat-text-primary)]">
                          {row.name}
                        </p>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{row.sizeMB} MB</p>

                      {/* Progress details for active downloads */}
                      {isActive && (
                        <p className="mt-0.5 text-[10px] text-[#FF6B35]">
                          {getProgressText(row.status, row.progress)}
                          {row.status === "Downloading" && row.etaSeconds !== null && ` · ${formatTime(row.etaSeconds)} left`}
                        </p>
                      )}

                      {/* Action buttons */}
                      {(canRetry || canCancel) && (
                        <div className="mt-1.5 flex items-center gap-2">
                          {canRetry && (
                            <button
                              onClick={() => void retryModelDownload(row.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FF6B35] transition-colors hover:text-[#FF6B35]/80"
                            >
                              <RefreshCw className="h-3 w-3" />
                              Retry
                            </button>
                          )}
                          {canCancel && (
                            <button
                              onClick={() => setConfirmModelId(row.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <Square className="h-3 w-3 fill-current" />
                              Cancel
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      <StatusBadge status={row.displayStatus} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <ConfirmDialog
        isOpen={Boolean(confirmModelId)}
        onClose={() => setConfirmModelId(null)}
        onConfirm={() => {
          if (confirmModelId) {
            cancelModelDownload(confirmModelId);
          }
          setConfirmModelId(null);
        }}
        title="Cancel model download?"
        description={
          loadingModelId === confirmModelId
            ? "This will stop the active download and keep your current chat available."
            : "This will remove the queued model download request."
        }
        confirmText="Cancel download"
        cancelText="Keep downloading"
        variant="danger"
      />
    </>
  );
}
