/**
 * ChatRoute Component - Handles /chat (no ID)
 *
 * On mount, creates a new conversation (in memory only) and navigates to /chat/{newId}.
 * The conversation is NOT saved to storage until the user sends their first message.
 * This prevents empty conversations from appearing in the sidebar.
 */

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { createConversation } from "@/lib/storage/conversations";
import { useModelStore } from "@/store/modelStore";

/**
 * ChatRoute component
 *
 * Automatically creates a new conversation when user navigates to /chat
 * and redirects to /chat/{id} with the new conversation.
 */
export function ChatRoute() {
  const navigate = useNavigate();

  // Get current model from store
  const currentModel = useModelStore((state) => state.currentModel);
  const defaultModelId = "gemma-2b-it-q4f16_1-MLC"; // Fallback model

  useEffect(() => {
    const createNewConversation = async () => {
      try {
        // Use current model ID if available, otherwise use default
        const modelId = currentModel?.id || defaultModelId;

        // Create new conversation (in memory only - not saved until first message)
        const conversation = createConversation(modelId);

        // Navigate to the new conversation
        // Using replace: false to add to history (user can go back)
        navigate(`/chat/${conversation.id}`, { replace: false });
      } catch (error) {
        console.error("Failed to create conversation:", error);
        // On error, stay on this page briefly then redirect to root
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      }
    };

    createNewConversation();
  }, [navigate, currentModel]);

  // Show loading state while creating
  return (
    <div className="flex h-full flex-col items-center justify-center bg-[#FFF8F0]">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF6B35]" />
      <p className="mt-4 text-gray-600">Creating new conversation...</p>
    </div>
  );
}

export default ChatRoute;
