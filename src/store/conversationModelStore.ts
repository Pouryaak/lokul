import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { modelEngine, type ModelLoadingState } from "@/lib/ai/model-engine";
import { getModelById, SMART_MODEL } from "@/lib/ai/models";
import { updateConversationModelTarget } from "@/lib/storage/conversations";

export type DownloadLifecycle =
  | "Queued"
  | "Downloading"
  | "Compiling"
  | "Ready"
  | "Failed"
  | "Canceled";

interface ConversationModelState {
  activeConversationId: string | null;
  requestedModelByConversation: Record<string, string>;
  engineLoadedModelId: string | null;
  downloadLifecycleByModel: Record<string, DownloadLifecycle>;
  queue: string[];
  loadingModelId: string | null;
  queueRunning: boolean;
}

interface ConversationModelActions {
  setActiveConversation: (conversationId: string | null) => void;
  hydrateConversation: (conversationId: string, modelId: string) => Promise<void>;
  requestModelForActiveConversation: (modelId: string) => Promise<void>;
  requestModelForConversation: (conversationId: string, modelId: string) => Promise<void>;
  syncEngineState: (engineState: ModelLoadingState) => void;
  syncDownloadProgress: (progressStep: string) => void;
  getRequestedModelForConversation: (conversationId: string) => string;
}

type ConversationModelStore = ConversationModelState & ConversationModelActions;

type StoreSet = (
  partial:
    | Partial<ConversationModelStore>
    | ((state: ConversationModelStore) => Partial<ConversationModelStore>)
) => void;

type StoreGet = () => ConversationModelStore;

let queueDrainPromise: Promise<void> | null = null;

const INITIAL_STATE: ConversationModelState = {
  activeConversationId: null,
  requestedModelByConversation: {},
  engineLoadedModelId: null,
  downloadLifecycleByModel: {},
  queue: [],
  loadingModelId: null,
  queueRunning: false,
};

function setLifecycle(
  lifecycles: Record<string, DownloadLifecycle>,
  modelId: string,
  lifecycle: DownloadLifecycle
): Record<string, DownloadLifecycle> {
  return {
    ...lifecycles,
    [modelId]: lifecycle,
  };
}

function toLifecycleFromProgress(step: string, current: DownloadLifecycle): DownloadLifecycle {
  if (step === "compiling") {
    return "Compiling";
  }

  if (step === "ready") {
    return "Ready";
  }

  return current === "Compiling" ? "Compiling" : "Downloading";
}

function shouldQueueModel(state: ConversationModelState, modelId: string): boolean {
  if (state.engineLoadedModelId === modelId) {
    return false;
  }

  const lifecycle = state.downloadLifecycleByModel[modelId];
  if (lifecycle === "Queued" || lifecycle === "Downloading" || lifecycle === "Compiling") {
    return false;
  }

  return !state.queue.includes(modelId);
}

async function runQueue(get: StoreGet, set: StoreSet): Promise<void> {
  if (queueDrainPromise) {
    return queueDrainPromise;
  }

  queueDrainPromise = (async () => {
    set({ queueRunning: true });

    try {
      while (true) {
        const nextModelId = get().queue[0];
        if (!nextModelId) {
          break;
        }

        set((state) => ({
          queue: state.queue.slice(1),
          loadingModelId: nextModelId,
          downloadLifecycleByModel: setLifecycle(
            state.downloadLifecycleByModel,
            nextModelId,
            "Downloading"
          ),
        }));

        try {
          await modelEngine.loadModel(nextModelId);
        } catch {
          set((state) => ({
            downloadLifecycleByModel: setLifecycle(
              state.downloadLifecycleByModel,
              nextModelId,
              "Failed"
            ),
          }));
        }
      }
    } finally {
      set({ queueRunning: false });
      queueDrainPromise = null;
    }
  })();

  return queueDrainPromise;
}

async function queueModelLoad(modelId: string, get: StoreGet, set: StoreSet): Promise<void> {
  if (shouldQueueModel(get(), modelId)) {
    set((state) => ({
      queue: [...state.queue, modelId],
      downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Queued"),
    }));
  }

  await runQueue(get, set);
}

function resolveModelId(modelId: string): string {
  return getModelById(modelId)?.id ?? SMART_MODEL.id;
}

function createHydrateConversation(set: StoreSet, get: StoreGet) {
  return async (conversationId: string, modelId: string): Promise<void> => {
    const resolvedModelId = resolveModelId(modelId);
    set((state) => ({
      activeConversationId: conversationId,
      requestedModelByConversation: {
        ...state.requestedModelByConversation,
        [conversationId]: resolvedModelId,
      },
    }));

    if (get().engineLoadedModelId === resolvedModelId) {
      set((state) => ({
        downloadLifecycleByModel: setLifecycle(
          state.downloadLifecycleByModel,
          resolvedModelId,
          "Ready"
        ),
      }));
      return;
    }

    await queueModelLoad(resolvedModelId, get, set);
  };
}

function createRequestModelForConversation(set: StoreSet, get: StoreGet) {
  return async (conversationId: string, modelId: string): Promise<void> => {
    const resolvedModelId = getModelById(modelId)?.id;
    if (!resolvedModelId) {
      throw new Error(`Model not found: ${modelId}`);
    }

    await updateConversationModelTarget(conversationId, resolvedModelId);

    set((state) => ({
      requestedModelByConversation: {
        ...state.requestedModelByConversation,
        [conversationId]: resolvedModelId,
      },
    }));

    if (get().engineLoadedModelId === resolvedModelId) {
      set((state) => ({
        downloadLifecycleByModel: setLifecycle(
          state.downloadLifecycleByModel,
          resolvedModelId,
          "Ready"
        ),
      }));
      return;
    }

    await queueModelLoad(resolvedModelId, get, set);
  };
}

function createSyncEngineState(set: StoreSet) {
  return (engineState: ModelLoadingState): void => {
    if (engineState.kind === "loading") {
      set((state) => ({
        loadingModelId: engineState.modelId,
        downloadLifecycleByModel: setLifecycle(
          state.downloadLifecycleByModel,
          engineState.modelId,
          "Downloading"
        ),
      }));
      return;
    }

    if (engineState.kind === "ready") {
      set((state) => ({
        engineLoadedModelId: engineState.model.id,
        loadingModelId: null,
        downloadLifecycleByModel: setLifecycle(
          state.downloadLifecycleByModel,
          engineState.model.id,
          "Ready"
        ),
      }));
      return;
    }

    if (engineState.kind === "error") {
      set((state) => ({
        loadingModelId: null,
        downloadLifecycleByModel: setLifecycle(
          state.downloadLifecycleByModel,
          engineState.modelId,
          "Failed"
        ),
      }));
      return;
    }

    set((state) => ({
      engineLoadedModelId: null,
      loadingModelId: null,
      downloadLifecycleByModel:
        state.loadingModelId === null
          ? state.downloadLifecycleByModel
          : setLifecycle(state.downloadLifecycleByModel, state.loadingModelId, "Canceled"),
    }));
  };
}

function createSyncDownloadProgress(set: StoreSet, get: StoreGet) {
  return (progressStep: string): void => {
    const loadingModelId = get().loadingModelId;
    if (!loadingModelId) {
      return;
    }

    const currentLifecycle = get().downloadLifecycleByModel[loadingModelId] ?? "Downloading";
    const nextLifecycle = toLifecycleFromProgress(progressStep, currentLifecycle);

    set((state) => ({
      downloadLifecycleByModel: setLifecycle(
        state.downloadLifecycleByModel,
        loadingModelId,
        nextLifecycle
      ),
    }));
  };
}

function createActions(set: StoreSet, get: StoreGet): ConversationModelActions {
  const requestModelForConversation = createRequestModelForConversation(set, get);

  return {
    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
    },
    hydrateConversation: createHydrateConversation(set, get),
    requestModelForActiveConversation: async (modelId) => {
      const activeConversationId = get().activeConversationId;
      if (!activeConversationId) {
        throw new Error("No active conversation to apply model request");
      }

      await requestModelForConversation(activeConversationId, modelId);
    },
    requestModelForConversation,
    syncEngineState: createSyncEngineState(set),
    syncDownloadProgress: createSyncDownloadProgress(set, get),
    getRequestedModelForConversation: (conversationId) => {
      return get().requestedModelByConversation[conversationId] ?? SMART_MODEL.id;
    },
  };
}

export const useConversationModelStore = create<ConversationModelStore>()(
  devtools(
    (set, get) => ({
      ...INITIAL_STATE,
      ...createActions(set, get),
    }),
    { name: "ConversationModelStore" }
  )
);

export const useActiveConversationId = () =>
  useConversationModelStore((state) => state.activeConversationId);
export const useRequestedModelByConversation = () =>
  useConversationModelStore((state) => state.requestedModelByConversation);
export const useEngineLoadedModelId = () =>
  useConversationModelStore((state) => state.engineLoadedModelId);
export const useDownloadLifecycleByModel = () =>
  useConversationModelStore((state) => state.downloadLifecycleByModel);
