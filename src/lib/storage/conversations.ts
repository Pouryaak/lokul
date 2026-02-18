/**
 * Conversation Storage Utilities
 *
 * CRUD operations for conversations using Dexie/IndexedDB.
 * All conversations are stored locally - no cloud sync.
 */

import { db } from "./db";
import {
  abortedError,
  isAppError,
  persistenceConflictError,
  persistenceReplayError,
  storageError,
  toAppError,
} from "@/lib/utils/errors";
import { err, ok, type Result } from "@/types/result";
import type {
  CancellationReason,
  Conversation,
  ConversationSaveOptions,
  Message,
  PersistenceConflictDetails,
} from "@/types/index";

const MAX_TITLE_LENGTH = 20;
const DEFAULT_IDEMPOTENCY_WINDOW_MS = 5000;

interface IdempotencyCacheEntry {
  expiresAt: number;
  result: SaveConversationResult;
}

export interface SaveConversationOutcome {
  conversation: Conversation;
  replayed: boolean;
}

export type SaveConversationResult = Result<SaveConversationOutcome, ReturnType<typeof toAppError>>;

const idempotencyCache = new Map<string, IdempotencyCacheEntry>();

interface StorageOperationOptions {
  signal?: AbortSignal;
  cancelReason?: CancellationReason;
}

function assertNotAborted(options: StorageOperationOptions = {}): void {
  const { signal, cancelReason } = options;

  if (signal?.aborted) {
    throw abortedError(cancelReason ?? signal.reason);
  }
}

function normalizeVersion(value: number | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function withVersion(conversation: Conversation | undefined): Conversation | undefined {
  if (!conversation) {
    return undefined;
  }

  return {
    ...conversation,
    version: normalizeVersion(conversation.version),
  };
}

function normalizeConversation(conversation: Conversation): Conversation {
  return {
    ...conversation,
    version: normalizeVersion(conversation.version),
  };
}

function getIdempotencyCacheKey(conversationId: string, idempotencyKey: string): string {
  return `${conversationId}:${idempotencyKey}`;
}

function cleanupExpiredIdempotencyEntries(now: number): void {
  for (const [key, value] of idempotencyCache.entries()) {
    if (value.expiresAt <= now) {
      idempotencyCache.delete(key);
    }
  }
}

function getCachedIdempotentResult(
  conversationId: string,
  idempotencyKey: string,
  now: number
): SaveConversationResult | null {
  cleanupExpiredIdempotencyEntries(now);

  const cacheKey = getIdempotencyCacheKey(conversationId, idempotencyKey);
  const entry = idempotencyCache.get(cacheKey);

  if (!entry) {
    return null;
  }

  return entry.result;
}

function setCachedIdempotentResult(
  conversationId: string,
  idempotencyKey: string,
  result: SaveConversationResult,
  windowMs: number,
  now: number
): void {
  const cacheKey = getIdempotencyCacheKey(conversationId, idempotencyKey);
  idempotencyCache.set(cacheKey, {
    expiresAt: now + windowMs,
    result,
  });
}

function resolveExpectedVersion(
  conversation: Conversation,
  existing: Conversation | undefined,
  expectedVersion?: number
): number {
  if (typeof expectedVersion === "number") {
    return expectedVersion;
  }

  if (!existing) {
    return 0;
  }

  return normalizeVersion(conversation.version);
}

function buildConflictDetails(
  conversationId: string,
  expectedVersion: number,
  actualVersion: number
): PersistenceConflictDetails {
  return {
    conversationId,
    expectedVersion,
    actualVersion,
  };
}

function computeNextConversation(
  existing: Conversation | undefined,
  conversation: Conversation,
  expectedVersion: number
): Conversation {
  const createdAt = existing?.createdAt ?? conversation.createdAt;
  const nextVersion = expectedVersion + 1;

  return {
    ...conversation,
    createdAt,
    version: nextVersion,
  };
}

export async function saveConversationWithVersion(
  conversation: Conversation,
  options: ConversationSaveOptions = {}
): Promise<SaveConversationResult> {
  const normalized = normalizeConversation(conversation);
  const now = Date.now();
  const idempotencyWindowMs = options.idempotencyWindowMs ?? DEFAULT_IDEMPOTENCY_WINDOW_MS;

  try {
    assertNotAborted(options);

    if (options.idempotencyKey) {
      const cached = getCachedIdempotentResult(normalized.id, options.idempotencyKey, now);

      if (cached) {
        return err(persistenceReplayError(normalized.id, options.idempotencyKey));
      }
    }

    const result = await db.transaction("rw", db.conversations, async () => {
      assertNotAborted(options);

      const existing = withVersion(await db.conversations.get(normalized.id));
      const expectedVersion = resolveExpectedVersion(normalized, existing, options.expectedVersion);
      const actualVersion = normalizeVersion(existing?.version);

      if (expectedVersion !== actualVersion) {
        return err(
          persistenceConflictError(
            buildConflictDetails(normalized.id, expectedVersion, actualVersion)
          )
        );
      }

      const nextConversation = computeNextConversation(existing, normalized, expectedVersion);
      await db.conversations.put(nextConversation);

      return ok({
        conversation: nextConversation,
        replayed: false,
      });
    });

    if (options.idempotencyKey) {
      setCachedIdempotentResult(
        normalized.id,
        options.idempotencyKey,
        result,
        idempotencyWindowMs,
        now
      );
    }

    return result;
  } catch (error) {
    if (isAppError(error)) {
      return err(error);
    }

    return err(storageError("Failed to save conversation", undefined, error));
  }
}

export async function saveConversation(
  conversation: Conversation,
  options: Omit<ConversationSaveOptions, "expectedVersion"> = {}
): Promise<void> {
  const result = await saveConversationWithVersion(conversation, options);

  if (result.kind === "err") {
    throw result.error;
  }

  if (import.meta.env.DEV) {
    console.info(
      `[Conversations] Saved: ${conversation.id} (${conversation.title}) v${result.value.conversation.version}`
    );
  }
}

export async function getConversation(
  id: string,
  options: StorageOperationOptions = {}
): Promise<Conversation | undefined> {
  try {
    assertNotAborted(options);
    const conversation = await db.conversations.get(id);
    assertNotAborted(options);
    return conversation ? normalizeConversation(conversation) : undefined;
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw storageError("Failed to get conversation", undefined, error);
  }
}

export async function getAllConversations(
  options: StorageOperationOptions = {}
): Promise<Conversation[]> {
  try {
    assertNotAborted(options);
    const conversations = await db.conversations.orderBy("updatedAt").reverse().toArray();
    assertNotAborted(options);
    return conversations.map(normalizeConversation);
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw storageError("Failed to get conversations", undefined, error);
  }
}

export async function deleteConversation(
  id: string,
  options: StorageOperationOptions = {}
): Promise<void> {
  try {
    assertNotAborted(options);
    await db.conversations.delete(id);

    if (import.meta.env.DEV) {
      console.info(`[Conversations] Deleted: ${id}`);
    }
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw storageError("Failed to delete conversation", undefined, error);
  }
}

export async function updateConversationTitle(
  id: string,
  title: string,
  options: StorageOperationOptions = {}
): Promise<void> {
  try {
    assertNotAborted(options);

    const conversation = await getConversation(id, options);

    if (!conversation) {
      throw storageError(`Conversation not found: ${id}`);
    }

    const nextConversation: Conversation = {
      ...conversation,
      title,
      updatedAt: Date.now(),
    };

    const result = await saveConversationWithVersion(nextConversation, {
      expectedVersion: conversation.version,
      signal: options.signal,
    });

    if (result.kind === "err") {
      throw result.error;
    }

    if (import.meta.env.DEV) {
      console.info(`[Conversations] Updated title: ${id} -> "${title}"`);
    }
  } catch (error) {
    if (isAppError(error)) {
      throw error;
    }

    throw storageError("Failed to update conversation title", undefined, error);
  }
}

export function generateConversationTitle(firstUserMessage: string): string {
  const trimmed = firstUserMessage.trim();

  if (trimmed.length === 0) {
    return "New Conversation";
  }

  if (trimmed.length <= MAX_TITLE_LENGTH) {
    return trimmed;
  }

  const truncated = trimmed.slice(0, MAX_TITLE_LENGTH);
  const lastSpaceIndex = truncated.lastIndexOf(" ");

  if (lastSpaceIndex > 0) {
    return truncated.slice(0, lastSpaceIndex) + "...";
  }

  return truncated + "...";
}

export function createConversation(
  modelId: string,
  id?: string,
  messages: Message[] = []
): Conversation {
  const now = Date.now();
  const firstUserMessage = messages.find((m) => m.role === "user");
  const title = firstUserMessage
    ? generateConversationTitle(firstUserMessage.content)
    : "New Conversation";

  return {
    id: id ?? crypto.randomUUID(),
    title,
    model: modelId,
    messages,
    createdAt: now,
    updatedAt: now,
    version: 0,
  };
}

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
