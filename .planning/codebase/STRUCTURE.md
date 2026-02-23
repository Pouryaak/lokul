# Codebase Structure

**Analysis Date:** 2026-02-23

## Directory Layout

```text
Lokul/
├── public/                     # Static PWA/public assets (logo, manifest)
├── src/                        # Application source (UI, hooks, stores, services, worker)
│   ├── components/             # Route-facing and reusable React components
│   ├── hooks/                  # Application orchestration hooks
│   ├── lib/                    # Domain/infrastructure services (AI, memory, storage, perf)
│   ├── routes/                 # Route-level containers
│   ├── store/                  # Zustand state stores
│   ├── styles/                 # Global CSS and tokens
│   ├── types/                  # Shared domain and runtime type definitions
│   ├── workers/                # Web Worker entrypoints
│   ├── App.tsx                 # Router tree and app bootstrap orchestration
│   └── main.tsx                # React mount entrypoint
├── .planning/                  # GSD planning artifacts and generated codebase docs
├── .claude/                    # Local agent tooling and scripts
├── dist/                       # Production build output (generated)
├── dev-dist/                   # Development distribution artifacts (generated)
├── package.json                # Scripts and dependency manifest
├── tsconfig.json               # TypeScript compiler and path alias config
├── vite.config.ts              # Build/dev server and PWA plugin config
├── eslint.config.js            # Lint rules and architecture checks
└── index.html                  # Browser HTML shell
```

## Directory Purposes

**`src/components/`:**
- Purpose: Keep renderable UI components and feature-specific view composition.
- Contains: Chat surfaces (`src/components/Chat/*.tsx`), shell/sidebar (`src/components/chat-layout/*.tsx`), onboarding (`src/components/onboarding/*.tsx`), memory/model/perf widgets, and shared primitives in `src/components/ui/*.tsx`.
- Key files: `src/components/Chat/AIChatInterface.tsx`, `src/components/chat-layout/ChatLayout.tsx`, `src/components/chat-layout/AppSidebar.tsx`, `src/components/ui/sidebar.tsx`.

**`src/hooks/`:**
- Purpose: Encapsulate side effects and orchestration used by UI.
- Contains: Chat transport/persistence hook (`src/hooks/useAIChat.ts`, `src/hooks/use-ai-chat-persistence.ts`), memory extraction/CRUD hooks (`src/hooks/useMemoryExtraction.ts`, `src/hooks/useMemory.ts`), and list/query hooks (`src/hooks/useConversations.ts`).
- Key files: `src/hooks/useAIChat.ts`, `src/hooks/use-ai-chat-persistence.ts`, `src/hooks/useMemory.ts`.

**`src/store/`:**
- Purpose: Manage shared reactive state with Zustand.
- Contains: Model loading state (`src/store/modelStore.ts`), conversation-scoped model queue/lifecycle (`src/store/conversationModelStore.ts`), settings state (`src/store/settingsStore.ts`), memory panel UI state (`src/store/memoryStore.ts`).
- Key files: `src/store/conversationModelStore.ts`, `src/store/modelStore.ts`, `src/store/settingsStore.ts`.

**`src/lib/`:**
- Purpose: Host non-UI service code and core business logic.
- Contains: AI runtime services in `src/lib/ai/`, memory processing in `src/lib/memory/`, storage in `src/lib/storage/`, metrics/detection in `src/lib/performance/`, and utilities in `src/lib/utils/`.
- Key files: `src/lib/ai/webllm-transport.ts`, `src/lib/ai/model-engine.ts`, `src/lib/storage/conversations.ts`, `src/lib/storage/db.ts`, `src/lib/memory/extraction.ts`.

**`src/routes/`:**
- Purpose: Keep route boundary components that assemble page-level dependencies.
- Contains: Root wrapper and chat routes.
- Key files: `src/routes/RootLayout.tsx`, `src/routes/ChatRoute.tsx`, `src/routes/ChatDetailRoute.tsx`.

**`src/types/`:**
- Purpose: Centralize domain contracts and shared type helpers.
- Contains: Core app types and environment declarations.
- Key files: `src/types/index.ts`, `src/types/result.ts`, `src/types/pwa.ts`.

## Key File Locations

**Entry Points:**
- `index.html`: Browser shell and module script include for `src/main.tsx`.
- `src/main.tsx`: React root mount and global stylesheet imports.
- `src/App.tsx`: Router declaration, settings/model bootstrap, app-level wrappers.
- `src/workers/inference.worker.ts`: WebLLM worker runtime entry for inference requests.

**Configuration:**
- `package.json`: NPM scripts, runtime dependencies, dev tooling dependencies.
- `vite.config.ts`: React plugin, Tailwind plugin, PWA plugin, alias setup (`@` -> `/src`), worker format.
- `tsconfig.json`: Strict TS options and path mapping (`@/*` -> `src/*`).
- `eslint.config.js`: Lint config and architecture check scope (`src/{hooks,lib/ai,routes,store}`).
- `components.json`: Shadcn config, alias map, and UI registry settings.

**Core Logic:**
- `src/lib/ai/`: Model definitions, loading engine, transport adapter, and inference manager.
- `src/lib/memory/`: Memory extraction, compaction, context building, and eviction.
- `src/lib/storage/`: IndexedDB schema, conversation CRUD/versioning, settings, memory persistence, import/export.
- `src/store/`: Global state coordination and model queue state.

**Testing:**
- `src/lib/storage/conversation-transfer.test.ts`: Conversation import/export coverage.
- `src/lib/memory/extraction.test.ts`: Memory extraction parsing and behavior coverage.
- `src/store/modelStore.test.ts`: Store behavior and model lifecycle tests.
- `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`: Chat layout mobile regression coverage.

## Naming Conventions

**Files:**
- Feature and route components use PascalCase filenames in several areas (for example `src/components/Chat/AIChatInterface.tsx`, `src/routes/ChatDetailRoute.tsx`).
- Hooks use `use`-prefixed camelCase filenames (`src/hooks/useAIChat.ts`, `src/hooks/useConversations.ts`, `src/hooks/use-ai-chat-persistence.ts`).
- Service and utility modules are primarily lowercase or kebab-case (`src/lib/ai/webllm-transport.ts`, `src/lib/storage/conversations.ts`, `src/lib/utils/errors.ts`).

**Directories:**
- Domain-oriented folders are lowercase (`src/hooks`, `src/lib`, `src/routes`, `src/store`).
- Component subfolders are mixed by feature history (`src/components/Chat`, `src/components/chat-layout`, `src/components/Sidebar`, `src/components/sidebar-02`); place new files in the existing feature folder that owns the UI surface.

## Where to Add New Code

**New Feature:**
- Primary code: Route container in `src/routes/` and feature UI in `src/components/<feature>/`.
- Tests: Add `<feature>.test.ts` or `<feature>.test.tsx` adjacent to implementation under `src/`.

**New Component/Module:**
- Implementation: Put composable UI in `src/components/`; if it is a design primitive, place it in `src/components/ui/`.

**Utilities:**
- Shared helpers: Put generic utilities in `src/lib/utils/`; put domain helpers in domain folders such as `src/lib/storage/`, `src/lib/memory/`, or `src/lib/ai/`.

## Special Directories

**`.planning/`:**
- Purpose: Planning state, phase artifacts, and generated mapping docs.
- Generated: Yes.
- Committed: Yes.

**`dist/`:**
- Purpose: Vite production build output.
- Generated: Yes.
- Committed: No.

**`dev-dist/`:**
- Purpose: Alternate development distribution output.
- Generated: Yes.
- Committed: No.

**`node_modules/`:**
- Purpose: Installed package dependencies.
- Generated: Yes.
- Committed: No.

---

*Structure analysis: 2026-02-23*
