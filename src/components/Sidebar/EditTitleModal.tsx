/**
 * EditTitleModal Component - Modal for editing conversation titles
 *
 * Allows users to rename conversations with validation and character limits.
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * Maximum length for conversation titles
 */
const MAX_TITLE_LENGTH = 50;

/**
 * Props for the EditTitleModal component
 */
interface EditTitleModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when title is saved */
  onSave: (title: string) => void;
  /** Current title to pre-fill */
  currentTitle: string;
}

/**
 * EditTitleModal component
 *
 * @example
 * ```tsx
 * <EditTitleModal
 *   isOpen={isEditing}
 *   onClose={() => setIsEditing(false)}
 *   onSave={(title) => updateTitle(id, title)}
 *   currentTitle={conversation.title}
 * />
 * ```
 */
export function EditTitleModal({
  isOpen,
  onClose,
  onSave,
  currentTitle,
}: EditTitleModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  /**
   * Reset title when modal opens
   */
  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
      setError(null);
    }
  }, [isOpen, currentTitle]);

  /**
   * Auto-focus input when modal opens
   */
  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen]);

  /**
   * Handle keyboard events
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
   * Add/remove keyboard listeners
   */
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  /**
   * Validate title input
   */
  const validateTitle = (value: string): string | null => {
    const trimmed = value.trim();

    if (trimmed.length === 0) {
      return "Title cannot be empty";
    }

    if (trimmed.length > MAX_TITLE_LENGTH) {
      return `Title must be ${MAX_TITLE_LENGTH} characters or less`;
    }

    return null;
  };

  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTitle(value);
    setError(validateTitle(value));
  };

  /**
   * Handle save
   */
  const handleSave = () => {
    const trimmed = title.trim();
    const validationError = validateTitle(trimmed);

    if (validationError) {
      setError(validationError);
      return;
    }

    onSave(trimmed);
    onClose();
  };

  /**
   * Handle key down in input
   */
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    }
  };

  /**
   * Don't render if not open
   */
  if (!isOpen) {
    return null;
  }

  const charCount = title.length;
  const isOverLimit = charCount > MAX_TITLE_LENGTH;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-title-title"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            <Pencil className="h-5 w-5 text-[#FF6B35]" />
          </div>
          <h2
            id="edit-title-title"
            className="text-lg font-semibold text-gray-900"
          >
            Edit Conversation Title
          </h2>
        </div>

        {/* Input */}
        <div className="mb-4">
          <label
            htmlFor="title-input"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            ref={inputRef}
            id="title-input"
            type="text"
            value={title}
            onChange={handleChange}
            onKeyDown={handleInputKeyDown}
            placeholder="Enter conversation title..."
            className={cn(
              "w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2",
              error
                ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                : "border-gray-300 focus:border-[#FF6B35] focus:ring-orange-200"
            )}
            maxLength={MAX_TITLE_LENGTH + 10}
          />

          {/* Character count and error */}
          <div className="mt-2 flex items-center justify-between">
            {error ? (
              <span className="text-sm text-red-500">{error}</span>
            ) : (
              <span />
            )}
            <span
              className={cn(
                "text-xs",
                isOverLimit ? "text-red-500" : "text-gray-500"
              )}
            >
              {charCount}/{MAX_TITLE_LENGTH}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <Button variant="outline" size="md" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            className="flex-1"
            onClick={handleSave}
            disabled={!!error || title.trim().length === 0}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
