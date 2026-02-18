/**
 * ConfirmDialog Component - Reusable confirmation dialog
 *
 * A modal dialog for confirming destructive or important actions.
 * Supports multiple visual variants and customizable button text.
 */

import { useEffect, useCallback } from "react";
import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";

/**
 * Props for the ConfirmDialog component
 */
interface ConfirmDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed (cancel or backdrop click) */
  onClose: () => void;
  /** Callback when confirm button is clicked */
  onConfirm: () => void;
  /** Dialog title */
  title: string;
  /** Dialog description/explanation */
  description: string;
  /** Text for the confirm button (default: "Confirm") */
  confirmText?: string;
  /** Text for the cancel button (default: "Cancel") */
  cancelText?: string;
  /** Visual variant for the dialog */
  variant?: "danger" | "warning" | "info";
}

/**
 * Icon component based on variant
 */
function VariantIcon({ variant }: { variant: ConfirmDialogProps["variant"] }) {
  const iconClass = "h-12 w-12";

  switch (variant) {
    case "danger":
      return <AlertTriangle className={cn(iconClass, "text-red-500")} />;
    case "warning":
      return <AlertCircle className={cn(iconClass, "text-amber-500")} />;
    case "info":
    default:
      return <Info className={cn(iconClass, "text-blue-500")} />;
  }
}

/**
 * ConfirmDialog component
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showDeleteConfirm}
 *   onClose={() => setShowDeleteConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Conversation"
 *   description="This action cannot be undone."
 *   variant="danger"
 *   confirmText="Delete"
 * />
 * ```
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "warning",
}: ConfirmDialogProps) {
  /**
   * Handle keyboard events (Escape to close)
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  /**
   * Handle confirm with Enter key
   */
  const handleConfirmKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Enter") {
        onConfirm();
      }
    },
    [onConfirm]
  );

  /**
   * Add/remove keyboard listeners
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  /**
   * Don't render if not open
   */
  if (!isOpen) {
    return null;
  }

  /**
   * Get button variant based on dialog variant
   */
  const getButtonVariant = () => {
    switch (variant) {
      case "danger":
        return "destructive";
      case "warning":
        return "primary";
      case "info":
      default:
        return "default";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-description"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onKeyDown={handleConfirmKeyDown}
      >
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          <VariantIcon variant={variant} />
        </div>

        {/* Title */}
        <h2
          id="confirm-dialog-title"
          className="mb-2 text-center text-lg font-semibold text-gray-900"
        >
          {title}
        </h2>

        {/* Description */}
        <p
          id="confirm-dialog-description"
          className="mb-6 text-center text-gray-600"
        >
          {description}
        </p>

        {/* Button row */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            {cancelText}
          </Button>
          <Button
            variant={getButtonVariant()}
            size="md"
            className="flex-1"
            onClick={onConfirm}
            autoFocus
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
}
