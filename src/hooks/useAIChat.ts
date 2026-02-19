/**
 * useAIChat Hook
 *
 * Configures useChat from @ai-sdk/react with the WebLLM transport and
 * persistence orchestration.
 */

import { useEffect, useMemo } from "react";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { WebLLMTransport } from "@/lib/ai/webllm-transport";
import { useChatPersistence, type PersistenceRecoveryState } from "@/hooks/use-ai-chat-persistence";

export interface UseAIChatOptions {
  conversationId: string;
  modelId: string;
  initialMessages?: UIMessage[];
}

export interface UseAIChatReturn {
  messages: UIMessage[];
  status: "submitted" | "streaming" | "ready" | "error";
  error: Error | undefined;
  sendMessage: (message: { text: string }) => Promise<void>;
  stop: () => void;
  persistenceRecovery: PersistenceRecoveryState | null;
  retryPersistence: () => Promise<void>;
  dismissPersistenceRecovery: () => void;
}

export function useAIChat(options: UseAIChatOptions): UseAIChatReturn {
  const { conversationId, modelId, initialMessages } = options;
  const transport = useMemo(() => new WebLLMTransport({ modelId }), [modelId]);

  useEffect(() => {
    return () => {
      transport.abort();
    };
  }, [transport]);

  const chatHelpers = useChat({
    id: conversationId,
    transport,
    messages: initialMessages,
  });

  const persistence = useChatPersistence({
    conversationId,
    modelId,
    messages: chatHelpers.messages,
    initialMessageCount: initialMessages?.length ?? 0,
    stopChat: chatHelpers.stop,
  });

  return {
    messages: chatHelpers.messages,
    status: chatHelpers.status,
    error: chatHelpers.error,
    sendMessage: chatHelpers.sendMessage,
    stop: persistence.stop,
    persistenceRecovery: persistence.persistenceRecovery,
    retryPersistence: persistence.retryPersistence,
    dismissPersistenceRecovery: persistence.dismissPersistenceRecovery,
  };
}
