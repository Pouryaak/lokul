/**
 * Model Store - reactive model state for React components.
 *
 * Delegates lifecycle operations to modelEngine and mirrors engine
 * state through Zustand for component subscriptions.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { modelEngine } from "@/lib/ai/model-engine";
import type { DownloadProgress } from "@/lib/ai/inference";
import { MODELS, getModelById, type ModelConfig } from "@/lib/ai/models";

type LoadingStep = "idle" | "downloading" | "compiling" | "ready" | "error";

interface ModelState {
  currentModel: ModelConfig | null;
  isLoading: boolean;
  downloadProgress: DownloadProgress | null;
  loadingStep: LoadingStep;
  error: string | null;
  availableModels: ModelConfig[];
  loadModel: (modelId: string) => Promise<void>;
  cancelDownload: () => void;
  resetModel: () => void;
  clearError: () => void;
}

function toLoadingStep(progress: DownloadProgress | null): LoadingStep {
  if (!progress) {
    return "downloading";
  }

  if (progress.step === "compiling") {
    return "compiling";
  }

  if (progress.step === "ready") {
    return "ready";
  }

  return "downloading";
}

export const useModelStore = create<ModelState>()(
  devtools(
    (set) => {
      modelEngine.subscribe((engineState) => {
        if (engineState.kind === "idle") {
          set({
            currentModel: null,
            isLoading: false,
            loadingStep: "idle",
            downloadProgress: null,
            error: null,
          });
          return;
        }

        if (engineState.kind === "loading") {
          set({
            currentModel: null,
            isLoading: true,
            loadingStep: "downloading",
            error: null,
          });
          return;
        }

        if (engineState.kind === "ready") {
          set({
            currentModel: engineState.model,
            isLoading: false,
            loadingStep: "ready",
            downloadProgress: null,
            error: null,
          });
          return;
        }

        set({
          isLoading: false,
          loadingStep: "error",
          error: engineState.error,
        });
      });

      modelEngine.setProgressCallback((progress) => {
        set({
          downloadProgress: progress,
          loadingStep: toLoadingStep(progress),
        });
      });

      return {
        currentModel: null,
        isLoading: false,
        downloadProgress: null,
        loadingStep: "idle",
        error: null,
        availableModels: MODELS,

        loadModel: async (modelId: string) => {
          const model = getModelById(modelId);
          if (!model) {
            set({
              error: `Model not found: ${modelId}`,
              loadingStep: "error",
              isLoading: false,
            });
            return;
          }

          try {
            await modelEngine.loadModel(modelId);
          } catch (err) {
            if (import.meta.env.DEV) {
              console.error("[ModelStore] Load failed:", err);
            }
          }
        },

        cancelDownload: () => {
          modelEngine.unload();
        },

        resetModel: () => {
          modelEngine.unload();
        },

        clearError: () => {
          set({ error: null });

          if (modelEngine.getState().kind === "error") {
            modelEngine.unload();
          }
        },
      };
    },
    { name: "ModelStore" }
  )
);

export const useCurrentModel = () => useModelStore((state) => state.currentModel);
export const useIsLoading = () => useModelStore((state) => state.isLoading);
export const useDownloadProgress = () => useModelStore((state) => state.downloadProgress);
export const useLoadingStep = () => useModelStore((state) => state.loadingStep);
export const useModelError = () => useModelStore((state) => state.error);
export const useAvailableModels = () => useModelStore((state) => state.availableModels);
export const useLoadModel = () => useModelStore((state) => state.loadModel);
export const useCancelDownload = () => useModelStore((state) => state.cancelDownload);
export const useResetModel = () => useModelStore((state) => state.resetModel);
