/**
 * WebLLM Transport for AI SDK UI
 *
 * Custom ChatTransport implementation that bridges WebLLM's streaming inference
 * with AI SDK UI's state management. This enables true streaming without the
 * batch-then-stream pattern.
 */

import type { ChatTransport, UIMessage, UIMessageChunk, ChatRequestOptions } from "ai";
import { startTokenTracking, recordToken, stopTokenTracking } from "@/lib/performance/metrics";
import {
  getUserMessage,
  modelError,
  modelNotLoadedError,
  toAppError,
  type AppError,
} from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import { inferenceManager } from "./inference";
import { modelEngine } from "./model-engine";
import type { CancellationReason } from "@/types/index";

const DEFAULT_CANCEL_REASON: CancellationReason = "user_stop";
const CHUNK_STALL_TIMEOUT_MS = 20000;
const CHUNK_ABORT_SENTINEL = "__ABORTED__" as const;
const DRAIN_WAIT_TIMEOUT_MS = 4000;

function logTransport(scope: string, payload: Record<string, unknown>): void {
  if (!import.meta.env.DEV) {
    return;
  }

  console.info(`[WebLLMTransport:${scope}]`, payload);
}

async function nextChunkWithTimeout(
  iterator: AsyncIterator<string>,
  timeoutMs: number,
  abortSignal: AbortSignal | null
): Promise<IteratorResult<string> | null | typeof CHUNK_ABORT_SENTINEL> {
  const timeoutPromise = new Promise<null>((resolve) => {
    window.setTimeout(() => resolve(null), timeoutMs);
  });

  if (!abortSignal) {
    return Promise.race([iterator.next(), timeoutPromise]);
  }

  const abortPromise = new Promise<typeof CHUNK_ABORT_SENTINEL>((resolve) => {
    const onAbort = () => {
      abortSignal.removeEventListener("abort", onAbort);
      resolve(CHUNK_ABORT_SENTINEL);
    };

    if (abortSignal.aborted) {
      resolve(CHUNK_ABORT_SENTINEL);
      return;
    }

    abortSignal.addEventListener("abort", onAbort);
  });

  return Promise.race([iterator.next(), timeoutPromise, abortPromise]);
}

async function drainIterator(iterator: AsyncIterator<string>): Promise<void> {
  try {
    while (true) {
      const next = await Promise.race([
        iterator.next(),
        new Promise<null>((resolve) => {
          window.setTimeout(() => resolve(null), 2000);
        }),
      ]);

      if (next === null || next.done) {
        break;
      }
    }
  } catch {
    // best-effort cleanup
  }
}

async function waitForDrainCompletion(promise: Promise<void>): Promise<boolean> {
  const result = await Promise.race([
    promise.then(() => true),
    new Promise<boolean>((resolve) => {
      window.setTimeout(() => resolve(false), DRAIN_WAIT_TIMEOUT_MS);
    }),
  ]);

  return result;
}

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
  private requestCounter = 0;
  private needsRecoveryAfterAbort = false;
  private pendingDrain: Promise<void> | null = null;

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
    this.requestCounter += 1;
    const requestId = `${this.modelId}:${this.requestCounter}`;

    if (this.pendingDrain) {
      logTransport("drain-wait-start", { requestId });
      const drained = await waitForDrainCompletion(this.pendingDrain);
      logTransport("drain-wait-done", { requestId, drained });
      this.pendingDrain = null;
    }

    if (this.needsRecoveryAfterAbort) {
      const recovered = await this.recoverAfterStall(requestId);
      this.needsRecoveryAfterAbort = !recovered;
    }

    const requestAbortController = new AbortController();
    this.abortController = requestAbortController;
    const cleanupAbortListener = this.linkAbortSignal(abortSignal, requestAbortController);
    const webLLMMessages = this.convertToWebLLMMessages(messages);
    const cancelReason = getCancelReason(abortSignal?.reason);

    const lastMessage = webLLMMessages[webLLMMessages.length - 1];
    logTransport("send-start", {
      requestId,
      modelId: this.modelId,
      messageCount: webLLMMessages.length,
      lastRole: lastMessage?.role ?? null,
      lastLength: lastMessage?.content.length ?? 0,
      cancelReason,
    });

    return this.createChunkStream(webLLMMessages, {
      requestAbortController,
      cancelReason,
      cleanupAbortListener,
      requestId,
    });
  }

  private async streamResponse(
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { signal: AbortSignal; cancelReason: CancellationReason; requestId: string }
  ): Promise<Result<void, AppError>> {
    const messageId = crypto.randomUUID();
    startTokenTracking();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const tokenStreamResult = await this.createTokenStream(webLLMMessages, options);

      if (tokenStreamResult.kind === "err") {
        logTransport("stream-init-error", {
          requestId: options.requestId,
          error: tokenStreamResult.error.message,
        });
        return tokenStreamResult;
      }

      const streamResult = await this.pushTokenChunks(
        controller,
        tokenStreamResult.value,
        messageId,
        options.requestId,
        options.signal
      );

      if (streamResult.kind === "err") {
        return streamResult;
      }

      if (!streamResult.value.stalled) {
        if (streamResult.value.tokenCount > 0) {
          controller.enqueue({ type: "text-end", id: messageId });
          logTransport("stream-close", { requestId: options.requestId, messageId });
        }

        return ok(undefined);
      }

      this.needsRecoveryAfterAbort = true;

      if (attempt === 0 && streamResult.value.tokenCount === 0) {
        const recovered = await this.recoverAfterStall(options.requestId);
        if (recovered) {
          this.needsRecoveryAfterAbort = false;
          continue;
        }
      }

      return err(modelError("Model response stalled. Please retry your message."));
    }

    return err(modelError("Model response stalled. Please retry your message."));
  }

  private async createTokenStream(
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { signal: AbortSignal; cancelReason: CancellationReason; requestId: string }
  ): Promise<Result<AsyncGenerator<string>, AppError>> {
    if (!inferenceManager.isLoaded()) {
      const engineState = modelEngine.getState();

      if (engineState.kind === "loading") {
        const isReady = await modelEngine.waitForReadyModel(engineState.modelId);

        logTransport("wait-for-ready", {
          requestId: options.requestId,
          targetModelId: engineState.modelId,
          isReady,
          aborted: options.signal.aborted,
        });

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
    messageId: string,
    requestId: string,
    requestSignal: AbortSignal
  ): Promise<Result<{ tokenCount: number; stalled: boolean }, AppError>> {
    let tokenCount = 0;
    let started = false;
    const iterator = tokenStream[Symbol.asyncIterator]();

    try {
      while (true) {
        const nextChunk = await nextChunkWithTimeout(
          iterator,
          CHUNK_STALL_TIMEOUT_MS,
          requestSignal
        );

        if (nextChunk === CHUNK_ABORT_SENTINEL) {
          logTransport("stream-aborted", { requestId, messageId, tokenCount });
          this.pendingDrain = drainIterator(iterator);
          break;
        }

        if (nextChunk === null) {
          inferenceManager.abort();
          this.needsRecoveryAfterAbort = true;
          logTransport("stream-stalled", {
            requestId,
            messageId,
            tokenCount,
            timeoutMs: CHUNK_STALL_TIMEOUT_MS,
          });
          return ok({ tokenCount, stalled: true });
        }

        if (nextChunk.done) {
          break;
        }

        const token = nextChunk.value;

        if (!started) {
          controller.enqueue({ type: "text-start", id: messageId });
          logTransport("stream-open", { requestId, messageId });
          started = true;
        }

        tokenCount += 1;
        recordToken();
        controller.enqueue({
          type: "text-delta",
          delta: token,
          id: messageId,
        });
      }

      logTransport("stream-finished", { requestId, messageId, tokenCount });

      return ok({ tokenCount, stalled: false });
    } catch (error) {
      logTransport("stream-error", {
        requestId,
        messageId,
        tokenCount,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return err(toAppError(error));
    }
  }

  private async recoverAfterStall(requestId: string): Promise<boolean> {
    try {
      logTransport("recover-start", { requestId, modelId: this.modelId });
      const result = await inferenceManager.initializeSafe(this.modelId);

      if (result.kind === "err") {
        throw result.error;
      }

      logTransport("recover-success", { requestId, modelId: this.modelId });
      return true;
    } catch (error) {
      logTransport("recover-failed", {
        requestId,
        modelId: this.modelId,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      return false;
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
      requestId: string;
    }
  ): ReadableStream<UIMessageChunk> {
    return new ReadableStream<UIMessageChunk>({
      start: async (controller) => {
        try {
          const result = await this.streamResponse(controller, webLLMMessages, {
            signal: options.requestAbortController.signal,
            cancelReason: options.cancelReason,
            requestId: options.requestId,
          });

          if (result.kind === "err") {
            controller.enqueue({ type: "error", errorText: getUserMessage(result.error) });
          }

          controller.close();
        } finally {
          stopTokenTracking();
          options.cleanupAbortListener();
          this.abortController = null;
        }
      },
      cancel: () => {
        logTransport("stream-cancel", { requestId: options.requestId });
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
