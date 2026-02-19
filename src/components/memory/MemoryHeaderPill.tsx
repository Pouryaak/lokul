import { Brain } from "lucide-react";
import { cn } from "@/lib/utils";

interface MemoryHeaderPillProps {
  count: number;
  onClick: () => void;
}

export function MemoryHeaderPill({ count, onClick }: MemoryHeaderPillProps) {
  const label = `${count} ${count === 1 ? "memory" : "memories"} ↗`;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-2 rounded-full border border-[#FF6B35]/25 bg-white px-3 text-sm font-medium text-[#B44B24] transition-colors hover:bg-[#FFF4ED]",
        "focus-visible:ring-2 focus-visible:ring-[#FF6B35]/40 focus-visible:outline-none"
      )}
      aria-label="Open memory panel"
    >
      <Brain className="h-4 w-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">{count}</span>
    </button>
  );
}
