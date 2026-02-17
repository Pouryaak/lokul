---
phase: 01-core-infrastructure
plan: 01
subsystem: core
tags: [types, storage, settings, webgpu]
dependencies:
  requires: []
  provides: ["types", "storage", "settings", "gpu-detection"]
  affects: ["01-02", "01-03", "02-01"]
tech-stack:
  added: ["Dexie 4.3.0", "Zustand 5.0.11"]
  patterns: ["IndexedDB storage", "Reactive state management", "WebGPU detection"]
key-files:
  created:
    - src/types/index.ts
    - src/types/webgpu.d.ts
    - src/types/vite-env.d.ts
    - src/lib/storage/db.ts
    - src/lib/storage/settings.ts
    - src/store/settingsStore.ts
    - src/lib/performance/gpu-detection.ts
  modified: []
decisions:
  - "Use single index.ts for all domain types to simplify imports"
  - "Store settings as single record with fixed id 'app' in IndexedDB"
  - "Use Zustand devtools middleware for debugging state changes"
  - "No WebGPU polyfill - strict requirement for Chrome 120+ or Edge 120+"
metrics:
  duration: 25
  completed-date: 2026-02-17
---

# Phase 01 Plan 01: Core Infrastructure Foundation Summary

**One-liner:** Established foundational TypeScript types, Dexie IndexedDB storage layer, reactive settings store with Zustand, and WebGPU detection utilities for the Lokul privacy-first AI chat application.

---

## Types Created

### Domain Types (`src/types/index.ts`)

| Type | Purpose | Key Fields |
|------|---------|------------|
| `Model` | AI model configuration | id, name, tier (quick/smart/genius), size, status |
| `Message` | Chat message | id, role (user/assistant/system), content, timestamp |
| `Conversation` | Chat session | id, title, model, messages[], createdAt, updatedAt |
| `Settings` | User preferences | theme, defaultModel, hasCompletedSetup, autoLoadQuickMode |
| `GPUInfo` | WebGPU support status | supported, deviceName, error, details |
| `DownloadProgress` | Model download tracking | loaded, total, percentage, estimatedTimeSeconds |
| `MemoryFact` | Extracted user facts | id, key, value, confidence, sourceConversationId |
| `PerformanceMetrics` | Inference performance | tokensPerSecond, timeToFirstTokenMs, memoryUsageMB |

### Type Declaration Files

- **`src/types/webgpu.d.ts`**: Type declarations for WebGPU API (`navigator.gpu`, `GPUAdapter`, `GPUDevice`)
- **`src/types/vite-env.d.ts`**: Type declarations for Vite's `import.meta.env` API

---

## Database Schema Design

### LokulDatabase (`src/lib/storage/db.ts`)

```typescript
// Schema Version 1
db.version(1).stores({
  settings: "id",           // Single record (id: "app")
  conversations: "id, createdAt, updatedAt",
  memory: "id, key, updatedAt"
});
```

**Tables:**
- **settings**: Stores app configuration as single row with fixed id "app"
- **conversations**: Chat history with indexes for sorting by date
- **memory**: User facts with key-based lookup for context building

**Features:**
- Database lifecycle management (`initializeDatabase`, `closeDatabase`, `deleteDatabase`)
- Error handling with fallback to defaults
- DEV mode logging for debugging

---

## Settings Store API

### Storage Layer (`src/lib/storage/settings.ts`)

| Function | Purpose |
|----------|---------|
| `getSettings()` | Retrieve settings merged with defaults |
| `saveSettings(partial)` | Upsert partial settings changes |
| `resetSettings()` | Restore factory defaults |
| `completeSetup()` | Mark first-run setup as complete |
| `getTheme()` / `setTheme()` | Theme preference access |
| `getDefaultModel()` / `setDefaultModel()` | Default model access |

**Default Settings:**
```typescript
{
  theme: "system",
  defaultModel: "phi-2",
  hasCompletedSetup: false,
  autoLoadQuickMode: true,
  version: 1
}
```

### Zustand Store (`src/store/settingsStore.ts`)

| State | Type | Description |
|-------|------|-------------|
| `settings` | `Settings` | Current settings values |
| `isLoading` | `boolean` | Loading state from IndexedDB |
| `error` | `string \| null` | Error message if load/save failed |

| Action | Purpose |
|--------|---------|
| `loadSettings()` | Hydrate store from IndexedDB |
| `updateSettings(partial)` | Update with optimistic UI updates |
| `resetSettings()` | Reset to defaults |
| `setTheme(theme)` | Set UI theme |
| `setDefaultModel(modelId)` | Set default model |
| `completeSetup()` | Mark setup complete |
| `clearError()` | Clear error state |

**Features:**
- Optimistic updates with rollback on error
- DEV mode logging via Zustand devtools
- Selector helpers for granular subscriptions

---

## GPU Detection Capabilities

### Functions (`src/lib/performance/gpu-detection.ts`)

| Function | Return Type | Purpose |
|----------|-------------|---------|
| `checkWebGPUSupport()` | `GPUInfo` | Synchronous WebGPU availability check |
| `getGPUInfo()` | `Promise<GPUInfo>` | Detailed GPU adapter information |
| `getRecommendedBrowsers()` | `RecommendedBrowser[]` | List of supported browsers with URLs |
| `isBrowserSupported()` | `boolean` | Check Chrome 120+ or Edge 120+ |
| `getBrowserCompatibility()` | `BrowserCompatibility` | Detailed compatibility analysis |
| `getUnsupportedBrowserMessage()` | `string` | User-friendly error message |
| `isMobileDevice()` | `boolean` | Detect mobile user agents |
| `getMobileWarning()` | `string \| null` | Mobile warning message |

**Browser Support Matrix:**

| Browser | Min Version | Supported |
|---------|-------------|-----------|
| Chrome | 120+ | Yes |
| Edge | 120+ | Yes |
| Firefox | 133+ (Nightly) | Partial |
| Safari | Any | No |

**Error Messages:**
- "Your browser doesn't support WebGPU"
- "Lokul requires Chrome 120+ or Edge 120+"

---

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Type Fix] Added WebGPU type declarations**
- **Found during:** TypeScript compilation verification
- **Issue:** `navigator.gpu` and `import.meta.env.DEV` not recognized by TypeScript
- **Fix:** Created `src/types/webgpu.d.ts` and `src/types/vite-env.d.ts` with proper type declarations
- **Files modified:** `src/types/webgpu.d.ts` (new), `src/types/vite-env.d.ts` (new)
- **Commit:** 952fc10

**2. [Rule 1 - Import Fix] Fixed Settings type import conflict**
- **Found during:** TypeScript compilation verification
- **Issue:** `Settings` type imported from both `./db` and `@/types/index` causing conflicts
- **Fix:** Removed duplicate import, used single `Settings` type from `@/types/index`
- **Files modified:** `src/lib/storage/settings.ts`
- **Commit:** 952fc10

**3. [Rule 1 - Unused Variable Fix] Removed unused error message variables**
- **Found during:** TypeScript compilation verification
- **Issue:** `message` variable declared but not used in catch blocks
- **Fix:** Reordered code to use `message` variable or removed unused declarations
- **Files modified:** `src/lib/storage/settings.ts`
- **Commit:** 952fc10

---

## Verification Results

- [x] TypeScript compiles without errors (`npm run type-check`)
- [x] All types importable from `src/types/index.ts`
- [x] Settings CRUD operations implemented
- [x] Zustand store with reactive state
- [x] WebGPU detection utilities working
- [x] Type declarations for WebGPU and Vite env

---

## Self-Check: PASSED

All files verified to exist:
- FOUND: src/types/index.ts
- FOUND: src/types/webgpu.d.ts
- FOUND: src/types/vite-env.d.ts
- FOUND: src/lib/storage/db.ts
- FOUND: src/lib/storage/settings.ts
- FOUND: src/store/settingsStore.ts
- FOUND: src/lib/performance/gpu-detection.ts

All commits verified:
- FOUND: 7eb51d2 (Task 1: TypeScript types)
- FOUND: 2595332 (Task 2: Dexie database)
- FOUND: 9351991 (Task 3: Zustand store)
- FOUND: e3bf023 (Task 4: GPU detection)
- FOUND: 952fc10 (Type fixes)

---

## Next Steps

This plan provides the foundational infrastructure for:
- **Plan 01-02**: First-run setup UI with WebGPU detection
- **Plan 01-03**: Model management and download progress
- **Plan 02-01**: Chat interface with message types

The types and storage layer are ready for conversation history, memory facts, and settings persistence.
