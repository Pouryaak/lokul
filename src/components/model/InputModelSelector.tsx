import { ChevronDown, Cpu } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ModelSelector,
  ModelSelectorContent,
  ModelSelectorEmpty,
  ModelSelectorGroup,
  ModelSelectorInput,
  ModelSelectorItem,
  ModelSelectorList,
  ModelSelectorName,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { MODELS } from "@/lib/ai/models";
import { useConversationModelStore } from "@/store/conversationModelStore";
import { useModelStore } from "@/store/modelStore";
import { cn } from "@/lib/utils";

interface InputModelSelectorProps {
  conversationId: string;
}

type DistributorId = "microsoft" | "meta" | "mistral" | "other";

interface ModelGroup {
  id: DistributorId;
  label: string;
  logoPath: string;
  models: typeof MODELS;
}

function getModelStateLabel(
  modelId: string,
  requestedModelId: string,
  activeModelId: string | null,
  lifecycle?: string
): string | null {
  if (modelId === requestedModelId && modelId === activeModelId) {
    return "Active";
  }

  if (modelId === requestedModelId) {
    return "Requested";
  }

  if (modelId === activeModelId) {
    return "Ready";
  }

  if (lifecycle === "Ready") {
    return "Ready";
  }

  return null;
}

function getDistributorId(modelId: string): DistributorId {
  if (modelId.includes("phi-2")) {
    return "microsoft";
  }

  if (modelId.includes("Llama")) {
    return "meta";
  }

  if (modelId.includes("Mistral")) {
    return "mistral";
  }

  return "other";
}

function getDistributorMeta(distributorId: DistributorId): Omit<ModelGroup, "models"> {
  if (distributorId === "microsoft") {
    return {
      id: "microsoft",
      label: "Microsoft",
      logoPath: "/microsoft-logo.png",
    };
  }

  if (distributorId === "meta") {
    return {
      id: "meta",
      label: "Meta",
      logoPath: "/meta-logo.webp",
    };
  }

  if (distributorId === "mistral") {
    return {
      id: "mistral",
      label: "Mistral AI",
      logoPath: "/mistral-logo.png",
    };
  }

  return {
    id: "other",
    label: "Other",
    logoPath: "/spark-logo.svg",
  };
}

function groupModelsByDistributor(): ModelGroup[] {
  const groupedModels = new Map<DistributorId, typeof MODELS>();

  for (const model of MODELS) {
    const distributorId = getDistributorId(model.id);
    const existingModels = groupedModels.get(distributorId) ?? [];
    groupedModels.set(distributorId, [...existingModels, model]);
  }

  return Array.from(groupedModels.entries()).map(([distributorId, models]) => ({
    ...getDistributorMeta(distributorId),
    models,
  }));
}

function getModelLogoPath(modelId: string): string {
  const distributorId = getDistributorId(modelId);
  return getDistributorMeta(distributorId).logoPath;
}

export function InputModelSelector({ conversationId }: InputModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentModel = useModelStore((state) => state.currentModel);
  const requestModelForActiveConversation = useConversationModelStore(
    (state) => state.requestModelForActiveConversation
  );
  const openDownloadManager = useConversationModelStore((state) => state.openDownloadManager);
  const getActiveModelForConversation = useConversationModelStore(
    (state) => state.getActiveModelForConversation
  );
  const requestedModelId = useConversationModelStore((state) =>
    state.getRequestedModelForConversation(conversationId)
  );
  const lifecycleByModel = useConversationModelStore((state) => state.downloadLifecycleByModel);
  const activeModelId = getActiveModelForConversation(conversationId);
  const groupedModels = useMemo(groupModelsByDistributor, []);
  const previousActiveModelRef = useRef(activeModelId);

  useEffect(() => {
    if (activeModelId !== previousActiveModelRef.current && activeModelId === requestedModelId) {
      const activeModel = MODELS.find((model) => model.id === activeModelId);
      if (activeModel) {
        toast.success(`Switched to ${activeModel.name}`);
      }
    }

    previousActiveModelRef.current = activeModelId;
  }, [activeModelId, requestedModelId]);

  const triggerModelId = activeModelId || currentModel?.id || MODELS[0]?.id || "";
  const triggerModel = MODELS.find((model) => model.id === triggerModelId);
  const triggerModelLogoPath = triggerModel ? getModelLogoPath(triggerModel.id) : null;

  const handleModelRequest = (modelId: string) => {
    const status = lifecycleByModel[modelId];
    if (status !== "Ready") {
      openDownloadManager();
    }

    void requestModelForActiveConversation(modelId);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      <ModelSelector open={open} onOpenChange={setOpen}>
        <ModelSelectorTrigger asChild>
          <button
            type="button"
            className="flex h-8 min-w-[200px] items-center gap-2 rounded-md border border-[var(--chat-border-subtle)] bg-[var(--chat-assistant-bubble-bg)] px-3 text-xs font-medium text-[var(--chat-text-secondary)]"
            aria-label="Choose model"
          >
            {triggerModelLogoPath ? (
              <img
                src={triggerModelLogoPath}
                alt="Current model provider"
                className="h-3.5 w-3.5 rounded-sm object-contain"
              />
            ) : (
              <Cpu className="text-primary h-3.5 w-3.5" />
            )}
            <span className="truncate">{triggerModel?.name ?? "Choose model"}</span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-[var(--chat-text-muted)]" />
          </button>
        </ModelSelectorTrigger>

        <ModelSelectorContent title="Select model" className="sm:max-w-[460px]">
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList className="max-h-[340px]">
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {groupedModels.map((group, groupIndex) => (
              <div key={group.id}>
                {groupIndex > 0 ? <div className="mt-1" /> : null}
                <div className="px-2 pt-2 pb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[var(--chat-text-muted)]">
                    <img src={group.logoPath} alt={`${group.label} logo`} className="h-3.5 w-3.5" />
                    <span>{group.label}</span>
                  </div>
                </div>
                <ModelSelectorGroup>
                  {group.models.map((model) => {
                    const stateLabel = getModelStateLabel(
                      model.id,
                      requestedModelId,
                      activeModelId,
                      lifecycleByModel[model.id]
                    );

                    return (
                      <ModelSelectorItem
                        key={model.id}
                        value={`${group.label} ${model.name} ${model.description} ${model.bestFor}`}
                        onSelect={() => handleModelRequest(model.id)}
                        className="group"
                      >
                        <div className="flex w-full items-center gap-2.5">
                          <div className="min-w-0 flex-1 space-y-0.5">
                            <ModelSelectorName className="text-sm font-medium text-[var(--chat-text-primary)]">
                              {model.name}
                            </ModelSelectorName>
                            <p className="truncate text-xs text-[var(--chat-text-muted)]">
                              {model.description}
                            </p>
                            <p className="truncate text-[11px] text-[var(--chat-text-subtle)]">
                              Best for: {model.bestFor}
                            </p>
                          </div>
                          {stateLabel ? (
                            <span
                              className={cn(
                                "rounded-full px-2 py-0.5 text-[10px] font-medium",
                                stateLabel === "Active"
                                  ? "border-primary/35 bg-primary/20 text-primary border"
                                  : "border border-[var(--chat-border-soft)] bg-white/5 text-[var(--chat-text-muted)]"
                              )}
                            >
                              {stateLabel}
                            </span>
                          ) : null}
                          {stateLabel ? null : <div className="h-5 min-w-8" aria-hidden="true" />}
                        </div>
                      </ModelSelectorItem>
                    );
                  })}
                </ModelSelectorGroup>
              </div>
            ))}
          </ModelSelectorList>
        </ModelSelectorContent>
      </ModelSelector>
    </div>
  );
}
