/**
 * useGlobalShortcuts - Global keyboard shortcuts for the application
 *
 * Registers Cmd+K (search), Cmd+N (new chat), and Escape (close overlays)
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

import { useHotkeys } from "react-hotkeys-hook";

/**
 * Configuration for global keyboard shortcuts
 */
interface GlobalShortcutsConfig {
  /** Callback when Cmd/Ctrl+K is pressed - opens search */
  onSearch: () => void;
  /** Callback when Cmd/Ctrl+N is pressed - creates new chat */
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
 * - Cmd/Ctrl+N: Creates new chat (overrides browser default)
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

  // Cmd+N / Ctrl+N - New chat
  useHotkeys(
    "meta+n, ctrl+n",
    (event) => {
      event.preventDefault();
      onNewChat();
    },
    {
      enableOnFormTags: true,
      preventDefault: true,
    },
    [onNewChat]
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
