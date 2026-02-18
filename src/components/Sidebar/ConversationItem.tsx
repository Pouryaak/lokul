/**
 * ConversationItem Component - Individual conversation row with actions
 *
 * Displays a single conversation in the sidebar with hover actions
 * for editing and deleting. Shows relative timestamp.
 */

import { useState, useCallback } from "react";
import { MessageSquare, Trash2, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Conversation } from "@/types/index";
import { EditTitleModal } from "./EditTitleModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

/**
 * Props for the ConversationItem component
 */
interface ConversationItemProps {
  /** The conversation to display */
  conversation: Conversation;
  /** Whether this conversation is currently active */
  isActive: boolean;
  /** Callback when the item is clicked */
  onClick: () => void;
  /** Callback when delete is confirmed */
  onDelete: (id: string) => void;
  /** Callback when title is edited */
  onEditTitle: (id: string, title: string) => void;
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
 * ConversationItem component
 *
 * @example
 * ```tsx
 * <ConversationItem
 *   conversation={conversation}
 *   isActive={conversation.id === currentId}
 *   onClick={() => loadConversation(conversation.id)}
 *   onDelete={(id) => deleteConversation(id)}
 *   onEditTitle={(id, title) => updateTitle(id, title)}
 * />
 * ```
 */
export function ConversationItem({
  conversation,
  isActive,
  onClick,
  onDelete,
  onEditTitle,
}: ConversationItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  /**
   * Handle edit button click
   */
  const handleEditClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setIsEditing(true);
    },
    [setIsEditing]
  );

  /**
   * Handle delete button click
   */
  const handleDeleteClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowDeleteConfirm(true);
    },
    [setShowDeleteConfirm]
  );

  /**
   * Handle confirm delete
   */
  const handleConfirmDelete = useCallback(() => {
    onDelete(conversation.id);
    setShowDeleteConfirm(false);
  }, [onDelete, conversation.id]);

  /**
   * Handle save title
   */
  const handleSaveTitle = useCallback(
    (title: string) => {
      onEditTitle(conversation.id, title);
    },
    [onEditTitle, conversation.id]
  );

  /**
   * Show actions when hovered or active
   */
  const showActions = isHovered || isActive;

  return (
    <>
      {/* Main item container */}
      <button
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "group flex w-full items-center gap-3 rounded-xl p-3 text-left transition-all duration-200",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35] focus-visible:ring-offset-2",
          isActive
            ? "border-l-4 border-[#FF6B35] bg-orange-50"
            : "border-l-4 border-transparent hover:bg-gray-100"
        )}
        aria-current={isActive ? "true" : undefined}
      >
        {/* Icon */}
        <MessageSquare
          className={cn(
            "h-4 w-4 shrink-0",
            isActive ? "text-[#FF6B35]" : "text-gray-500"
          )}
        />

        {/* Content area */}
        <div className="min-w-0 flex-1">
          {/* Title */}
          <p
            className={cn(
              "truncate text-sm font-medium",
              isActive ? "text-gray-900" : "text-gray-700"
            )}
            title={conversation.title}
          >
            {conversation.title}
          </p>

          {/* Relative timestamp */}
          <p className="text-xs text-gray-500">
            {formatRelativeTime(conversation.updatedAt)}
          </p>
        </div>

        {/* Actions */}
        <div
          className={cn(
            "flex shrink-0 items-center gap-1 transition-opacity duration-200",
            showActions ? "opacity-100" : "opacity-0"
          )}
        >
          {/* Edit button */}
          <button
            onClick={handleEditClick}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              "hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B35]",
              isActive ? "text-gray-600" : "text-gray-400"
            )}
            aria-label={`Edit title for "${conversation.title}"`}
            title="Edit title"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
              "hover:bg-red-100 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400",
              isActive ? "text-gray-600" : "text-gray-400"
            )}
            aria-label={`Delete "${conversation.title}"`}
            title="Delete conversation"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </button>

      {/* Edit title modal */}
      <EditTitleModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        onSave={handleSaveTitle}
        currentTitle={conversation.title}
      />

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Conversation"
        description={`Are you sure you want to delete "${conversation.title}"? This action cannot be undone.`}
        variant="danger"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </>
  );
}
