/**
 * Search Index Service
 *
 * Full-text search across all conversations using MiniSearch.
 * Indexes conversation titles and message content for fast fuzzy search.
 */

import MiniSearch from "minisearch";
import type { Conversation, Message } from "@/types/index";

/**
 * Document structure for the search index
 */
export interface SearchableDocument {
  /** Unique ID: `${conversationId}:${messageId}` */
  id: string;
  /** Conversation title (indexed with boost) */
  title: string;
  /** Message content (indexed) */
  content: string;
  /** Parent conversation ID for navigation */
  conversationId: string;
  /** Message role for display purposes */
  role: "user" | "assistant";
  /** Timestamp for sorting (optional) */
  updatedAt: number;
}

/**
 * Search result with match metadata
 */
export interface SearchResult {
  id: string;
  title: string;
  content: string;
  conversationId: string;
  role: "user" | "assistant";
  updatedAt: number;
  /** Match score from MiniSearch */
  score: number;
}

/** Singleton MiniSearch instance */
let searchIndex: MiniSearch<SearchableDocument> | null = null;

/** Track which conversations are indexed */
const indexedConversationIds = new Set<string>();

/** Track document IDs by conversation ID for removal */
const documentsByConversation = new Map<string, Set<string>>();

/**
 * Create a new MiniSearch instance with configured options
 */
export function createSearchIndex(): MiniSearch<SearchableDocument> {
  return new MiniSearch<SearchableDocument>({
    fields: ["title", "content"],
    storeFields: ["id", "title", "content", "conversationId", "role", "updatedAt"],
    searchOptions: {
      fuzzy: 0.2,
      prefix: true,
      boost: { title: 2 },
    },
  });
}

/**
 * Get or create the singleton search index
 */
function getOrCreateIndex(): MiniSearch<SearchableDocument> {
  if (!searchIndex) {
    searchIndex = createSearchIndex();
  }
  return searchIndex;
}

/**
 * Convert a message to a searchable document
 */
function messageToDocument(
  conversationId: string,
  title: string,
  updatedAt: number,
  message: Message
): SearchableDocument {
  return {
    id: `${conversationId}:${message.id}`,
    title,
    content: message.content,
    conversationId,
    role: message.role as "user" | "assistant",
    updatedAt,
  };
}

/**
 * Index all messages from a single conversation
 *
 * @param conversation - The conversation to index
 */
export function indexConversation(conversation: Conversation): void {
  const index = getOrCreateIndex();

  // Remove existing documents for this conversation if re-indexing
  if (indexedConversationIds.has(conversation.id)) {
    removeConversationFromIndex(conversation.id);
  }

  // Create documents for all messages
  const documents = conversation.messages.map((message) =>
    messageToDocument(conversation.id, conversation.title, conversation.updatedAt, message)
  );

  // Track document IDs for this conversation
  const docIds = new Set(documents.map((d) => d.id));
  documentsByConversation.set(conversation.id, docIds);

  // Add all documents to the index
  if (documents.length > 0) {
    index.addAll(documents);
    indexedConversationIds.add(conversation.id);
  }
}

/**
 * Index multiple conversations at once
 *
 * @param conversations - Array of conversations to index
 */
export function indexConversations(conversations: Conversation[]): void {
  const index = getOrCreateIndex();

  // Build all documents
  const allDocuments: SearchableDocument[] = [];

  for (const conversation of conversations) {
    // Skip already indexed conversations
    if (indexedConversationIds.has(conversation.id)) {
      continue;
    }

    const documents = conversation.messages.map((message) =>
      messageToDocument(conversation.id, conversation.title, conversation.updatedAt, message)
    );

    // Track document IDs for this conversation
    const docIds = new Set(documents.map((d) => d.id));
    documentsByConversation.set(conversation.id, docIds);

    allDocuments.push(...documents);
    indexedConversationIds.add(conversation.id);
  }

  // Bulk add all documents
  if (allDocuments.length > 0) {
    index.addAll(allDocuments);
  }
}

/**
 * Search across all indexed conversations
 *
 * @param query - Search query string
 * @param limit - Maximum number of results to return (default: 10)
 * @returns Array of search results sorted by relevance
 */
export function searchConversations(query: string, limit = 10): SearchResult[] {
  // Handle empty query
  if (!query || query.trim().length === 0) {
    return [];
  }

  // Handle uninitialized index
  if (!searchIndex) {
    return [];
  }

  try {
    const results = searchIndex.search(query.trim(), { fuzzy: 0.2, prefix: true });

    // Map to SearchResult format with score
    const searchResults: SearchResult[] = results.map((result) => ({
      id: result.id,
      title: result.title,
      content: result.content,
      conversationId: result.conversationId,
      role: result.role,
      updatedAt: result.updatedAt,
      score: result.score,
    }));

    // Limit results
    return searchResults.slice(0, limit);
  } catch (error) {
    console.error("[SearchIndex] Search error:", error);
    return [];
  }
}

/**
 * Remove all documents belonging to a conversation from the index
 *
 * @param conversationId - ID of the conversation to remove
 */
export function removeConversationFromIndex(conversationId: string): void {
  if (!searchIndex) {
    return;
  }

  // Get document IDs for this conversation
  const docIds = documentsByConversation.get(conversationId);

  if (docIds && docIds.size > 0) {
    try {
      for (const docId of docIds) {
        searchIndex.discard(docId);
      }
    } catch (error) {
      console.error("[SearchIndex] Error removing conversation:", error);
    }
  }

  // Remove from tracking maps
  documentsByConversation.delete(conversationId);
  indexedConversationIds.delete(conversationId);
}

/**
 * Clear the entire search index
 */
export function clearSearchIndex(): void {
  if (searchIndex) {
    searchIndex.removeAll();
  }
  searchIndex = null;
  indexedConversationIds.clear();
  documentsByConversation.clear();
}

/**
 * Check if the index has been initialized
 */
export function isIndexInitialized(): boolean {
  return searchIndex !== null;
}

/**
 * Get the number of indexed documents
 */
export function getIndexedDocumentCount(): number {
  return searchIndex?.documentCount ?? 0;
}

/**
 * Get the set of indexed conversation IDs (for debugging/testing)
 */
export function getIndexedConversationIds(): Set<string> {
  return new Set(indexedConversationIds);
}
