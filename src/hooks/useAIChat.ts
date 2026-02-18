/**
 * useAIChat Hook
 *
 * Wrapper hook that configures useChat from @ai-sdk/react with the WebLLM transport.
 * This is the bridge between the existing model store and AI SDK UI.
 */

import { useChat, type UIMessage } from "@ai-sdk/react";
import { WebLLMTransport } from "@/lib/ai/webllm-transport";

/**
 * Options for the useAIChat hook
 */
export interface UseAIChatOptions {
  /** Unique identifier for the conversation/chat session */
  conversationId: string;
  /** The model ID to use for inference */
  modelId: string;
  /** Initial messages to populate the chat */
  messages?: UIMessage[];
}

/**
 * Custom hook for AI chat using WebLLM transport
 *
 * Wraps useChat from @ai-sdk/react with the WebLLM custom transport.
 * This enables true streaming from local WebLLM inference through
 * AI SDK UI's state management.
 *
 * @example
 * ```tsx
 * function ChatComponent() {
 *   const { messages, sendMessage, status, error } = useAIChat({
 *     conversationId: 'conv-123',
 *     modelId: 'phi-2-q4f16_1-MLC',
 *   });
 *
 *   return (
 *     <div>
 *       {messages.map(msg => (
 *         <Message key={msg.id} message={msg} />
 *       ))}
 *       <input onChange={handleInputChange} value={input} />
 *       <button onClick={() => sendMessage(input)}>Send</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Configuration options for the chat
 * @returns useChat helpers (messages, sendMessage, status, error, etc.)
 */
export function useAIChat(options: UseAIChatOptions) {
  const { conversationId, modelId, messages } = options;

  // Create WebLLM transport instance with the specified model
  const transport = new WebLLMTransport({ modelId });

  // Configure useChat with the WebLLM transport
  const chatHelpers = useChat({
    id: conversationId,
    transport,
    messages,
  });

  return chatHelpers;
}
