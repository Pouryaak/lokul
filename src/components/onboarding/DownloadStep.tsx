import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Progress } from "@/components/ui/Progress";
import type { ModelConfig } from "@/lib/ai/models";
import { useModelStore } from "@/store/modelStore";
import { formatBytes, formatTimeEstimate } from "@/lib/utils";
import { Clock, HardDrive, X } from "lucide-react";

interface DownloadStepProps {
  model: ModelConfig;
  onComplete: () => void;
  onCancel: () => void;
}

function formatSize(mb: number): string {
  if (mb < 1000) {
    return `${mb} MB`;
  }
  return `${(mb / 1000).toFixed(1)} GB`;
}

export function DownloadStep({ model, onComplete, onCancel }: DownloadStepProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const loadModel = useModelStore((state) => state.loadModel);
  const downloadProgress = useModelStore((state) => state.downloadProgress);
  const loadingStep = useModelStore((state) => state.loadingStep);
  const modelError = useModelStore((state) => state.error);
  const currentModel = useModelStore((state) => state.currentModel);
  const cancelDownload = useModelStore((state) => state.cancelDownload);
  const resetModel = useModelStore((state) => state.resetModel);

  useEffect(() => {
    if (!hasStarted && loadingStep === "idle") {
      setHasStarted(true);
      loadModel(model.id);
    }
  }, [hasStarted, loadingStep, loadModel, model.id]);

  useEffect(() => {
    if (loadingStep === "ready" && currentModel) {
      onComplete();
    }
  }, [loadingStep, currentModel, onComplete]);

  const handleCancel = () => {
    cancelDownload();
    resetModel();
    onCancel();
  };

  const percentage = downloadProgress?.percentage ?? 0;
  const total = model.sizeMB * 1024 * 1024;
  const loaded = Math.round((percentage / 100) * total);
  const estimatedTime = downloadProgress?.timeElapsed
    ? Math.round((downloadProgress.timeElapsed / Math.max(percentage, 1)) * (100 - percentage))
    : null;

  const getStepLabel = () => {
    if (downloadProgress?.text) {
      return downloadProgress.text;
    }
    switch (loadingStep) {
      case "downloading":
        return "Downloading model files...";
      case "compiling":
        return "Compiling shaders...";
      case "ready":
        return "Ready!";
      case "error":
        return "Error occurred";
      default:
        return "Initializing...";
    }
  };

  // Error state
  if (modelError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-4">
        <div className="mx-auto max-w-[400px] text-center">
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
                <X className="h-8 w-8 text-red-500" />
              </div>
            </div>
          </div>

          <h2
            className="mb-3 text-2xl text-white"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            Download Failed
          </h2>
          <p className="mb-8 text-white/60" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            {modelError}
          </p>

          <div className="flex flex-col gap-3">
            <Button variant="cta" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="ghost" onClick={handleCancel}>
              Choose Different Model
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mx-auto w-full max-w-[500px]">
        {/* Cancel button */}
        <button
          onClick={handleCancel}
          className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white/80"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Cancel
        </button>

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 flex justify-center"
        >
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#ff6b35]/20 blur-3xl" />
            <img src="/lokul-logo.png" alt="Lokul" className="relative h-14 w-14" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8 text-center"
        >
          <h2
            className="mb-2 text-3xl text-white"
            style={{ fontFamily: '"Instrument Serif", serif', fontStyle: "italic" }}
          >
            Downloading {model.name}
          </h2>
          <p className="text-white/50" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            This only happens once. After this, it works offline forever.
          </p>
        </motion.div>

        {/* Progress */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-6"
        >
          <Progress
            value={percentage}
            showLabel
            currentSize={formatBytes(loaded)}
            totalSize={formatBytes(total)}
            stepLabel={getStepLabel()}
            size="lg"
          />
        </motion.div>

        {/* Time estimate */}
        {estimatedTime !== null && estimatedTime > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mb-8 flex items-center justify-center gap-2 text-white/50"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          >
            <Clock className="h-4 w-4" />
            <span>About {formatTimeEstimate(estimatedTime)} remaining</span>
          </motion.div>
        )}

        {/* Model info card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-xl border border-white/10 bg-white/5 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#ff6b35]/10">
              <HardDrive className="h-5 w-5 text-[#ff6b35]" />
            </div>
            <div>
              <p
                className="text-sm font-medium text-white"
                style={{ fontFamily: '"DM Sans", sans-serif' }}
              >
                {model.name}
              </p>
              <p className="text-xs text-white/40" style={{ fontFamily: '"DM Sans", sans-serif' }}>
                {formatSize(model.sizeMB)} - {model.bestFor}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Helpful tip */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-6 rounded-lg border border-white/5 bg-white/5 p-4 text-center"
        >
          <p className="text-xs text-white/40" style={{ fontFamily: '"DM Sans", sans-serif' }}>
            The model is being cached in your browser. It will persist even after you close this
            tab.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
