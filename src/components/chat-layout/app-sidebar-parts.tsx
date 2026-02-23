import { Plus, Settings, MessageSquare, Loader2 } from "lucide-react";
import { memo, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/index";
import { formatRelativeTime } from "./sidebar-time";

export function SidebarLogo({ className }: { className?: string }) {
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

export function EmptyState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <MessageSquare className="h-5 w-5 text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white/5">
        <MessageSquare className="h-6 w-6 text-gray-500" />
      </div>
      <p className="text-sm text-gray-300">No conversations yet</p>
      <p className="mt-1 text-xs text-gray-500">Start a new chat to begin</p>
    </div>
  );
}

export function LoadingState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      <p className="mt-2 text-sm text-gray-400">Loading conversations...</p>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  onClick,
  isCollapsed,
}: ConversationItemProps) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-center rounded-lg p-2 transition-colors",
          isActive
            ? "bg-[#FF6B35]/20 text-[#FF6B35]"
            : "text-gray-400 hover:bg-white/5 hover:text-gray-200"
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
        isActive ? "bg-[#FF6B35]/18 text-white" : "text-gray-300 hover:bg-white/5 hover:text-white"
      )}
    >
      <MessageSquare
        className={cn("h-4 w-4 shrink-0", isActive ? "text-[#FF8C5A]" : "text-gray-500")}
      />
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-sm font-medium" title={conversation.title}>
          {conversation.title}
        </p>
        <p className="text-xs text-gray-500">{formatRelativeTime(conversation.updatedAt)}</p>
      </div>
    </button>
  );
});

interface SidebarButtonProps {
  isCollapsed: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
}

function SidebarButton({ isCollapsed, label, icon, onClick }: SidebarButtonProps) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/5 hover:text-white"
        title={label}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-gray-300 transition-colors hover:bg-white/5 hover:text-white"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

export function NewChatItem({
  onClick,
  isCollapsed,
}: {
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <SidebarButton
      isCollapsed={isCollapsed}
      label="New chat"
      onClick={onClick}
      icon={<Plus className="h-4 w-4 text-gray-400" />}
    />
  );
}

export function SettingsButton({
  onClick,
  isCollapsed,
}: {
  onClick: () => void;
  isCollapsed: boolean;
}) {
  return (
    <SidebarButton
      isCollapsed={isCollapsed}
      label="Settings"
      onClick={onClick}
      icon={<Settings className="h-4 w-4" />}
    />
  );
}
