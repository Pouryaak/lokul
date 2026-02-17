/**
 * LoadingScreen Component - Model download progress overlay
 *
 * Full-screen overlay showing download progress with time estimates.
 */

import { useEffect, useState } from "react";
import { X, Clock, Lightbulb, Check } from "lucide-react";
import { Progress, formatBytes, formatTimeEstimate } from "@/components/ui/Progress";
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
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full" />
              <img
                src="/spark-logo.svg"
                alt=""
                className="relative w-20 h-20"
              />
            </div>
          </div>

          {/* Error Message */}
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Download Failed
          </h2>
          <p className="text-gray-600 mb-8">{error}</p>

          {/* Actions */}
          <div className="flex gap-4 justify-center">
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
      <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          {/* Logo */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse" />
              <div className="relative w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <Check className="w-10 h-10 text-green-600" />
              </div>
            </div>
          </div>

          {/* Success Message */}
          <h2 className="text-2xl font-bold text-[#1A1A1A] mb-4">
            {modelName} Ready!
          </h2>
          <p className="text-gray-600 mb-8">
            Downloaded and cached. Now works completely offline.
          </p>

          {/* Auto-dismiss message */}
          <p className="text-sm text-gray-400">
            Starting in a few seconds...
          </p>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="fixed inset-0 z-50 bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Close button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Cancel"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-[#FF6B35]/20 blur-3xl rounded-full animate-pulse" />
            <img
              src="/spark-logo.svg"
              alt=""
              className="relative w-20 h-20"
            />
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-[#1A1A1A] mb-2">
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
          <div className="flex items-center justify-center gap-2 text-gray-500 mb-4">
            <Clock className="w-4 h-4" />
            <span>{formatTimeEstimate(estimatedTime)}</span>
          </div>
        )}

        {/* Helpful tip */}
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
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
