import { useMemo, useState } from "react";
import {
  Brain,
  X,
  Plus,
  Trash2,
  Pin,
  Sparkles,
  FolderHeart,
  User,
  Briefcase,
  Check,
  MoreHorizontal,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useMemory } from "@/hooks/useMemory";
import { useMemoryStore } from "@/store/memoryStore";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";
import { AnimatePresence, motion } from "framer-motion";

const categoryConfig: Record<
  MemoryCategory,
  { icon: React.ElementType; label: string; color: string; bg: string; border: string; glow: string }
> = {
  project: {
    icon: Briefcase,
    label: "Project",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/20",
    glow: "shadow-cyan-500/20",
  },
  preference: {
    icon: FolderHeart,
    label: "Preference",
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/20",
    glow: "shadow-purple-500/20",
  },
  identity: {
    icon: User,
    label: "Identity",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-emerald-500/20",
  },
};

function CategoryBadge({
  category,
  count,
  isActive,
  onClick,
}: {
  category: MemoryCategory | "all";
  count: number;
  isActive: boolean;
  onClick: () => void;
}) {
  if (category === "all") {
    return (
      <button
        onClick={onClick}
        className={cn(
          "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
          isActive
            ? "bg-[#FF6B35]/20 text-[#FF6B35] ring-1 ring-[#FF6B35]/30"
            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        <Sparkles className="h-3 w-3" />
        All
        <span className="ml-0.5 rounded-full bg-current/20 px-1.5 py-0.5 text-[10px]">{count}</span>
      </button>
    );
  }

  const config = categoryConfig[category];
  const Icon = config.icon;

  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
        isActive
          ? cn(config.bg, config.color, "ring-1 ring-current/30")
          : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
      <span className="ml-0.5 rounded-full bg-current/20 px-1.5 py-0.5 text-[10px]">{count}</span>
    </button>
  );
}

function QuickMemoryItem({
  fact,
  onPin,
  onDelete,
  onClick,
}: {
  fact: MemoryFact;
  onPin: () => void;
  onDelete: () => void;
  onClick: () => void;
}) {
  const config = categoryConfig[fact.category];

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl border border-[var(--chat-border-subtle)] bg-muted/30 p-3 transition-all",
        "hover:border-[var(--chat-border-soft)] hover:bg-muted/50"
      )}
    >
      {fact.pinned && (
        <div className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B35] text-white">
          <Pin className="h-2.5 w-2.5 fill-current" />
        </div>
      )}
      <p className="line-clamp-2 text-xs text-[var(--chat-text-primary)]">{fact.fact}</p>
      <div className="mt-2 flex items-center justify-between">
        <span className={cn("text-[10px] font-medium", config.color)}>{config.label}</span>
        <div className="flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className={cn(
              "rounded p-1 transition-colors",
              fact.pinned ? "text-[#FF6B35]" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Pin className={cn("h-3 w-3", fact.pinned && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded p-1 text-muted-foreground transition-colors hover:text-red-400"
          >
            <Trash2 className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickMemoryComposer({
  onAdd,
  onExpand,
}: {
  onAdd: (text: string) => void;
  onExpand: () => void;
}) {
  const [value, setValue] = useState("");

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (trimmed) {
      onAdd(trimmed);
      setValue("");
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          type="text"
          placeholder="Add a memory..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSubmit();
          }}
          className="w-full rounded-xl bg-muted/50 px-3 py-2.5 pr-16 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50"
        />
        <div className="absolute right-1.5 top-1/2 -translate-y-1/2">
          {value && (
            <button
              onClick={handleSubmit}
              className="rounded-lg bg-[#FF6B35]/10 px-2.5 py-1 text-xs font-medium text-[#FF6B35] transition-colors hover:bg-[#FF6B35]/20"
            >
              Add
            </button>
          )}
        </div>
      </div>
      <button
        onClick={onExpand}
        className="flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
      >
        <Sparkles className="h-3 w-3" />
        Open full memory panel
      </button>
    </div>
  );
}

export function MemoryButton({ count }: { count: number }) {
  const [open, setOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { facts, addFact, deleteFact, pinFact, unpinFact, isLoading } = useMemory();
  const { selectedCategory, setSelectedCategory } = useMemoryStore();

  const filteredFacts = useMemo(() => {
    if (selectedCategory === "all") return facts;
    return facts.filter((f) => f.category === selectedCategory);
  }, [facts, selectedCategory]);

  const groupedCounts = useMemo(
    () => ({
      all: facts.length,
      project: facts.filter((f) => f.category === "project").length,
      preference: facts.filter((f) => f.category === "preference").length,
      identity: facts.filter((f) => f.category === "identity").length,
    }),
    [facts]
  );

  const recentFacts = useMemo(() => {
    return [...filteredFacts].sort((a, b) => b.lastSeen - a.lastSeen).slice(0, 5);
  }, [filteredFacts]);

  const handleAddQuick = async (text: string) => {
    await addFact({
      fact: text,
      category: "preference",
      confidence: 0.6,
      mentionCount: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      lastSeenConversationId: "manual",
      pinned: false,
    });
  };

  const handleExpand = () => {
    setOpen(false);
    setSheetOpen(true);
  };

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Memory"
          >
            <Brain className="h-4 w-4" />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF6B35] text-[10px] font-medium text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          align="start"
          sideOffset={8}
          className="w-[380px] border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[var(--chat-border-subtle)] px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#FF6B35]/10">
                <Brain className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-[var(--chat-text-primary)]">Memory</h3>
                <p className="text-[10px] text-muted-foreground">{count} facts remembered</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content */}
          <div className="space-y-3 p-3">
            {/* Category Filter */}
            <div className="flex flex-wrap gap-1.5">
              {(["all", "project", "preference", "identity"] as const).map((cat) => (
                <CategoryBadge
                  key={cat}
                  category={cat}
                  count={groupedCounts[cat]}
                  isActive={selectedCategory === cat}
                  onClick={() => setSelectedCategory(cat)}
                />
              ))}
            </div>

            {/* Recent Memories */}
            <div className="space-y-2">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Recent
              </p>
              {isLoading ? (
                <div className="py-6 text-center">
                  <div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[#FF6B35]" />
                </div>
              ) : recentFacts.length === 0 ? (
                <div className="rounded-xl border border-dashed border-[var(--chat-border-subtle)] bg-muted/20 py-6 text-center">
                  <Brain className="mx-auto h-6 w-6 text-muted-foreground/50" />
                  <p className="mt-2 text-xs text-muted-foreground">No memories yet</p>
                </div>
              ) : (
                <div className="max-h-[180px] space-y-2 overflow-y-auto pr-1">
                  {recentFacts.map((fact) => (
                    <QuickMemoryItem
                      key={fact.id}
                      fact={fact}
                      onPin={() => (fact.pinned ? unpinFact(fact.id) : pinFact(fact.id))}
                      onDelete={() => deleteFact(fact.id)}
                      onClick={handleExpand}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add */}
            <QuickMemoryComposer onAdd={handleAddQuick} onExpand={handleExpand} />
          </div>
        </PopoverContent>
      </Popover>

      {/* Full Sheet */}
      <MemorySheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </>
  );
}

function MemorySheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const {
    facts,
    count,
    addFact,
    deleteFact,
    updateFact,
    pinFact,
    unpinFact,
    isLoading,
    optimisticClear,
  } = useMemory();
  const {
    selectedCategory,
    setSelectedCategory,
    isManageMode,
    toggleManageMode,
    selectedFactIds,
    clearSelection,
    selectFact,
    deselectFact,
  } = useMemoryStore();
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [editingFact, setEditingFact] = useState<MemoryFact | null>(null);
  const [editValue, setEditValue] = useState("");
  const [editCategory, setEditCategory] = useState<MemoryCategory>("preference");

  const filteredFacts = useMemo(() => {
    if (selectedCategory === "all") return facts;
    return facts.filter((f) => f.category === selectedCategory);
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

  const handleClose = () => {
    clearSelection();
    setEditingFact(null);
    onClose();
  };

  const handleAddFact = (factText: string) => {
    addFact({
      fact: factText,
      category: "preference",
      confidence: 0.6,
      mentionCount: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      lastSeenConversationId: "manual",
      pinned: false,
    });
  };

  const handleStartEdit = (fact: MemoryFact) => {
    setEditingFact(fact);
    setEditValue(fact.fact);
    setEditCategory(fact.category);
  };

  const handleSaveEdit = () => {
    if (!editingFact || !editValue.trim()) return;
    updateFact(editingFact.id, {
      fact: editValue.trim(),
      category: editCategory,
      lastSeen: Date.now(),
    });
    setEditingFact(null);
  };

  const handleDeleteSelected = async () => {
    const ids = Array.from(selectedFactIds);
    for (const factId of ids) {
      await deleteFact(factId);
    }
    clearSelection();
  };

  const hasSelection = selectedFactIds.size > 0;

  return (
    <Sheet open={open} onOpenChange={(next) => !next && handleClose()}>
      <SheetContent
        side="right"
        className="w-full border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-0 sm:max-w-md"
      >
        {/* Header */}
        <SheetHeader className="border-b border-[var(--chat-border-subtle)] bg-[var(--chat-header-bg)] px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#FF6B35]/5">
                <Brain className="h-5 w-5 text-[#FF6B35]" />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold text-[var(--chat-text-primary)]">
                  Memory
                </SheetTitle>
                <p className="text-[11px] text-muted-foreground">{count} facts remembered</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleManageMode}
                className={cn(
                  "h-8 text-xs transition-colors",
                  isManageMode && "bg-[#FF6B35]/10 text-[#FF6B35] hover:bg-[#FF6B35]/20"
                )}
              >
                {isManageMode ? "Done" : "Manage"}
              </Button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="mt-3 flex gap-1">
            {(["all", "project", "preference", "identity"] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-xs font-medium transition-all",
                  selectedCategory === cat
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                {cat === "all" ? "All" : categoryConfig[cat].label}
              </button>
            ))}
          </div>
        </SheetHeader>

        {/* Content */}
        <div className="flex h-[calc(100vh-140px)] flex-col">
          <div className="flex-1 overflow-y-auto p-4">
            {isLoading ? (
              <div className="flex h-32 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-[#FF6B35]" />
              </div>
            ) : optimisticClear ? (
              <div className="flex h-32 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--chat-border-subtle)] bg-muted/20">
                <p className="text-sm text-muted-foreground">Clearing all memories...</p>
              </div>
            ) : filteredFacts.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-[var(--chat-border-subtle)] bg-muted/20">
                <Brain className="h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-sm font-medium text-muted-foreground">No memories yet</p>
                <p className="text-xs text-muted-foreground/70">I&apos;ll learn as we talk</p>
              </div>
            ) : (
              <div className="space-y-4">
                {selectedCategory === "all"
                  ? // Grouped view
                    (["project", "preference", "identity"] as const).map((cat) => {
                      const sectionFacts = groupedFacts[cat];
                      if (sectionFacts.length === 0) return null;
                      const Icon = categoryConfig[cat].icon;
                      return (
                        <section key={cat} className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Icon className={cn("h-3.5 w-3.5", categoryConfig[cat].color)} />
                            <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                              {categoryConfig[cat].label}
                            </h3>
                            <span className="text-[10px] text-muted-foreground">
                              ({sectionFacts.length})
                            </span>
                          </div>
                          <div className="space-y-2">
                            {sectionFacts.map((fact) => (
                              <PremiumMemoryCard
                                key={fact.id}
                                fact={fact}
                                onUpdate={() => handleStartEdit(fact)}
                                onDelete={() => deleteFact(fact.id)}
                                onPin={() => (fact.pinned ? unpinFact(fact.id) : pinFact(fact.id))}
                                isManageMode={isManageMode}
                                isSelected={selectedFactIds.has(fact.id)}
                                onToggleSelect={() =>
                                  selectedFactIds.has(fact.id)
                                    ? deselectFact(fact.id)
                                    : selectFact(fact.id)
                                }
                              />
                            ))}
                          </div>
                        </section>
                      );
                    })
                  : // Flat view for selected category
                    filteredFacts.map((fact) => (
                      <PremiumMemoryCard
                        key={fact.id}
                        fact={fact}
                        onUpdate={() => handleStartEdit(fact)}
                        onDelete={() => deleteFact(fact.id)}
                        onPin={() => (fact.pinned ? unpinFact(fact.id) : pinFact(fact.id))}
                        isManageMode={isManageMode}
                        isSelected={selectedFactIds.has(fact.id)}
                        onToggleSelect={() =>
                          selectedFactIds.has(fact.id)
                            ? deselectFact(fact.id)
                            : selectFact(fact.id)
                        }
                      />
                    ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-[var(--chat-border-subtle)] bg-[var(--chat-header-bg)] p-4">
            {/* Add Memory Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a new memory..."
                className="flex-1 rounded-xl bg-muted/50 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-[#FF6B35]/50"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    const target = e.target as HTMLInputElement;
                    if (target.value.trim()) {
                      handleAddFact(target.value.trim());
                      target.value = "";
                    }
                  }
                }}
              />
              <Button
                size="icon"
                variant="ghost"
                className="h-10 w-10 shrink-0 text-muted-foreground hover:text-foreground"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Clear All Confirmation */}
            <AnimatePresence>
              {showClearConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-3 overflow-hidden rounded-xl border border-red-500/20 bg-red-500/10 p-3"
                >
                  <p className="text-sm text-red-400">This will remove all {count} memories.</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        // clearAllFacts();
                        setShowClearConfirm(false);
                      }}
                      className="text-red-400 hover:bg-red-500/20 hover:text-red-300"
                    >
                      Confirm Clear
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Manage Mode Actions */}
            <AnimatePresence>
              {isManageMode && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="mt-3 flex items-center justify-between rounded-xl border border-[var(--chat-border-subtle)] bg-muted/30 p-3"
                >
                  <span className="text-xs text-muted-foreground">
                    {selectedFactIds.size} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSelection}
                      className="h-7 text-xs text-muted-foreground hover:text-foreground"
                    >
                      Clear
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={!hasSelection}
                      onClick={handleDeleteSelected}
                      className="h-7 text-xs text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                    >
                      <Trash2 className="mr-1 h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Clear All Button (when not in manage mode) */}
            {!isManageMode && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-xs text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              >
                <Trash2 className="h-3 w-3" />
                Clear all memory
              </button>
            )}
          </div>
        </div>
      </SheetContent>

      {/* Edit Dialog */}
      <AnimatePresence>
        {editingFact && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setEditingFact(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-[var(--chat-border-soft)] bg-[var(--chat-surface-bg)] p-5 shadow-2xl"
            >
              <h3 className="text-sm font-semibold text-[var(--chat-text-primary)]">Edit Memory</h3>
              <div className="mt-4 space-y-3">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  rows={3}
                  className="resize-none border-[var(--chat-border-subtle)] bg-muted/30 text-sm"
                />
                <div className="flex gap-2">
                  {(["project", "preference", "identity"] as const).map((cat) => {
                    const Icon = categoryConfig[cat].icon;
                    return (
                      <button
                        key={cat}
                        onClick={() => setEditCategory(cat)}
                        className={cn(
                          "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition-all",
                          editCategory === cat
                            ? cn(categoryConfig[cat].bg, categoryConfig[cat].color, "ring-1 ring-current/30")
                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                        )}
                      >
                        <Icon className="h-3 w-3" />
                        {categoryConfig[cat].label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setEditingFact(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  className="bg-[#FF6B35] text-white hover:bg-[#FF6B35]/90"
                >
                  <Check className="mr-1 h-3.5 w-3.5" />
                  Save
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Sheet>
  );
}

function PremiumMemoryCard({
  fact,
  onUpdate,
  onDelete,
  onPin,
  isManageMode,
  isSelected,
  onToggleSelect,
}: {
  fact: MemoryFact;
  onUpdate: () => void;
  onDelete: () => void;
  onPin: () => void;
  isManageMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}) {
  const config = categoryConfig[fact.category];
  const confidencePct = Math.max(0, Math.min(100, fact.confidence * 100));

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group relative rounded-xl border p-3 transition-all",
        "border-[var(--chat-border-subtle)] bg-muted/20 hover:border-[var(--chat-border-soft)] hover:bg-muted/30",
        isSelected && "border-[#FF6B35]/50 bg-[#FF6B35]/5"
      )}
    >
      {/* Pin Indicator */}
      {fact.pinned && (
        <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#FF6B35] text-white shadow-lg shadow-[#FF6B35]/30">
          <Pin className="h-2.5 w-2.5 fill-current" />
        </div>
      )}

      {/* Selection Checkbox (Manage Mode) */}
      {isManageMode && (
        <div className="absolute top-3 left-3">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onToggleSelect}
            className="h-4 w-4 rounded border-muted-foreground/30 bg-muted text-[#FF6B35] focus:ring-[#FF6B35]/50"
          />
        </div>
      )}

      <div className={cn("pr-16", isManageMode && "pl-6")}>
        <p
          onClick={onUpdate}
          className="cursor-pointer text-sm leading-relaxed text-[var(--chat-text-primary)] transition-colors hover:text-[#FF6B35]"
        >
          {fact.fact}
        </p>
      </div>

      {/* Actions */}
      {!isManageMode && (
        <div className="absolute top-2 right-2 flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPin();
            }}
            className={cn(
              "rounded-lg p-1.5 transition-colors",
              fact.pinned
                ? "bg-[#FF6B35]/10 text-[#FF6B35]"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Pin className={cn("h-3.5 w-3.5", fact.pinned && "fill-current")} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdate();
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <Badge
          variant="outline"
          className={cn(
            "border-0 bg-transparent px-0 text-[10px] font-medium uppercase tracking-wide",
            config.color
          )}
        >
          <config.icon className="mr-1 h-3 w-3" />
          {config.label}
        </Badge>

        {/* Confidence Bar */}
        <div className="flex items-center gap-2">
          <div className="h-1 w-16 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[#FF6B35] transition-all"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
