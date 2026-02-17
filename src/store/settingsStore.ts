/**
 * Settings Store - Reactive state management for user preferences
 *
 * Uses Zustand for state management with custom persistence to IndexedDB.
 * Provides reactive access to settings with load/update/reset actions.
 */

import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { getSettings, saveSettings, resetSettings, defaultSettings } from "@/lib/storage/settings";
import type { Settings, Theme } from "@/types/index";

/**
 * Settings state interface including loading state and actions
 */
export interface SettingsState {
  /** Current settings values */
  settings: Settings;

  /** Whether settings are currently being loaded from storage */
  isLoading: boolean;

  /** Error message if settings load/save failed */
  error: string | null;

  // Actions
  /** Load settings from persistent storage */
  loadSettings: () => Promise<void>;

  /** Update settings with partial changes */
  updateSettings: (partial: Partial<Settings>) => Promise<void>;

  /** Reset all settings to defaults */
  resetSettings: () => Promise<void>;

  /** Set a specific theme */
  setTheme: (theme: Theme) => Promise<void>;

  /** Set the default model */
  setDefaultModel: (modelId: string) => Promise<void>;

  /** Mark setup as complete */
  completeSetup: () => Promise<void>;

  /** Clear any error state */
  clearError: () => void;
}

/**
 * Create the settings store with Zustand.
 *
 * The store initializes with default settings and isLoading: true.
 * Call loadSettings() on app mount to hydrate from IndexedDB.
 *
 * @example
 * ```tsx
 * function App() {
 *   const { settings, isLoading, loadSettings } = useSettingsStore();
 *
 *   useEffect(() => {
 *     loadSettings();
 *   }, [loadSettings]);
 *
 *   if (isLoading) return <LoadingScreen />;
 *
 *   return <div>Theme: {settings.theme}</div>;
 * }
 * ```
 */
export const useSettingsStore = create<SettingsState>()(
  devtools(
    (set, get) => ({
      // Initial state
      settings: { ...defaultSettings },
      isLoading: true,
      error: null,

      /**
       * Load settings from IndexedDB storage.
       * Called on app initialization to hydrate state.
       */
      loadSettings: async () => {
        set({ isLoading: true, error: null });

        try {
          const settings = await getSettings();
          set({ settings, isLoading: false });

          if (import.meta.env.DEV) {
            console.info("[SettingsStore] Settings loaded:", settings);
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to load settings";

          if (import.meta.env.DEV) {
            console.error("[SettingsStore] Failed to load settings:", error);
          }

          set({ error: message, isLoading: false });
        }
      },

      /**
       * Update settings with partial changes.
       * Merges with existing settings and persists to storage.
       */
      updateSettings: async (partial: Partial<Settings>) => {
        const currentSettings = get().settings;

        // Optimistically update UI
        const updatedSettings = { ...currentSettings, ...partial };
        set({ settings: updatedSettings, error: null });

        try {
          await saveSettings(partial);

          if (import.meta.env.DEV) {
            console.info("[SettingsStore] Settings updated:", partial);
          }
        } catch (error) {
          // Revert on error
          set({ settings: currentSettings });

          const message = error instanceof Error ? error.message : "Failed to save settings";

          if (import.meta.env.DEV) {
            console.error("[SettingsStore] Failed to save settings:", error);
          }

          set({ error: message });
          throw error;
        }
      },

      /**
       * Reset all settings to factory defaults.
       */
      resetSettings: async () => {
        set({ isLoading: true, error: null });

        try {
          await resetSettings();
          const settings = await getSettings();
          set({ settings, isLoading: false });

          if (import.meta.env.DEV) {
            console.info("[SettingsStore] Settings reset to defaults");
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Failed to reset settings";

          if (import.meta.env.DEV) {
            console.error("[SettingsStore] Failed to reset settings:", error);
          }

          set({ error: message, isLoading: false });
          throw error;
        }
      },

      /**
       * Set the UI theme.
       */
      setTheme: async (theme: Theme) => {
        await get().updateSettings({ theme });
      },

      /**
       * Set the default model for new conversations.
       */
      setDefaultModel: async (modelId: string) => {
        await get().updateSettings({ defaultModel: modelId });
      },

      /**
       * Mark the first-run setup as complete.
       */
      completeSetup: async () => {
        await get().updateSettings({ hasCompletedSetup: true });
      },

      /**
       * Clear any error state.
       */
      clearError: () => {
        set({ error: null });
      },
    }),
    { name: "SettingsStore" }
  )
);

/**
 * Selector hooks for common settings access.
 * Use these to subscribe to specific settings slices and avoid unnecessary re-renders.
 */

/**
 * Get just the theme setting
 */
export const selectTheme = (state: SettingsState) => state.settings.theme;

/**
 * Get just the default model setting
 */
export const selectDefaultModel = (state: SettingsState) => state.settings.defaultModel;

/**
 * Get just the hasCompletedSetup flag
 */
export const selectHasCompletedSetup = (state: SettingsState) => state.settings.hasCompletedSetup;

/**
 * Get loading state
 */
export const selectIsLoading = (state: SettingsState) => state.isLoading;

/**
 * Get error state
 */
export const selectError = (state: SettingsState) => state.error;
