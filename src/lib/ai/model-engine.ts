/**
 * Model Engine - model lifecycle management.
 */

import { isRetryableError, modelError, toAppError, type AppError } from "@/lib/utils/errors";
import { inferenceManager, type DownloadProgress } from "./inference";
import { getModelById, type ModelConfig } from "./models";

const MAX_INIT_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 300;
const MAX_RETRY_DELAY_MS = 3000;
const BREAKER_THRESHOLD = 3;
const BREAKER_COOLDOWN_MS = 8000;

export type CircuitState = "closed" | "open" | "half_open";

export type ModelLoadingState =
  | { kind: "idle" }
  | { kind: "loading"; modelId: string; abort: () => void }
  | { kind: "ready"; model: ModelConfig }
  | { kind: "error"; error: string; modelId: string; circuit: CircuitState };

type StateListener = (state: ModelLoadingState) => void;

interface InFlightLoad {
  modelId: string;
  promise: Promise<void>;
  abort: () => void;
  token: symbol;
}

interface CircuitBreaker {
  state: CircuitState;
  failureCount: number;
  openedUntil: number | null;
}

function jitteredDelay(attempt: number): number {
  const expDelay = Math.min(MAX_RETRY_DELAY_MS, BASE_RETRY_DELAY_MS * 2 ** attempt);
  const jitter = Math.floor(Math.random() * 150);
  return expDelay + jitter;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export class ModelEngine {
  private state: ModelLoadingState = { kind: "idle" };
  private listeners: Set<StateListener> = new Set();
  private progressCallback: ((progress: DownloadProgress) => void) | null = null;
  private inFlightLoad: InFlightLoad | null = null;
  private breaker: CircuitBreaker = { state: "closed", failureCount: 0, openedUntil: null };

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
      const nextError = `Model not found: ${modelId}`;
      this.setState({ kind: "error", error: nextError, modelId, circuit: this.breaker.state });
      throw modelError(nextError);
    }

    if (this.state.kind === "ready" && this.state.model.id === modelId) {
      return;
    }

    if (this.inFlightLoad?.modelId === modelId) {
      return this.inFlightLoad.promise;
    }

    this.assertCircuitAllowsAttempt(modelId);
    this.cancelInFlightLoad();

    const loadToken = Symbol(modelId);
    const abort = () => {
      inferenceManager.terminate();
    };

    this.setState({ kind: "loading", modelId, abort });

    const promise = this.runLoad(model, loadToken, abort);
    this.inFlightLoad = { modelId, promise, abort, token: loadToken };

    return promise;
  }

  unload(): void {
    this.cancelInFlightLoad();
    inferenceManager.terminate();
    this.setState({ kind: "idle" });
  }

  async retry(): Promise<void> {
    if (this.state.kind !== "error") {
      throw modelError("No error to retry from");
    }

    return this.loadModel(this.state.modelId);
  }

  private assertCircuitAllowsAttempt(modelId: string): void {
    const now = Date.now();

    if (
      this.breaker.state === "open" &&
      this.breaker.openedUntil &&
      now < this.breaker.openedUntil
    ) {
      const cooldownLeft = Math.max(0, this.breaker.openedUntil - now);
      throw modelError(
        `Model initialization temporarily paused. Retry in ${Math.ceil(cooldownLeft / 1000)}s.`,
        `Circuit breaker open for model ${modelId}`
      );
    }

    if (this.breaker.state === "open") {
      this.breaker.state = "half_open";
    }
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
      await this.initializeWithRetries(model);

      if (!this.isTokenActive(token)) {
        return;
      }

      this.markSuccess();
      this.inFlightLoad = null;
      this.setState({ kind: "ready", model });
    } catch (error) {
      if (!this.isTokenActive(token)) {
        return;
      }

      const appError = toAppError(error);
      this.markFailure();
      this.inFlightLoad = null;
      this.setState({
        kind: "error",
        error: appError.message,
        modelId: model.id,
        circuit: this.breaker.state,
      });
      throw appError;
    } finally {
      if (this.inFlightLoad?.token === token) {
        this.inFlightLoad = null;
      }

      if (this.state.kind === "loading" && !this.isTokenActive(token)) {
        abort();
      }
    }
  }

  private async initializeWithRetries(model: ModelConfig): Promise<void> {
    let lastError: AppError | null = null;

    for (let attempt = 0; attempt <= MAX_INIT_RETRIES; attempt += 1) {
      const result = await inferenceManager.initializeSafe(model.id, (progress) => {
        this.progressCallback?.(progress);
      });

      if (result.kind === "ok") {
        return;
      }

      lastError = result.error;

      if (!isRetryableError(result.error) || attempt === MAX_INIT_RETRIES) {
        break;
      }

      await sleep(jitteredDelay(attempt));
    }

    throw lastError ?? modelError("Model initialization failed");
  }

  private markSuccess(): void {
    this.breaker = {
      state: "closed",
      failureCount: 0,
      openedUntil: null,
    };
  }

  private markFailure(): void {
    const failureCount = this.breaker.failureCount + 1;

    if (failureCount >= BREAKER_THRESHOLD) {
      this.breaker = {
        state: "open",
        failureCount,
        openedUntil: Date.now() + BREAKER_COOLDOWN_MS,
      };
      return;
    }

    this.breaker = {
      state: this.breaker.state === "half_open" ? "open" : this.breaker.state,
      failureCount,
      openedUntil: this.breaker.openedUntil,
    };
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
