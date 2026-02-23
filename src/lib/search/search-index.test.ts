import { beforeEach, describe, expect, it } from "vitest";
import type { Conversation, Message } from "@/types/index";
import {
  clearSearchIndex,
  createSearchIndex,
  getIndexedConversationIds,
  getIndexedDocumentCount,
  indexConversation,
  indexConversations,
  isIndexInitialized,
  removeConversationFromIndex,
  searchConversations,
} from "./search-index";

function buildMessage(partial: Partial<Message> = {}): Message {
  const id = partial.id ?? "msg-1";
  const conversationId = partial.conversationId ?? "conv-1";

  return {
    id,
    role: partial.role ?? "user",
    content: partial.content ?? "Hello world",
    timestamp: partial.timestamp ?? Date.now(),
    conversationId,
  };
}

function buildConversation(partial: Partial<Conversation> = {}): Conversation {
  const id = partial.id ?? "conv-1";
  const createdAt = partial.createdAt ?? 1730000000000;
  const updatedAt = partial.updatedAt ?? 1730000010000;

  return {
    id,
    title: partial.title ?? "Test Conversation",
    model: partial.model ?? "phi-2-q4f16_1-MLC",
    createdAt,
    updatedAt,
    version: partial.version ?? 0,
    messages: partial.messages ?? [buildMessage({ conversationId: id })],
  };
}

describe("createSearchIndex", () => {
  it("creates a MiniSearch instance with correct configuration", () => {
    const index = createSearchIndex();

    expect(index).toBeDefined();
    expect(index.documentCount).toBe(0);
  });
});

describe("indexConversation", () => {
  beforeEach(() => {
    clearSearchIndex();
  });

  it("indexes a conversation with multiple messages", () => {
    const conversation = buildConversation({
      messages: [
        buildMessage({ id: "m1", content: "First message" }),
        buildMessage({ id: "m2", content: "Second message" }),
        buildMessage({ id: "m3", content: "Third message" }),
      ],
    });

    indexConversation(conversation);

    expect(getIndexedDocumentCount()).toBe(3);
    expect(getIndexedConversationIds()).toContain("conv-1");
  });

  it("does not create duplicate entries when re-indexing same conversation", () => {
    const conversation = buildConversation({
      messages: [buildMessage({ id: "m1", content: "Test message" })],
    });

    indexConversation(conversation);
    indexConversation(conversation);

    expect(getIndexedDocumentCount()).toBe(1);
  });
});

describe("indexConversations", () => {
  beforeEach(() => {
    clearSearchIndex();
  });

  it("indexes multiple conversations at once", () => {
    const conversations = [
      buildConversation({
        id: "conv-1",
        title: "First Chat",
        messages: [
          buildMessage({ id: "m1", conversationId: "conv-1", content: "Message in first chat" }),
        ],
      }),
      buildConversation({
        id: "conv-2",
        title: "Second Chat",
        messages: [
          buildMessage({ id: "m2", conversationId: "conv-2", content: "Message in second chat" }),
        ],
      }),
    ];

    indexConversations(conversations);

    expect(getIndexedDocumentCount()).toBe(2);
    expect(getIndexedConversationIds()).toContain("conv-1");
    expect(getIndexedConversationIds()).toContain("conv-2");
  });

  it("skips already indexed conversations", () => {
    const conversation = buildConversation({
      id: "conv-1",
      messages: [buildMessage({ id: "m1", conversationId: "conv-1", content: "Test" })],
    });

    indexConversation(conversation);
    indexConversations([conversation]);

    expect(getIndexedDocumentCount()).toBe(1);
  });
});

describe("searchConversations", () => {
  beforeEach(() => {
    clearSearchIndex();
  });

  it("finds results by message content", () => {
    const conversation = buildConversation({
      title: "Random Chat",
      messages: [
        buildMessage({ id: "m1", content: "I love programming in TypeScript" }),
        buildMessage({ id: "m2", content: "The weather is nice today" }),
      ],
    });

    indexConversation(conversation);

    const results = searchConversations("TypeScript");

    expect(results).toHaveLength(1);
    expect(results[0].content).toContain("TypeScript");
  });

  it("boosts results by conversation title", () => {
    const conversations = [
      buildConversation({
        id: "conv-1",
        title: "TypeScript Discussion",
        messages: [buildMessage({ id: "m1", conversationId: "conv-1", content: "Hello there" })],
      }),
      buildConversation({
        id: "conv-2",
        title: "Random Chat",
        messages: [
          buildMessage({
            id: "m2",
            conversationId: "conv-2",
            content: "I like TypeScript programming",
          }),
        ],
      }),
    ];

    indexConversations(conversations);

    const results = searchConversations("TypeScript");

    // Title match should rank higher (boosted)
    expect(results[0].conversationId).toBe("conv-1");
    expect(results).toHaveLength(2);
  });

  it("handles fuzzy matching", () => {
    const conversation = buildConversation({
      messages: [buildMessage({ id: "m1", content: "programming languages" })],
    });

    indexConversation(conversation);

    // Fuzzy search should match "programing" with missing 'm'
    const results = searchConversations("programing");

    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array for empty query", () => {
    const conversation = buildConversation({
      messages: [buildMessage({ content: "Some content" })],
    });

    indexConversation(conversation);

    expect(searchConversations("")).toEqual([]);
    expect(searchConversations("   ")).toEqual([]);
  });

  it("returns empty array when index is not initialized", () => {
    clearSearchIndex();

    expect(searchConversations("test")).toEqual([]);
  });

  it("respects the limit parameter", () => {
    const conversation = buildConversation({
      messages: [
        buildMessage({ id: "m1", content: "python one" }),
        buildMessage({ id: "m2", content: "python two" }),
        buildMessage({ id: "m3", content: "python three" }),
        buildMessage({ id: "m4", content: "python four" }),
        buildMessage({ id: "m5", content: "python five" }),
      ],
    });

    indexConversation(conversation);

    const results = searchConversations("python", 3);

    expect(results).toHaveLength(3);
  });

  it("shows separate results for multiple matches in same conversation", () => {
    const conversation = buildConversation({
      messages: [
        buildMessage({ id: "m1", content: "First message about python" }),
        buildMessage({ id: "m2", content: "Second message about python" }),
        buildMessage({ id: "m3", content: "Third message about python" }),
      ],
    });

    indexConversation(conversation);

    const results = searchConversations("python");

    expect(results).toHaveLength(3);
    // All results should have same conversationId but different message IDs
    expect(new Set(results.map((r) => r.conversationId)).size).toBe(1);
    expect(new Set(results.map((r) => r.id)).size).toBe(3);
  });
});

describe("removeConversationFromIndex", () => {
  beforeEach(() => {
    clearSearchIndex();
  });

  it("removes all documents for a conversation", () => {
    const conversation = buildConversation({
      id: "conv-to-remove",
      messages: [
        buildMessage({ id: "m1", conversationId: "conv-to-remove", content: "Message one" }),
        buildMessage({ id: "m2", conversationId: "conv-to-remove", content: "Message two" }),
      ],
    });

    indexConversation(conversation);
    expect(getIndexedDocumentCount()).toBe(2);

    removeConversationFromIndex("conv-to-remove");

    expect(getIndexedDocumentCount()).toBe(0);
    expect(getIndexedConversationIds()).not.toContain("conv-to-remove");
  });

  it("only removes the specified conversation", () => {
    const conversations = [
      buildConversation({
        id: "conv-1",
        messages: [buildMessage({ id: "m1", conversationId: "conv-1", content: "Content 1" })],
      }),
      buildConversation({
        id: "conv-2",
        messages: [buildMessage({ id: "m2", conversationId: "conv-2", content: "Content 2" })],
      }),
    ];

    indexConversations(conversations);
    expect(getIndexedDocumentCount()).toBe(2);

    removeConversationFromIndex("conv-1");

    expect(getIndexedDocumentCount()).toBe(1);
    expect(getIndexedConversationIds()).toContain("conv-2");
    expect(getIndexedConversationIds()).not.toContain("conv-1");
  });

  it("handles removing non-existent conversation gracefully", () => {
    const conversation = buildConversation();
    indexConversation(conversation);

    // Should not throw
    removeConversationFromIndex("non-existent");

    expect(getIndexedDocumentCount()).toBe(1);
  });
});

describe("clearSearchIndex", () => {
  it("removes all documents and resets state", () => {
    const conversations = [
      buildConversation({
        id: "conv-1",
        messages: [buildMessage({ id: "m1", conversationId: "conv-1", content: "Test 1" })],
      }),
      buildConversation({
        id: "conv-2",
        messages: [buildMessage({ id: "m2", conversationId: "conv-2", content: "Test 2" })],
      }),
    ];

    indexConversations(conversations);
    expect(getIndexedDocumentCount()).toBe(2);

    clearSearchIndex();

    expect(getIndexedDocumentCount()).toBe(0);
    expect(getIndexedConversationIds().size).toBe(0);
  });
});

describe("isIndexInitialized", () => {
  beforeEach(() => {
    clearSearchIndex();
  });

  it("returns false when index has not been created", () => {
    clearSearchIndex();
    expect(isIndexInitialized()).toBe(false);
  });

  it("returns true after indexing a conversation", () => {
    const conversation = buildConversation();
    indexConversation(conversation);
    expect(isIndexInitialized()).toBe(true);
  });
});
