/**
 * ChatDetailRoute Component - Handles /chat/:id.
 *
 * Loads an existing conversation and waits for model readiness before
 * rendering the AI chat interface.
 */

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import type { UIMessage } from "@ai-sdk/react";
import { useParams } from "react-router-dom";
import { AIChatInterface } from "@/components/Chat/AIChatInterface";
import { createConversation, getConversation } from "@/lib/storage/conversations";
import { QUICK_MODEL } from "@/lib/ai/models";
import { useModelStore } from "@/store/modelStore";
import type { Conversation } from "@/types/index";

function LoadingState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#FFF8F0]">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      <p className="mt-4 text-gray-600">{title}</p>
      {subtitle ? <p className="mt-2 text-sm text-gray-500">{subtitle}</p> : null}
    </div>
  );
}

function ErrorState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#FFF8F0]">
      <p className="text-red-500">{title}</p>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg bg-[#FF6B35] px-4 py-2 text-white hover:bg-[#FF6B35]/90"
      >
        Retry
      </button>
    </div>
  );
}

function toInitialMessages(conversation: Conversation): UIMessage[] {
  return conversation.messages.map((message) => ({
    id: message.id,
    role: message.role,
    content: message.content,
    parts: [{ type: "text", text: message.content }],
  }));
}

export function ChatDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoadingConversation, setIsLoadingConversation] = useState(true);
  const [conversationError, setConversationError] = useState<string | null>(null);

  const currentModel = useModelStore((state) => state.currentModel);
  const isModelLoading = useModelStore((state) => state.isLoading);
  const modelError = useModelStore((state) => state.error);

  useEffect(() => {
    if (!id) {
      setConversationError("Conversation not found");
      setIsLoadingConversation(false);
      return;
    }

    const loadConversation = async () => {
      setIsLoadingConversation(true);
      setConversationError(null);

      try {
        const loadedConversation = await getConversation(id);

        if (!loadedConversation) {
          const fallbackModelId = currentModel?.id ?? QUICK_MODEL.id;
          setConversation(createConversation(fallbackModelId, id));
          return;
        }

        setConversation(loadedConversation);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to load conversation";
        setConversationError(message);
      } finally {
        setIsLoadingConversation(false);
      }
    };

    void loadConversation();
  }, [id, currentModel]);

  if (isLoadingConversation) {
    return <LoadingState title="Loading conversation..." />;
  }

  if (conversationError || !conversation) {
    return (
      <ErrorState title="Conversation unavailable" description={conversationError ?? "Not found"} />
    );
  }

  if (isModelLoading) {
    return (
      <LoadingState title="Loading AI model..." subtitle="This may take a moment on first load" />
    );
  }

  if (modelError) {
    return <ErrorState title="Failed to load model" description={modelError} />;
  }

  if (!currentModel) {
    return (
      <ErrorState
        title="No model loaded"
        description="Please retry to initialize the default model."
      />
    );
  }

  return (
    <AIChatInterface
      conversationId={conversation.id}
      modelId={currentModel.id}
      initialMessages={toInitialMessages(conversation)}
    />
  );
}

export default ChatDetailRoute;
