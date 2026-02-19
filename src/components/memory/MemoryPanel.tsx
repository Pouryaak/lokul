import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMemory } from "@/hooks/useMemory";
import { useMemoryStore } from "@/store/memoryStore";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";
import { MemoryCard } from "./MemoryCard";
import { MemoryEmptyState } from "./MemoryEmptyState";

interface MemoryPanelProps {
  open: boolean;
  onClose: () => void;
}

const sectionOrder: Array<{ key: MemoryCategory; title: string }> = [
  { key: "project", title: "Current work" },
  { key: "preference", title: "Preferences" },
  { key: "identity", title: "About" },
];

const MANUAL_DEFAULT_CATEGORY: MemoryCategory = "preference";

function isToastInteractionTarget(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) {
    return false;
  }

  return target.closest("[data-sonner-toaster], [data-sonner-toast]") !== null;
}

export function MemoryPanel({ open, onClose }: MemoryPanelProps) {
  const { id: routeConversationId } = useParams<{ id: string }>();
  const {
    facts,
    count,
    error,
    addFact,
    updateFact,
    deleteFact,
    pinFact,
    unpinFact,
    clearAllFacts,
    isLoading,
    optimisticClear,
  } = useMemory();
  const {
    selectedCategory,
    setSelectedCategory,
    isManageMode,
    toggleManageMode,
    selectedFactIds,
    selectFact,
    deselectFact,
    clearSelection,
    closePanel,
  } = useMemoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const filteredFacts = useMemo(() => {
    if (selectedCategory === "all") {
      return facts;
    }
    return facts.filter((fact) => fact.category === selectedCategory);
  }, [facts, selectedCategory]);

  const groupedFacts = useMemo(() => {
    const groups: Record<MemoryCategory, MemoryFact[]> = {
      project: [],
      preference: [],
      identity: [],
    };

    for (const fact of filteredFacts) {
      groups[fact.category].push(fact);
    }

    return groups;
  }, [filteredFacts]);

  const hasSelection = selectedFactIds.size > 0;

  const handleClose = () => {
    clearSelection();
    onClose();
    closePanel();
  };

  const handleAddFact = async (factText: string) => {
    const now = Date.now();
    const conversationId = routeConversationId ?? "manual-memory-entry";
    try {
      await addFact({
        fact: factText,
        category: MANUAL_DEFAULT_CATEGORY,
        confidence: 0.6,
        mentionCount: 1,
        firstSeen: now,
        lastSeen: now,
        lastSeenConversationId: conversationId,
        pinned: false,
      });
      toast.success("Memory saved");
    } catch {
      toast.error("Failed to save memory");
    }
  };

  const handleToggleSelection = (factId: string) => {
    if (selectedFactIds.has(factId)) {
      deselectFact(factId);
      return;
    }

    selectFact(factId);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedFactIds);
    for (const factId of ids) {
      await deleteFact(factId);
    }
    clearSelection();
  };

  return (
    <Sheet open={open} onOpenChange={(nextOpen) => (!nextOpen ? handleClose() : undefined)}>
      <SheetContent
        side="right"
        className="w-full p-0 sm:max-w-xl"
        onInteractOutside={(event) => {
          if (isToastInteractionTarget(event.target)) {
            event.preventDefault();
          }
        }}
      >
        <SheetHeader className="border-b border-gray-200/80 bg-white/95 py-3 pr-12 pl-4">
          <div className="flex items-center justify-between gap-3">
            <SheetTitle>Memory</SheetTitle>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#FFF4ED] px-2 py-1 text-xs text-[#B44B24]">
                {count} total
              </span>
              <Button type="button" variant="outline" size="sm" onClick={toggleManageMode}>
                {isManageMode ? "Done" : "Manage"}
              </Button>
            </div>
          </div>
          <Tabs
            value={selectedCategory}
            onValueChange={(value) => setSelectedCategory(value as MemoryCategory | "all")}
          >
            <TabsList variant="line" className="w-full justify-start">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="project">Project</TabsTrigger>
              <TabsTrigger value="preference">Preference</TabsTrigger>
              <TabsTrigger value="identity">Identity</TabsTrigger>
            </TabsList>
          </Tabs>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col bg-[#FFF8F0]">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {isLoading ? (
              <p className="text-sm text-gray-500">Loading memories...</p>
            ) : optimisticClear ? (
              <p className="text-sm text-gray-500">
                All memories are pending removal. Undo to keep them.
              </p>
            ) : filteredFacts.length === 0 ? (
              <MemoryEmptyState />
            ) : (
              <div className="space-y-5">
                {sectionOrder.map(({ key, title }) => {
                  const sectionFacts = groupedFacts[key];
                  if (sectionFacts.length === 0) {
                    return null;
                  }

                  return (
                    <section key={key} className="space-y-2">
                      <h3 className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                        {title}
                      </h3>
                      <div className="space-y-2">
                        {sectionFacts.map((fact) => (
                          <MemoryCard
                            key={fact.id}
                            fact={fact}
                            onUpdate={(factId, updates) => {
                              void updateFact(factId, updates);
                            }}
                            onDelete={(factId) => {
                              void deleteFact(factId);
                            }}
                            onPin={(factId, shouldPin) => {
                              if (shouldPin) {
                                void pinFact(factId);
                                return;
                              }
                              void unpinFact(factId);
                            }}
                            isManageMode={isManageMode}
                            isSelected={selectedFactIds.has(fact.id)}
                            onSelect={handleToggleSelection}
                          />
                        ))}
                      </div>
                    </section>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-200/80 bg-white/90 p-4">
            <MemoryComposer onAdd={handleAddFact} />

            {showClearConfirm ? (
              <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-sm text-gray-700">This will remove all {count} facts.</p>
                <div className="mt-2 flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowClearConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      void clearAllFacts();
                      setShowClearConfirm(false);
                    }}
                  >
                    Confirm
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 text-gray-500"
                onClick={() => setShowClearConfirm(true)}
              >
                Clear all memory
              </Button>
            )}

            {isManageMode && (
              <div className="mt-3 flex items-center justify-between rounded-lg border border-gray-200 bg-white p-2">
                <span className="text-xs text-gray-600">{selectedFactIds.size} selected</span>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={!hasSelection}
                  onClick={() => {
                    void handleDeleteSelected();
                  }}
                >
                  Delete selected
                </Button>
              </div>
            )}

            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function MemoryComposer({ onAdd }: { onAdd: (fact: string) => void }) {
  const [value, setValue] = useState("");

  const submit = () => {
    const next = value.trim();
    if (!next) {
      return;
    }
    onAdd(next);
    setValue("");
  };

  return (
    <div className="flex gap-2">
      <Input
        placeholder="+ Remember something..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            submit();
          }
        }}
      />
      <Button type="button" size="sm" onClick={submit}>
        Add
      </Button>
    </div>
  );
}
