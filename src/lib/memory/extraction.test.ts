import { describe, expect, it, vi } from "vitest";
import type { MLCEngineInterface } from "@mlc-ai/web-llm";
import type { Message } from "@/types/index";
import { extractFacts } from "./extraction";

function buildMessage(partial: Partial<Message>): Message {
  return {
    id: partial.id ?? "m1",
    role: partial.role ?? "user",
    content: partial.content ?? "hello",
    timestamp: partial.timestamp ?? Date.now(),
    conversationId: partial.conversationId ?? "c1",
  };
}

describe("extractFacts", () => {
  it("returns an empty ok result for short message history", async () => {
    const createMock = vi.fn();
    const engine = {
      chat: {
        completions: {
          create: createMock,
        },
      },
    } as unknown as MLCEngineInterface;
    const messages = [buildMessage({ content: "Only one message" })];

    const result = await extractFacts(engine, messages);

    expect(result.kind).toBe("ok");
    expect(result.kind === "ok" ? result.value : []).toEqual([]);
    expect(createMock).not.toHaveBeenCalled();
  });
});
