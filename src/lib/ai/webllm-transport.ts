/**
 * WebLLM Transport for AI SDK UI
 *
 * Custom ChatTransport implementation that bridges WebLLM's streaming inference
 * with AI SDK UI's state management. This enables true streaming without the
 * batch-then-stream pattern.
 */

import type {
  ChatTransport,
  UIMessage,
  UIMessageChunk,
  ChatRequestOptions,
} from "ai";
import {
  startTokenTracking,
  recordToken,
  stopTokenTracking,
} from "@/lib/performance/metrics";
import { inferenceManager } from "./inference";

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
    // Create a new AbortController for this request
    this.abortController = new AbortController();

    // Link with external abort signal if provided
    if (abortSignal) {
      abortSignal.addEventListener("abort", () => {
        this.abortController?.abort();
      });
    }

    // Convert UIMessages to WebLLM format
    const webLLMMessages = this.convertToWebLLMMessages(messages);

    // Create the stream
    const stream = new ReadableStream<UIMessageChunk>({
      start: async (controller) => {
        try {
          // Check if model is loaded, if not we need to initialize it
          if (!inferenceManager.isLoaded()) {
            // For now, throw an error - the caller should ensure model is loaded
            throw new Error(
              "Model not initialized. Please load a model before sending messages."
            );
          }

          // Generate a unique ID for this assistant message
          const messageId = crypto.randomUUID();

          // Signal the start of text generation
          controller.enqueue({
            type: "text-start",
            id: messageId,
          });

          // Start tracking tokens for performance metrics
          startTokenTracking();

          // Stream tokens from WebLLM
          const tokenStream = inferenceManager.generate(webLLMMessages);

          for await (const token of tokenStream) {
            // Check if aborted
            if (this.abortController?.signal.aborted) {
              break;
            }

            // Record token for TPS calculation
            recordToken();

            // Yield each token as a text-delta chunk
            controller.enqueue({
              type: "text-delta",
              delta: token,
              id: messageId,
            });
          }

          // Record final metrics
          stopTokenTracking();

          // Signal the end of text generation
          controller.enqueue({
            type: "text-end",
            id: messageId,
          });

          // Close the stream
          controller.close();
        } catch (error) {
          // Handle errors by yielding an error chunk
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";

          controller.enqueue({
            type: "error",
            errorText: errorMessage,
          });

          controller.close();
        }
      },
      cancel: () => {
        // Clean up when the stream is cancelled
        this.abort();
      },
    });

    return stream;
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
    return messages.map((message) => {
      // Extract text content from message parts
      const content = this.extractTextContent(message);

      return {
        role: message.role,
        content,
      };
    });
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
