import { Plus, Settings, MessageSquare, Loader2, Search } from "lucide-react";
import { memo, useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/index";
import { formatRelativeTime } from "./sidebar-time";
import { ConversationItemMenu } from "./ConversationItemMenu";
import { Kbd } from "@/components/ui/kbd";

/**
 * Detect if the user is on macOS
 * Used to show ⌘ vs Ctrl for keyboard shortcuts
 */
function isMacOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return navigator.platform.toUpperCase().indexOf("MAC") >= 0;
}

/**
 * Get the modifier key symbol for the current platform
 * Returns ⌘ on macOS, Ctrl on other platforms
 */
function getModifierKey(): string {
  return isMacOS() ? "⌘" : "Ctrl";
}

export function SidebarLogo({ className }: { className?: string }) {
  return (
    <img src="/lokul-logo.png" alt="Lokul" className={cn("rounded-lg object-cover", className)} />
  );
}

export function EmptyState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <MessageSquare className="h-5 w-5 text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-6 w-6 text-muted-foreground/60" />
      </div>
      <p className="text-sm text-[var(--chat-text-secondary)]">No conversations yet</p>
      <p className="mt-1 text-xs text-muted-foreground">Start a new chat to begin</p>
    </div>
  );
}

export function LoadingState({ isCollapsed }: { isCollapsed: boolean }) {
  if (isCollapsed) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground/60" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center px-4 py-8">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground/60" />
      <p className="mt-2 text-sm text-muted-foreground">Loading conversations...</p>
    </div>
  );
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
  onRename: (id: string, newTitle: string) => Promise<void>;
}

export const ConversationItem = memo(function ConversationItem({
  conversation,
  isActive,
  onClick,
  isCollapsed,
  onRename,
}: ConversationItemProps) {
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(conversation.title);
  const [isHovered, setIsHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering rename mode
  useEffect(() => {
    if (isRenaming && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isRenaming]);

  // Reset rename value when conversation changes
  useEffect(() => {
    if (!isRenaming) {
      setRenameValue(conversation.title);
    }
  }, [conversation.title, isRenaming]);

  const handleRenameClick = () => {
    setIsRenaming(true);
  };

  const handleRenameSubmit = async () => {
    const trimmedValue = renameValue.trim();
    if (trimmedValue && trimmedValue !== conversation.title) {
      await onRename(conversation.id, trimmedValue);
    }
    setIsRenaming(false);
  };

  const handleRenameCancel = () => {
    setRenameValue(conversation.title);
    setIsRenaming(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleRenameSubmit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleRenameCancel();
    }
  };

  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex w-full items-center justify-center rounded-lg p-2 transition-colors",
          isActive
            ? "bg-primary/20 text-primary"
            : "text-muted-foreground hover:bg-accent hover:text-foreground"
        )}
        title={conversation.title}
      >
        <MessageSquare className="h-4 w-4" />
      </button>
    );
  }

  return (
    <div
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors",
        isActive ? "bg-primary/18 text-foreground" : "text-[var(--chat-text-secondary)] hover:bg-accent hover:text-foreground"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button onClick={onClick} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <MessageSquare
          className={cn("h-4 w-4 shrink-0", isActive ? "text-primary" : "text-muted-foreground/60")}
        />
        <div className="min-w-0 flex-1">
          {isRenaming ? (
            <input
              ref={inputRef}
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={() => void handleRenameSubmit()}
              onKeyDown={handleKeyDown}
              className="ring-primary/50 focus:ring-primary w-full rounded bg-muted px-1 py-0.5 text-sm font-medium text-foreground ring-1 outline-none focus:ring-2"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <p className="truncate text-sm font-medium" title={conversation.title}>
                {conversation.title}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(conversation.updatedAt)}</p>
            </>
          )}
        </div>
      </button>
      {!isRenaming && (
        <ConversationItemMenu
          conversation={conversation}
          onRename={handleRenameClick}
          isVisible={isHovered || isActive}
        />
      )}
    </div>
  );
});

interface SidebarButtonProps {
  isCollapsed: boolean;
  label: string;
  icon: ReactNode;
  onClick: () => void;
  shortcut?: string;
}

function SidebarButton({ isCollapsed, label, icon, onClick, shortcut }: SidebarButtonProps) {
  if (isCollapsed) {
    return (
      <button
        onClick={onClick}
        className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        title={label}
      >
        {icon}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-[var(--chat-text-secondary)] transition-colors hover:bg-accent hover:text-foreground"
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {shortcut && <Kbd className="px-1.5 py-0.5 text-[9px]">{shortcut}</Kbd>}
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
  const shortcut = `${getModifierKey()}N`;

  return (
    <SidebarButton
      isCollapsed={isCollapsed}
      label="New chat"
      onClick={onClick}
      icon={<Plus className="h-4 w-4 text-muted-foreground/70" />}
      shortcut={shortcut}
    />
  );
}

export function SearchButton({
  onClick,
  isCollapsed,
}: {
  onClick: () => void;
  isCollapsed: boolean;
}) {
  const shortcut = `${getModifierKey()}K`;

  return (
    <SidebarButton
      isCollapsed={isCollapsed}
      label="Search"
      onClick={onClick}
      icon={<Search className="h-4 w-4 text-muted-foreground/70" />}
      shortcut={shortcut}
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
