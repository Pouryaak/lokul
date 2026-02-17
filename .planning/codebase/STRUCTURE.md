# Codebase Structure

**Analysis Date:** 2026-02-17

## Directory Layout

```
/Users/poak/Documents/personal-project/Lokul/
├── public/                     # Static assets
│   ├── lokul-logo.png          # App logo (PNG)
│   ├── spark-logo.svg          # App logo (SVG)
│   └── manifest.json           # PWA manifest
│
├── src/
│   ├── components/             # React components (by feature)
│   │   ├── Chat/               # Chat interface components
│   │   ├── Loading/            # Loading states
│   │   ├── ModelSelector/      # Model selection UI
│   │   ├── PerformancePanel/   # Performance metrics display
│   │   └── Sidebar/            # Navigation sidebar
│   │
│   ├── lib/                    # Core libraries (by domain)
│   │   ├── ai/                 # AI inference logic
│   │   ├── memory/             # Memory management
│   │   ├── perf/               # Performance monitoring
│   │   ├── pwa/                # PWA utilities
│   │   └── storage/            # IndexedDB operations
│   │
│   ├── hooks/                  # Custom React hooks
│   ├── store/                  # Zustand state stores
│   ├── styles/                 # Global styles
│   ├── workers/                # Web Workers
│   │   └── inference.worker.ts # AI inference worker
│   │
│   ├── App.tsx                 # Root application component
│   └── main.tsx                # Application entry point
│
├── .planning/codebase/         # Architecture documentation
│   ├── ARCHITECTURE.md         # This file
│   └── STRUCTURE.md            # Directory structure guide
│
├── .env.example                # Environment variables template
├── package.json                # Package manifest (minimal)
├── tailwind.config.ts          # Tailwind CSS configuration
└── vite.config.ts              # Vite build configuration
```

## Directory Purposes

**public/:**
- Purpose: Static assets served directly
- Contains: Images, logos, PWA manifest, HTML entry
- Key files: `manifest.json`, `spark-logo.svg`
- Generated: No
- Committed: Yes

**src/components/:**
- Purpose: React UI components organized by feature/domain
- Contains: Component directories with .tsx files
- Key files: Currently scaffolded with .gitkeep files
- Pattern: Directory per feature (e.g., `Chat/`, `Sidebar/`)

**src/lib/:**
- Purpose: Core business logic and service modules
- Contains: Domain-specific modules (ai, storage, memory, perf, pwa)
- Key files: Currently scaffolded with .gitkeep files
- Pattern: Directory per domain concern

**src/hooks/:**
- Purpose: Custom React hooks for shared logic
- Contains: Hook files (e.g., `useChat.ts`, `useModel.ts`)
- Key files: Currently scaffolded with .gitkeep

**src/store/:**
- Purpose: Zustand state management stores
- Contains: Store files (e.g., `chatStore.ts`, `modelStore.ts`)
- Key files: Currently scaffolded with .gitkeep

**src/workers/:**
- Purpose: Web Workers for background processing
- Contains: Worker scripts (inference, etc.)
- Key files: `inference.worker.ts`
- Pattern: One worker per CPU-intensive task

**src/styles/:**
- Purpose: Global styles and CSS configuration
- Contains: Global CSS, Tailwind directives
- Key files: Currently scaffolded with .gitkeep

## Key File Locations

**Entry Points:**
- `src/main.tsx`: React application bootstrap
- `src/App.tsx`: Root component tree
- `src/workers/inference.worker.ts`: AI worker thread entry

**Configuration:**
- `vite.config.ts`: Build tool configuration
- `tailwind.config.ts`: CSS framework configuration
- `package.json`: Dependencies and scripts
- `.env.example`: Environment variable template

**Core Logic (To Be Implemented):**
- `src/lib/ai/inference.ts`: AI orchestration
- `src/lib/ai/models.ts`: Model configurations
- `src/lib/ai/context-builder.ts`: Context management
- `src/lib/storage/db.ts`: Database schema
- `src/lib/storage/conversations.ts`: Conversation CRUD
- `src/lib/storage/memory.ts`: Memory CRUD
- `src/lib/memory/fact-extractor.ts`: Pattern extraction
- `src/lib/memory/context-manager.ts`: Memory integration
- `src/lib/perf/metrics.ts`: Performance tracking
- `src/lib/perf/gpu-detection.ts`: WebGPU checks

**State Management (To Be Implemented):**
- `src/store/chatStore.ts`: Chat state
- `src/store/modelStore.ts`: Model state
- `src/store/settingsStore.ts`: User settings
- `src/store/uiStore.ts`: UI state

**Custom Hooks (To Be Implemented):**
- `src/hooks/useChat.ts`: Chat operations
- `src/hooks/useModel.ts`: Model management
- `src/hooks/usePerformance.ts`: Performance monitoring
- `src/hooks/useMemory.ts`: Memory operations
- `src/hooks/useConversations.ts`: Conversation list
- `src/hooks/useSettings.ts`: Settings management

## Naming Conventions

**Files:**
- Components: PascalCase (e.g., `ChatInterface.tsx`, `MessageList.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useChat.ts`, `useModel.ts`)
- Utilities: camelCase (e.g., `token-counter.ts`, `validators.ts`)
- Stores: camelCase with `Store` suffix (e.g., `chatStore.ts`)
- Workers: kebab-case with `.worker.ts` suffix (e.g., `inference.worker.ts`)

**Directories:**
- kebab-case for multi-word names (e.g., `performance-panel/`, `model-selector/`)
- Singular form preferred (e.g., `component/`, `hook/`, not `components/`, `hooks/`)
- Exception: `components/`, `hooks/`, `lib/` are plural by convention

**Types:**
- Interfaces: PascalCase (e.g., `Message`, `Conversation`, `ModelConfig`)
- Type aliases: PascalCase (e.g., `MessageRole`, `ModelType`)
- Enums: PascalCase (e.g., `MessageStatus`, `DownloadState`)

## Where to Add New Code

**New Feature (e.g., Settings Panel):**
- Component: `src/components/settings/SettingsPanel.tsx`
- Hook: `src/hooks/useSettings.ts`
- Store: `src/store/settingsStore.ts`
- Types: `src/types/settings.ts`

**New AI Capability:**
- Core logic: `src/lib/ai/[capability].ts`
- Types: `src/types/ai.ts`
- Integration: Update `src/lib/ai/inference.ts`

**New Storage Entity:**
- Schema: Update `src/lib/storage/db.ts`
- CRUD: `src/lib/storage/[entity].ts`
- Types: `src/types/storage.ts`

**New UI Component:**
- Feature-specific: `src/components/[feature]/[Component].tsx`
- Shared/reusable: `src/components/ui/[Component].tsx`

**Utilities:**
- Shared helpers: `src/lib/utils/[name].ts`
- Feature-specific: `src/lib/[feature]/utils.ts`

## Special Directories

**.planning/codebase/:**
- Purpose: Architecture documentation and codebase analysis
- Contains: ARCHITECTURE.md, STRUCTURE.md
- Generated: No (manually maintained)
- Committed: Yes

**public/:**
- Purpose: Static assets not processed by build
- Contains: Logos, manifest, HTML
- Generated: No
- Committed: Yes

**node_modules/:**
- Purpose: Dependencies (not tracked)
- Generated: Yes (by npm/yarn)
- Committed: No (in .gitignore)

---

*Structure analysis: 2026-02-17*
