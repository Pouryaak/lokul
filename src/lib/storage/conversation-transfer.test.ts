import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Conversation } from "@/types/index";

const { getConversationMock, saveConversationWithVersionMock } = vi.hoisted(() => ({
  getConversationMock: vi.fn(),
  saveConversationWithVersionMock: vi.fn(),
}));

vi.mock("@/lib/storage/conversations", () => {
  return {
    getConversation: getConversationMock,
    saveConversationWithVersion: saveConversationWithVersionMock,
  };
});

import { exportConversationJson, importConversationJson } from "./conversation-transfer";

function buildConversation(partial: Partial<Conversation> = {}): Conversation {
  const id = partial.id ?? "conversation-1";
  const createdAt = partial.createdAt ?? 1730000000000;
  const updatedAt = partial.updatedAt ?? 1730000010000;

  return {
    id,
    title: partial.title ?? "Imported Conversation",
    model: partial.model ?? "phi-2-q4f16_1-MLC",
    createdAt,
    updatedAt,
    version: partial.version ?? 0,
    settings: partial.settings,
    messages: partial.messages ?? [
      {
        id: "m1",
        role: "user",
        content: "Hello",
        timestamp: createdAt,
        conversationId: id,
      },
    ],
  };
}

function okSave(conversation: Conversation) {
  return {
    kind: "ok" as const,
    value: {
      conversation,
      replayed: false,
    },
  };
}

describe("importConversationJson", () => {
  beforeEach(() => {
    getConversationMock.mockReset();
    saveConversationWithVersionMock.mockReset();
  });

  it("imports a valid backup payload", async () => {
    const incoming = buildConversation();
    getConversationMock.mockResolvedValue(undefined);
    saveConversationWithVersionMock.mockResolvedValue(okSave({ ...incoming, version: 1 }));

    const result = await importConversationJson(exportConversationJson(incoming));

    expect(result.ok).toBe(true);
    expect(result.ok ? result.resolution : "").toBe("created");
    expect(getConversationMock).toHaveBeenCalledWith(incoming.id);
    expect(saveConversationWithVersionMock).toHaveBeenCalledTimes(1);
    expect(saveConversationWithVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: incoming.id, version: 0 }),
      { expectedVersion: 0 }
    );
  });

  it("returns actionable error for malformed JSON", async () => {
    const result = await importConversationJson("{not-json");

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        step: "parse",
        code: "invalid_json",
      })
    );
    expect(getConversationMock).not.toHaveBeenCalled();
    expect(saveConversationWithVersionMock).not.toHaveBeenCalled();
  });

  it("rejects payloads missing required conversation fields", async () => {
    const invalidPayload = JSON.stringify({
      schemaVersion: 1,
      exportedAt: Date.now(),
      conversation: {
        id: "conversation-1",
        model: "phi-2-q4f16_1-MLC",
        messages: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    });

    const result = await importConversationJson(invalidPayload);

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        step: "integrity",
        code: "invalid_messages",
      })
    );
    expect(saveConversationWithVersionMock).not.toHaveBeenCalled();
  });

  it("blocks conflict imports without explicit resolution", async () => {
    const incoming = buildConversation();
    getConversationMock.mockResolvedValue(buildConversation({ id: incoming.id, version: 3 }));

    const result = await importConversationJson(exportConversationJson(incoming));

    expect(result).toEqual(
      expect.objectContaining({
        ok: false,
        step: "conflict",
        code: "conflict_unresolved",
      })
    );
    expect(saveConversationWithVersionMock).not.toHaveBeenCalled();
  });

  it("replaces existing conversation when conflict resolver selects replace", async () => {
    const incoming = buildConversation();
    const existing = buildConversation({ id: incoming.id, version: 7, title: "Existing" });
    getConversationMock.mockResolvedValue(existing);
    saveConversationWithVersionMock.mockResolvedValue(okSave({ ...incoming, version: 8 }));

    const result = await importConversationJson(exportConversationJson(incoming), {
      resolveConflict: () => "replace",
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.resolution : "").toBe("replaced");
    expect(saveConversationWithVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({ id: incoming.id, version: existing.version }),
      { expectedVersion: existing.version }
    );
  });

  it("duplicates conversation with a new id when resolver selects duplicate", async () => {
    const incoming = buildConversation();
    const existing = buildConversation({ id: incoming.id, version: 2 });
    getConversationMock.mockResolvedValue(existing);

    const duplicatedConversation = buildConversation({
      id: "conversation-duplicate",
      title: "Imported Conversation (Imported)",
      version: 1,
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Hello",
          timestamp: 1730000000000,
          conversationId: "conversation-duplicate",
        },
      ],
    });

    saveConversationWithVersionMock.mockResolvedValue(okSave(duplicatedConversation));

    const result = await importConversationJson(exportConversationJson(incoming), {
      resolveConflict: () => "duplicate",
      generateConversationId: () => "conversation-duplicate",
      now: () => 1730000099999,
    });

    expect(result.ok).toBe(true);
    expect(result.ok ? result.resolution : "").toBe("duplicated");
    expect(saveConversationWithVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "conversation-duplicate",
        title: "Imported Conversation (Imported)",
        messages: [
          expect.objectContaining({
            conversationId: "conversation-duplicate",
          }),
        ],
      }),
      { expectedVersion: 0 }
    );
  });
});
