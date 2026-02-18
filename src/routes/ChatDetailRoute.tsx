/**
 * ChatDetailRoute Component - Handles /chat/:id
 *
 * Loads an existing conversation from storage and renders the chat interface.
 * If conversation not found, shows toast warning and redirects to /chat.
 */

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AIChatInterface } from "@/components/Chat/AIChatInterface";
import { getConversation } from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";
import type { UIMessage } from "@ai-sdk/react";

/**
 * ChatDetailRoute component
 *
 * Loads a conversation by ID from URL params and renders the chat interface.
 * Handles non-existent conversations with a toast warning and redirect.
 */
export function ChatDetailRoute() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadConversation = async () => {
      if (!id) {
        toast.error("Invalid conversation ID");
        navigate("/chat");
        return;
      }

      try {
        const loadedConversation = await getConversation(id);

        if (!loadedConversation) {
          // Conversation not found - show warning and redirect
          toast.warning("Conversation not found");
          navigate("/chat");
          return;
        }

        setConversation(loadedConversation);
      } catch (error) {
        console.error("Failed to load conversation:", error);
        toast.error("Failed to load conversation");
        navigate("/chat");
      } finally {
        setIsLoading(false);
      }
    };

    loadConversation();
  }, [id, navigate]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex h-full flex-col items-center justify-center bg-[#FFF8F0]">
        <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
        <p className="mt-4 text-gray-600">Loading conversation...</p>
      </div>
    );
  }

  if (!conversation) {
    return null; // Will redirect
  }

  // Convert storage messages to UIMessages
  const initialMessages: UIMessage[] = conversation.messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content,
    parts: [{ type: "text" as const, text: msg.content }],
  }));

  return (
    <AIChatInterface
      conversationId={id!}
      modelId={conversation.model}
      initialMessages={initialMessages}
    />
  );
}

export default ChatDetailRoute;
