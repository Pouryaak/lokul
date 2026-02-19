/**
 * ConfirmDialog Component - Reusable confirmation dialog
 *
 * A modal dialog for confirming destructive or important actions.
 * Supports multiple visual variants and customizable button text.
 */

import { AlertTriangle, Info, AlertCircle } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

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
    <Dialog open={isOpen} onOpenChange={(open) => (open ? undefined : onClose())}>
      <DialogContent className="max-w-md rounded-2xl p-6" showCloseButton={false}>
        <div className="mb-2 flex justify-center">
          <VariantIcon variant={variant} />
        </div>

        <DialogHeader className="text-center sm:text-center">
          <DialogTitle className="text-lg text-gray-900">{title}</DialogTitle>
          <DialogDescription className="text-gray-600">{description}</DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-2">
          <Button variant="outline" size="md" className="w-full" onClick={onClose}>
            {cancelText}
          </Button>
          <Button variant={getButtonVariant()} size="md" className="w-full" onClick={onConfirm}>
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
