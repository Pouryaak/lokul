# Architecture

**Analysis Date:** 2026-02-23

## Pattern Overview

**Overall:** Layered client-side modular monolith (React UI + hook/store orchestration + local services + browser infrastructure)

**Key Characteristics:**
- Route-driven UI composition starts in `src/main.tsx` and `src/App.tsx`, with nested route shells in `src/routes/RootLayout.tsx`, `src/routes/ChatRoute.tsx`, and `src/routes/ChatDetailRoute.tsx`.
- Business orchestration is split across hooks (`src/hooks/useAIChat.ts`, `src/hooks/use-ai-chat-persistence.ts`, `src/hooks/useMemoryExtraction.ts`) and Zustand stores (`src/store/modelStore.ts`, `src/store/conversationModelStore.ts`, `src/store/settingsStore.ts`).
- Infrastructure is browser-local only: WebLLM worker inference in `src/lib/ai/inference.ts` + `src/workers/inference.worker.ts`, Dexie IndexedDB in `src/lib/storage/db.ts`, and PWA runtime in `vite.config.ts` plus `src/components/performance/StatusIndicator.tsx`.

## Layers

**Presentation Layer:**
- Purpose: Render routed pages, chat UI, onboarding, memory panel, model controls, and performance status.
- Location: `src/components/`, `src/routes/`, `src/App.tsx`.
- Contains: Route components (`src/routes/*.tsx`), chat shell (`src/components/chat-layout/ChatLayout.tsx`), chat surface (`src/components/Chat/AIChatInterface.tsx`), onboarding flow (`src/components/onboarding/OnboardingFlow.tsx`), and UI primitives (`src/components/ui/*.tsx`).
- Depends on: Hooks (`src/hooks/*.ts`), stores (`src/store/*.ts`), and selected domain utilities (`src/lib/*`).
- Used by: App entrypoint `src/main.tsx` through `src/App.tsx`.

**Application Orchestration Layer:**
- Purpose: Coordinate transport, persistence, memory extraction, and list synchronization for UI interactions.
- Location: `src/hooks/`.
- Contains: Chat adapter (`src/hooks/useAIChat.ts`), persistence controller (`src/hooks/use-ai-chat-persistence.ts`), conversation list hook (`src/hooks/useConversations.ts`), memory hook (`src/hooks/useMemory.ts`), and extraction trigger logic (`src/hooks/useMemoryExtraction.ts`).
- Depends on: Services in `src/lib/` and state in `src/store/`.
- Used by: Components such as `src/components/Chat/AIChatInterface.tsx`, `src/components/chat-layout/AppSidebar.tsx`, and `src/components/memory/MemoryPanel.tsx`.

**State Coordination Layer:**
- Purpose: Keep reactive app-wide state for model lifecycle, per-conversation model targets, settings hydration, and memory panel UI.
- Location: `src/store/`.
- Contains: `src/store/modelStore.ts`, `src/store/conversationModelStore.ts`, `src/store/settingsStore.ts`, `src/store/memoryStore.ts`.
- Depends on: Model and storage services (`src/lib/ai/model-engine.ts`, `src/lib/storage/settings.ts`, `src/lib/storage/conversations.ts`).
- Used by: Route components and model/memory UI controls.

**Domain Services Layer:**
- Purpose: Execute core product capabilities (local inference, prompt/context shaping, storage, transfer, memory maintenance, performance checks).
- Location: `src/lib/ai/`, `src/lib/memory/`, `src/lib/storage/`, `src/lib/performance/`, `src/lib/utils/`.
- Contains: `src/lib/ai/webllm-transport.ts`, `src/lib/ai/model-engine.ts`, `src/lib/storage/conversations.ts`, `src/lib/storage/memory.ts`, `src/lib/memory/context-builder.ts`, `src/lib/memory/compaction.ts`, `src/lib/memory/extraction.ts`.
- Depends on: Browser APIs, external libraries, and shared types in `src/types/index.ts`.
- Used by: Hooks and stores.

**Infrastructure Layer:**
- Purpose: Bind app logic to browser runtime primitives (worker threads, IndexedDB, service worker/PWA, WebGPU).
- Location: `src/workers/inference.worker.ts`, `src/lib/storage/db.ts`, `vite.config.ts`, `src/components/performance/StatusIndicator.tsx`.
- Contains: Worker message handling via `WebWorkerMLCEngineHandler` in `src/workers/inference.worker.ts`, Dexie schema/migrations in `src/lib/storage/db.ts`, PWA plugin wiring in `vite.config.ts`.
- Depends on: Browser platform and plugin runtime.
- Used by: AI services and status UI.

## Data Flow

**Chat Request + Stream + Persistence Flow:**

1. User submits through `src/components/Chat/AIChatInterface.tsx` and `src/components/Chat/ai-chat-parts.tsx`, which call `sendMessage` from `src/hooks/useAIChat.ts`.
2. `src/hooks/useAIChat.ts` creates `WebLLMTransport` from `src/lib/ai/webllm-transport.ts`; the transport builds context/memory (`src/lib/memory/context-builder.ts`, `src/lib/memory/compaction.ts`) and streams tokens from `inferenceManager` in `src/lib/ai/inference.ts`.
3. `src/lib/ai/inference.ts` delegates execution to the worker entry in `src/workers/inference.worker.ts`; chunks return through transport to UI, while `src/hooks/use-ai-chat-persistence.ts` debounces and saves conversation snapshots via `src/lib/storage/conversations.ts`.

**Conversation Bootstrap Flow (`/chat` -> `/chat/:id`):**

1. `src/routes/ChatRoute.tsx` creates a local conversation via `createConversation` and `saveConversation` from `src/lib/storage/conversations.ts`.
2. It hydrates active conversation-model state through `src/store/conversationModelStore.ts` and navigates to `/chat/:id` with a `pendingMessage` payload.
3. `src/routes/ChatDetailRoute.tsx` loads the conversation with `getConversation`, ensures model hydration via `hydrateConversation`, and passes initial/pending messages into `src/components/Chat/AIChatInterface.tsx`.

**Model Lifecycle Flow (queue + activation):**

1. UI requests model changes via `src/components/model/InputModelSelector.tsx` or `src/components/model/PendingModelSelector.tsx`.
2. Requests enter `src/store/conversationModelStore.ts`, which queues per-model lifecycle states and persists per-conversation targets through `updateConversationModelTarget` in `src/lib/storage/conversations.ts`.
3. `src/store/modelStore.ts` reflects `src/lib/ai/model-engine.ts` state; `modelEngine` drives initialization retries/circuit breaker and calls `inferenceManager.initializeSafe` in `src/lib/ai/inference.ts`.

**State Management:**
- Global reactive state uses Zustand stores in `src/store/*.ts`; persistent domain data uses Dexie queries in `src/lib/storage/*.ts` plus live subscriptions (`useLiveQuery`) in hooks like `src/hooks/useConversations.ts` and `src/hooks/useMemory.ts`.

## Key Abstractions

**WebLLMTransport (chat protocol adapter):**
- Purpose: Implement AI SDK `ChatTransport` for local WebLLM stream semantics, chunk timeouts, abort/recovery, and context fallback.
- Examples: `src/lib/ai/webllm-transport.ts`, consumed by `src/hooks/useAIChat.ts`.
- Pattern: Adapter + stream controller around async generators.

**ModelEngine (model lifecycle state machine):**
- Purpose: Centralize model loading/unloading, retry behavior, and circuit-breaker transitions.
- Examples: `src/lib/ai/model-engine.ts`, coordinated via `src/store/modelStore.ts`.
- Pattern: Stateful service with pub/sub listeners and in-flight token cancellation.

**ConversationModelStore (conversation-scoped model coordination):**
- Purpose: Track requested/active model per conversation, queue downloads, and expose lifecycle UI state.
- Examples: `src/store/conversationModelStore.ts`, used by `src/routes/ChatDetailRoute.tsx`, `src/components/model/DownloadManager.tsx`.
- Pattern: Store-based orchestration with queue processor (`runQueue`) and derived selectors.

**Persistence Recovery Controller:**
- Purpose: Debounced compare-and-swap conversation writes with idempotency keys and retry handling.
- Examples: `src/hooks/use-ai-chat-persistence.ts`, `src/lib/storage/conversations.ts`.
- Pattern: Hook-managed control plane + optimistic concurrency in storage service.

**Memory Pipeline (extract -> store -> inject):**
- Purpose: Extract stable user facts, store/merge/evict facts, and inject scored memory into prompts.
- Examples: `src/hooks/useMemoryExtraction.ts`, `src/lib/memory/extraction.ts`, `src/lib/memory/storage-operations.ts`, `src/lib/memory/context-builder.ts`, `src/lib/storage/memory.ts`.
- Pattern: Periodic sidecar inference pipeline with confidence filtering and budgeted prompt augmentation.

## Entry Points

**Browser App Entry:**
- Location: `index.html`, `src/main.tsx`.
- Triggers: Browser loads `/` and mounts `#root`.
- Responsibilities: Boot React tree, load global styles, render `App`.

**Route Composition Entry:**
- Location: `src/App.tsx`.
- Triggers: React render lifecycle + route navigation.
- Responsibilities: Initialize settings/model bootstrap, declare route graph, wrap with `BrowserRouter`, `ErrorBoundary`, and `Toaster`.

**Chat Route Entries:**
- Location: `src/routes/ChatRoute.tsx`, `src/routes/ChatDetailRoute.tsx`.
- Triggers: `/chat` and `/chat/:id` navigation.
- Responsibilities: Conversation creation/loading, conversation-model hydration, and initial chat props shaping.

**Worker Runtime Entry:**
- Location: `src/workers/inference.worker.ts`.
- Triggers: Worker spawn from `src/lib/ai/inference.ts`.
- Responsibilities: Handle WebLLM worker protocol via `WebWorkerMLCEngineHandler`.

## Error Handling

**Strategy:** Typed application errors + `Result` wrappers in service boundaries, with UI fallback and toast notifications.

**Patterns:**
- Use `AppError` constructors and translators in `src/lib/utils/errors.ts` and return `Result` values via `ok/err` from `src/types/result.ts` (consumed heavily in `src/lib/storage/memory.ts`, `src/lib/ai/inference.ts`).
- Apply route/component error boundaries and user-visible fallback UI in `src/components/ErrorBoundary.tsx`, plus non-blocking toasts in `src/components/Chat/AIChatInterface.tsx` and route-level error states in `src/routes/ChatDetailRoute.tsx`.

## Cross-Cutting Concerns

**Logging:** Development-gated `console.info/warn/error` checks behind `import.meta.env.DEV` across services and stores, e.g. `src/lib/ai/inference.ts`, `src/lib/memory/extraction.ts`, `src/store/settingsStore.ts`.
**Validation:** Runtime normalization/parsing for imported conversations in `src/lib/storage/conversation-transfer.ts` and extraction payload parsing in `src/lib/memory/extraction.ts`; TypeScript strict mode configured in `tsconfig.json`.
**Authentication:** Not applicable for runtime auth; app is local-only and no request authentication layer is implemented in `src/`.

---

*Architecture analysis: 2026-02-23*
