import { useState } from "react";
import { MoreVertical, Pencil, FileDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditTitleModal } from "@/components/Sidebar/EditTitleModal";
import { useConversationActions } from "@/hooks/useConversationActions";
import { getConversation } from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";

interface ChatTopbarMenuProps {
  conversationId: string;
}

async function getConversationOrThrow(conversationId: string): Promise<Conversation> {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found. Refresh and try again.");
  }
  return conversation;
}

export function ChatTopbarMenu({ conversationId }: ChatTopbarMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const {
    deleteConversation,
    renameConversation,
    exportAsMarkdown,
    exportAsJson,
    exportAsText,
    isDeleting,
  } = useConversationActions();

  const loadConversation = async () => {
    const conv = await getConversation(conversationId);
    if (conv) {
      setConversation(conv);
    }
  };

  const handleRenameClick = async () => {
    await loadConversation();
    setShowRenameModal(true);
  };

  const handleRenameSave = async (newTitle: string) => {
    await renameConversation(conversationId, newTitle);
    setShowRenameModal(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    void deleteConversation(conversationId);
  };

  const handleExportMarkdown = () => {
    void exportAsMarkdown(conversationId);
  };

  const handleExportJson = () => {
    void exportAsJson(conversationId);
  };

  const handleExportText = () => {
    void exportAsText(conversationId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Conversation actions"
          >
            <MoreVertical className="h-4 w-4" />
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
        title="Delete Conversation"
        description="This conversation will be permanently removed. This action cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        loading={isDeleting}
      />

      <EditTitleModal
        isOpen={showRenameModal}
        onClose={() => setShowRenameModal(false)}
        onSave={handleRenameSave}
        currentTitle={conversation?.title ?? ""}
      />
    </>
  );
}
