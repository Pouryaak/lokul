import { type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type KbdProps = ComponentProps<"span"> & {
  children: ReactNode;
};

export const Kbd = ({ className, children, ...props }: KbdProps) => (
  <span
    className={cn(
      "relative inline-flex items-center rounded-md border px-2 py-1 font-mono text-[10px] font-medium select-none",
      "border-zinc-600 bg-gradient-to-b from-zinc-700 to-zinc-800 shadow-[0_2px_0_#333,0_3px_2px_rgba(0,0,0,0.5)]",
      "text-zinc-200",
      "light:from-gray-100 light:to-gray-200 light:border-gray-300 light:shadow-[0_2px_0_#ccc,0_3px_2px_rgba(0,0,0,0.25)]",
      "light:text-gray-700",
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export type KbdKeyProps = ComponentProps<"span"> & {
  "aria-label"?: string;
  className?: string;
};

export const KbdKey = ({ className, children, ...props }: KbdKeyProps) => (
  <span
    className={cn(
      "rounded-sm bg-transparent px-1 py-px font-mono text-[10px] font-medium select-none",
      className
    )}
    {...props}
  >
    {children}
  </span>
);

export type KbdSeparatorProps = ComponentProps<"span"> & {
  children?: ReactNode;
  className?: string;
};

export const KbdSeparator = ({ className, children = "+", ...props }: KbdSeparatorProps) => (
  <span
    className={cn(
      "text-muted-foreground/70 pointer-events-none mx-0.5 text-[10px] select-none",
      className
    )}
    {...props}
  >
    {children}
  </span>
);
