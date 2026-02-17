/**
 * Model Store - Reactive state management for AI models
 *
 * Manages model loading state, download progress, and error handling.
 * Integrates with inferenceManager for actual model operations.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { inferenceManager, type DownloadProgress } from "@/lib/ai/inference";
import { MODELS, getModelById, type ModelConfig } from "@/lib/ai/models";

/**
 * Loading step states for model initialization
 */
type LoadingStep = "idle" | "downloading" | "compiling" | "ready" | "error";

/**
 * Model state interface
 */
interface ModelState {
  // State
  /** Currently loaded/active model */
  currentModel: ModelConfig | null;
  /** Whether a model is being loaded */
  isLoading: boolean;
  /** Current download progress (null if not downloading) */
  downloadProgress: DownloadProgress | null;
  /** Current loading step */
  loadingStep: LoadingStep;
  /** Error message if loading failed */
  error: string | null;
  /** List of all available models */
  availableModels: ModelConfig[];

  // Actions
  /** Load a model by ID */
  loadModel: (modelId: string) => Promise<void>;
  /** Cancel ongoing download */
  cancelDownload: () => void;
  /** Unload current model and reset state */
  resetModel: () => void;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Model store with Zustand
 *
 * Initial state:
 * - No model loaded (null)
 * - Loading step: idle
 * - Available models: all configured models
 */
export const useModelStore = create<ModelState>()(
  devtools(
    (set, _get) => ({
      // Initial state
      currentModel: null,
      isLoading: false,
      downloadProgress: null,
      loadingStep: "idle",
      error: null,
      availableModels: MODELS,

      /**
       * Load a model by ID
       * Handles the full loading lifecycle with progress tracking
       */
      loadModel: async (modelId: string) => {
        const model = getModelById(modelId);
        if (!model) {
          set({
            error: `Model not found: ${modelId}`,
            loadingStep: "error",
          });
          return;
        }

        // Reset state and start loading
        set({
          isLoading: true,
          loadingStep: "downloading",
          downloadProgress: null,
          error: null,
          currentModel: null,
        });

        try {
          await inferenceManager.initialize(modelId, (progress) => {
            // Map progress step to loading step
            let loadingStep: LoadingStep = "downloading";
            if (progress.step === "compiling") {
              loadingStep = "compiling";
            } else if (progress.step === "ready") {
              loadingStep = "ready";
            }

            set({
              downloadProgress: progress,
              loadingStep,
            });
          });

          // Model loaded successfully
          set({
            currentModel: model,
            isLoading: false,
            loadingStep: "ready",
            downloadProgress: null,
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Failed to load model";

          set({
            error: errorMessage,
            isLoading: false,
            loadingStep: "error",
            downloadProgress: null,
          });
        }
      },

      /**
       * Cancel ongoing download
       * Terminates the worker and resets state
       */
      cancelDownload: () => {
        inferenceManager.terminate();

        set({
          isLoading: false,
          loadingStep: "idle",
          downloadProgress: null,
          error: null,
        });
      },

      /**
       * Unload current model and reset to idle state
       */
      resetModel: () => {
        inferenceManager.terminate();

        set({
          currentModel: null,
          isLoading: false,
          loadingStep: "idle",
          downloadProgress: null,
          error: null,
        });
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "ModelStore" }
  )
);

/**
 * Selector hooks for common state slices
 * These prevent unnecessary re-renders by selecting specific state
 */

/** Get current model config */
export const useCurrentModel = () => useModelStore((state) => state.currentModel);

/** Get loading state */
export const useIsLoading = () => useModelStore((state) => state.isLoading);

/** Get download progress */
export const useDownloadProgress = () => useModelStore((state) => state.downloadProgress);

/** Get loading step */
export const useLoadingStep = () => useModelStore((state) => state.loadingStep);

/** Get error message */
export const useModelError = () => useModelStore((state) => state.error);

/** Get available models */
export const useAvailableModels = () => useModelStore((state) => state.availableModels);

/** Get loadModel action */
export const useLoadModel = () => useModelStore((state) => state.loadModel);

/** Get cancelDownload action */
export const useCancelDownload = () => useModelStore((state) => state.cancelDownload);

/** Get resetModel action */
export const useResetModel = () => useModelStore((state) => state.resetModel);
