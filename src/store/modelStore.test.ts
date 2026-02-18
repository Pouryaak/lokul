import { beforeEach, describe, expect, it, vi } from "vitest";

const { loadModelMock, unloadMock, updateConversationModelTargetMock } = vi.hoisted(() => ({
  loadModelMock: vi.fn<(modelId: string) => Promise<void>>(),
  unloadMock: vi.fn(),
  updateConversationModelTargetMock: vi.fn<(id: string, modelId: string) => Promise<void>>(),
}));

vi.mock("@/lib/ai/model-engine", () => {
  return {
    modelEngine: {
      loadModel: loadModelMock,
      unload: unloadMock,
    },
  };
});

vi.mock("@/lib/storage/conversations", () => {
  return {
    updateConversationModelTarget: updateConversationModelTargetMock,
  };
});

import { useConversationModelStore } from "@/store/conversationModelStore";

function resetConversationModelState() {
  useConversationModelStore.setState({
    activeConversationId: null,
    requestedModelByConversation: {},
    activeModelByConversation: {},
    engineLoadedModelId: null,
    downloadLifecycleByModel: {},
    queue: [],
    loadingModelId: null,
    queueRunning: false,
    isDownloadManagerOpen: false,
  });
}

function deferred(): {
  promise: Promise<void>;
  resolve: () => void;
  reject: (error?: unknown) => void;
} {
  let resolve!: () => void;
  let reject!: (error?: unknown) => void;

  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe("conversationModelStore queue orchestration", () => {
  beforeEach(() => {
    resetConversationModelState();
    loadModelMock.mockReset();
    unloadMock.mockReset();
    updateConversationModelTargetMock.mockReset();
    updateConversationModelTargetMock.mockResolvedValue();
  });

  it("serializes queue execution one-by-one", async () => {
    const loadOrder: string[] = [];
    loadModelMock.mockImplementation(async (modelId: string) => {
      loadOrder.push(modelId);
      await Promise.resolve();
    });

    const store = useConversationModelStore.getState();
    store.setActiveConversation("c1");

    await Promise.all([
      store.requestModelForConversation("c1", "phi-2-q4f16_1-MLC"),
      store.requestModelForConversation("c1", "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"),
    ]);

    expect(loadOrder).toEqual(["phi-2-q4f16_1-MLC", "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"]);
  });

  it("does not activate stale completed model intent", () => {
    useConversationModelStore.setState({
      activeConversationId: "c1",
      requestedModelByConversation: { c1: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC" },
      activeModelByConversation: { c1: "phi-2-q4f16_1-MLC" },
      downloadLifecycleByModel: { "phi-2-q4f16_1-MLC": "Downloading" },
    });

    const store = useConversationModelStore.getState();
    expect(store.shouldActivateLoadedModel("phi-2-q4f16_1-MLC")).toBe(false);

    store.syncEngineState({
      kind: "ready",
      model: {
        id: "phi-2-q4f16_1-MLC",
        name: "Quick Mode",
        description: "Quick",
        sizeMB: 80,
        modelUrl: "",
        requiredVRAM: 512,
      },
    });

    expect(useConversationModelStore.getState().getActiveModelForConversation("c1")).toBe(
      "phi-2-q4f16_1-MLC"
    );
  });

  it("tracks lifecycle transitions including canceled and failed", () => {
    const store = useConversationModelStore.getState();
    store.syncEngineState({
      kind: "loading",
      modelId: "phi-2-q4f16_1-MLC",
      abort: vi.fn(),
    });
    store.syncDownloadProgress("compiling");
    store.syncEngineState({ kind: "idle" });

    expect(useConversationModelStore.getState().downloadLifecycleByModel["phi-2-q4f16_1-MLC"]).toBe(
      "Compiling"
    );

    store.syncEngineState({
      kind: "error",
      error: "failed",
      modelId: "Mistral-7B-Instruct-v0.3-q4f16_1-MLC",
      circuit: "closed",
    });

    expect(
      useConversationModelStore.getState().downloadLifecycleByModel[
        "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"
      ]
    ).toBe("Failed");
  });

  it("keeps active model stable while download is in progress", async () => {
    const pending = deferred();
    loadModelMock.mockImplementation(async () => pending.promise);

    useConversationModelStore.setState({
      activeConversationId: "c1",
      requestedModelByConversation: { c1: "phi-2-q4f16_1-MLC" },
      activeModelByConversation: { c1: "phi-2-q4f16_1-MLC" },
    });

    const store = useConversationModelStore.getState();
    const request = store.requestModelForConversation("c1", "Mistral-7B-Instruct-v0.3-q4f16_1-MLC");

    await Promise.resolve();
    expect(useConversationModelStore.getState().getActiveModelForConversation("c1")).toBe(
      "phi-2-q4f16_1-MLC"
    );
    expect(useConversationModelStore.getState().loadingModelId).toBe(
      "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"
    );

    pending.resolve();
    await request;
  });
});
