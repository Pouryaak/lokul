/**
 * Conversation Storage Utilities
 *
 * CRUD operations for conversations using Dexie/IndexedDB.
 * All conversations are stored locally - no cloud sync.
 */

import { db } from "./db";
import type { Conversation, Message } from "@/types/index";

/**
 * Maximum length for auto-generated conversation titles
 */
const MAX_TITLE_LENGTH = 20;

/**
 * Save or update a conversation in the database
 * Uses put() for upsert operation (insert if new, update if exists)
 *
 * @param conversation - The conversation to save
 * @throws Error if save operation fails
 */
export async function saveConversation(conversation: Conversation): Promise<void> {
  try {
    await db.conversations.put(conversation);

    if (import.meta.env.DEV) {
      console.info(`[Conversations] Saved: ${conversation.id} (${conversation.title})`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save conversation: ${message}`);
  }
}

/**
 * Retrieve a conversation by ID
 *
 * @param id - The conversation ID
 * @returns The conversation or undefined if not found
 */
export async function getConversation(id: string): Promise<Conversation | undefined> {
  try {
    return await db.conversations.get(id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get conversation: ${message}`);
  }
}

/**
 * Get all conversations sorted by most recently updated first
 *
 * @returns Array of conversations ordered by updatedAt (descending)
 */
export async function getAllConversations(): Promise<Conversation[]> {
  try {
    return await db.conversations.orderBy("updatedAt").reverse().toArray();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to get conversations: ${message}`);
  }
}

/**
 * Delete a conversation by ID
 *
 * @param id - The conversation ID to delete
 * @throws Error if delete operation fails
 */
export async function deleteConversation(id: string): Promise<void> {
  try {
    await db.conversations.delete(id);

    if (import.meta.env.DEV) {
      console.info(`[Conversations] Deleted: ${id}`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to delete conversation: ${message}`);
  }
}

/**
 * Update the title of a conversation
 *
 * @param id - The conversation ID
 * @param title - The new title
 * @throws Error if update fails or conversation not found
 */
export async function updateConversationTitle(id: string, title: string): Promise<void> {
  try {
    const conversation = await db.conversations.get(id);

    if (!conversation) {
      throw new Error(`Conversation not found: ${id}`);
    }

    await db.conversations.update(id, {
      title,
      updatedAt: Date.now(),
    });

    if (import.meta.env.DEV) {
      console.info(`[Conversations] Updated title: ${id} -> "${title}"`);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to update conversation title: ${message}`);
  }
}

/**
 * Generate a conversation title from the first user message
 * Uses first 20 characters, breaking at word boundary if possible
 *
 * @param firstUserMessage - The first message from the user
 * @returns Generated title (max 20 chars + "..." if truncated)
 */
export function generateConversationTitle(firstUserMessage: string): string {
  // Trim whitespace
  const trimmed = firstUserMessage.trim();

  // Handle empty messages
  if (trimmed.length === 0) {
    return "New Conversation";
  }

  // If message is short enough, use it as-is
  if (trimmed.length <= MAX_TITLE_LENGTH) {
    return trimmed;
  }

  // Find word boundary within the first MAX_TITLE_LENGTH characters
  const truncated = trimmed.slice(0, MAX_TITLE_LENGTH);

  // Try to break at the last space to avoid cutting words
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    // Break at word boundary
    return truncated.slice(0, lastSpaceIndex) + "...";
  }

  // No space found, just truncate and add ellipsis
  return truncated + "...";
}

/**
 * Create a new conversation with initial messages
 *
 * @param modelId - The model ID to use for this conversation
 * @param messages - Initial messages (optional)
 * @returns The created conversation
 */
export function createConversation(
  modelId: string,
  messages: Message[] = []
): Conversation {
  const now = Date.now();

  // Generate title from first user message if available
  const firstUserMessage = messages.find((m) => m.role === "user");
  const title = firstUserMessage
    ? generateConversationTitle(firstUserMessage.content)
    : "New Conversation";

  return {
    id: crypto.randomUUID(),
    title,
    model: modelId,
    messages,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Add a message to an existing conversation
 * Updates the conversation's updatedAt timestamp
 *
 * @param conversation - The conversation to update
 * @param message - The message to add
 * @returns Updated conversation
 */
export function addMessageToConversation(
  conversation: Conversation,
  message: Message
): Conversation {
  return {
    ...conversation,
    messages: [...conversation.messages, message],
    updatedAt: Date.now(),
  };
}

/**
 * Update the last message in a conversation
 * Useful for updating streaming content or metadata
 *
 * @param conversation - The conversation to update
 * @param updateFn - Function to transform the last message
 * @returns Updated conversation
 */
export function updateLastMessage(
  conversation: Conversation,
  updateFn: (message: Message) => Message
): Conversation {
  if (conversation.messages.length === 0) {
    return conversation;
  }

  const messages = [...conversation.messages];
  messages[messages.length - 1] = updateFn(messages[messages.length - 1]);

  return {
    ...conversation,
    messages,
    updatedAt: Date.now(),
  };
}
