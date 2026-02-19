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
  activeModelByConversation: Record<string, string>;
  engineLoadedModelId: string | null;
  downloadLifecycleByModel: Record<string, DownloadLifecycle>;
  queue: string[];
  loadingModelId: string | null;
  queueRunning: boolean;
  isDownloadManagerOpen: boolean;
}

interface ConversationModelActions {
  setActiveConversation: (conversationId: string | null) => void;
  hydrateConversation: (conversationId: string, modelId: string) => Promise<void>;
  requestModelForActiveConversation: (modelId: string) => Promise<void>;
  requestModelForConversation: (conversationId: string, modelId: string) => Promise<void>;
  cancelModelDownload: (modelId: string) => void;
  retryModelDownload: (modelId: string) => Promise<void>;
  openDownloadManager: () => void;
  closeDownloadManager: () => void;
  syncEngineState: (engineState: ModelLoadingState) => void;
  syncDownloadProgress: (progressStep: string) => void;
  getRequestedModelForConversation: (conversationId: string) => string;
  getActiveModelForConversation: (conversationId: string) => string;
  shouldActivateLoadedModel: (modelId: string) => boolean;
}

type ConversationModelStore = ConversationModelState & ConversationModelActions;

type StoreSet = (
  partial:
    | Partial<ConversationModelStore>
    | ((state: ConversationModelStore) => Partial<ConversationModelStore>)
) => void;

type StoreGet = () => ConversationModelStore;

let queueDrainPromise: Promise<void> | null = null;
const canceledModels = new Set<string>();

const INITIAL_STATE: ConversationModelState = {
  activeConversationId: null,
  requestedModelByConversation: {},
  activeModelByConversation: {},
  engineLoadedModelId: null,
  downloadLifecycleByModel: {},
  queue: [],
  loadingModelId: null,
  queueRunning: false,
  isDownloadManagerOpen: false,
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

function resolveModelId(modelId: string): string {
  return getModelById(modelId)?.id ?? SMART_MODEL.id;
}

function getRequestedForActive(state: ConversationModelState): string {
  if (!state.activeConversationId) {
    return SMART_MODEL.id;
  }

  return state.requestedModelByConversation[state.activeConversationId] ?? SMART_MODEL.id;
}

function shouldQueueModel(state: ConversationModelState, modelId: string): boolean {
  if (state.engineLoadedModelId === modelId || state.loadingModelId === modelId) {
    return false;
  }

  const lifecycle = state.downloadLifecycleByModel[modelId];
  if (lifecycle === "Queued" || lifecycle === "Downloading" || lifecycle === "Compiling") {
    return false;
  }

  return !state.queue.includes(modelId);
}

function markReadyForConversation(
  state: ConversationModelState,
  conversationId: string,
  modelId: string
): Partial<ConversationModelStore> {
  return {
    activeModelByConversation: {
      ...state.activeModelByConversation,
      [conversationId]: modelId,
    },
    downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Ready"),
  };
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
          const lifecycle = canceledModels.has(nextModelId) ? "Canceled" : "Failed";
          canceledModels.delete(nextModelId);
          set((state) => ({
            downloadLifecycleByModel: setLifecycle(
              state.downloadLifecycleByModel,
              nextModelId,
              lifecycle
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
  if (!shouldQueueModel(get(), modelId)) {
    return;
  }

  set((state) => ({
    queue: [...state.queue, modelId],
    downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Queued"),
  }));

  await runQueue(get, set);
}

async function ensureConversationModel(
  conversationId: string,
  modelId: string,
  get: StoreGet,
  set: StoreSet,
  persist: boolean
): Promise<void> {
  if (persist) {
    await updateConversationModelTarget(conversationId, modelId);
  }

  set((state) => ({
    requestedModelByConversation: {
      ...state.requestedModelByConversation,
      [conversationId]: modelId,
    },
  }));

  if (get().engineLoadedModelId === modelId) {
    set((state) => markReadyForConversation(state, conversationId, modelId));
    return;
  }

  await queueModelLoad(modelId, get, set);
}

function updateReadyStateFromEngine(set: StoreSet, modelId: string): void {
  set((state) => {
    const activeConversationId = state.activeConversationId;
    const requestedModelId = getRequestedForActive(state);
    const nextState: Partial<ConversationModelStore> = {
      engineLoadedModelId: modelId,
      loadingModelId: null,
      downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Ready"),
    };

    if (activeConversationId && requestedModelId === modelId) {
      nextState.activeModelByConversation = {
        ...state.activeModelByConversation,
        [activeConversationId]: modelId,
      };
    }

    return nextState;
  });
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
      set((state) => markReadyForConversation(state, conversationId, resolvedModelId));
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

    const stateBeforeRequest = get();
    const isAlreadyReady =
      stateBeforeRequest.engineLoadedModelId === resolvedModelId ||
      stateBeforeRequest.downloadLifecycleByModel[resolvedModelId] === "Ready";

    if (!isAlreadyReady) {
      set({ isDownloadManagerOpen: true });
    }

    await ensureConversationModel(conversationId, resolvedModelId, get, set, true);
  };
}

function createCancelModelDownload(set: StoreSet, get: StoreGet) {
  return (modelId: string): void => {
    canceledModels.add(modelId);

    set((state) => {
      const isQueued = state.queue.includes(modelId);
      if (!isQueued) {
        return {};
      }

      return {
        queue: state.queue.filter((id) => id !== modelId),
        downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Canceled"),
      };
    });

    if (get().loadingModelId === modelId) {
      modelEngine.unload();
    }
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
      updateReadyStateFromEngine(set, engineState.model.id);
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

    set((state) => {
      const loadingModelId = state.loadingModelId;
      const isCanceled = loadingModelId ? canceledModels.has(loadingModelId) : false;

      if (loadingModelId) {
        canceledModels.delete(loadingModelId);
      }

      return {
        engineLoadedModelId: null,
        loadingModelId: null,
        downloadLifecycleByModel:
          loadingModelId && isCanceled
            ? setLifecycle(state.downloadLifecycleByModel, loadingModelId, "Canceled")
            : state.downloadLifecycleByModel,
      };
    });
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
    setActiveConversation: (conversationId) => set({ activeConversationId: conversationId }),
    hydrateConversation: createHydrateConversation(set, get),
    requestModelForActiveConversation: async (modelId) => {
      const activeConversationId = get().activeConversationId;
      if (!activeConversationId) {
        throw new Error("No active conversation to apply model request");
      }

      await requestModelForConversation(activeConversationId, modelId);
    },
    requestModelForConversation,
    cancelModelDownload: createCancelModelDownload(set, get),
    retryModelDownload: async (modelId) => {
      if (!shouldQueueModel(get(), modelId)) {
        set({ isDownloadManagerOpen: true });
        return;
      }

      set({ isDownloadManagerOpen: true });

      set((state) => ({
        downloadLifecycleByModel: setLifecycle(state.downloadLifecycleByModel, modelId, "Queued"),
      }));
      await queueModelLoad(modelId, get, set);
    },
    openDownloadManager: () => set({ isDownloadManagerOpen: true }),
    closeDownloadManager: () => set({ isDownloadManagerOpen: false }),
    syncEngineState: createSyncEngineState(set),
    syncDownloadProgress: createSyncDownloadProgress(set, get),
    getRequestedModelForConversation: (conversationId) =>
      get().requestedModelByConversation[conversationId] ?? SMART_MODEL.id,
    getActiveModelForConversation: (conversationId) => {
      const state = get();
      return (
        state.activeModelByConversation[conversationId] ??
        state.requestedModelByConversation[conversationId] ??
        SMART_MODEL.id
      );
    },
    shouldActivateLoadedModel: (modelId) => {
      const state = get();
      if (!state.activeConversationId) {
        return true;
      }

      return getRequestedForActive(state) === modelId;
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
export const useIsDownloadManagerOpen = () =>
  useConversationModelStore((state) => state.isDownloadManagerOpen);
