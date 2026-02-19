/**
 * WebLLM Transport for AI SDK UI
 *
 * Custom ChatTransport implementation that bridges WebLLM's streaming inference
 * with AI SDK UI's state management. This enables true streaming without the
 * batch-then-stream pattern.
 */

import type { ChatTransport, UIMessage, UIMessageChunk, ChatRequestOptions } from "ai";
import { startTokenTracking, recordToken, stopTokenTracking } from "@/lib/performance/metrics";
import { getUserMessage, modelNotLoadedError, toAppError, type AppError } from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import { inferenceManager } from "./inference";
import { modelEngine } from "./model-engine";
import type { CancellationReason } from "@/types/index";

const DEFAULT_CANCEL_REASON: CancellationReason = "user_stop";

function getCancelReason(reason: unknown): CancellationReason {
  if (reason === "route_change" || reason === "model_switch" || reason === "shutdown") {
    return reason;
  }

  return DEFAULT_CANCEL_REASON;
}

/**
 * Options for creating a WebLLMTransport instance
 */
export interface WebLLMTransportOptions {
  /** The model ID to use for inference */
  modelId: string;
}

/**
 * Custom ChatTransport implementation for WebLLM
 *
 * Bridges WebLLM's local inference with AI SDK UI's streaming interface.
 * Converts WebLLM's AsyncGenerator<string> tokens into AI SDK UI's
 * UIMessageChunk stream format.
 */
export class WebLLMTransport implements ChatTransport<UIMessage> {
  /** The model ID for inference */
  private modelId: string;

  /** AbortController for cancellation support */
  private abortController: AbortController | null = null;

  /**
   * Creates a new WebLLMTransport instance
   * @param options - Transport configuration options
   */
  constructor(options: WebLLMTransportOptions) {
    this.modelId = options.modelId;
  }

  /**
   * Sends messages to WebLLM and returns a streaming response
   *
   * Converts UIMessage[] to WebLLM format, calls inferenceManager.generate(),
   * and yields tokens as UIMessageChunk events.
   *
   * @param options - Configuration object containing messages and abort signal
   * @returns Promise resolving to a ReadableStream of UIMessageChunk objects
   */
  async sendMessages({
    messages,
    abortSignal,
  }: {
    /** The type of message submission */
    trigger: "submit-message" | "regenerate-message";
    /** Unique identifier for the chat session */
    chatId: string;
    /** ID of the message to regenerate, or undefined for new messages */
    messageId: string | undefined;
    /** Array of UI messages representing the conversation history */
    messages: UIMessage[];
    /** Signal to abort the request if needed */
    abortSignal: AbortSignal | undefined;
  } & ChatRequestOptions): Promise<ReadableStream<UIMessageChunk>> {
    const requestAbortController = new AbortController();
    this.abortController = requestAbortController;
    const cleanupAbortListener = this.linkAbortSignal(abortSignal, requestAbortController);
    const webLLMMessages = this.convertToWebLLMMessages(messages);
    const cancelReason = getCancelReason(abortSignal?.reason);
    return this.createChunkStream(webLLMMessages, {
      requestAbortController,
      cancelReason,
      cleanupAbortListener,
    });
  }

  private async streamResponse(
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { signal: AbortSignal; cancelReason: CancellationReason }
  ): Promise<Result<void, AppError>> {
    const tokenStreamResult = await this.createTokenStream(webLLMMessages, options);

    if (tokenStreamResult.kind === "err") {
      return tokenStreamResult;
    }

    const messageId = crypto.randomUUID();
    controller.enqueue({ type: "text-start", id: messageId });
    startTokenTracking();

    const streamResult = await this.pushTokenChunks(controller, tokenStreamResult.value, messageId);
    if (streamResult.kind === "err") {
      return streamResult;
    }

    controller.enqueue({ type: "text-end", id: messageId });
    return ok(undefined);
  }

  private async createTokenStream(
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { signal: AbortSignal; cancelReason: CancellationReason }
  ): Promise<Result<AsyncGenerator<string>, AppError>> {
    if (!inferenceManager.isLoaded()) {
      const engineState = modelEngine.getState();

      if (engineState.kind === "loading") {
        const isReady = await modelEngine.waitForReadyModel(engineState.modelId);

        if (!isReady || options.signal.aborted || !inferenceManager.isLoaded()) {
          return err(
            modelNotLoadedError(
              "Model is still loading. Please wait for download/compile to finish before sending."
            )
          );
        }
      } else {
        return err(
          modelNotLoadedError("Model not initialized. Please load a model before sending messages.")
        );
      }
    }

    return inferenceManager.generateSafe(webLLMMessages, {
      signal: options.signal,
      cancelReason: options.cancelReason,
    });
  }

  private async pushTokenChunks(
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    tokenStream: AsyncGenerator<string>,
    messageId: string
  ): Promise<Result<void, AppError>> {
    try {
      for await (const token of tokenStream) {
        if (this.abortController?.signal.aborted) {
          break;
        }

        recordToken();
        controller.enqueue({
          type: "text-delta",
          delta: token,
          id: messageId,
        });
      }

      return ok(undefined);
    } catch (error) {
      return err(toAppError(error));
    }
  }

  private linkAbortSignal(
    abortSignal: AbortSignal | undefined,
    requestAbortController: AbortController
  ): () => void {
    if (!abortSignal) {
      return () => undefined;
    }

    const abortHandler = () => {
      requestAbortController.abort();
    };

    abortSignal.addEventListener("abort", abortHandler);
    return () => {
      abortSignal.removeEventListener("abort", abortHandler);
    };
  }

  private createChunkStream(
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: {
      requestAbortController: AbortController;
      cancelReason: CancellationReason;
      cleanupAbortListener: () => void;
    }
  ): ReadableStream<UIMessageChunk> {
    return new ReadableStream<UIMessageChunk>({
      start: async (controller) => {
        try {
          const result = await this.streamResponse(controller, webLLMMessages, {
            signal: options.requestAbortController.signal,
            cancelReason: options.cancelReason,
          });

          if (result.kind === "err") {
            controller.enqueue({ type: "error", errorText: getUserMessage(result.error) });
          }

          controller.close();
        } finally {
          stopTokenTracking();
          options.cleanupAbortListener();
        }
      },
      cancel: () => {
        options.cleanupAbortListener();
        this.abort();
      },
    });
  }

  /**
   * Reconnects to an existing streaming response
   *
   * WebLLM doesn't support stream resumption, so this always returns null.
   *
   * @returns Promise resolving to null (no active stream can be resumed)
   */
  async reconnectToStream(): Promise<ReadableStream<UIMessageChunk> | null> {
    // WebLLM doesn't support stream resumption
    return null;
  }

  /**
   * Gets the model ID for this transport instance
   * @returns The model ID
   */
  getModelId(): string {
    return this.modelId;
  }

  /**
   * Aborts the ongoing generation
   *
   * Calls inferenceManager.abort() and aborts the internal AbortController.
   */
  abort(): void {
    if (import.meta.env.DEV) {
      console.info("[WebLLMTransport] Abort requested");
    }

    // Abort the inference manager
    inferenceManager.abort();

    // Abort the internal controller
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
  }

  /**
   * Converts UIMessage array to WebLLM message format
   *
   * Maps 'user' | 'assistant' | 'system' roles directly (they match WebLLM).
   * Extracts text content from message parts.
   *
   * @param messages - Array of UIMessage objects
   * @returns Array of messages in WebLLM format
   */
  private convertToWebLLMMessages(
    messages: UIMessage[]
  ): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    const converted = messages
      .map((message) => ({
        role: message.role,
        content: this.extractTextContent(message).trim(),
      }))
      .filter((message) => message.content.length > 0);

    if (import.meta.env.DEV && converted.length < messages.length) {
      console.info("[WebLLMTransport] Dropped empty messages before inference", {
        inputCount: messages.length,
        sentCount: converted.length,
      });
    }

    return converted;
  }

  /**
   * Extracts text content from a UIMessage's parts
   *
   * @param message - The UIMessage to extract content from
   * @returns Concatenated text content
   */
  private extractTextContent(message: UIMessage): string {
    if (!message.parts || message.parts.length === 0) {
      return "";
    }

    // Concatenate all text parts
    return message.parts
      .filter((part) => part.type === "text")
      .map((part) => (part as { type: "text"; text: string }).text)
      .join("");
  }
}
