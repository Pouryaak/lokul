# Architecture Research: Browser-Based AI Systems

**Domain:** WebLLM/WebGPU AI Applications
**Researched:** 2026-02-17
**Confidence:** HIGH

---

## Standard Architecture

### System Overview

Browser-based AI systems follow a layered architecture that separates UI concerns from computation-heavy inference work. The architecture must handle WebGPU access, model caching, and non-blocking inference through Web Workers.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Chat UI    │  │ Model Select │  │   Settings   │  │  Performance │    │
│  │  Components  │  │   Component  │  │   Panel      │  │   Panel      │    │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │
│         │                 │                 │                 │             │
├─────────┴─────────────────┴─────────────────┴─────────────────┴─────────────┤
│                      APPLICATION LAYER (State Management)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     State Store (Zustand/Redux)                      │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Chat     │  │   Model    │  │  Settings  │  │    UI      │     │   │
│  │  │   State    │  │   State    │  │   State    │  │   State    │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│         │                 │                 │                 │             │
├─────────┴─────────────────┴─────────────────┴─────────────────┴─────────────┤
│                         SERVICE LAYER                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐ │
│  │   AI/Inference      │  │      Storage        │  │    Performance      │ │
│  │     Service         │  │     Service         │  │     Service         │ │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │ │
│  │  │   Inference   │  │  │  │  Conversation │  │  │  │   GPU Check   │  │ │
│  │  │   Manager     │  │  │  │    Store      │  │  │  │   Metrics     │  │ │
│  │  └───────────────┘  │  │  └───────────────┘  │  │  └───────────────┘  │ │
│  │  ┌───────────────┐  │  │  ┌───────────────┐  │  │  ┌───────────────┐  │ │
│  │  │  Context      │  │  │  │    Memory     │  │  │  │    Memory     │  │ │
│  │  │  Builder      │  │  │  │    Store      │  │  │  │   Monitor     │  │ │
│  │  └───────────────┘  │  │  └───────────────┘  │  │  └───────────────┘  │ │
│  └──────────┬──────────┘  └──────────┬──────────┘  └──────────┬──────────┘ │
│             │                        │                        │             │
├─────────────┴────────────────────────┴────────────────────────┴─────────────┤
│                      INFRASTRUCTURE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────┐  ┌─────────────────────────┐                    │
│  │      Web Worker         │  │      IndexedDB          │                    │
│  │   (AI Inference)        │  │   (Persistent Storage)  │                    │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │                    │
│  │  │  MLCEngine      │    │  │  │  Conversations  │    │                    │
│  │  │  (WebLLM)       │    │  │  │  Object Store   │    │                    │
│  │  └─────────────────┘    │  │  └─────────────────┘    │                    │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │                    │
│  │  │  WebGPU Device  │    │  │  │  Memory Facts   │    │                    │
│  │  │  (GPU Access)   │    │  │  │  Object Store   │    │                    │
│  │  └─────────────────┘    │  │  └─────────────────┘    │                    │
│  └─────────────────────────┘  └─────────────────────────┘                    │
│                                                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐                    │
│  │    Service Worker       │  │      Cache API          │                    │
│  │   (PWA/Offline)         │  │   (Model Caching)       │                    │
│  │  ┌─────────────────┐    │  │  ┌─────────────────┐    │                    │
│  │  │  Static Assets  │    │  │  │  Model Weights  │    │                    │
│  │  │  Cache Strategy │    │  │  │  Cache Storage  │    │                    │
│  │  └─────────────────┘    │  │  └─────────────────┘    │                    │
│  └─────────────────────────┘  └─────────────────────────┘                    │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **Chat UI Components** | Render messages, input, streaming text | React components with virtualization |
| **Model Selector** | Display available models, download progress | Dropdown with progress indicators |
| **State Store** | Centralized application state | Zustand or Redux Toolkit |
| **Inference Manager** | Orchestrate AI requests, handle streaming | Service class with async generators |
| **Context Builder** | Assemble conversation context for LLM | Token-aware context window management |
| **Conversation Store** | CRUD operations for chat history | Dexie.js wrapper around IndexedDB |
| **Memory Store** | User facts, preferences extraction | IndexedDB with indexing on keys |
| **Web Worker** | Run ML inference off main thread | Dedicated Worker with MLCEngine |
| **Service Worker** | Enable offline/PWA capabilities | Cache-first strategy for assets |

---

## Recommended Project Structure

```
src/
├── components/                 # React UI components
│   ├── chat/                   # Chat-specific components
│   │   ├── ChatInterface.tsx   # Main chat container
│   │   ├── MessageList.tsx     # Virtualized message list
│   │   ├── Message.tsx         # Single message display
│   │   ├── MessageInput.tsx    # Auto-resizing input
│   │   └── StreamingMessage.tsx # Streaming indicator
│   │
│   ├── model/                  # Model management UI
│   │   ├── ModelSelector.tsx   # Model dropdown
│   │   ├── ModelCard.tsx       # Model info display
│   │   └── DownloadProgress.tsx # Download UI
│   │
│   ├── performance/            # Performance monitoring UI
│   │   ├── PerformancePanel.tsx
│   │   └── StatusIndicator.tsx
│   │
│   ├── sidebar/                # Navigation sidebar
│   │   ├── Sidebar.tsx
│   │   ├── ConversationList.tsx
│   │   └── ConversationItem.tsx
│   │
│   ├── memory/                 # Memory management UI
│   │   ├── MemoryPanel.tsx
│   │   └── FactItem.tsx
│   │
│   ├── settings/               # Settings UI
│   │   ├── SettingsPanel.tsx
│   │   └── SettingsSection.tsx
│   │
│   └── ui/                     # Reusable UI primitives
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ... (shadcn/ui)
│
├── lib/                        # Core business logic
│   ├── ai/                     # AI/inference layer
│   │   ├── worker.ts           # Web Worker setup
│   │   ├── models.ts           # Model configurations
│   │   ├── inference.ts        # Inference orchestration
│   │   └── context-builder.ts  # Context window management
│   │
│   ├── storage/                # Data persistence
│   │   ├── db.ts               # Dexie schema & migrations
│   │   ├── conversations.ts    # Conversation CRUD
│   │   ├── memory.ts           # Memory CRUD
│   │   └── settings.ts         # Settings persistence
│   │
│   ├── memory/                 # Memory system
│   │   ├── fact-extractor.ts   # Pattern-based extraction
│   │   ├── context-manager.ts  # Memory context building
│   │   └── compaction.ts       # Auto-compaction logic
│   │
│   ├── performance/            # Performance monitoring
│   │   ├── metrics.ts          # Performance tracking
│   │   ├── gpu-detection.ts    # WebGPU capability check
│   │   └── memory-monitor.ts   # Memory usage tracking
│   │
│   └── utils/                  # Utility functions
│       ├── markdown.ts         # Markdown processing
│       ├── token-counter.ts    # Token estimation
│       └── validators.ts       # Input validation
│
├── hooks/                      # Custom React hooks
│   ├── useChat.ts              # Chat state & operations
│   ├── useModel.ts             # Model management
│   ├── usePerformance.ts       # Performance monitoring
│   ├── useMemory.ts            # Memory operations
│   ├── useConversations.ts     # Conversation list
│   └── useSettings.ts          # Settings state
│
├── store/                      # Zustand stores
│   ├── chatStore.ts
│   ├── modelStore.ts
│   ├── settingsStore.ts
│   └── uiStore.ts
│
├── workers/                    # Web Workers
│   └── inference.worker.ts     # AI inference worker
│
├── types/                      # TypeScript types
│   ├── chat.ts
│   ├── model.ts
│   ├── memory.ts
│   └── storage.ts
│
├── styles/
│   └── globals.css             # Global styles + Tailwind
│
├── App.tsx                     # Main app component
└── main.tsx                    # Entry point
```

### Structure Rationale

- **components/**: Organized by feature domain (chat, model, settings) rather than type. Each folder contains related components for a specific user-facing feature.
- **lib/**: Business logic separated from UI. Each subfolder represents a service domain (ai, storage, memory, performance).
- **hooks/**: Custom hooks that compose store access and service calls, keeping components clean.
- **store/**: Zustand stores for global state, split by domain to prevent unnecessary re-renders.
- **workers/**: Web Workers must be in separate files for bundler processing.
- **types/**: Centralized type definitions shared across the application.

---

## Architectural Patterns

### Pattern 1: Web Worker Offloading

**What:** Run all AI inference in a dedicated Web Worker to prevent UI blocking during model loading and generation.

**When to use:** Always for WebLLM applications. The main thread must remain responsive for user interactions.

**Trade-offs:**
- **Pros:** Non-blocking UI, better perceived performance, can terminate long-running inference
- **Cons:** Message passing overhead, more complex debugging, need to serialize data

**Example:**
```typescript
// workers/inference.worker.ts
import { WebWorkerMLCEngineHandler } from "@mlc-ai/web-llm";

const handler = new WebWorkerMLCEngineHandler();
self.onmessage = (msg: MessageEvent) => {
  handler.onmessage(msg);
};

// lib/ai/inference.ts (main thread)
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";

export class InferenceManager {
  private engine: MLCEngineInterface | null = null;

  async initialize(modelId: string) {
    const worker = new Worker(
      new URL("../workers/inference.worker.ts", import.meta.url),
      { type: "module" }
    );

    this.engine = await CreateWebWorkerMLCEngine(worker, modelId, {
      initProgressCallback: (report) => {
        // Update UI with download progress
        console.log(`Loading: ${report.progress}%`);
      }
    });
  }

  async *generate(messages: ChatMessage[]): AsyncGenerator<string> {
    if (!this.engine) throw new Error("Engine not initialized");

    const stream = await this.engine.chat.completions.create({
      messages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      yield chunk.choices[0]?.delta?.content || "";
    }
  }
}
```

### Pattern 2: Service Layer Abstraction

**What:** Abstract WebLLM behind a service interface that the UI layer interacts with, rather than calling WebLLM directly from components.

**When to use:** When you need to swap inference backends, add logging, or implement retry logic.

**Trade-offs:**
- **Pros:** Easier testing, backend flexibility, centralized error handling
- **Cons:** Additional abstraction layer, potential for over-engineering

**Example:**
```typescript
// lib/ai/inference.ts
export interface InferenceService {
  initialize(modelId: string): Promise<void>;
  generate(messages: ChatMessage[]): AsyncGenerator<string>;
  abort(): void;
  getLoadedModel(): string | null;
}

export class WebLLMInferenceService implements InferenceService {
  // Implementation details hidden from UI
}
```

### Pattern 3: IndexedDB with Dexie.js

**What:** Use Dexie.js as a wrapper around IndexedDB for type-safe, promise-based storage operations.

**When to use:** For all persistent storage needs (conversations, memory, settings).

**Trade-offs:**
- **Pros:** Much cleaner API than raw IndexedDB, TypeScript support, migrations support
- **Cons:** Additional dependency, slightly larger bundle size

**Example:**
```typescript
// lib/storage/db.ts
import Dexie, { Table } from "dexie";

export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export class LokulDatabase extends Dexie {
  conversations!: Table<Conversation, string>;
  memory!: Table<MemoryFact, string>;

  constructor() {
    super("LokulDB");
    this.version(1).stores({
      conversations: "id, createdAt, updatedAt",
      memory: "id, key",
    });
  }
}

export const db = new LokulDatabase();
```

### Pattern 4: Zustand Store with Slices

**What:** Split global state into domain-specific stores (chat, model, settings) rather than one large store.

**When to use:** For medium to large applications where different features have independent state.

**Trade-offs:**
- **Pros:** Prevents unnecessary re-renders, clearer separation of concerns
- **Cons:** Potential for cross-store synchronization issues

**Example:**
```typescript
// store/chatStore.ts
import { create } from "zustand";

interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  addMessage: (message: Message) => void;
  setStreaming: (streaming: boolean) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isStreaming: false,
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
  setStreaming: (streaming) => set({ isStreaming: streaming }),
}));
```

### Pattern 5: Streaming with Async Generators

**What:** Use JavaScript async generators to stream LLM responses token-by-token to the UI.

**When to use:** Always for chat interfaces to provide immediate feedback to users.

**Trade-offs:**
- **Pros:** Immediate visual feedback, cancellable mid-generation
- **Cons:** More complex state management for partial messages

**Example:**
```typescript
// hooks/useChat.ts
export function useChat() {
  const [streamingContent, setStreamingContent] = useState("");
  const inference = useInferenceService();

  const sendMessage = async (content: string) => {
    setStreamingContent("");

    const stream = inference.generate([{ role: "user", content }]);

    for await (const token of stream) {
      setStreamingContent((prev) => prev + token);
    }

    // Finalize message once complete
    addMessage({ role: "assistant", content: streamingContent });
    setStreamingContent("");
  };

  return { sendMessage, streamingContent };
}
```

---

## Data Flow

### Request Flow (User Message to AI Response)

```
User Input
    ↓
MessageInput Component → Input Validation
    ↓
useChat Hook → Adds user message to store
    ↓
Inference Service → Context Builder assembles prompt
    ↓
Web Worker → MLCEngine processes generation
    ↓
WebGPU → Hardware-accelerated inference
    ↓
Streaming Response ← Async generator yields tokens
    ↓
MessageList Component ← UI updates with each token
    ↓
IndexedDB ← Conversation persisted
```

### State Management Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Zustand Store                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │ Chat Store  │  │ Model Store │  │  UI Store   │          │
│  │             │  │             │  │             │          │
│  │ - messages  │  │ - current   │  │ - sidebar   │          │
│  │ - isLoading │  │ - available │  │   open      │          │
│  │ - error     │  │ - loading   │  │ - theme     │          │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘          │
└─────────┼────────────────┼────────────────┼─────────────────┘
          │                │                │
          ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    React Components                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Chat UI    │  │   Model     │  │  Sidebar    │          │
│  │             │  │  Selector   │  │             │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
└─────────────────────────────────────────────────────────────┘
          │                │                │
          └────────────────┴────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │  User Actions   │
                  └─────────────────┘
```

### Key Data Flows

1. **Message Flow:** User types → Input validated → Added to chat store → Sent to inference service → Streamed response → UI updates → Persisted to IndexedDB

2. **Model Loading Flow:** User selects model → Model store updates → Download initiated (cached in IndexedDB/Cache API) → Web Worker initialized with model → Ready state updated

3. **Memory Extraction Flow:** Assistant response complete → Fact extractor parses content → Memory facts extracted → Stored in memory table → Available for future context building

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **Single User** | All-in-one approach is fine. IndexedDB handles storage. Web Worker manages inference. |
| **Multiple Conversations** | Implement conversation list with lazy loading. Virtualize message lists for performance. |
| **Large Context Windows** | Implement context trimming strategies. Consider memory compaction for long-running conversations. |
| **Multiple Models** | Model switching requires unloading/loading. Cache frequently used models. Track VRAM usage. |

### Scaling Priorities

1. **First bottleneck: Message list rendering**
   - **Problem:** Long conversations cause UI lag
   - **Fix:** Implement virtualization with `react-virtuoso` or similar

2. **Second bottleneck: Context window size**
   - **Problem:** Large contexts slow down inference
   - **Fix:** Implement sliding window context management, summarize older messages

3. **Third bottleneck: Model cache size**
   - **Problem:** Multiple large models exceed storage quota
   - **Fix:** LRU cache eviction, user-controlled model management

---

## Anti-Patterns

### Anti-Pattern 1: Main Thread Inference

**What people do:** Run MLCEngine directly in the main thread without a Web Worker.

**Why it's wrong:** Model loading and inference block the UI thread, causing the browser to freeze and display "page unresponsive" warnings.

**Do this instead:** Always use `CreateWebWorkerMLCEngine` or `CreateServiceWorkerMLCEngine` to offload computation.

### Anti-Pattern 2: Synchronous Storage Operations

**What people do:** Use localStorage for conversation history or block on IndexedDB operations.

**Why it's wrong:** localStorage is synchronous and blocks the main thread. IndexedDB operations should always be async.

**Do this instead:** Use Dexie.js for promise-based IndexedDB operations. Save conversations asynchronously without blocking UI.

### Anti-Pattern 3: Storing Full Message History in State

**What people do:** Load entire conversation history into Zustand/Redux store on app start.

**Why it's wrong:** Causes slow initial load and excessive memory usage. All components re-render when any message changes.

**Do this instead:** Load conversation metadata for the list. Fetch message content lazily when a conversation is opened.

### Anti-Pattern 4: Ignoring WebGPU Feature Detection

**What people do:** Assume WebGPU is available and proceed with initialization.

**Why it's wrong:** WebGPU is not universally supported (Safari, older browsers). Uncaught errors break the application.

**Do this instead:** Always check `navigator.gpu` availability and provide graceful fallback or clear error messaging.

### Anti-Pattern 5: Blocking on Model Download

**What people do:** Wait for full model download before showing any UI.

**Why it's wrong:** Large models (4GB+) take significant time to download. Users see blank screen or loading spinner for minutes.

**Do this instead:** Show download progress immediately. Allow browsing existing conversations while downloading. Cache models for subsequent loads.

---

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| **HuggingFace** | Direct model download | Models downloaded from HuggingFace repos. CORS must be configured. |
| **WebLLM Prebuilt** | CDN or bundled | Use `prebuiltAppConfig` for official models. |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Main Thread ↔ Web Worker** | Message passing | Structured clone algorithm for data. No shared memory. |
| **UI Layer ↔ Service Layer** | Function calls | Services are singletons imported where needed. |
| **Service Layer ↔ Storage** | Async/await | Dexie.js provides promise-based API. |
| **App ↔ Service Worker** | PostMessage | For PWA features and model persistence. |

---

## Build Order Implications

Based on component dependencies, the recommended build order is:

1. **Infrastructure Layer First**
   - Set up TypeScript types (`types/`)
   - Initialize storage layer (`lib/storage/db.ts`)
   - Create Web Worker scaffold (`workers/inference.worker.ts`)

2. **Service Layer Second**
   - Implement inference service (`lib/ai/inference.ts`)
   - Build context builder (`lib/ai/context-builder.ts`)
   - Create storage services (`lib/storage/conversations.ts`, `lib/storage/memory.ts`)

3. **State Management Third**
   - Set up Zustand stores (`store/`)
   - Create custom hooks (`hooks/`)

4. **UI Components Last**
   - Build UI primitives (`components/ui/`)
   - Implement feature components (`components/chat/`, `components/model/`)
   - Assemble main app (`App.tsx`)

**Critical Path:** Types → Storage → Worker → Inference Service → Chat Store → Chat UI

---

## Sources

- [WebLLM Documentation](https://webllm.mlc.ai/docs/) — Official WebLLM docs
- [WebLLM GitHub — Advanced Usage](https://github.com/mlc-ai/web-llm/blob/main/docs/user/advanced_usage.md) — Worker patterns, caching
- [MDN — Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API) — Worker architecture
- [MDN — Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API) — PWA/offline patterns
- [MDN — WebGPU API](https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API) — GPU compute architecture
- [MDN — IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API) — Client-side storage
- [Dexie.js Documentation](https://dexie.org/) — IndexedDB wrapper patterns
- [Zustand Documentation](https://github.com/pmndrs/zustand) — State management patterns

---

*Architecture research for: Lokul — Privacy-first browser-based AI chat*
*Researched: 2026-02-17*
