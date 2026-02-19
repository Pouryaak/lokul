import {
  getConversation,
  saveConversationWithVersion,
  type SaveConversationResult,
} from "@/lib/storage/conversations";
import {
  CONVERSATION_BACKUP_SCHEMA_VERSION,
  type Conversation,
  type ConversationBackupEnvelope,
  type ConversationConflictResolution,
  type ConversationImportFailure,
  type ConversationImportOptions,
  type ConversationImportResult,
  type Message,
  type MessageRole,
} from "@/types/index";

const LINE_SEPARATOR = "\n";

function formatTimestamp(timestamp: number): string {
  return new Date(timestamp).toISOString();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isMessageRole(value: unknown): value is MessageRole {
  return value === "user" || value === "assistant" || value === "system";
}

function normalizeMessage(value: unknown, conversationId: string): Message | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    !isMessageRole(value.role) ||
    typeof value.content !== "string" ||
    typeof value.timestamp !== "number" ||
    !Number.isFinite(value.timestamp) ||
    typeof value.conversationId !== "string"
  ) {
    return null;
  }

  if (value.conversationId !== conversationId) {
    return null;
  }

  return {
    id: value.id,
    role: value.role,
    content: value.content,
    timestamp: value.timestamp,
    conversationId: value.conversationId,
    metadata: isRecord(value.metadata) ? (value.metadata as Message["metadata"]) : undefined,
  };
}

function normalizeConversation(value: unknown): Conversation | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.id !== "string" ||
    typeof value.title !== "string" ||
    typeof value.model !== "string" ||
    !Array.isArray(value.messages) ||
    typeof value.createdAt !== "number" ||
    typeof value.updatedAt !== "number" ||
    !Number.isFinite(value.createdAt) ||
    !Number.isFinite(value.updatedAt)
  ) {
    return null;
  }

  const messages: Message[] = [];
  for (const rawMessage of value.messages) {
    const normalizedMessage = normalizeMessage(rawMessage, value.id);
    if (!normalizedMessage) {
      return null;
    }
    messages.push(normalizedMessage);
  }

  return {
    id: value.id,
    title: value.title,
    model: value.model,
    messages,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    version:
      typeof value.version === "number" && Number.isFinite(value.version)
        ? Math.max(0, value.version)
        : 0,
    settings: isRecord(value.settings)
      ? {
          temperature:
            typeof value.settings.temperature === "number" &&
            Number.isFinite(value.settings.temperature)
              ? value.settings.temperature
              : undefined,
          maxTokens:
            typeof value.settings.maxTokens === "number" &&
            Number.isFinite(value.settings.maxTokens)
              ? value.settings.maxTokens
              : undefined,
          systemPrompt:
            typeof value.settings.systemPrompt === "string"
              ? value.settings.systemPrompt
              : undefined,
        }
      : undefined,
  };
}

function toFailure(
  step: ConversationImportFailure["step"],
  code: ConversationImportFailure["code"],
  message: string
): ConversationImportFailure {
  return {
    ok: false,
    step,
    code,
    message,
  };
}

function createBackupEnvelope(
  conversation: Conversation,
  exportedAt: number = Date.now()
): ConversationBackupEnvelope {
  return {
    schemaVersion: CONVERSATION_BACKUP_SCHEMA_VERSION,
    exportedAt,
    conversation,
  };
}

function parseEnvelope(raw: unknown): ConversationImportResult | ConversationBackupEnvelope {
  if (!isRecord(raw)) {
    return toFailure("schema", "invalid_schema", "Backup file must contain an object payload.");
  }

  if (typeof raw.schemaVersion !== "number") {
    return toFailure("schema", "invalid_schema", "Backup schema version is missing or invalid.");
  }

  if (raw.schemaVersion !== CONVERSATION_BACKUP_SCHEMA_VERSION) {
    return toFailure(
      "schema",
      "invalid_schema",
      `Unsupported backup schema version: ${raw.schemaVersion}.`
    );
  }

  if (typeof raw.exportedAt !== "number" || !Number.isFinite(raw.exportedAt)) {
    return toFailure("schema", "invalid_schema", "Backup export timestamp is missing or invalid.");
  }

  const conversation = normalizeConversation(raw.conversation);
  if (!conversation) {
    return toFailure(
      "integrity",
      "invalid_messages",
      "Conversation payload is invalid or contains malformed messages."
    );
  }

  return {
    schemaVersion: raw.schemaVersion,
    exportedAt: raw.exportedAt,
    conversation,
  };
}

function toJsonString(payload: ConversationBackupEnvelope): string {
  return JSON.stringify(payload, null, 2);
}

function toDuplicateConversation(
  incoming: Conversation,
  generateConversationId: NonNullable<ConversationImportOptions["generateConversationId"]>,
  now: number
): Conversation {
  const duplicateId = generateConversationId();
  const duplicateTitle = incoming.title.endsWith(" (Imported)")
    ? incoming.title
    : `${incoming.title} (Imported)`;

  return {
    ...incoming,
    id: duplicateId,
    title: duplicateTitle,
    version: 0,
    updatedAt: now,
    messages: incoming.messages.map((message) => ({
      ...message,
      conversationId: duplicateId,
    })),
  };
}

async function persistConversation(
  conversation: Conversation,
  expectedVersion: number
): Promise<SaveConversationResult> {
  return saveConversationWithVersion(conversation, { expectedVersion });
}

export function exportConversationMarkdown(conversation: Conversation): string {
  const header = [
    `# ${conversation.title}`,
    "",
    `- Conversation ID: ${conversation.id}`,
    `- Model: ${conversation.model}`,
    `- Created: ${formatTimestamp(conversation.createdAt)}`,
    `- Updated: ${formatTimestamp(conversation.updatedAt)}`,
    `- Messages: ${conversation.messages.length}`,
    "",
    "---",
    "",
  ];

  const body = conversation.messages.flatMap((message) => [
    `## ${message.role.toUpperCase()}`,
    `_${formatTimestamp(message.timestamp)}_`,
    "",
    message.content,
    "",
  ]);

  return [...header, ...body].join(LINE_SEPARATOR).trim() + LINE_SEPARATOR;
}

export function exportConversationJson(conversation: Conversation): string {
  return toJsonString(createBackupEnvelope(conversation));
}

export function exportConversationText(conversation: Conversation): string {
  const lines = [
    `${conversation.title}`,
    `Conversation ID: ${conversation.id}`,
    `Model: ${conversation.model}`,
    `Created: ${formatTimestamp(conversation.createdAt)}`,
    `Updated: ${formatTimestamp(conversation.updatedAt)}`,
    "",
  ];

  for (const message of conversation.messages) {
    lines.push(`[${formatTimestamp(message.timestamp)}] ${message.role}:`);
    lines.push(message.content);
    lines.push("");
  }

  return lines.join(LINE_SEPARATOR).trim() + LINE_SEPARATOR;
}

export async function importConversationJson(
  fileText: string,
  options: ConversationImportOptions = {}
): Promise<ConversationImportResult> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(fileText);
  } catch {
    return toFailure(
      "parse",
      "invalid_json",
      "Invalid JSON file. Please provide a valid .json backup."
    );
  }

  const envelope = parseEnvelope(parsed);
  if ("ok" in envelope && envelope.ok === false) {
    return envelope;
  }

  const incomingConversation = envelope.conversation;
  const existingConversation = await getConversation(incomingConversation.id);

  if (!existingConversation) {
    const createResult = await persistConversation({ ...incomingConversation, version: 0 }, 0);
    if (createResult.kind === "err") {
      return toFailure("persist", "persist_failed", createResult.error.message);
    }

    return {
      ok: true,
      resolution: "created",
      conversation: createResult.value.conversation,
    };
  }

  if (!options.resolveConflict) {
    return toFailure(
      "conflict",
      "conflict_unresolved",
      "Conversation already exists. Choose replace or duplicate to continue import."
    );
  }

  const resolution = await options.resolveConflict({
    existing: existingConversation,
    incoming: incomingConversation,
  });

  if (resolution === "replace") {
    const replaceResult = await persistConversation(
      {
        ...incomingConversation,
        version: existingConversation.version,
      },
      existingConversation.version
    );

    if (replaceResult.kind === "err") {
      return toFailure("persist", "persist_failed", replaceResult.error.message);
    }

    return {
      ok: true,
      resolution: "replaced",
      conversation: replaceResult.value.conversation,
    };
  }

  const generateConversationId = options.generateConversationId ?? (() => crypto.randomUUID());
  const now = options.now?.() ?? Date.now();
  const duplicateConversation = toDuplicateConversation(
    incomingConversation,
    generateConversationId,
    now
  );

  if (duplicateConversation.id === existingConversation.id) {
    return toFailure(
      "conflict",
      "conflict_unresolved",
      "Duplicate import generated the same conversation ID. Try again."
    );
  }

  const duplicateResult = await persistConversation(duplicateConversation, 0);
  if (duplicateResult.kind === "err") {
    return toFailure("persist", "persist_failed", duplicateResult.error.message);
  }

  return {
    ok: true,
    resolution: "duplicated",
    conversation: duplicateResult.value.conversation,
  };
}

export type { ConversationConflictResolution };
