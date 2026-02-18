import { useMemo, useState } from "react";
import { Download, RefreshCw, Square, XCircle } from "lucide-react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/lib/ai/models";
import { useConversationModelStore, type DownloadLifecycle } from "@/store/conversationModelStore";
import { useModelStore } from "@/store/modelStore";

function getStatusClass(status: DownloadLifecycle): string {
  if (status === "Ready") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "Failed") {
    return "bg-red-100 text-red-700";
  }

  if (status === "Canceled") {
    return "bg-slate-100 text-slate-700";
  }

  return "bg-amber-100 text-amber-700";
}

export function DownloadManager() {
  const [confirmModelId, setConfirmModelId] = useState<string | null>(null);

  const isOpen = useConversationModelStore((state) => state.isDownloadManagerOpen);
  const openDownloadManager = useConversationModelStore((state) => state.openDownloadManager);
  const closeDownloadManager = useConversationModelStore((state) => state.closeDownloadManager);
  const lifecycleByModel = useConversationModelStore((state) => state.downloadLifecycleByModel);
  const loadingModelId = useConversationModelStore((state) => state.loadingModelId);
  const retryModelDownload = useConversationModelStore((state) => state.retryModelDownload);
  const cancelModelDownload = useConversationModelStore((state) => state.cancelModelDownload);
  const downloadProgress = useModelStore((state) => state.downloadProgress);

  const rows = useMemo(() => {
    return MODELS.map((model) => {
      const status = lifecycleByModel[model.id] ?? "Ready";
      const isActiveDownload =
        status === "Downloading" ||
        (status === "Compiling" && downloadProgress?.step === "compiling");

      return {
        id: model.id,
        name: model.name,
        sizeMB: model.sizeMB,
        status,
        progress: isActiveDownload
          ? (downloadProgress?.percentage ?? 0)
          : status === "Ready"
            ? 100
            : null,
        etaSeconds: isActiveDownload ? null : null,
      };
    });
  }, [downloadProgress?.percentage, downloadProgress?.step, lifecycleByModel]);

  const hasActivity = rows.some(
    (row) => row.status === "Queued" || row.status === "Downloading" || row.status === "Compiling"
  );

  return (
    <>
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => (isOpen ? closeDownloadManager() : openDownloadManager())}
          aria-expanded={isOpen}
          aria-label="Toggle download manager"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Downloads</span>
          {hasActivity ? <span className="h-2 w-2 rounded-full bg-[#FF6B35]" /> : null}
        </Button>

        {isOpen ? (
          <div className="absolute top-12 right-0 z-50 w-[320px] rounded-xl border border-gray-200 bg-white p-3 shadow-lg sm:w-[380px]">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-900">Download Manager</p>
              <button
                onClick={closeDownloadManager}
                className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Close download manager"
              >
                <XCircle className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2">
              {rows.map((row) => {
                const canRetry = row.status === "Failed";
                const canCancel =
                  row.status === "Queued" ||
                  row.status === "Downloading" ||
                  row.status === "Compiling";

                return (
                  <div key={row.id} className="rounded-lg border border-gray-100 px-3 py-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">{row.name}</p>
                        <p className="text-xs text-gray-500">{row.sizeMB}MB</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${getStatusClass(row.status)}`}
                      >
                        {row.status}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-[#FF6B35] transition-all"
                          style={{ width: `${row.progress ?? 0}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-gray-500">
                        <span>
                          {row.progress === null
                            ? "Progress: --"
                            : `Progress: ${Math.round(row.progress)}%`}
                        </span>
                        <span>
                          ETA:{" "}
                          {row.etaSeconds === null
                            ? "--"
                            : `${Math.max(0, Math.round(row.etaSeconds))}s`}
                        </span>
                      </div>
                    </div>

                    {(canRetry || canCancel) && (
                      <div className="mt-2 flex items-center gap-2">
                        {canRetry ? (
                          <button
                            onClick={() => void retryModelDownload(row.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-[#FF6B35] hover:text-[#FF6B35]/80"
                          >
                            <RefreshCw className="h-3 w-3" />
                            Retry
                          </button>
                        ) : null}
                        {canCancel ? (
                          <button
                            onClick={() => setConfirmModelId(row.id)}
                            className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-gray-800"
                          >
                            <Square className="h-3 w-3" />
                            Cancel
                          </button>
                        ) : null}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

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
        variant="warning"
      />
    </>
  );
}
