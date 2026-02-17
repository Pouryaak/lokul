/**
 * Card Component - Container with consistent styling
 *
 * Simple card wrapper with white background, shadow, and optional accent.
 */

import { cn } from "@/lib/utils";

/**
 * Props for the Card component
 */
export interface CardProps {
  /** Card content */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show orange accent on top */
  accent?: boolean;
  /** Whether card should have hover effect */
  hover?: boolean;
}

/**
 * Card component for content containers
 *
 * @example
 * ```tsx
 * <Card accent hover>
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className,
  accent = false,
  hover = false,
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-white p-6 shadow-md",
        accent && "border-t-4 border-t-[#FF6B35]",
        hover && "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Props for CardHeader component
 */
export interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card header section
 */
export function CardHeader({ children, className }: CardHeaderProps) {
  return (
    <div className={cn("mb-4", className)}>
      {children}
    </div>
  );
}

/**
 * Props for CardTitle component
 */
export interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card title styling
 */
export function CardTitle({ children, className }: CardTitleProps) {
  return (
    <h3 className={cn("text-xl font-semibold text-[#1A1A1A]", className)}>
      {children}
    </h3>
  );
}

/**
 * Props for CardContent component
 */
export interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card content section
 */
export function CardContent({ children, className }: CardContentProps) {
  return (
    <div className={cn("text-gray-600", className)}>
      {children}
    </div>
  );
}

/**
 * Props for CardFooter component
 */
export interface CardFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Card footer section
 */
export function CardFooter({ children, className }: CardFooterProps) {
  return (
    <div className={cn("mt-4 pt-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
}
