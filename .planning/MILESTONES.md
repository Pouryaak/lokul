# Milestones: Lokul

## v1.0 — Initial Release

**Completed:** 2026-02-23
**Phases:** 1-5 (including 2.1, 2.2)

### Shipped Features

**Core Infrastructure (Phase 1)**
- Type definitions and storage layer (Dexie)
- WebGPU detection with clear error messaging
- Web Worker for AI inference
- Model configurations (Quick/Smart/Genius)
- Landing page with 11-section marketing
- PWA/Service Worker with offline indicator
- Performance panel with health monitoring

**Chat Interface (Phase 2)**
- Streaming chat with ChatGPT-style UX
- Auto-resizing message input
- Markdown rendering with syntax highlighting
- Conversation sidebar with history
- Conversation persistence (IndexedDB)

**AI SDK UI Migration (Phase 2.1)**
- React Router (/chat, /chat/[id])
- AI SDK UI integration
- WebLLM as custom transport
- Collapsible sidebar with shadcn primitives

**Stabilization & Refactor (Phase 2.2)**
- Result<T,E> error handling infrastructure
- Debounced persistence with optimistic locking
- Abort signal propagation throughout stack
- Error boundary for crash recovery
- Request deduplication for model loading
- Clean architecture separation

**Model Management (Phase 3)**
- Conversation-scoped model switching
- Non-blocking downloads with progress
- Download manager UI with queue/cancel/retry
- Smart-default model strategy

**Memory System (Phase 4)**
- Three-tier memory (Core Facts + Daily Context + Recent Messages)
- Fact extraction via LLM
- Context window auto-management
- Auto-compaction at 80% threshold
- Memory Panel with edit/pin/clear

**Polish & PWA (Phase 5)**
- Responsive shell with mobile-first design
- Long-thread virtualization
- Import/Export (Markdown/JSON/Text)
- PWA install eligibility with first-successful-chat gate
- Compact header status indicator

### Metrics (Phase 5)

| Phase | Plans | Duration |
|-------|-------|----------|
| Phase 1 | 4 | ~3.5h |
| Phase 2 | 5 | ~2.5h |
| Phase 2.1 | 7 | ~2h |
| Phase 2.2 | 6 | ~3h |
| Phase 3 | 3 | ~0.5h |
| Phase 4 | 6 | ~0.5h |
| Phase 5 | 4 | ~0.5h |
| **Total** | **35** | **~12.5h** |

### Key Decisions

- 100% browser-based, no server components
- WebGPU over WebGL for AI inference
- Local-only storage (IndexedDB)
- Three model tiers (Quick/Smart/Genius)
- No user accounts (local-only by design)
- Open source (MIT)

---

## v1.1 — UI Polish + Search + Delete

**Status:** In Progress
**Started:** 2026-02-23

### Target Features

- Full-text search across all conversations
- Chat deletion via 3-dot menu with confirmation
- UI/UX polish (buttons, panels, colors, consistency)
- Keyboard shortcuts

---
*Last updated: 2026-02-23*
