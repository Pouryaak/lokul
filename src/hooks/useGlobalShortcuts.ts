/**
 * useGlobalShortcuts - Global keyboard shortcuts for the application
 *
 * Registers Cmd+K (search), Cmd+M (new chat), and Escape (close overlays)
 * using react-hotkeys-hook. Overrides browser defaults for Cmd+K and Cmd+N.
 *
 * @example
 * ```tsx
 * useGlobalShortcuts({
 *   onSearch: () => setSearchOpen(true),
 *   onNewChat: () => navigate('/chat'),
 *   onEscape: () => closeOverlays(),
 *   searchOpen,
 *   dialogOpen: settingsOpen,
 * });
 * ```
 */

import { useEffect } from "react";
import { useHotkeys } from "react-hotkeys-hook";

/**
 * Configuration for global keyboard shortcuts
 */
interface GlobalShortcutsConfig {
  /** Callback when Cmd/Ctrl+K is pressed - opens search */
  onSearch: () => void;
  /** Callback when Cmd/Ctrl+M is pressed - creates new chat */
  onNewChat: () => void;
  /** Optional callback when Escape is pressed - closes overlays */
  onEscape?: () => void;
  /** Whether search overlay is currently open */
  searchOpen?: boolean;
  /** Whether any dialog is currently open */
  dialogOpen?: boolean;
  /** Whether any sheet is currently open */
  sheetOpen?: boolean;
}

/**
 * Hook that registers global keyboard shortcuts
 *
 * - Cmd/Ctrl+K: Opens search (overrides browser default)
 * - Cmd/Ctrl+M: Creates new chat
 * - Escape: Closes overlays (search, dialogs, sheets)
 *
 * Shortcuts work globally including in form inputs (enableOnFormTags).
 * Browser defaults for Cmd+K (focus address bar) and Cmd+N (new window) are overridden.
 */
export function useGlobalShortcuts({
  onSearch,
  onNewChat,
  onEscape,
  searchOpen,
  dialogOpen,
  sheetOpen,
}: GlobalShortcutsConfig): void {
  // Native event listener for Cmd+M for new chat
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "m") {
        event.preventDefault();
        event.stopPropagation();
        onNewChat();
      }
    };

    // Add listener to window with capture phase to catch event early
    window.addEventListener("keydown", handleKeyDown, true);

    return () => {
      window.removeEventListener("keydown", handleKeyDown, true);
    };
  }, [onNewChat]);

  // Cmd+K / Ctrl+K - Open search
  useHotkeys(
    "meta+k, ctrl+k",
    (event) => {
      event.preventDefault();
      onSearch();
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [onSearch]
  );

  // Escape - Close overlays (only if something is open)
  useHotkeys(
    "escape",
    () => {
      // Only call onEscape if there's something to close
      if (searchOpen || dialogOpen || sheetOpen) {
        onEscape?.();
      }
    },
    {
      enableOnFormTags: true,
    },
    [onEscape, searchOpen, dialogOpen, sheetOpen]
  );
}
