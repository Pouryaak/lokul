/**
 * ConversationItemMenu Component
 *
 * 3-dot dropdown menu for individual conversation items in the sidebar.
 * Provides Rename, Export, and Delete actions with confirmation for destructive actions.
 */

import { useState } from "react";
import { MoreHorizontal, Pencil, FileDown, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useConversationActions } from "@/hooks/useConversationActions";
import type { Conversation } from "@/types/index";

export interface ConversationItemMenuProps {
  /** The conversation this menu belongs to */
  conversation: Conversation;
  /** Callback when rename action is triggered */
  onRename: () => void;
  /** Whether the menu button should be visible */
  isVisible?: boolean;
}

/**
 * 3-dot menu for conversation items
 *
 * @example
 * ```tsx
 * <ConversationItemMenu
 *   conversation={conversation}
 *   onRename={() => setIsRenaming(true)}
 * />
 * ```
 */
export function ConversationItemMenu({ conversation, onRename, isVisible = false }: ConversationItemMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteConversation, exportAsMarkdown, exportAsJson, exportAsText, isDeleting } =
    useConversationActions();

  const handleRenameClick = () => {
    onRename();
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    void deleteConversation(conversation.id);
  };

  const handleExportMarkdown = () => {
    void exportAsMarkdown(conversation.id);
  };

  const handleExportJson = () => {
    void exportAsJson(conversation.id);
  };

  const handleExportText = () => {
    void exportAsText(conversation.id);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon-xs"
            className={cn(
              "h-6 w-6 text-muted-foreground transition-opacity hover:bg-muted hover:text-foreground",
              isVisible ? "opacity-100" : "opacity-0"
            )}
            aria-label={`Actions for ${conversation.title}`}
            onClick={(e) => e.stopPropagation()}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={handleRenameClick}>
            <Pencil className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleExportMarkdown}>
            <FileDown className="h-4 w-4" />
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportJson}>
            <FileDown className="h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleExportText}>
            <FileDown className="h-4 w-4" />
            Export as Text
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleDeleteClick}>
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title={`Delete "${conversation.title}"?`}
        description="This conversation will be permanently removed."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />
    </>
  );
}
