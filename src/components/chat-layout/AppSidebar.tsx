/**
 * AppSidebar Component - Application-specific sidebar with conversation list
 *
 * Wraps shadcn sidebar primitives with Lokul-specific content:
 * - Header with logo and new chat button
 * - Conversation list with memory/performance warnings
 * - Footer with settings link
 *
 * Based on @blocks/sidebar-02 pattern from shadcn.
 */

import { useCallback } from "react";
import { Plus, Settings, MessageSquare, AlertTriangle, Zap, X, Loader2, Cpu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useConversations } from "@/hooks/useConversations";
import { useCurrentConversationId } from "@/store/chatStore";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/lib/ai/models";
import { useCurrentModel, useModelStore } from "@/store/modelStore";
import type { Conversation } from "@/types/index";

/**
 * Props for the AppSidebar component
 */
interface AppSidebarProps {
  /** Callback when new chat button is clicked */
  onNewChat?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Optional additional className */
  className?: string;
}

/**
 * Format a timestamp to relative time
 * Returns strings like "just now", "5m ago", "2h ago", "yesterday", "3d ago"
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  // Less than 1 minute
  if (diff < 60 * 1000) {
    return "just now";
  }

  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const minutes = Math.floor(diff / (60 * 1000));
    return `${minutes}m ago`;
  }

  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours}h ago`;
  }

  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    if (days === 1) {
      return "yesterday";
    }
    return `${days}d ago`;
  }

  // Default to date string
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Empty state component when no conversations exist
 */
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
        <MessageSquare className="h-6 w-6 text-gray-400" />
      </div>
      <p className="text-sm text-gray-500">No conversations yet</p>
      <p className="mt-1 text-xs text-gray-400">Start a new chat to begin</p>
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
 * Conversation menu item component
 */
interface ConversationMenuItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

function ConversationMenuItem({
  conversation,
  isActive,
  onClick,
}: ConversationMenuItemProps) {
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        onClick={onClick}
        isActive={isActive}
        tooltip={conversation.title}
        className={cn(
          "group flex w-full items-center gap-3",
          isActive && "border-l-2 border-[#FF6B35]"
        )}
      >
        <MessageSquare
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-[#FF6B35]" : "text-gray-500"
          )}
        />
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              isActive ? "text-gray-900" : "text-gray-700"
            )}
            title={conversation.title}
          >
            {conversation.title}
          </p>
          <p className="text-xs text-gray-500">
            {formatRelativeTime(conversation.updatedAt)}
          </p>
        </div>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}

/**
 * AppSidebar component
 *
 * @example
 * ```tsx
 * <AppSidebar
 *   onNewChat={() => createNewConversation()}
 *   onSettingsClick={() => openSettings()}
 * />
 * ```
 */
export function AppSidebar({
  onNewChat,
  onSettingsClick,
  className,
}: AppSidebarProps) {
  const currentConversationId = useCurrentConversationId();
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const currentModel = useCurrentModel();
  const loadModel = useModelStore((state) => state.loadModel);

  const {
    conversations,
    isLoading,
    loadConversation,
    createNewConversation,
    memoryWarning,
    performanceSuggestion,
    clearPerformanceSuggestion,
  } = useConversations();

  /**
   * Handle model change - creates new conversation with selected model
   */
  const handleModelChange = useCallback(
    async (modelId: string) => {
      // Load the new model
      await loadModel(modelId);
      // Create new conversation with the selected model
      createNewConversation();
      onNewChat?.();
    },
    [loadModel, createNewConversation, onNewChat]
  );

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
   * Handle new chat button click
   */
  const handleNewChat = useCallback(() => {
    createNewConversation();
    onNewChat?.();
  }, [createNewConversation, onNewChat]);

  return (
    <Sidebar
      collapsible="icon"
      className={cn("border-r border-gray-200", className)}
    >
      {/* Header with logo and new chat button */}
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A]">
                <MessageSquare className="h-4 w-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">Lokul</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNewChat}
            aria-label="New chat"
            title="New chat"
            className={cn("shrink-0", isCollapsed && "w-full")}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </SidebarHeader>

      {/* Model Selector */}
      {!isCollapsed && (
        <div className="px-4 pb-3">
          <Select
            value={currentModel?.id || ""}
            onValueChange={handleModelChange}
          >
            <SelectTrigger className="w-full">
              <div className="flex items-center gap-2">
                <Cpu className="h-4 w-4 text-gray-500" />
                <SelectValue placeholder="Select model" />
              </div>
            </SelectTrigger>
            <SelectContent>
              {MODELS.map((model) => (
                <SelectItem key={model.id} value={model.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">{model.name}</span>
                    <span className="text-xs text-gray-500">
                      {model.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <SidebarSeparator />

      {/* Warning banners */}
      {!isCollapsed && (memoryWarning || performanceSuggestion) && (
        <div className="space-y-2 p-3">
          {/* Memory warning */}
          {memoryWarning && (
            <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="font-medium text-amber-800">High Memory Usage</p>
                <p className="text-xs text-amber-700">
                  Memory usage is above 75%. Consider closing other tabs or
                  restarting the app.
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
      )}

      {/* Conversation list */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          {!isCollapsed && (
            <SidebarGroupLabel className="text-xs font-medium text-gray-500">
              Conversations
            </SidebarGroupLabel>
          )}
          <SidebarMenu>
            {isLoading ? (
              <LoadingState />
            ) : conversations.length === 0 ? (
              <EmptyState />
            ) : (
              conversations.map((conversation) => (
                <ConversationMenuItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={conversation.id === currentConversationId}
                  onClick={() => handleLoadConversation(conversation.id)}
                />
              ))
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer with settings */}
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={onSettingsClick}
              tooltip="Settings"
              className="w-full"
            >
              <Settings className="h-4 w-4" />
              {!isCollapsed && <span>Settings</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
