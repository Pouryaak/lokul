import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pin, Trash2, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { MemoryCategory, MemoryFact } from "@/lib/memory/types";

interface MemoryCardProps {
  fact: MemoryFact;
  onUpdate: (id: string, updates: Partial<MemoryFact>) => void;
  onDelete: (id: string) => void;
  onPin: (id: string, pinned: boolean) => void;
  isManageMode?: boolean;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
}

const categoryColors: Record<MemoryCategory, string> = {
  project: "border-l-cyan-500 bg-cyan-50/70",
  preference: "border-l-purple-500 bg-purple-50/70",
  identity: "border-l-green-500 bg-green-50/70",
};

const categoryLabel: Record<MemoryCategory, string> = {
  project: "Project",
  preference: "Preference",
  identity: "Identity",
};

export function MemoryCard({
  fact,
  onUpdate,
  onDelete,
  onPin,
  isManageMode = false,
  isSelected = false,
  onSelect,
}: MemoryCardProps) {
  const [isInlineEditing, setIsInlineEditing] = useState(false);
  const [isFullEditing, setIsFullEditing] = useState(false);
  const [inlineValue, setInlineValue] = useState(fact.fact);
  const [fullValue, setFullValue] = useState(fact.fact);
  const [fullCategory, setFullCategory] = useState<MemoryCategory>(fact.category);
  const clickTimerRef = useRef<number | null>(null);

  const confidencePct = useMemo(() => Math.max(0, Math.min(100, fact.confidence * 100)), [fact]);

  const clearClickTimer = () => {
    if (clickTimerRef.current !== null) {
      window.clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
  };

  const submitInlineEdit = () => {
    const next = inlineValue.trim();
    if (next && next !== fact.fact) {
      onUpdate(fact.id, { fact: next, lastSeen: Date.now() });
    }
    setIsInlineEditing(false);
    setInlineValue(fact.fact);
  };

  const cancelInlineEdit = () => {
    setInlineValue(fact.fact);
    setIsInlineEditing(false);
  };

  const submitFullEdit = () => {
    const next = fullValue.trim();
    if (next) {
      onUpdate(fact.id, { fact: next, category: fullCategory, lastSeen: Date.now() });
    }
    setIsFullEditing(false);
    setIsInlineEditing(false);
  };

  const handleCardClick = () => {
    if (isManageMode) {
      onSelect?.(fact.id);
      return;
    }

    clearClickTimer();
    clickTimerRef.current = window.setTimeout(() => {
      setInlineValue(fact.fact);
      setIsInlineEditing(true);
      clickTimerRef.current = null;
    }, 180);
  };

  const handleCardDoubleClick = () => {
    clearClickTimer();
    setFullValue(fact.fact);
    setFullCategory(fact.category);
    setIsInlineEditing(false);
    setIsFullEditing(true);
  };

  return (
    <div
      onClick={handleCardClick}
      onDoubleClick={handleCardDoubleClick}
      className={cn(
        "group relative rounded-xl border border-l-4 border-gray-200 p-3 transition-colors",
        categoryColors[fact.category],
        fact.pinned && "ring-1 ring-[#FF6B35]/35",
        isSelected && "ring-2 ring-[#FF6B35]"
      )}
    >
      {fact.pinned && <div className="absolute inset-y-0 left-0 w-1 rounded-l-xl bg-[#FF6B35]" />}

      <AnimatePresence>
        {(isManageMode || fact.pinned || isInlineEditing || isFullEditing) && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="absolute top-2 right-2 flex items-center gap-1"
          >
            {isManageMode ? (
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onSelect?.(fact.id)}
                className="h-4 w-4 rounded border-gray-300"
                aria-label="Select memory"
              />
            ) : (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onPin(fact.id, !fact.pinned);
                  }}
                  aria-label={fact.pinned ? "Unpin memory" : "Pin memory"}
                >
                  <Pin
                    className={cn("h-3.5 w-3.5", fact.pinned && "fill-[#FF6B35] text-[#FF6B35]")}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  onClick={(event) => {
                    event.stopPropagation();
                    onDelete(fact.id);
                  }}
                  aria-label="Delete memory"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-500" />
                </Button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-2 pr-14">
        {isFullEditing ? (
          <div className="space-y-2" onClick={(event) => event.stopPropagation()}>
            <Textarea
              value={fullValue}
              onChange={(event) => setFullValue(event.target.value)}
              rows={3}
            />
            <select
              value={fullCategory}
              onChange={(event) => setFullCategory(event.target.value as MemoryCategory)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white px-2 text-sm"
            >
              <option value="project">Project</option>
              <option value="preference">Preference</option>
              <option value="identity">Identity</option>
            </select>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" onClick={submitFullEdit}>
                <Check className="mr-1 h-4 w-4" />
                Save
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsFullEditing(false);
                  setFullValue(fact.fact);
                  setFullCategory(fact.category);
                }}
              >
                <X className="mr-1 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : isInlineEditing ? (
          <Input
            value={inlineValue}
            onChange={(event) => setInlineValue(event.target.value)}
            onBlur={submitInlineEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                submitInlineEdit();
              }
              if (event.key === "Escape") {
                cancelInlineEdit();
              }
            }}
            autoFocus
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          <p className="text-sm leading-relaxed text-gray-900">{fact.fact}</p>
        )}
      </div>

      {!isFullEditing && (
        <>
          <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-[#FF6B35] transition-all"
              style={{ width: `${confidencePct}%` }}
            />
          </div>
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-[10px] tracking-wide uppercase">
              {categoryLabel[fact.category]}
            </Badge>
            {fact.pinned && <span className="text-xs font-medium text-[#FF6B35]">Pinned</span>}
          </div>
        </>
      )}
    </div>
  );
}
