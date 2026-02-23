/**
 * useConversationActions Hook
 *
 * Provides actions for managing conversations with toast feedback.
 * Handles delete, rename, and export operations.
 */

import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { deleteConversation, updateConversationTitle } from "@/lib/storage/conversations";
import {
  exportConversationJson,
  exportConversationMarkdown,
  exportConversationText,
} from "@/lib/storage/conversation-transfer";
import { getConversation } from "@/lib/storage/conversations";
import type { Conversation } from "@/types/index";

/**
 * Sanitize a string for use in a filename
 */
function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 48);
}

/**
 * Build a safe filename for download
 */
function buildFilename(conversation: Conversation, extension: string): string {
  const title = sanitizeFilenameSegment(conversation.title);
  const fallback = conversation.id.slice(0, 12).toLowerCase();
  const base = title.length > 0 ? title : fallback;
  return `${base}.${extension}`;
}

/**
 * Download a string as a file
 */
function downloadString(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Hook return type
 */
export interface ConversationActions {
  /** Delete a conversation by ID */
  deleteConversation: (id: string) => Promise<void>;
  /** Rename a conversation */
  renameConversation: (id: string, newTitle: string) => Promise<void>;
  /** Export conversation as Markdown */
  exportAsMarkdown: (id: string) => Promise<void>;
  /** Export conversation as JSON */
  exportAsJson: (id: string) => Promise<void>;
  /** Export conversation as plain text */
  exportAsText: (id: string) => Promise<void>;
  /** Whether a delete operation is in progress */
  isDeleting: boolean;
}

/**
 * Hook for managing conversation actions with toast feedback
 *
 * @example
 * ```tsx
 * const { deleteConversation, exportAsMarkdown, isDeleting } = useConversationActions();
 *
 * await deleteConversation(conversationId);
 * await exportAsMarkdown(conversationId);
 * ```
 */
export function useConversationActions(): ConversationActions {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = useCallback(
    async (id: string) => {
      setIsDeleting(true);
      try {
        await deleteConversation(id);
        toast.success("Conversation deleted");
        // Navigate to new conversation after delete
        navigate("/chat");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Failed to delete conversation";
        toast.error(message);
        throw error;
      } finally {
        setIsDeleting(false);
      }
    },
    [navigate]
  );

  const handleRename = useCallback(async (id: string, newTitle: string) => {
    try {
      await updateConversationTitle(id, newTitle);
      toast.success("Conversation renamed");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to rename conversation";
      toast.error(message);
      throw error;
    }
  }, []);

  const handleExport = useCallback(
    async (
      id: string,
      extension: "md" | "json" | "txt",
      serializer: (conversation: Conversation) => string,
      mimeType: string
    ) => {
      try {
        const conversation = await getConversation(id);
        if (!conversation) {
          throw new Error("Conversation not found");
        }
        const content = serializer(conversation);
        downloadString(content, buildFilename(conversation, extension), mimeType);
        toast.success(`Exported as ${extension.toUpperCase()}`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Export failed";
        toast.error(message);
      }
    },
    []
  );

  const handleExportMarkdown = useCallback(
    (id: string) =>
      handleExport(id, "md", exportConversationMarkdown, "text/markdown;charset=utf-8"),
    [handleExport]
  );

  const handleExportJson = useCallback(
    (id: string) => handleExport(id, "json", exportConversationJson, "application/json"),
    [handleExport]
  );

  const handleExportText = useCallback(
    (id: string) => handleExport(id, "txt", exportConversationText, "text/plain;charset=utf-8"),
    [handleExport]
  );

  return {
    deleteConversation: handleDelete,
    renameConversation: handleRename,
    exportAsMarkdown: handleExportMarkdown,
    exportAsJson: handleExportJson,
    exportAsText: handleExportText,
    isDeleting,
  };
}
