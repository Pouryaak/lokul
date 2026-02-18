/**
 * ConversationSidebar Component - Main sidebar with conversation list
 *
 * Displays conversation history, memory warnings, and performance suggestions.
 * Collapsible on mobile, fixed width on desktop.
 */

import { useCallback } from "react";
import { Plus, PanelLeft, AlertTriangle, Zap, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";
import { useCurrentConversationId } from "@/store/chatStore";
import { Button } from "@/components/ui/Button";
import { ConversationItem } from "./ConversationItem";

/**
 * Props for the ConversationSidebar component
 */
interface ConversationSidebarProps {
  /** Whether the sidebar is open */
  isOpen: boolean;
  /** Callback when toggle button is clicked */
  onToggle: () => void;
  /** Callback when new chat button is clicked */
  onNewChat: () => void;
  /** Optional additional className */
  className?: string;
}

/**
 * Empty state component when no conversations exist
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <PanelLeft className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">No conversations yet</p>
      <p className="mt-1 text-xs text-gray-400">
        Start a new chat to begin
      </p>
    </div>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
    </div>
  );
}

/**
 * ConversationSidebar component
 *
 * @example
 * ```tsx
 * <ConversationSidebar
 *   isOpen={sidebarOpen}
 *   onToggle={() => setSidebarOpen(!sidebarOpen)}
 *   onNewChat={() => clearChat()}
 * />
 * ```
 */
export function ConversationSidebar({
  isOpen,
  onToggle,
  onNewChat,
  className,
}: ConversationSidebarProps) {
  const currentConversationId = useCurrentConversationId();

  const {
    conversations,
    isLoading,
    loadConversation,
    deleteConversation,
    editTitle,
    memoryWarning,
    performanceSuggestion,
    clearPerformanceSuggestion,
  } = useConversations();

  /**
   * Handle loading a conversation
   */
  const handleLoadConversation = useCallback(
    (id: string) => {
      loadConversation(id);
    },
    [loadConversation]
  );

  /**
   * Handle deleting a conversation
   */
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      await deleteConversation(id);
    },
    [deleteConversation]
  );

  /**
   * Handle editing a conversation title
   */
  const handleEditTitle = useCallback(
    async (id: string, title: string) => {
      await editTitle(id, title);
    },
    [editTitle]
  );

  return (
    <>
      {/* Sidebar container */}
      <aside
        className={cn(
          "flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300 ease-in-out",
          isOpen ? "w-[280px] translate-x-0" : "w-0 -translate-x-full opacity-0",
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-4">
          <h2 className="text-sm font-semibold text-gray-900">Conversations</h2>
          <div className="flex items-center gap-1">
            {/* New chat button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              aria-label="New chat"
              title="New chat"
            >
              <Plus className="h-4 w-4" />
            </Button>
            {/* Toggle button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              aria-label="Close sidebar"
              title="Close sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Warning banners */}
        <div className="space-y-2 p-3">
          {/* Memory warning */}
          {memoryWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">High Memory Usage</p>
                <p className="text-xs text-amber-700">
                  Memory usage is above 75%. Consider closing other tabs or restarting the app.
                </p>
              </div>
            </div>
          )}

          {/* Performance suggestion */}
          {performanceSuggestion && (
            <div className="flex items-start gap-2 rounded-lg bg-blue-50 p-3 text-sm">
              <Zap className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="flex-1">
                <p className="font-medium text-blue-800">Performance Tip</p>
                <p className="text-xs text-blue-700">{performanceSuggestion}</p>
              </div>
              <button
                onClick={clearPerformanceSuggestion}
                className="shrink-0 rounded p-1 hover:bg-blue-100"
                aria-label="Dismiss suggestion"
              >
                <X className="h-3 w-3 text-blue-600" />
              </button>
            </div>
          )}
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto px-2 pb-4">
          {isLoading ? (
            <LoadingState />
          ) : conversations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="space-y-1">
              {conversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  onClick={() => handleLoadConversation(conversation.id)}
                  onDelete={handleDeleteConversation}
                  onEditTitle={handleEditTitle}
                />
              ))}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
          onClick={onToggle}
          aria-hidden="true"
        />
      )}
    </>
  );
}
