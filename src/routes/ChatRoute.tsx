/**
 * ChatRoute Component - Handles /chat (no ID)
 *
 * Shows a welcome screen with greeting and suggested prompts.
 * Creates a new conversation only when user sends the first message.
 * The first message is passed to ChatDetailRoute and sent once there,
 * so the user message appears only once (ChatGPT-like behavior).
 */

import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { NewChatWelcome } from "@/components/Chat/NewChatWelcome";
import { PendingModelSelector } from "@/components/model/PendingModelSelector";
import { createConversation, saveConversation } from "@/lib/storage/conversations";
import { SMART_MODEL } from "@/lib/ai/models";
import { useModelStore } from "@/store/modelStore";
import { useConversationModelStore } from "@/store/conversationModelStore";
import { toast } from "sonner";

interface PendingInputSectionProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
  onSubmit: (text: string) => Promise<void>;
  isLoading: boolean;
}

function PendingInputSection({
  selectedModelId,
  onModelChange,
  onSubmit,
  isLoading,
}: PendingInputSectionProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSubmit = useCallback(async () => {
    const text = inputValue.trim();
    if (!text || isLoading) return;

    setInputValue("");
    await onSubmit(text);
  }, [inputValue, isLoading, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit]
  );

  return (
    <div className="pointer-events-none fixed right-0 bottom-0 left-0 px-4 pb-4 md:left-[calc(var(--sidebar-width,0px)+0px)]">
      <div className="pointer-events-auto mx-auto max-w-3xl">
        <div className="rounded-2xl border border-white/12 bg-[#141414]/95 shadow-[0_14px_38px_rgba(0,0,0,0.38)] backdrop-blur">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message Lokul..."
            rows={1}
            className="max-h-[200px] min-h-[60px] w-full resize-none bg-transparent px-4 pt-3 pb-2 text-[15px] text-[#f2ede8] outline-none placeholder:text-gray-500"
            style={{ fontFamily: '"DM Sans", sans-serif' }}
          />
          <div className="flex items-center justify-between gap-2 px-3 pb-3">
            <PendingModelSelector selectedModelId={selectedModelId} onModelChange={onModelChange} />
            <button
              onClick={handleSubmit}
              disabled={!inputValue.trim() || isLoading}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#ff6b35] text-white transition-all hover:bg-[#e55a2b] disabled:opacity-50"
              aria-label="Send message"
            >
              {isLoading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 10l7-7m0 0l7 7m-7-7v18"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p
          className="mt-2 text-center text-xs text-gray-500"
          style={{ fontFamily: '"DM Sans", sans-serif' }}
        >
          Lokul runs entirely in your browser. Your data never leaves your device.
        </p>
      </div>
    </div>
  );
}

export function ChatRoute() {
  const navigate = useNavigate();
  const currentModel = useModelStore((state) => state.currentModel);
  const hydrateConversation = useConversationModelStore((state) => state.hydrateConversation);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedModelId, setSelectedModelId] = useState(currentModel?.id ?? SMART_MODEL.id);

  const createConversationAndNavigate = useCallback(
    async (firstMessage: string) => {
      if (isCreating) return;

      setIsCreating(true);

      try {
        const modelId = selectedModelId;
        const conversation = createConversation(modelId);

        await saveConversation(conversation);
        await hydrateConversation(conversation.id, modelId);
        navigate(`/chat/${conversation.id}`, {
          replace: true,
          state: { pendingMessage: firstMessage },
        });
      } catch (error) {
        console.error("Failed to create conversation:", error);
        toast.error("Failed to start conversation");
        setIsCreating(false);
      }
    },
    [selectedModelId, hydrateConversation, isCreating, navigate]
  );

  const handleSuggestionClick = useCallback(
    (text: string) => {
      void createConversationAndNavigate(text);
    },
    [createConversationAndNavigate]
  );

  return (
    <div className="relative flex h-full flex-col bg-transparent">
      <div className="flex-1 overflow-y-auto pb-40">
        <NewChatWelcome onSuggestionClick={handleSuggestionClick} />
      </div>
      <PendingInputSection
        selectedModelId={selectedModelId}
        onModelChange={setSelectedModelId}
        onSubmit={createConversationAndNavigate}
        isLoading={isCreating}
      />
    </div>
  );
}

export default ChatRoute;
