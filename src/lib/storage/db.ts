/**
 * Lokul Database - IndexedDB layer using Dexie.js
 *
 * Provides persistent storage for conversations, memory facts, and settings.
 * All data stays local - no cloud sync.
 */

import Dexie, { type Table } from "dexie";
import type { Conversation, MemoryFact, Settings } from "@/types/index";

/**
 * Database schema version and table definitions
 */
const DB_NAME = "LokulDB";
const DB_VERSION = 1;

/**
 * LokulDatabase extends Dexie to provide typed tables for all domain models.
 *
 * Tables:
 * - settings: Single-row table for app settings (keyed by "app")
 * - conversations: Chat conversations with messages
 * - memory: Extracted facts about the user
 */
export class LokulDatabase extends Dexie {
  /** Settings table - stores app configuration */
  settings!: Table<SettingsRecord, string>;

  /** Conversations table - stores chat history */
  conversations!: Table<Conversation, string>;

  /** Memory table - stores extracted user facts */
  memory!: Table<MemoryFact, string>;

  constructor() {
    super(DB_NAME);

    // Define schema for version 1
    this.version(DB_VERSION).stores({
      // Settings: single record with id "app"
      settings: "id",

      // Conversations: indexed by id, with secondary indexes for sorting
      conversations: "id, createdAt, updatedAt",

      // Memory: indexed by id, with secondary index for key lookups
      memory: "id, key, updatedAt",
    });
  }
}

/**
 * Settings record wrapper for Dexie storage.
 * Uses a single row with id "app" for the settings object.
 */
export interface SettingsRecord extends Settings {
  /** Fixed id "app" for the single settings record */
  id: "app";
}

/**
 * Singleton database instance.
 * Import this to perform database operations.
 *
 * @example
 * ```ts
 * import { db } from "@/lib/storage/db";
 *
 * // Get all conversations
 * const conversations = await db.conversations.toArray();
 *
 * // Get a specific conversation
 * const conversation = await db.conversations.get("conv-id");
 * ```
 */
export const db = new LokulDatabase();

/**
 * Initialize the database and verify connectivity.
 * Called on app startup to ensure storage is working.
 *
 * @returns Promise resolving when database is ready
 * @throws Error if database cannot be opened
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Verify database can be opened
    await db.open();

    if (import.meta.env.DEV) {
      console.info("[LokulDB] Database initialized successfully");
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    throw new Error(`Failed to initialize database: ${message}`);
  }
}

/**
 * Close the database connection.
 * Useful for cleanup in tests or when switching profiles.
 */
export async function closeDatabase(): Promise<void> {
  await db.close();
}

/**
 * Delete the entire database.
 * WARNING: This permanently removes all data. Use with caution.
 */
export async function deleteDatabase(): Promise<void> {
  await db.delete();
}

/**
 * Check if the database is currently open.
 */
export function isDatabaseOpen(): boolean {
  return db.isOpen();
}
