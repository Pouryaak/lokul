"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Plus, Settings, MessageSquare, Loader2, Cpu } from "lucide-react";
import { useCallback } from "react";
import { useParams } from "react-router-dom";
import { useConversations } from "@/hooks/useConversations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MODELS } from "@/lib/ai/models";
import { useCurrentModel, useModelStore } from "@/store/modelStore";
import type { Conversation } from "@/types/index";

interface AppSidebarProps {
  /** Callback when new chat button is clicked */
  onNewChat?: () => void;
  /** Callback when settings is clicked */
  onSettingsClick?: () => void;
  /** Callback when a conversation is clicked - passes conversation ID for navigation */
  onConversationClick?: (id: string) => void;
  /** Optional additional className */
  className?: string;
}

/**
 * Format a timestamp to relative time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60 * 1000) return "just now";
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}m ago`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}h ago`;
  }
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return days === 1 ? "yesterday" : `${days}d ago`;
  }

  return new Date(timestamp).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

/**
 * Lokul Logo Component
 */
function Logo({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-gradient-to-br from-[#FF6B35] to-[#FF8C5A]",
        className
      )}
    >
      <MessageSquare className="h-5 w-5 text-white" />
    </div>
  );
}

/**
 * Empty state when no conversations exist
 */
function EmptyState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <MessageSquare className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
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
function LoadingState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      <p className="mt-2 text-sm text-gray-500">Loading conversations...</p>
    </div>
  );
}

/**
 * Conversation list item
 */
function ConversationItem({
  conversation,
  isActive,
  onClick,
  isCollapsed,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
  isCollapsed: boolean;
}) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-center rounded-lg p-2 transition-colors",
          isActive ? "bg-[#FF6B35]/10 text-[#FF6B35]" : "text-gray-500 hover:bg-gray-100"
        )}
        title={conversation.title}
      >
        <MessageSquare className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        isActive ? "bg-[#FF6B35]/10 text-gray-900" : "text-gray-700 hover:bg-gray-100"
      )}
    >
      <MessageSquare
        className={cn("h-4 w-4 shrink-0", isActive ? "text-[#FF6B35]" : "text-gray-500")}
      />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium" title={conversation.title}>
          {conversation.title}
        </p>
        <p className="text-xs text-gray-500">{formatRelativeTime(conversation.updatedAt)}</p>
      </div>
    </button>
  );
}

/**
 * Model Selector Component
 */
function ModelSelector({ isCollapsed }: { isCollapsed: boolean }) {
  const currentModel = useCurrentModel();
  const loadModel = useModelStore((state) => state.loadModel);

  const handleModelChange = useCallback(
    async (modelId: string) => {
      await loadModel(modelId);
    },
    [loadModel]
  );

  if (isCollapsed) {
    return (
      <div className="flex justify-center py-2">
        <Cpu className="h-4 w-4 text-gray-500" />
      </div>
    );
  }

  return (
    <Select value={currentModel?.id || ""} onValueChange={handleModelChange}>
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
              <span className="text-xs text-gray-500">{model.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

/**
 * New Chat List Item (Claude-style)
 */
function NewChatItem({ onClick, isCollapsed }: { onClick: () => void; isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        title="New chat"
      >
        <Plus className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
    >
      <Plus className="h-4 w-4 text-gray-500" />
      <span>New chat</span>
    </button>
  );
}

/**
 * Settings Button
 */
function SettingsButton({ onClick, isCollapsed }: { onClick: () => void; isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        title="Settings"
      >
        <Settings className="h-4 w-4" />
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
    >
      <Settings className="h-4 w-4" />
      <span>Settings</span>
    </button>
  );
}

/**
 * AppSidebar Component
 *
 * Uses @blocks/sidebar-02 pattern with collapsible icon-only mode.
 * Matches the blocks.so DashboardSidebar structure.
 */
export function AppSidebar({
  onNewChat,
  onSettingsClick,
  onConversationClick,
  className,
}: AppSidebarProps) {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const { id: currentConversationId } = useParams<{ id: string }>();

  const { conversations, isLoading } = useConversations();

  const handleNewChat = useCallback(() => {
    onNewChat?.();
  }, [onNewChat]);

  const handleLoadConversation = useCallback(
    (id: string) => {
      onConversationClick?.(id);
    },
    [onConversationClick]
  );

  return (
    <Sidebar variant="inset" collapsible="icon" className={className}>
      {/* Header with Logo and New Chat */}
      <SidebarHeader
        className={cn(
          "flex md:pt-3.5",
          isCollapsed
            ? "flex-row items-center justify-between gap-y-4 md:flex-col md:items-start md:justify-start"
            : "flex-row items-center justify-between"
        )}
      >
        {/* Logo */}
        <a href="/" className="flex items-center gap-2">
          <Logo className="h-8 w-8" />
          {!isCollapsed && <span className="font-semibold text-gray-900">Lokul</span>}
        </a>

        {/* Collapse Trigger Only */}
        <motion.div
          key={isCollapsed ? "header-collapsed" : "header-expanded"}
          className={cn(
            "flex items-center",
            isCollapsed ? "flex-row md:flex-col-reverse" : "flex-row"
          )}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <SidebarTrigger />
        </motion.div>
      </SidebarHeader>

      {/* Model Selector */}
      <div className={cn("px-3", isCollapsed && "py-2")}>
        <ModelSelector isCollapsed={isCollapsed} />
      </div>

      {/* Conversation List */}
      <SidebarContent className="gap-4 px-2 py-4">
        {/* New Chat - Claude style, before conversations */}
        <NewChatItem onClick={handleNewChat} isCollapsed={isCollapsed} />

        {!isCollapsed && <p className="px-3 text-xs font-medium text-gray-500">Conversations</p>}

        {isLoading ? (
          <LoadingState isCollapsed={isCollapsed} />
        ) : conversations.length === 0 ? (
          <EmptyState isCollapsed={isCollapsed} />
        ) : (
          <div className="space-y-1">
            {conversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentConversationId}
                onClick={() => handleLoadConversation(conversation.id)}
                isCollapsed={isCollapsed}
              />
            ))}
          </div>
        )}
      </SidebarContent>

      {/* Footer with Settings */}
      <SidebarFooter className="px-2">
        <SettingsButton onClick={onSettingsClick || (() => {})} isCollapsed={isCollapsed} />
      </SidebarFooter>
    </Sidebar>
  );
}
