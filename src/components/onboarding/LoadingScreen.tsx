/**
 * LoadingScreen Component - Model download progress overlay
 *
 * Full-screen overlay showing download progress with time estimates.
 */

import { useEffect, useState } from "react";
import { X, Clock, Lightbulb, Check } from "lucide-react";
import { Progress } from "@/components/ui/Progress";
import { formatBytes, formatTimeEstimate } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import type { DownloadProgress } from "@/lib/ai/inference";

/**
 * Props for LoadingScreen
 */
export interface LoadingScreenProps {
  /** Callback when user cancels */
  onCancel: () => void;
  /** Callback when model is ready */
  onReady: () => void;
  /** Model name to display */
  modelName?: string;
  /** Model size in MB */
  modelSizeMB?: number;
  /** Download progress from model store */
  progress: DownloadProgress | null;
  /** Current loading step */
  loadingStep: "idle" | "downloading" | "compiling" | "ready" | "error";
  /** Error message if loading failed */
  error: string | null;
}

/**
 * Loading screen with download progress
 */
export function LoadingScreen({
  onCancel,
  onReady,
  modelName = "Quick Mode",
  modelSizeMB = 80,
  progress,
  loadingStep,
  error,
}: LoadingScreenProps) {
  const [showComplete, setShowComplete] = useState(false);

  // Auto-dismiss when ready
  useEffect(() => {
    if (loadingStep === "ready") {
      setShowComplete(true);
      const timer = setTimeout(() => {
        onReady();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [loadingStep, onReady]);

  // Calculate progress values
  const percentage = progress?.percentage ?? 0;
  // Calculate loaded bytes from percentage and model size
  const total = modelSizeMB * 1024 * 1024;
  const loaded = Math.round((percentage / 100) * total);
  // Estimate time remaining based on progress and elapsed time
  const estimatedTime = progress?.timeElapsed
    ? Math.round((progress.timeElapsed / Math.max(percentage, 1)) * (100 - percentage))
    : null;

  // Get step label - use progress text if available, otherwise fallback to step
  const getStepLabel = () => {
    if (progress?.text) {
      return progress.text;
    }
    switch (loadingStep) {
      case "downloading":
        return `Downloading ${modelName}...`;
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
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-red-500/20 blur-3xl" />
              <img src="/spark-logo.svg" alt="" className="relative h-20 w-20" />
            </div>
          </div>

          {/* Error Message */}
          <h2 className="mb-4 text-2xl font-bold text-red-600">Download Failed</h2>
          <p className="mb-8 text-gray-600">{error}</p>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Button variant="primary" onClick={() => window.location.reload()}>
              Try Again
            </Button>
            <Button variant="outline" onClick={onCancel}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Completion state
  if (showComplete) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-3xl" />
              <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
                <Check className="h-10 w-10 text-green-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="mb-4 text-2xl font-bold text-[#1A1A1A]">{modelName} Ready!</h2>
          <p className="mb-8 text-gray-600">Downloaded and cached. Now works completely offline.</p>

          {/* Auto-dismiss message */}
          <p className="text-sm text-gray-400">Starting in a few seconds...</p>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4">
      <div className="w-full max-w-md">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 transition-colors hover:text-gray-600"
          aria-label="Cancel"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-[#FF6B35]/20 blur-3xl" />
            <img src="/spark-logo.svg" alt="" className="relative h-20 w-20" />
          </div>
        </div>

        {/* Title */}
        <h2 className="mb-2 text-center text-2xl font-bold text-[#1A1A1A]">
          Downloading {modelName}
        </h2>

        {/* Progress */}
        <div className="mb-6">
          <Progress
            value={percentage}
            showLabel
            currentSize={formatBytes(loaded)}
            totalSize={formatBytes(total)}
            stepLabel={getStepLabel()}
            size="lg"
          />
        </div>

        {/* Time estimate */}
        {estimatedTime !== null && estimatedTime > 0 && (
          <div className="mb-4 flex items-center justify-center gap-2 text-gray-500">
            <Clock className="h-4 w-4" />
            <span>{formatTimeEstimate(estimatedTime)}</span>
          </div>
        )}

        {/* Helpful tip */}
        <div className="mb-6 rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <p className="text-sm text-blue-700">
              You can keep chatting. We'll switch automatically when ready.
            </p>
          </div>
        </div>

        {/* Cancel button */}
        <div className="text-center">
          <Button variant="outline" onClick={onCancel}>
            Cancel Download
          </Button>
        </div>
      </div>
    </div>
  );
}
