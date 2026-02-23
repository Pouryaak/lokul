import { useState } from "react";
import { MoreVertical, FileDown, Trash2 } from "lucide-react";
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

interface ChatTopbarMenuProps {
  conversationId: string;
}

export function ChatTopbarMenu({ conversationId }: ChatTopbarMenuProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const {
    deleteConversation,
    exportAsMarkdown,
    exportAsJson,
    exportAsText,
    isDeleting,
  } = useConversationActions();

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
    </>
  );
}
