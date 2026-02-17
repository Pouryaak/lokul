# Architecture

**Analysis Date:** 2026-02-17

## Pattern Overview

**Overall:** Layered Architecture with Clean Architecture principles

**Key Characteristics:**
- Strict separation of concerns across 4 distinct layers
- Unidirectional data flow (UI → Application → Service → Infrastructure)
- Web Workers for CPU-intensive AI operations
- Local-first storage with IndexedDB
- Privacy-by-architecture (no server-side processing)

## Layers

**React UI Layer:**
- Purpose: Render interface and handle user interactions
- Location: `src/components/`, `src/hooks/`
- Contains: React components, custom hooks, UI state
- Depends on: Application Layer (via hooks)
- Used by: Browser rendering engine

**Application Layer:**
- Purpose: Business logic orchestration and state management
- Location: `src/store/`, `src/hooks/`
- Contains: Zustand stores, business logic hooks, data transformation
- Depends on: Service Layer
- Used by: React UI Layer

**Service Layer:**
- Purpose: Core services for AI, storage, and performance
- Location: `src/lib/ai/`, `src/lib/storage/`, `src/lib/perf/`, `src/lib/pwa/`, `src/lib/memory/`
- Contains: AI inference management, database operations, performance monitoring, memory management
- Depends on: Infrastructure Layer
- Used by: Application Layer

**Infrastructure Layer:**
- Purpose: External system adapters and low-level APIs
- Location: `src/workers/`, browser APIs
- Contains: WebLLM integration, IndexedDB, WebGPU detection
- Depends on: External libraries (@mlc-ai/web-llm, Dexie)
- Used by: Service Layer

## Data Flow

**Chat Message Flow:**

1. User submits message via `src/components/chat/MessageInput.tsx`
2. `useChat` hook processes input and updates `chatStore`
3. `src/lib/ai/inference.ts` orchestrates AI request
4. `src/workers/inference.worker.ts` executes WebLLM in Web Worker
5. Streaming response chunks flow back up via postMessage
6. `chatStore` updates message state
7. `MessageList` component re-renders with new content

**State Management:**
- Global state: Zustand stores in `src/store/`
- Server state: Not applicable (local-first architecture)
- Form state: React useState in components
- URL state: Not currently used

## Key Abstractions

**InferenceManager:**
- Purpose: Manages AI model lifecycle and inference requests
- Examples: `src/lib/ai/inference.ts` (to be created)
- Pattern: Singleton with async methods

**Storage Service:**
- Purpose: Abstracts IndexedDB operations for conversations and memory
- Examples: `src/lib/storage/conversations.ts`, `src/lib/storage/memory.ts` (to be created)
- Pattern: Repository pattern with async CRUD operations

**Context Builder:**
- Purpose: Constructs context window for AI inference
- Examples: `src/lib/ai/context-builder.ts` (to be created)
- Pattern: Pure functions with token estimation

**Memory Manager:**
- Purpose: Extracts and manages user memory facts
- Examples: `src/lib/memory/fact-extractor.ts`, `src/lib/memory/context-manager.ts` (to be created)
- Pattern: Background processing with pattern matching

## Entry Points

**Main Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser page load
- Responsibilities: Mount React app, initialize stores, setup service worker

**Application Component:**
- Location: `src/App.tsx`
- Triggers: ReactDOM.render
- Responsibilities: Render root layout, setup providers, route-level components

**AI Worker Entry:**
- Location: `src/workers/inference.worker.ts`
- Triggers: Main thread instantiates Worker
- Responsibilities: Initialize WebLLM, handle inference requests, stream responses

**PWA Manifest:**
- Location: `public/manifest.json`
- Triggers: Browser install prompt
- Responsibilities: Define app metadata for standalone installation

## Error Handling

**Strategy:** Layer-specific error handling with user-friendly messages

**Patterns:**
- UI Layer: Error boundaries in components, toast notifications
- Application Layer: Store actions handle errors, update error state
- Service Layer: Try-catch with specific error types, logging in dev mode
- Infrastructure Layer: Worker error events, initialization fallbacks

**Error Types:**
- `InferenceError`: AI model failures, context length exceeded
- `StorageError`: IndexedDB quota exceeded, corruption
- `ValidationError`: User input validation
- `GPUError`: WebGPU not supported, initialization failed

## Cross-Cutting Concerns

**Logging:**
- Approach: Console-only in development, disabled in production
- Pattern: Conditional logging with `import.meta.env.DEV`

**Validation:**
- Approach: Input validation at layer boundaries
- Pattern: Zod schemas for complex inputs, simple checks for primitives

**Authentication:**
- Approach: Not applicable (privacy-first, no user accounts)
- Pattern: Local-only data with no server sync

**Performance Monitoring:**
- Approach: Built-in performance tracking
- Location: `src/lib/perf/metrics.ts` (to be created)
- Pattern: Metrics collection with optional reporting

---

*Architecture analysis: 2026-02-17*
