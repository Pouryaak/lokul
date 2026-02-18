import { Cpu } from "lucide-react";
import { useMemo } from "react";
import { MODELS } from "@/lib/ai/models";
import { useConversationModelStore } from "@/store/conversationModelStore";
import { useModelStore } from "@/store/modelStore";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface InputModelSelectorProps {
  conversationId: string;
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

export function InputModelSelector({ conversationId }: InputModelSelectorProps) {
  const loadModel = useModelStore((state) => state.loadModel);
  const currentModel = useModelStore((state) => state.currentModel);
  const requestedModelId = useConversationModelStore((state) =>
    state.getRequestedModelForConversation(conversationId)
  );
  const lifecycleByModel = useConversationModelStore((state) => state.downloadLifecycleByModel);

  const selectedModelId = requestedModelId || currentModel?.id || MODELS[0]?.id || "";

  const activeBadge = useMemo(() => {
    if (!selectedModelId) {
      return null;
    }

    const lifecycle = lifecycleByModel[selectedModelId];

    if (lifecycle && lifecycle !== "Ready") {
      return lifecycle;
    }

    if (selectedModelId === currentModel?.id) {
      return "Active";
    }

    return "Requested";
  }, [currentModel?.id, lifecycleByModel, selectedModelId]);

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedModelId} onValueChange={(modelId) => void loadModel(modelId)}>
        <SelectTrigger className="h-8 min-w-[180px] rounded-lg border-gray-200 text-xs">
          <div className="flex items-center gap-2">
            <Cpu className="h-3.5 w-3.5 text-gray-500" />
            <SelectValue placeholder="Choose model" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {MODELS.map((model) => {
            const stateLabel = getModelStateLabel(
              model.id,
              requestedModelId,
              currentModel?.id ?? null,
              lifecycleByModel[model.id]
            );

            return (
              <SelectItem key={model.id} value={model.id}>
                <div className="flex w-full min-w-[220px] items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{model.name}</p>
                    <p className="truncate text-xs text-gray-500">{model.description}</p>
                  </div>
                  {stateLabel ? (
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-700">
                      {stateLabel}
                    </span>
                  ) : null}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {activeBadge ? (
        <span className="rounded-full bg-[#FF6B35]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF6B35]">
          {activeBadge}
        </span>
      ) : null}
    </div>
  );
}
