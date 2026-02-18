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
import { getModelById, type ModelConfig } from "./models";

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
    const model = getModelById(modelId);
    if (!model) {
      throw new Error(`Model not found: ${modelId}`);
    }

    // Clean up existing worker if any
    if (this.worker) {
      this.terminate();
    }

    this.progressCallback = onProgress || null;

    try {
      // Create Web Worker for inference
      this.worker = new Worker(new URL("../../workers/inference.worker.ts", import.meta.url), {
        type: "module",
      });

      // Create WebLLM engine with progress callback
      this.engine = await CreateWebWorkerMLCEngine(this.worker, modelId, {
        initProgressCallback: (report: InitProgressReport) => {
          this.handleProgress(report, model);
        },
      });

      this.currentModel = modelId;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error(`[InferenceManager] Failed to initialize model '${modelId}':`, error);
        if (error instanceof Error) {
          console.error(`[InferenceManager] Error name: ${error.name}`);
          console.error(`[InferenceManager] Error stack: ${error.stack}`);
        }
      }
      this.terminate();
      throw error;
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
  async *generate(messages: Message[]): AsyncGenerator<string> {
    if (!this.engine) {
      throw new Error("Engine not initialized. Call initialize() first.");
    }

    const stream = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
      max_tokens: 2000,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || "";
      if (content) {
        yield content;
      }
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
