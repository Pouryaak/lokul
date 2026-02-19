import { useRef, type ChangeEvent } from "react";
import { FileDown, FileUp, MoreHorizontal } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  exportConversationJson,
  exportConversationMarkdown,
  exportConversationText,
  importConversationJson,
} from "@/lib/storage/conversation-transfer";
import { getConversation } from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";

interface ChatTopbarMenuProps {
  conversationId: string;
}

function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

function buildFilename(conversation: Conversation, extension: string): string {
  const title = sanitizeFilenameSegment(conversation.title);
  const fallback = conversation.id.slice(0, 12).toLowerCase();
  const base = title.length > 0 ? title : fallback;
  return `${base}.${extension}`;
}

function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

async function getConversationOrThrow(conversationId: string): Promise<Conversation> {
  const conversation = await getConversation(conversationId);
  if (!conversation) {
    throw new Error("Conversation not found. Refresh and try again.");
  }
  return conversation;
}

export function ChatTopbarMenu({ conversationId }: ChatTopbarMenuProps) {
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const handleExport = async (
    extension: "md" | "json" | "txt",
    serializer: (conversation: Conversation) => string,
    mimeType: string
  ) => {
    try {
      const conversation = await getConversationOrThrow(conversationId);
      const content = serializer(conversation);
      downloadString(content, buildFilename(conversation, extension), mimeType);
      toast.success(`Exported ${extension.toUpperCase()} backup`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Export failed";
      toast.error(message);
    }
  };

  const handleImportClick = () => {
    importInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const [file] = Array.from(event.target.files ?? []);
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const fileText = await file.text();
      const result = await importConversationJson(fileText, {
        resolveConflict: () => {
          const shouldReplace = window.confirm(
            "A conversation with this ID already exists.\n\nPress OK to replace it, or Cancel to import as duplicate."
          );

          return shouldReplace ? "replace" : "duplicate";
        },
      });

      if (!result.ok) {
        toast.error(result.message);
        return;
      }

      if (result.resolution === "replaced") {
        toast.success("Conversation replaced from backup");
        return;
      }

      if (result.resolution === "duplicated") {
        toast.success("Conversation imported as duplicate");
        return;
      }

      toast.success("Conversation imported from backup");
    } catch {
      toast.error("Import failed. Please try again.");
    }
  };

  return (
    <>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleFileChange}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" aria-label="Conversation transfer actions">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuItem
            onClick={() =>
              void handleExport("md", exportConversationMarkdown, "text/markdown;charset=utf-8")
            }
          >
            <FileDown className="h-4 w-4" />
            Export as Markdown
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => void handleExport("json", exportConversationJson, "application/json")}
          >
            <FileDown className="h-4 w-4" />
            Export as JSON
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              void handleExport("txt", exportConversationText, "text/plain;charset=utf-8")
            }
          >
            <FileDown className="h-4 w-4" />
            Export as Text
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleImportClick}>
            <FileUp className="h-4 w-4" />
            Import JSON backup
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
