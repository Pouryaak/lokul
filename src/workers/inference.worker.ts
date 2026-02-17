/**
 * Web Worker for AI inference using WebLLM
 *
 * This worker runs AI inference off the main thread to ensure UI responsiveness
 * during model loading and generation. Uses WebLLM's WebWorkerMLCEngineHandler
 * for standardized communication between main thread and MLCEngine.
 */

import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

/**
 * Create the Web Worker handler instance
 * This manages all communication between main thread and MLCEngine
 */
const handler = new WebWorkerMLCEngineHandler();

/**
 * Set up message handler to route all messages to the WebLLM handler
 * The handler processes initialization, generation, and abort requests
 */
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};

/**
 * Export nothing - worker runs in isolation
 * This worker is instantiated via:
 * new Worker(new URL("./inference.worker.ts", import.meta.url), { type: "module" })
 */
