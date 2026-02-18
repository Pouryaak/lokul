/**
 * Model Engine - industry-level model lifecycle management.
 *
 * Handles:
 * - Request deduplication for model loads
 * - Safe cancellation when switching models
 * - Synchronous state inspection + subscriptions
 */

import { inferenceManager, type DownloadProgress } from "./inference";
import { getModelById, type ModelConfig } from "./models";

export type ModelLoadingState =
  | { kind: "idle" }
  | { kind: "loading"; modelId: string; abort: () => void }
  | { kind: "ready"; model: ModelConfig }
  | { kind: "error"; error: string; modelId: string };

type StateListener = (state: ModelLoadingState) => void;

interface InFlightLoad {
  modelId: string;
  promise: Promise<void>;
  abort: () => void;
  token: symbol;
}

export class ModelEngine {
  private state: ModelLoadingState = { kind: "idle" };
  private listeners: Set<StateListener> = new Set();
  private progressCallback: ((progress: DownloadProgress) => void) | null = null;
  private inFlightLoad: InFlightLoad | null = null;

  getState(): ModelLoadingState {
    return this.state;
  }

  isReady(): boolean {
    return this.state.kind === "ready";
  }

  getCurrentModel(): ModelConfig | null {
    return this.state.kind === "ready" ? this.state.model : null;
  }

  isLoading(modelId?: string): boolean {
    if (this.state.kind !== "loading") {
      return false;
    }

    return modelId ? this.state.modelId === modelId : true;
  }

  subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    listener(this.state);

    return () => {
      this.listeners.delete(listener);
    };
  }

  setProgressCallback(callback: ((progress: DownloadProgress) => void) | null): void {
    this.progressCallback = callback;
  }

  async loadModel(modelId: string): Promise<void> {
    const model = getModelById(modelId);

    if (!model) {
      const error = `Model not found: ${modelId}`;
      this.setState({ kind: "error", error, modelId });
      throw new Error(error);
    }

    if (this.state.kind === "ready" && this.state.model.id === modelId) {
      return;
    }

    if (this.inFlightLoad?.modelId === modelId) {
      return this.inFlightLoad.promise;
    }

    this.cancelInFlightLoad();

    const loadToken = Symbol(modelId);
    const abort = () => {
      inferenceManager.terminate();
    };

    this.setState({ kind: "loading", modelId, abort });

    const promise = this.runLoad(model, loadToken, abort);
    this.inFlightLoad = {
      modelId,
      promise,
      abort,
      token: loadToken,
    };

    return promise;
  }

  unload(): void {
    this.cancelInFlightLoad();
    inferenceManager.terminate();
    this.setState({ kind: "idle" });
  }

  async retry(): Promise<void> {
    if (this.state.kind !== "error") {
      throw new Error("No error to retry from");
    }

    return this.loadModel(this.state.modelId);
  }

  private cancelInFlightLoad(): void {
    if (!this.inFlightLoad) {
      return;
    }

    this.inFlightLoad.abort();
    this.inFlightLoad = null;
  }

  private async runLoad(model: ModelConfig, token: symbol, abort: () => void): Promise<void> {
    try {
      await inferenceManager.initialize(model.id, (progress) => {
        this.progressCallback?.(progress);
      });

      if (!this.isTokenActive(token)) {
        return;
      }

      this.inFlightLoad = null;
      this.setState({ kind: "ready", model });
    } catch (error) {
      if (!this.isTokenActive(token)) {
        return;
      }

      this.inFlightLoad = null;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      this.setState({ kind: "error", error: errorMessage, modelId: model.id });
      throw error;
    } finally {
      if (this.inFlightLoad?.token === token) {
        this.inFlightLoad = null;
      }

      if (this.state.kind === "loading" && !this.isTokenActive(token)) {
        abort();
      }
    }
  }

  private isTokenActive(token: symbol): boolean {
    return this.inFlightLoad?.token === token;
  }

  private setState(newState: ModelLoadingState): void {
    this.state = newState;

    this.listeners.forEach((listener) => {
      listener(newState);
    });
  }
}

export const modelEngine = new ModelEngine();
