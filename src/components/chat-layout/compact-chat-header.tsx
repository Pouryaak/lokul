import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompactChatHeaderProps {
  leftActions?: ReactNode;
  rightActions?: ReactNode;
  className?: string;
}

export function CompactChatHeader({
  leftActions,
  rightActions,
  className,
}: CompactChatHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex items-center justify-between border-b border-gray-200/60 bg-white/80 backdrop-blur-sm",
        "h-12 gap-2 px-2 sm:h-[3.25rem] sm:px-3 lg:h-14 lg:px-4",
        "max-[1120px]:h-12 max-[1120px]:gap-1.5 max-[1120px]:px-3",
        className
      )}
    >
      <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">{leftActions}</div>
      <div className="flex items-center gap-1.5 sm:gap-2">{rightActions}</div>
    </header>
  );
}
