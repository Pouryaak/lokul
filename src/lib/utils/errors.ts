export type ErrorCode =
  | "VALIDATION_ERROR"
  | "STORAGE_ERROR"
  | "STORAGE_NOT_FOUND"
  | "STORAGE_QUOTA_EXCEEDED"
  | "MEMORY_ERROR"
  | "MEMORY_EXTRACTION_FAILED"
  | "MEMORY_QUOTA_EXCEEDED"
  | "MODEL_ERROR"
  | "MODEL_NOT_LOADED"
  | "MODEL_DOWNLOAD_FAILED"
  | "PERSISTENCE_CONFLICT"
  | "PERSISTENCE_IDEMPOTENT_REPLAY"
  | "NETWORK_ERROR"
  | "UNKNOWN_ERROR"
  | "ABORTED";

export interface AppError {
  code: ErrorCode;
  message: string;
  details?: string;
  cause?: unknown;
}

export interface PersistenceConflictMeta {
  conversationId: string;
  expectedVersion: number;
  actualVersion: number;
}

export type ValidationError = AppError & { code: "VALIDATION_ERROR" };
export type StorageError =
  | (AppError & { code: "STORAGE_ERROR" })
  | (AppError & { code: "STORAGE_NOT_FOUND" })
  | (AppError & { code: "STORAGE_QUOTA_EXCEEDED" });
export type ModelError =
  | (AppError & { code: "MODEL_ERROR" })
  | (AppError & { code: "MODEL_NOT_LOADED" })
  | (AppError & { code: "MODEL_DOWNLOAD_FAILED" });
export type NetworkError = AppError & { code: "NETWORK_ERROR" };
export type MemoryError =
  | (AppError & { code: "MEMORY_ERROR" })
  | (AppError & { code: "MEMORY_EXTRACTION_FAILED" })
  | (AppError & { code: "MEMORY_QUOTA_EXCEEDED" });

function createError(
  code: ErrorCode,
  message: string,
  details?: string,
  cause?: unknown
): AppError {
  return {
    code,
    message,
    details,
    cause,
  };
}

export function validationError(
  message: string,
  details?: string,
  cause?: unknown
): ValidationError {
  return createError("VALIDATION_ERROR", message, details, cause) as ValidationError;
}

export function storageError(message: string, details?: string, cause?: unknown): StorageError {
  return createError("STORAGE_ERROR", message, details, cause) as StorageError;
}

export function notFoundError(resource: string, id: string, cause?: unknown): StorageError {
  return createError(
    "STORAGE_NOT_FOUND",
    `${resource} not found`,
    `${resource} with id '${id}' does not exist`,
    cause
  ) as StorageError;
}

export function quotaExceededError(details?: string, cause?: unknown): StorageError {
  return createError(
    "STORAGE_QUOTA_EXCEEDED",
    "Storage is full. Please delete some conversations to free up space.",
    details,
    cause
  ) as StorageError;
}

export function memoryError(message: string, details?: string, cause?: unknown): MemoryError {
  return createError("MEMORY_ERROR", message, details, cause) as MemoryError;
}

export function memoryExtractionError(message: string, cause?: unknown): MemoryError {
  return createError("MEMORY_EXTRACTION_FAILED", message, undefined, cause) as MemoryError;
}

export function memoryQuotaExceededError(details?: string, cause?: unknown): MemoryError {
  return createError(
    "MEMORY_QUOTA_EXCEEDED",
    "Memory storage is full. Please clear some saved memories and try again.",
    details,
    cause
  ) as MemoryError;
}

export function modelError(message: string, details?: string, cause?: unknown): ModelError {
  return createError("MODEL_ERROR", message, details, cause) as ModelError;
}

export function modelNotLoadedError(details?: string, cause?: unknown): ModelError {
  return createError(
    "MODEL_NOT_LOADED",
    "No AI model is loaded. Please wait for the model to load or refresh the page.",
    details,
    cause
  ) as ModelError;
}

export function modelDownloadFailed(modelId: string, cause?: unknown): ModelError {
  return createError(
    "MODEL_DOWNLOAD_FAILED",
    "Failed to download model. Please check your connection and try again.",
    `Model '${modelId}' download failed`,
    cause
  ) as ModelError;
}

export function persistenceConflictError(
  details: PersistenceConflictMeta,
  cause?: unknown
): AppError {
  return createError(
    "PERSISTENCE_CONFLICT",
    "Conversation changed in another operation. Retrying with latest state.",
    `Conversation ${details.conversationId} expected v${details.expectedVersion} but found v${details.actualVersion}`,
    cause
  );
}

export function persistenceReplayError(conversationId: string, idempotencyKey: string): AppError {
  return createError(
    "PERSISTENCE_IDEMPOTENT_REPLAY",
    "Duplicate save request ignored.",
    `Replay suppressed for conversation ${conversationId} and key ${idempotencyKey}`
  );
}

export function networkError(message: string, details?: string, cause?: unknown): NetworkError {
  return createError("NETWORK_ERROR", message, details, cause) as NetworkError;
}

export function unknownError(cause: unknown): AppError {
  const message = cause instanceof Error ? cause.message : "An unexpected error occurred";
  return createError("UNKNOWN_ERROR", "Something went wrong. Please try again.", message, cause);
}

export function abortedError(cause?: unknown): AppError {
  return createError("ABORTED", "Operation was cancelled.", "User aborted the operation", cause);
}

export function toAppError(error: unknown): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    if (error.name === "QuotaExceededError" || error.message.toLowerCase().includes("quota")) {
      return quotaExceededError(error.message, error);
    }

    if (error.name === "AbortError" || error.message.toLowerCase().includes("aborted")) {
      return abortedError(error);
    }

    return unknownError(error);
  }

  return unknownError(error);
}

export function isAppError(error: unknown): error is AppError {
  if (!error || typeof error !== "object") {
    return false;
  }

  const candidate = error as Partial<AppError>;
  return typeof candidate.code === "string" && typeof candidate.message === "string";
}

export function getUserMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred";
}

export function getTechnicalDetails(error: unknown): string | undefined {
  if (isAppError(error)) {
    return error.details;
  }

  if (error instanceof Error) {
    return error.stack;
  }

  return String(error);
}

const NON_RETRYABLE_CODES: ErrorCode[] = [
  "VALIDATION_ERROR",
  "STORAGE_NOT_FOUND",
  "PERSISTENCE_IDEMPOTENT_REPLAY",
];

export function isRetryableError(error: unknown): boolean {
  if (!isAppError(error)) {
    return true;
  }

  return !NON_RETRYABLE_CODES.includes(error.code);
}
