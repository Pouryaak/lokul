/**
 * Inference Manager for AI operations
 *
 * Orchestrates AI inference using Web Workers for non-blocking operation.
 * Handles model initialization, progress tracking, streaming generation,
 * and abort operations.
 */

import {
  CreateWebWorkerMLCEngine,
  type MLCEngineInterface,
  type InitProgressReport,
} from "@mlc-ai/web-llm";
import {
  abortedError,
  modelError,
  modelNotLoadedError,
  toAppError,
  type AppError,
} from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import { getModelById, type ModelConfig } from "./models";
import type { CancellationReason } from "@/types/index";

/**
 * Download progress information
 */
export interface DownloadProgress {
  /** Progress percentage (0-100) from WebLLM */
  percentage: number;
  /** Time elapsed in seconds */
  timeElapsed: number;
  /** Current loading step label */
  step: "downloading" | "compiling" | "ready";
  /** Progress text from WebLLM */
  text: string;
}

/**
 * Message format for chat completion
 */
export interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GenerateOptions {
  signal?: AbortSignal;
  cancelReason?: CancellationReason;
}

/**
 * Manages AI inference operations via Web Worker
 */
export class InferenceManager {
  /** WebLLM engine instance */
  private engine: MLCEngineInterface | null = null;
  /** Web Worker instance */
  private worker: Worker | null = null;
  /** Currently loaded model ID */
  private currentModel: string | null = null;
  /** Progress callback function */
  private progressCallback: ((progress: DownloadProgress) => void) | null = null;

  private ensureLoaded(): Result<void, AppError> {
    if (!this.engine) {
      return err(modelNotLoadedError("Engine not initialized. Call initialize() first."));
    }

    return ok(undefined);
  }

  async initializeSafe(
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<Result<void, AppError>> {
    const model = getModelById(modelId);
    if (!model) {
      return err(modelError(`Model not found: ${modelId}`));
    }

    if (this.worker) {
      this.terminate();
    }

    this.progressCallback = onProgress || null;

    try {
      this.worker = new Worker(new URL("../../workers/inference.worker.ts", import.meta.url), {
        type: "module",
      });

      this.engine = await CreateWebWorkerMLCEngine(this.worker, modelId, {
        initProgressCallback: (report: InitProgressReport) => {
          this.handleProgress(report, model);
        },
      });

      this.currentModel = modelId;
      return ok(undefined);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`[InferenceManager] Failed to initialize model '${modelId}':`, error);
      }

      this.terminate();
      return err(modelError(`Failed to load model '${modelId}'`, undefined, error));
    }
  }

  /**
   * Initialize the AI engine with a model
   * @param modelId - The model identifier to load
   * @param onProgress - Optional callback for download progress
   * @returns Promise that resolves when model is ready
   */
  async initialize(
    modelId: string,
    onProgress?: (progress: DownloadProgress) => void
  ): Promise<void> {
    const result = await this.initializeSafe(modelId, onProgress);

    if (result.kind === "err") {
      throw result.error;
    }
  }

  /**
   * Handle progress updates from WebLLM
   * @param report - Progress report from WebLLM
   * @param model - Model configuration for size calculations
   */
  private handleProgress(report: InitProgressReport, _model: ModelConfig): void {
    if (!this.progressCallback) return;

    const percentage = Math.min(100, report.progress * 100);

    // Determine loading step based on progress text or percentage
    let step: DownloadProgress["step"] = "downloading";
    if (percentage >= 100) {
      step = "ready";
    } else if (percentage > 95 || report.text.toLowerCase().includes("compile")) {
      step = "compiling";
    }

    this.progressCallback({
      percentage: Math.round(percentage * 10) / 10, // Round to 1 decimal
      timeElapsed: report.timeElapsed,
      step,
      text: report.text,
    });
  }

  /**
   * Generate streaming response from AI
   * @param messages - Array of chat messages
   * @returns Async generator yielding tokens
   */
  async *generate(messages: Message[], options: GenerateOptions = {}): AsyncGenerator<string> {
    const loadedResult = this.ensureLoaded();
    if (loadedResult.kind === "err") {
      throw loadedResult.error;
    }

    const engine = this.engine;
    if (!engine) {
      throw modelNotLoadedError("Engine not initialized. Call initialize() first.");
    }

    const abortHandler = () => {
      this.abort();
    };

    options.signal?.addEventListener("abort", abortHandler);

    try {
      const stream = await engine.chat.completions.create({
        messages,
        stream: true,
        temperature: 0.7,
        max_tokens: 2000,
      });

      for await (const chunk of stream) {
        if (options.signal?.aborted) {
          return;
        }

        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          yield content;
        }
      }
    } catch (error) {
      if (options.signal?.aborted) {
        return;
      }

      if (error instanceof Error && error.name === "AbortError") {
        return;
      }

      if (import.meta.env.DEV) {
        console.error("[InferenceManager] Generation error:", error);
      }

      throw toAppError(error);
    } finally {
      options.signal?.removeEventListener("abort", abortHandler);
    }
  }

  async generateSafe(
    messages: Message[],
    options: GenerateOptions = {}
  ): Promise<Result<AsyncGenerator<string>, AppError>> {
    if (options.signal?.aborted) {
      return err(abortedError(options.cancelReason));
    }

    const loadedResult = this.ensureLoaded();
    if (loadedResult.kind === "err") {
      return loadedResult;
    }

    try {
      return ok(this.generate(messages, options));
    } catch (error) {
      return err(toAppError(error));
    }
  }

  /**
   * Check if a model is currently loaded
   * @returns True if a model is loaded
   */
  isLoaded(): boolean {
    return this.engine !== null && this.currentModel !== null;
  }

  /**
   * Get current WebLLM engine instance.
   * Used by memory extraction hooks to run sidecar prompts.
   */
  getEngine(): MLCEngineInterface | null {
    return this.engine;
  }

  /**
   * Get the currently loaded model ID
   * @returns Model ID or null if no model loaded
   */
  getCurrentModel(): string | null {
    return this.currentModel;
  }

  /**
   * Abort ongoing generation
   */
  abort(): void {
    if (this.engine) {
      this.engine.interruptGenerate();
    }
  }

  /**
   * Terminate the worker and clean up resources
   */
  terminate(): void {
    this.abort();

    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }

    this.engine = null;
    this.currentModel = null;
    this.progressCallback = null;
  }
}

/**
 * Singleton instance of InferenceManager
 * Use this for all AI inference operations
 */
export const inferenceManager = new InferenceManager();
