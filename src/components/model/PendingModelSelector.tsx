/**
 * PendingModelSelector - Model selector for new/pending chats
 *
 * Works without a conversation ID, using the global model store.
 * Stores the selected model ID for use when the conversation is created.
 */

import { Check, ChevronDown, Cpu } from "lucide-react";
import { useMemo, useState } from "react";
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
  ModelSelectorSeparator,
  ModelSelectorTrigger,
} from "@/components/ai-elements/model-selector";
import { MODELS } from "@/lib/ai/models";
import { useModelStore } from "@/store/modelStore";
import { useConversationModelStore } from "@/store/conversationModelStore";
import { cn } from "@/lib/utils";

type DistributorId = "microsoft" | "meta" | "mistral" | "other";

interface ModelGroup {
  id: DistributorId;
  label: string;
  logoPath: string;
  models: typeof MODELS;
}

function getModelStateLabel(
  modelId: string,
  activeModelId: string | null,
  lifecycle?: string
): string | null {
  if (modelId === activeModelId) {
    return "Ready";
  }

  if (lifecycle === "Ready") {
    return "Ready";
  }

  return null;
}

function getDistributorId(modelId: string): DistributorId {
  if (modelId.includes("phi-2")) return "microsoft";
  if (modelId.includes("Llama")) return "meta";
  if (modelId.includes("Mistral")) return "mistral";
  return "other";
}

function getDistributorMeta(distributorId: DistributorId): Omit<ModelGroup, "models"> {
  switch (distributorId) {
    case "microsoft":
      return { id: "microsoft", label: "Microsoft", logoPath: "/microsoft-logo.png" };
    case "meta":
      return { id: "meta", label: "Meta", logoPath: "/meta-logo.webp" };
    case "mistral":
      return { id: "mistral", label: "Mistral AI", logoPath: "/mistral-logo.png" };
    default:
      return { id: "other", label: "Other", logoPath: "/spark-logo.svg" };
  }
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

interface PendingModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export function PendingModelSelector({
  selectedModelId,
  onModelChange,
}: PendingModelSelectorProps) {
  const [open, setOpen] = useState(false);
  const currentModel = useModelStore((state) => state.currentModel);
  const lifecycleByModel = useConversationModelStore((state) => state.downloadLifecycleByModel);
  const groupedModels = useMemo(groupModelsByDistributor, []);

  const triggerModel = MODELS.find((model) => model.id === selectedModelId);

  const handleModelSelect = (modelId: string) => {
    onModelChange(modelId);
    setOpen(false);

    const currentLifecycle = lifecycleByModel[modelId];
    const isDifferentFromLoaded = currentModel?.id !== modelId;

    if (isDifferentFromLoaded && currentLifecycle !== "Ready") {
      toast.info(
        `${MODELS.find((m) => m.id === modelId)?.name} will be downloaded when you send a message`
      );
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      <ModelSelector open={open} onOpenChange={setOpen}>
        <ModelSelectorTrigger asChild>
          <button
            type="button"
            className="flex h-8 min-w-[180px] items-center gap-2 rounded-md border border-[#FFE2D5] bg-[#FFF4ED] px-3 text-xs font-medium text-[#3F342D]"
            aria-label="Choose model"
          >
            <Cpu className="h-3.5 w-3.5 text-[#E06232]" />
            <span className="truncate">{triggerModel?.name ?? "Choose model"}</span>
            <ChevronDown className="ml-auto h-3.5 w-3.5 text-[#A7674D]" />
          </button>
        </ModelSelectorTrigger>

        <ModelSelectorContent title="Select model" className="sm:max-w-[430px]">
          <ModelSelectorInput placeholder="Search models..." />
          <ModelSelectorList>
            <ModelSelectorEmpty>No models found.</ModelSelectorEmpty>
            {groupedModels.map((group, groupIndex) => (
              <div key={group.id}>
                {groupIndex > 0 ? <ModelSelectorSeparator /> : null}
                <div className="px-2 pt-2 pb-1.5">
                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                    <img src={group.logoPath} alt={`${group.label} logo`} className="h-3.5 w-3.5" />
                    <span>{group.label}</span>
                  </div>
                </div>
                <ModelSelectorGroup>
                  {group.models.map((model) => {
                    const stateLabel = getModelStateLabel(
                      model.id,
                      currentModel?.id ?? null,
                      lifecycleByModel[model.id]
                    );

                    return (
                      <ModelSelectorItem
                        key={model.id}
                        value={`${group.label} ${model.name} ${model.description} ${model.bestFor}`}
                        onSelect={() => handleModelSelect(model.id)}
                      >
                        <div className="flex w-full items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              selectedModelId === model.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="min-w-0 flex-1">
                            <ModelSelectorName className="text-sm font-medium">
                              {model.name}
                            </ModelSelectorName>
                            <p className="truncate text-xs text-gray-500">{model.description}</p>
                            <p className="truncate text-[11px] text-gray-400">
                              Best for: {model.bestFor}
                            </p>
                          </div>
                          {stateLabel ? (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                              {stateLabel}
                            </span>
                          ) : null}
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
