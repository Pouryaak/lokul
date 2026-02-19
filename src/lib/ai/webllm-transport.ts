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
import { getMemoryFacts } from "@/lib/storage/memory";
import { buildContextWithMemory, estimateTokens } from "@/lib/memory/context-builder";
import { compactContext } from "@/lib/memory/compaction";

const DEFAULT_CANCEL_REASON: CancellationReason = "user_stop";
const CHUNK_STALL_TIMEOUT_MS = 20000;
const CHUNK_ABORT_SENTINEL = Symbol("chunk-aborted");
const DRAIN_WAIT_TIMEOUT_MS = 4000;
const TRANSPORT_FALLBACK_TARGET_RATIO = 0.8;
const TRANSPORT_MIN_CONTEXT_WINDOW = 1;

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
    if (this.pendingDrain) {
      await waitForDrainCompletion(this.pendingDrain);
      this.pendingDrain = null;
    }

    if (this.needsRecoveryAfterAbort) {
      const recovered = await this.recoverAfterStall();
      this.needsRecoveryAfterAbort = !recovered;
    }

    const requestAbortController = new AbortController();
    this.abortController = requestAbortController;
    const cleanupAbortListener = this.linkAbortSignal(abortSignal, requestAbortController);
    const webLLMMessages = await this.prepareMessagesForInference(messages);
    const cancelReason = getCancelReason(abortSignal?.reason);

    return this.createChunkStream(webLLMMessages, {
      requestAbortController,
      cancelReason,
      cleanupAbortListener,
    });
  }

  private async prepareMessagesForInference(
    messages: UIMessage[]
  ): Promise<Array<{ role: "system" | "user" | "assistant"; content: string }>> {
    const conversationMessages = this.convertToWebLLMMessages(messages);
    const currentMessage = [...conversationMessages]
      .reverse()
      .find((message) => message.role === "user")?.content;

    try {
      const memoryResult = await getMemoryFacts();
      if (memoryResult.kind === "err") {
        if (import.meta.env.DEV) {
          console.warn(
            "[Memory] Failed to load memory facts for prompt injection",
            memoryResult.error
          );
        }
        return conversationMessages;
      }

      const context = buildContextWithMemory(
        conversationMessages,
        memoryResult.value,
        this.modelId,
        {
          currentMessage,
        }
      );

      if (import.meta.env.DEV && context.percentUsed >= 70) {
        console.info(
          `[Memory] Context usage at ${context.percentUsed.toFixed(1)}%; monitoring for compaction.`
        );
      }

      if (context.percentUsed < 80) {
        return context.messages;
      }

      const compacted = compactContext(conversationMessages, memoryResult.value, this.modelId);
      if (import.meta.env.DEV) {
        console.info(
          `[Memory] Compaction applied (${compacted.stage}/${compacted.fallback}); context now ${compacted.percentUsed.toFixed(1)}%`
        );
      }

      if (!compacted.overLimit) {
        return compacted.messages;
      }

      if (import.meta.env.DEV) {
        console.warn(
          `[Memory] Compaction remains over limit (${compacted.totalTokens}/${compacted.limits.targetTokens}); applying transport fallback.`
        );
      }

      const fallbackMessages = this.applyOverLimitFallback(conversationMessages, currentMessage, {
        targetTokens: compacted.limits.targetTokens,
      });

      if (import.meta.env.DEV) {
        const fallbackTokens = fallbackMessages.reduce(
          (sum, message) => sum + estimateTokens(message.content),
          0
        );
        console.info(
          `[Memory] Transport fallback prepared ${fallbackMessages.length} messages (${fallbackTokens} tokens).`
        );
      }

      return fallbackMessages;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn("[Memory] Memory prompt injection failed; continuing without memory", error);
      }

      return conversationMessages;
    }
  }

  private applyOverLimitFallback(
    conversationMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    currentMessage: string | undefined,
    options: { targetTokens: number }
  ): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    const noMemoryContext = buildContextWithMemory(conversationMessages, [], this.modelId, {
      currentMessage,
    });

    if (noMemoryContext.totalTokens <= options.targetTokens) {
      return noMemoryContext.messages;
    }

    const systemMessage = noMemoryContext.messages.find((message) => message.role === "system");
    const conversationOnly = noMemoryContext.messages.filter(
      (message) => message.role !== "system"
    );
    const trimmedConversation = this.trimConversationToTokenTarget(
      conversationOnly,
      options.targetTokens
    );

    if (systemMessage) {
      return [systemMessage, ...trimmedConversation];
    }

    return trimmedConversation;
  }

  private trimConversationToTokenTarget(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    targetTokens: number
  ): Array<{ role: "system" | "user" | "assistant"; content: string }> {
    const safeTarget = Math.max(targetTokens, TRANSPORT_MIN_CONTEXT_WINDOW);
    const kept = [...messages];
    let totalTokens = kept.reduce((sum, message) => sum + estimateTokens(message.content), 0);

    while (kept.length > 1 && totalTokens > safeTarget * TRANSPORT_FALLBACK_TARGET_RATIO) {
      const removed = kept.shift();
      if (!removed) {
        break;
      }
      totalTokens -= estimateTokens(removed.content);
    }

    if (kept.length === 0) {
      return [];
    }

    if (totalTokens <= safeTarget * TRANSPORT_FALLBACK_TARGET_RATIO) {
      return kept;
    }

    const lastIndex = kept.length - 1;
    const last = kept[lastIndex];
    const lastTokenCount = estimateTokens(last.content);
    const overflow = Math.max(0, totalTokens - safeTarget);

    if (overflow >= lastTokenCount) {
      return [
        {
          ...last,
          content: last.content.slice(0, 32),
        },
      ];
    }

    const allowedTokens = Math.max(16, lastTokenCount - overflow);
    const allowedChars = allowedTokens * 4;
    const truncatedLast = {
      ...last,
      content: last.content.slice(0, allowedChars),
    };

    return [...kept.slice(0, lastIndex), truncatedLast];
  }

  private async streamResponse(
    controller: ReadableStreamDefaultController<UIMessageChunk>,
    webLLMMessages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { signal: AbortSignal; cancelReason: CancellationReason }
  ): Promise<Result<void, AppError>> {
    const messageId = crypto.randomUUID();
    startTokenTracking();

    for (let attempt = 0; attempt < 2; attempt += 1) {
      const tokenStreamResult = await this.createTokenStream(webLLMMessages, options);

      if (tokenStreamResult.kind === "err") {
        return tokenStreamResult;
      }

      const streamResult = await this.pushTokenChunks(
        controller,
        tokenStreamResult.value,
        messageId,
        options.signal
      );

      if (streamResult.kind === "err") {
        return streamResult;
      }

      if (!streamResult.value.stalled) {
        if (streamResult.value.tokenCount > 0) {
          controller.enqueue({ type: "text-end", id: messageId });
        }

        return ok(undefined);
      }

      this.needsRecoveryAfterAbort = true;

      if (attempt === 0 && streamResult.value.tokenCount === 0) {
        const recovered = await this.recoverAfterStall();
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
    messageId: string,
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
          this.pendingDrain = drainIterator(iterator);
          break;
        }

        if (nextChunk === null) {
          this.pendingDrain = null;
          inferenceManager.abort();
          this.needsRecoveryAfterAbort = true;
          return ok({ tokenCount, stalled: true });
        }

        if (nextChunk.done) {
          break;
        }

        const token = nextChunk.value;

        if (!started) {
          controller.enqueue({ type: "text-start", id: messageId });
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

      return ok({ tokenCount, stalled: false });
    } catch (error) {
      return err(toAppError(error));
    }
  }

  private async recoverAfterStall(): Promise<boolean> {
    try {
      const result = await inferenceManager.initializeSafe(this.modelId);

      if (result.kind === "err") {
        throw result.error;
      }

      return true;
    } catch {
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
          this.abortController = null;
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
