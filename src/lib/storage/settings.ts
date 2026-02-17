/**
 * Settings Storage - CRUD operations for user preferences
 *
 * Provides persistent storage for app settings using IndexedDB via Dexie.
 * Settings are merged with defaults to ensure all fields are present.
 */

import { db } from "./db";
import type { SettingsRecord } from "./db";
import type { Settings } from "@/types/index";

/**
 * Default settings for new installations.
 * These values are used when no settings exist in storage.
 */
export const defaultSettings: Settings = {
  theme: "system",
  defaultModel: "phi-2",
  hasCompletedSetup: false,
  autoLoadQuickMode: true,
  version: 1,
};

/**
 * Settings storage key - single record id for app settings
 */
const SETTINGS_ID = "app" as const;

/**
 * Retrieve settings from storage, merged with defaults.
 *
 * If no settings exist in storage, returns defaultSettings.
 * If partial settings exist, merges with defaults for missing fields.
 *
 * @returns Promise resolving to complete Settings object
 * @throws Error if database read fails
 *
 * @example
 * ```ts
 * const settings = await getSettings();
 * console.log(settings.theme); // "system" | "light" | "dark"
 * ```
 */
export async function getSettings(): Promise<Settings> {
  try {
    const record = await db.settings.get(SETTINGS_ID);

    if (!record) {
      // No settings exist yet - return defaults
      return { ...defaultSettings };
    }

    // Merge stored settings with defaults for any missing fields
    return {
      ...defaultSettings,
      ...record,
    };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Settings] Failed to load settings:", error);
    }

    // Return defaults on error so app can still function
    return { ...defaultSettings };
  }
}

/**
 * Save settings to persistent storage.
 *
 * Performs an upsert operation - creates new record if none exists,
 * updates existing record otherwise.
 *
 * @param settings - Partial settings object to save
 * @returns Promise resolving when save is complete
 * @throws Error if database write fails
 *
 * @example
 * ```ts
 * // Update just the theme
 * await saveSettings({ theme: "dark" });
 *
 * // Update multiple settings
 * await saveSettings({
 *   theme: "light",
 *   defaultModel: "llama-3.2-3b"
 * });
 * ```
 */
export async function saveSettings(
  settings: Partial<Settings>,
): Promise<void> {
  try {
    // Get existing settings to merge
    const existing = await db.settings.get(SETTINGS_ID);

    const record: SettingsRecord = {
      ...defaultSettings,
      ...existing,
      ...settings,
      id: SETTINGS_ID,
    };

    await db.settings.put(record);

    if (import.meta.env.DEV) {
      console.log("[Settings] Settings saved:", record);
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("[Settings] Failed to save settings:", error);
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to save settings: ${message}`);
  }
}

/**
 * Reset settings to default values.
 *
 * Clears all custom settings and restores factory defaults.
 *
 * @returns Promise resolving when reset is complete
 */
export async function resetSettings(): Promise<void> {
  try {
    const record: SettingsRecord = {
      ...defaultSettings,
      id: SETTINGS_ID,
    };

    await db.settings.put(record);

    if (import.meta.env.DEV) {
      console.log("[Settings] Settings reset to defaults");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to reset settings: ${message}`);
  }
}

/**
 * Check if user has completed the first-run setup.
 *
 * @returns Promise resolving to true if setup is complete
 */
export async function hasCompletedSetup(): Promise<boolean> {
  const settings = await getSettings();
  return settings.hasCompletedSetup;
}

/**
 * Mark the first-run setup as complete.
 *
 * Called after user successfully loads their first model.
 */
export async function completeSetup(): Promise<void> {
  await saveSettings({ hasCompletedSetup: true });
}

/**
 * Get the default model ID for new conversations.
 *
 * @returns Promise resolving to model ID string
 */
export async function getDefaultModel(): Promise<string> {
  const settings = await getSettings();
  return settings.defaultModel;
}

/**
 * Set the default model for new conversations.
 *
 * @param modelId - Model ID to set as default
 */
export async function setDefaultModel(modelId: string): Promise<void> {
  await saveSettings({ defaultModel: modelId });
}

/**
 * Get the current theme preference.
 *
 * @returns Promise resolving to theme value
 */
export async function getTheme(): Promise<Settings["theme"]> {
  const settings = await getSettings();
  return settings.theme;
}

/**
 * Set the theme preference.
 *
 * @param theme - Theme to set ("light", "dark", or "system")
 */
export async function setTheme(theme: Settings["theme"]): Promise<void> {
  await saveSettings({ theme });
}
