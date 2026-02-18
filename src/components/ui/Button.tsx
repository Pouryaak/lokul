/**
 * Button Component - Reusable button with variants
 *
 * Uses class-variance-authority for flexible styling variants.
 * Supports primary gradient, secondary, outline, and ghost styles.
 */

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/**
 * Button variants using CVA
 */
const buttonVariants = cva(
  // Base styles
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/90",
        primary:
          "bg-gradient-to-r from-[#FF6B35] to-[#FFB84D] text-white shadow-[0_0_30px_rgba(255,107,53,0.4)] hover:shadow-[0_0_40px_rgba(255,107,53,0.6)] hover:-translate-y-0.5",
        cta:
          "group relative overflow-hidden bg-gradient-to-r from-[#FF6B35] via-[#FF8C42] to-[#FFB84D] text-white shadow-[0_8px_32px_rgba(255,107,53,0.5),inset_0_1px_0_rgba(255,255,255,0.3)] hover:shadow-[0_12px_48px_rgba(255,107,53,0.7),inset_0_1px_0_rgba(255,255,255,0.4)] hover:-translate-y-1 active:translate-y-0 transition-all duration-300 before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:translate-x-[-200%] hover:before:translate-x-[200%] before:transition-transform before:duration-700",
        secondary:
          "bg-white text-[#FF6B35] border-2 border-[#FF6B35] hover:bg-[#FFF8F0] hover:-translate-y-0.5",
        outline:
          "border-2 border-[#FF6B35] bg-transparent text-[#FF6B35] hover:bg-[#FFF8F0] hover:-translate-y-0.5",
        ghost: "bg-transparent text-[#FF6B35] hover:bg-[#FFF8F0] hover:-translate-y-0.5",
        white:
          "bg-white text-[#FF6B35] shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.3)] hover:-translate-y-1",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm rounded-lg",
        sm: "h-9 px-4 text-sm rounded-lg",
        md: "h-11 px-6 text-base rounded-xl",
        lg: "h-14 px-8 text-lg rounded-xl",
        xl: "h-16 px-12 text-lg rounded-xl",
        "2xl": "h-20 px-16 text-2xl font-bold rounded-2xl",
        icon: "size-9 rounded-lg",
        "icon-sm": "size-8 rounded-lg",
        "icon-xs": "size-6 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

/**
 * Props for the Button component
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  /** Whether the button is in a loading state */
  loading?: boolean;
  /** Loading text to display (defaults to children) */
  loadingText?: string;
  /** Render as child element (uses Radix Slot) */
  asChild?: boolean;
}

/**
 * Button component with multiple variants and sizes
 *
 * @example
 * ```tsx
 * <Button>Default Button</Button>
 * <Button variant="primary" size="lg">Large Primary</Button>
 * <Button variant="outline" size="sm">Small Outline</Button>
 * <Button loading>Loading...</Button>
 * ```
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading = false, loadingText, children, disabled, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="mr-2 h-4 w-4 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText || children}
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);

Button.displayName = "Button";

export { buttonVariants };
