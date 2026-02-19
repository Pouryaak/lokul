/**
 * Lokul Type Definitions
 *
 * Core domain types for the Lokul privacy-first AI chat application.
 * All types use strict typing with no `any` types.
 */

// ============================================================================
// Model Types
// ============================================================================

/**
 * Represents the download/ready status of a model
 */
export type ModelStatus = "downloading" | "ready" | "error" | "pending";

/**
 * Model tier classification for the three-tier system
 */
export type ModelTier = "quick" | "smart" | "genius";

/**
 * AI model configuration and metadata
 */
export interface Model {
  /** Unique identifier for the model (e.g., "phi-2", "llama-3.2-3b") */
  id: string;

  /** Display name for the model */
  name: string;

  /** Human-readable description of the model's capabilities */
  description: string;

  /** Model size in bytes */
  size: number;

  /** Current status of the model */
  status: ModelStatus;

  /** Model tier classification */
  tier: ModelTier;

  /** Approximate download size for display (e.g., "~80MB") */
  sizeDisplay: string;

  /** WebLLM model ID for loading */
  webllmId: string;

  /** Context window size in tokens */
  contextWindow: number;
}

// ============================================================================
// Message Types
// ============================================================================

/**
 * Role of a message in the conversation
 */
export type MessageRole = "user" | "assistant" | "system";

/**
 * A single message in a conversation
 */
export interface Message {
  /** Unique identifier for the message */
  id: string;

  /** Role of the message sender */
  role: MessageRole;

  /** Message content */
  content: string;

  /** Timestamp when the message was created (Unix milliseconds) */
  timestamp: number;

  /** ID of the conversation this message belongs to */
  conversationId: string;

  /** Optional metadata for the message */
  metadata?: MessageMetadata;
}

/**
 * Additional metadata for a message
 */
export interface MessageMetadata {
  /** Token count for the message (if calculated) */
  tokenCount?: number;

  /** Generation time in milliseconds (for assistant messages) */
  generationTimeMs?: number;

  /** Model ID used to generate this message */
  modelId?: string;

  /** Whether the message was edited */
  edited?: boolean;

  /** Original content if edited */
  originalContent?: string;
}

// ============================================================================
// Conversation Types
// ============================================================================

/**
 * A conversation/chat session
 */
export interface Conversation {
  /** Unique identifier for the conversation */
  id: string;

  /** Display title for the conversation */
  title: string;

  /** ID of the model used in this conversation */
  model: string;

  /** All messages in the conversation */
  messages: Message[];

  /** Timestamp when the conversation was created (Unix milliseconds) */
  createdAt: number;

  /** Timestamp when the conversation was last updated (Unix milliseconds) */
  updatedAt: number;

  /** Monotonic storage version for optimistic concurrency */
  version: number;

  /** Optional conversation settings */
  settings?: ConversationSettings;
}

/**
 * Per-conversation settings
 */
export interface ConversationSettings {
  /** Temperature for generation (0.0 - 2.0) */
  temperature?: number;

  /** Maximum tokens per response */
  maxTokens?: number;

  /** System prompt override */
  systemPrompt?: string;
}

// ============================================================================
// Settings Types
// ============================================================================

/**
 * Theme preference
 */
export type Theme = "light" | "dark" | "system";

/**
 * User application settings
 */
export interface Settings {
  /** UI theme preference */
  theme: Theme;

  /** Default model ID for new conversations */
  defaultModel: string;

  /** Whether the user has completed the first-run setup */
  hasCompletedSetup: boolean;

  /** Whether to auto-load Quick Mode on first visit */
  autoLoadQuickMode: boolean;

  /** Version of the settings schema */
  version: number;
}

// ============================================================================
// GPU/Performance Types
// ============================================================================

/**
 * Information about WebGPU support and GPU capabilities
 */
export interface GPUInfo {
  /** Whether WebGPU is supported by the browser */
  supported: boolean;

  /** Name of the GPU device (null if not available) */
  deviceName: string | null;

  /** Error message if WebGPU is not supported (null if supported) */
  error: string | null;

  /** Additional GPU details (if available) */
  details?: GPUDeviceDetails;
}

/**
 * Detailed GPU device information
 */
export interface GPUDeviceDetails {
  /** GPU vendor name */
  vendor?: string;

  /** GPU architecture */
  architecture?: string;

  /** Whether the GPU is discrete (dedicated) or integrated */
  isDiscrete?: boolean;

  /** Estimated VRAM in MB (if detectable) */
  estimatedVramMB?: number;
}

/**
 * Model download progress information
 */
export interface DownloadProgress {
  /** Bytes downloaded so far */
  loaded: number;

  /** Total bytes to download */
  total: number;

  /** Download percentage (0-100) */
  percentage: number;

  /** Estimated time remaining in seconds (null if unknown) */
  estimatedTimeSeconds: number | null;

  /** Current download speed in bytes per second (null if unknown) */
  speedBps: number | null;

  /** Current step description (e.g., "Downloading weights...") */
  step: string;
}

/**
 * Performance metrics for AI inference
 */
export interface PerformanceMetrics {
  /** Tokens generated per second */
  tokensPerSecond: number;

  /** Time to first token in milliseconds */
  timeToFirstTokenMs: number;

  /** Total generation time in milliseconds */
  totalGenerationTimeMs: number;

  /** Memory usage in MB */
  memoryUsageMB: number;

  /** GPU utilization percentage (if available) */
  gpuUtilization?: number;
}

// ============================================================================
// Memory Types
// ============================================================================

/**
 * A single extracted fact about the user
 */
export type MemoryCategory = "identity" | "preference" | "project";

export interface MemoryFact {
  /** Unique identifier for the fact */
  id: string;

  /** Human-readable fact statement */
  fact: string;

  /** Category grouping used for relevance and UI */
  category: MemoryCategory;

  /** Confidence score (0-1) for extraction quality */
  confidence: number;

  /** Number of times this fact was re-observed */
  mentionCount: number;

  /** First observation timestamp (Unix milliseconds) */
  firstSeen: number;

  /** Most recent observation timestamp (Unix milliseconds) */
  lastSeen: number;

  /** Conversation ID where this fact was last observed */
  lastSeenConversationId: string;

  /** User pin flag to protect from automatic eviction */
  pinned: boolean;

  /** Optional link to previous fact replaced by this one */
  updatesFactId?: string;
}

/**
 * Memory context for AI inference
 */
export interface MemoryContext {
  /** All relevant facts for the current context */
  facts: MemoryFact[];

  /** Formatted memory string for system prompt injection */
  formattedMemory: string;

  /** Total memory size in characters */
  totalSize: number;
}

// ============================================================================
// UI State Types
// ============================================================================

/**
 * Sidebar visibility state
 */
export type SidebarState = "open" | "closed" | "auto";

/**
 * Loading state for async operations
 */
export interface LoadingState {
  /** Whether an operation is in progress */
  isLoading: boolean;

  /** Current progress percentage (0-100, null if indeterminate) */
  progress: number | null;

  /** Current operation description */
  message: string;

  /** Whether the operation can be cancelled */
  cancellable: boolean;
}

/**
 * Toast/notification message
 */
export interface ToastMessage {
  /** Unique identifier for the toast */
  id: string;

  /** Toast message content */
  message: string;

  /** Toast type */
  type: "info" | "success" | "warning" | "error";

  /** Duration in milliseconds (0 for persistent) */
  duration: number;
}

// ============================================================================
// Browser Support Types
// ============================================================================

/**
 * Recommended browser information
 */
export interface RecommendedBrowser {
  /** Browser name */
  name: string;

  /** Download URL */
  url: string;

  /** Minimum supported version */
  minVersion: string;

  /** Whether this browser is currently installed (best guess) */
  likelyInstalled?: boolean;
}

/**
 * Browser compatibility check result
 */
export interface BrowserCompatibility {
  /** Whether the current browser is supported */
  isSupported: boolean;

  /** Current browser name (if detectable) */
  currentBrowser: string | null;

  /** Current browser version (if detectable) */
  currentVersion: string | null;

  /** List of recommended browsers */
  recommendedBrowsers: RecommendedBrowser[];

  /** Specific compatibility issues */
  issues: string[];
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Generic async operation result
 */
export interface AsyncResult<T> {
  /** Whether the operation succeeded */
  success: boolean;

  /** Result data (if success) */
  data?: T;

  /** Error message (if failure) */
  error?: string;
}

/**
 * Standard cancellation reason taxonomy for async operations
 */
export type CancellationReason = "user_stop" | "route_change" | "model_switch" | "shutdown";

/**
 * Save options for compare-and-swap persistence writes
 */
export interface ConversationSaveOptions {
  expectedVersion?: number;
  idempotencyKey?: string;
  idempotencyWindowMs?: number;
  signal?: AbortSignal;
  cancelReason?: CancellationReason;
}

/**
 * Explicit metadata surfaced on optimistic concurrency conflicts
 */
export interface PersistenceConflictDetails {
  conversationId: string;
  expectedVersion: number;
  actualVersion: number;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  /** Page number (1-based) */
  page: number;

  /** Items per page */
  limit: number;
}

/**
 * Paginated result
 */
export interface PaginatedResult<T> {
  /** Items for the current page */
  items: T[];

  /** Total number of items */
  total: number;

  /** Current page number */
  page: number;

  /** Total number of pages */
  totalPages: number;

  /** Whether there is a next page */
  hasNext: boolean;

  /** Whether there is a previous page */
  hasPrev: boolean;
}
