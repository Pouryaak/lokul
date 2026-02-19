# State: Lokul

**Project:** Privacy-first AI chat that runs 100% in the browser using WebGPU
**Status:** In progress
**Updated:** 2026-02-19 (12:10 UTC)

---

## Project Reference

**Core Value:** Privacy by architecture, not by promise — Users can verify with their own eyes (DevTools Network tab) that conversations never leave their device

**Target Users:**
1. Privacy-Conscious Professionals (developers, writers, researchers)
2. Offline Workers (students, travelers, remote workers)
3. Open Source Enthusiasts (GitHub, HN, Reddit community)

**Success Metrics:**
- 10,000+ GitHub stars in first 6 months
- 70%+ first message completion rate
- < 30 seconds first load (Quick Mode)
- < 3 seconds average response time
- < 5% crash rate

---

## Current Position

**Phase:** Phase 4 - Memory System
**Plan:** 04-06 complete (6/6 plans complete)
**Status:** PHASE 4 COMPLETE - memory clear/undo reliability and first-click undo interaction fixes delivered

**Progress:**

[████████░░] 83%
[====================] 100% (Phase 4 complete)

**Phases:**
- [x] Phase 1: Core Infrastructure (4/4 plans complete)
  - [x] 01-01: Type definitions, storage, GPU detection
  - [x] 01-02: Web Worker, AI inference, model store
  - [x] 01-03: 11-section landing page
  - [x] 01-04: PWA, offline, performance panel
- [x] Phase 2: Chat Interface (5/5 plans complete)
  - [x] 02-01: Chat state management, storage, hooks
  - [x] 02-02: Chat UI components (MessageInput, MessageBubble, MessageList, etc)
  - [x] 02-03: Markdown rendering and ChatInterface integration
  - [x] 02-04: Conversation sidebar with performance monitoring
  - [x] 02-05: Fix model download failure (gap closure)
- [x] Phase 2.1: AI SDK UI Migration with Routing (7/7 plans complete)
  - [x] 02.1-01: AI SDK UI transport layer (WebLLMTransport, useAIChat)
  - [x] 02.1-02: Chat layout infrastructure (sidebar, ChatLayout)
  - [x] 02.1-03: React Router configuration (/chat, /chat/[id])
  - [x] 02.1-04: AI SDK UI integration with routed chat interface
  - [x] 02.1-05: Message actions, conversation clearing, welcome screen
  - [x] 02.1-06: Integration testing and verification
  - [x] 02.1-07: Performance integration (StatusIndicator, PerformancePanel, model selector)
- [x] Phase 2.2: Stabilization & Refactor (6/6 plans complete)
- [x] Phase 3: Model Management (3/3 plans complete)
- [x] Phase 4: Memory System (6/6 plans complete)
- [ ] Phase 5: Polish & PWA

---

## Performance Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| First load time | < 30s | N/A | Not started |
| First message time | < 60s | N/A | Not started |
| Response time | < 3s | N/A | Not started |
| Crash rate | < 5% | N/A | Not started |
| Phase 02.1-ai-sdk-ui-migration-with-routing P02.1-06 | 3m | 3 tasks | 3 files |
| Phase 02.2 P01 | 1 min | 3 tasks | 4 files |
| Phase 02.2 P02 | 3 min | 4 tasks | 8 files |
| Phase 02.2 P03 | 2 min | 3 tasks | 5 files |
| Phase 02.2 P04 | 4 min | 4 tasks | 4 files |
| Phase 02.2 P06 | 2 min | 5 tasks | 4 files |
| Phase 02.2 P05 | 3 min | 6 tasks | 5 files |
| Phase 02.2 P10 | 5m | 3 tasks | 7 files |
| Phase 02.2 P11 | 7m | 3 tasks | 6 files |
| Phase 03-model-management P01 | 7m | 2 tasks | 7 files |
| Phase 03-model-management P02 | 9m | 2 tasks | 5 files |
| Phase 03-model-management P03 | 16m | 3 tasks | 6 files |
| Phase 04-memory-system P01 | 4 min | 3 tasks | 7 files |
| Phase 04-memory-system P02 | 4 min | 4 tasks | 6 files |
| Phase 04-memory-system P03 | 6 min | 5 tasks | 7 files |
| Phase 04-memory-system P04 | 3 min | 3 tasks | 5 files |
| Phase 04-memory-system P05 | 2 min | 3 tasks | 4 files |
| Phase 04-memory-system P06 | 2 min | 2 tasks | 2 files |

### Plan Execution Metrics

| Plan | Duration | Tasks | Files | Completed |
|------|----------|-------|-------|-----------|
| 01-01 | 67 min | 4 | 6 | 2026-02-17 |
| 01-02 | 25 min | 4 | 4 | 2026-02-17 |
| 01-03 | 90 min | 14 | 15 | 2026-02-17 |
| 01-04 | 35 min | 5 | 5 | 2026-02-17 |
| 02-01 | 35 min | 3 | 4 | 2026-02-18 |
| 02-02 | 45 min | 3 | 8 | 2026-02-18 |
| 02-03 | 35 min | 3 | 5 | 2026-02-18 |
| 02-04 | 35 min | 4 | 6 | 2026-02-18 |
| 02-05 | 15 min | 3 | 3 | 2026-02-18 |
| 02.1-01 | 15 min | 3 | 3 | 2026-02-18 |
| 02.1-02 | 25 min | 3 | 11 | 2026-02-18 |
| 02.1-03 | 20 min | 3 | 6 | 2026-02-18 |
| 02.1-04 | 10 min | 3 | 30+ | 2026-02-18 |
| 02.1-05 | 25 min | 3 | 3 | 2026-02-18 |
| 02.1-06 | 20 min | 3 | 4 | 2026-02-18 |
| 02.1-07 | 3 min | 3 | 5 | 2026-02-18 |
| 04-02 | 4 min | 4 | 6 | 2026-02-19 |
| 04-03 | 6 min | 5 | 7 | 2026-02-19 |
| 04-04 | 3 min | 3 | 5 | 2026-02-19 |
| 04-05 | 2 min | 3 | 4 | 2026-02-19 |
| 04-06 | 2 min | 2 | 2 | 2026-02-19 |

---

## Accumulated Context

### Decisions Made

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-17 | 5-phase roadmap structure | Standard depth, natural delivery boundaries from requirements |
| 2026-02-17 | Phase 1 = Infrastructure first | Web Worker architecture must be established early; refactoring later is expensive |
| 2026-02-17 | Phase 4 = Memory before Polish | Memory system is core differentiator; polish can come after |
| 2026-02-17 | Use WebLLM's WebWorkerMLCEngineHandler | Reduces complexity, follows library best practices |
| 2026-02-17 | Adapt DownloadProgress to WebLLM's InitProgressReport | WebLLM uses progress (0-1), timeElapsed, text instead of loaded/total |
| 2026-02-17 | Export selector hooks from modelStore | Prevents unnecessary component re-renders |
| 2026-02-17 | Landing page as 11-section marketing page | Full conversion funnel from home_page.md design |
| 2026-02-17 | Use shadcn/ui patterns with CVA for variants | Consistent, composable component API |
| 2026-02-17 | StatusIndicator fixed bottom-left | Always visible without interfering with content |
| 2026-02-17 | PerformancePanel toggleable from top-right | Available when needed, hidden by default |
| 2026-02-18 | Use crypto.randomUUID() for IDs | Standard, cryptographically secure ID generation |
| 2026-02-18 | Auto-generate conversation titles from first message | User-friendly, reduces manual title entry |
| 2026-02-18 | Export selector hooks from chatStore | Prevents unnecessary re-renders in components |
| 2026-02-18 | Custom chat components vs pre-built libraries | Libraries not installed; custom components follow design language |
| 2026-02-18 | Use react-markdown for AI message rendering | Full markdown support with XSS-safe rendering |
| 2026-02-18 | Implement CodeBlock with react-syntax-highlighter | Provides syntax highlighting without additional dependencies |
| 2026-02-18 | Custom sidebar implementation (blocks.so/sidebar not available) | blocks.so/sidebar is a design reference, not an npm package |
| 2026-02-18 | Memory warning threshold at 75% | Balances early warning with avoiding excessive alerts |
| 2026-02-18 | Performance suggestion after 3 consecutive low TPS readings | Prevents false positives from single slow responses |
| 2026-02-18 | Model IDs must include -MLC suffix | WebLLM v0.2.80 requires -MLC suffix for prebuilt model IDs to download correctly |
| 2026-02-18 | Use ChatTransport interface for WebLLM integration | Standard AI SDK UI pattern for custom transports |
| 2026-02-18 | Yield text-start, text-delta, text-end chunks | Required for proper streaming UI updates in AI SDK UI |
| 2026-02-18 | Use shadcn sidebar primitives for chat layout | Provides collapsible sidebar with built-in state management |
| 2026-02-18 | Add asChild support to Button component | Required for shadcn sidebar composition patterns |
| 2026-02-18 | Consolidate Button.tsx casing (capital B) | Resolves TypeScript file casing conflict |
| 2026-02-18 | Use BrowserRouter for client-side routing | Enables URL-based navigation and deep linking |
| 2026-02-18 | Auto-create conversation at /chat | User gets fresh conversation without extra clicks |
| 2026-02-18 | Use sonner for toast notifications | Lightweight, modern toast library with rich colors |
| 2026-02-18 | Add MessageAvatar to ai-elements | Required for consistent avatar display in AI SDK UI patterns |
| 2026-02-18 | Use native confirm() for destructive actions | Simple, consistent browser behavior for clear conversation |
| 2026-02-18 | Privacy-focused suggested prompts | Align welcome screen with Lokul's core privacy value |
| 2026-02-18 | Performance components in ChatLayout | Better component composition, layout owns its UI |
| 2026-02-18 | Token tracking in metrics module | High-frequency token counting without React overhead |
| 2026-02-18 | Model selector creates new conversation | Per user decision: changing model = new chat |
| 2026-02-18 | Sidebar conversation click navigates to /chat/[id] | Bug fix - URL must update when conversation clicked for proper routing |
| 2026-02-18 | Start Chatting navigates to /loading first | Bug fix - navigate immediately to loading screen, then load model (was hanging with no feedback) |
| 2026-02-18 | Add code block CSS styling | Fixed AI code responses appearing as plain text without formatting - added pre/code block styles with dark theme support |
| 2026-02-18 | New Chat creates conversation in memory only | Bug fix - clicking New Chat no longer saves empty conversation to sidebar; conversation only saved when user sends first message |
| 2026-02-18 | New Chat button shouldn't create conversation immediately | Bug fix - clicking New Chat just navigates to /chat; conversation only created when user sends first message |
- [Phase 02.1]: Use TextUIPart type from ai package for message part filtering in persistence layer
- [Phase 02.2]: Converted src/lib/utils.ts into src/lib/utils/index.ts so @/lib/utils imports stay stable while adding modular error utilities
- [Phase 02.2]: Implemented dependency-free Result and AppError infrastructure to standardize explicit failure handling
- [Phase 02.2]: Use route params (/chat/:id) as active conversation state instead of chatStore selectors
- [Phase 02.2]: Keep useConversations focused on IndexedDB list operations only, removing imperative chat load/clear concerns
- [Phase 02.2]: Use shared debounce utility in useAIChat instead of inline timeout management.
- [Phase 02.2]: Preserve route conversation IDs by creating missing conversations with explicit id.
- [Phase 02.2]: Always remove external abort listeners in both stream finally and cancel paths.
- [Phase 02.2]: Use a singleton ModelEngine to deduplicate concurrent model load requests
- [Phase 02.2]: Trigger default model initialization in App when entering /chat routes without a ready model
- [Phase 02.2]: Wrap the full Routes tree with one shared ErrorBoundary for consistent crash recovery UX.
- [Phase 02.2]: Keep diagnostics in development only while preserving user-facing recovery actions in production.
- [Phase 02.2]: Re-throw inference failures with contextual messages to standardize downstream error handling.
- [Phase 02.2]: Guard /chat conversation creation with useRef to prevent duplicate creation under rerenders/StrictMode
- [Phase 02.2]: Deduplicate loaded conversations with a Map keyed by ID before rendering sidebar state
- [Phase 02.2]: Handle conversation selection through route navigation only and let ChatDetailRoute own hydration
- [Phase 02.2]: Use useAIChat stop() directly for stop-generation instead of local placeholder behavior
- [Phase 02.2]: Carry cancel reason metadata into storage APIs so aborted persistence reports deterministic intent.
- [Phase 02.2]: Treat generateSafe Result handling as canonical in transport and only surface user-safe messages to UI streams.
- [Phase 02.2]: Expose persistence failure recovery as explicit retry/dismiss actions instead of DEV-only logging.
- [Phase 02.2]: Move persistence orchestration into dedicated helper hooks so useAIChat remains a thin integration boundary.
- [Phase 02.2]: Scope architecture-fit rule to core application paths and document temporary legacy exceptions explicitly.
- [Phase 02.2]: Run architecture-check before full lint so function-size regressions fail early in local and CI flows.
- [Phase 03 prep]: Phase 3 must preserve 02.2 reliability guardrails (cancellation, persistence ordering semantics, no sidebar route-flicker regressions) per `.planning/phases/03-model-management/03-NOTES.md`.
- [Phase 03-model-management]: Delegate in-chat model switch requests from modelStore to conversationModelStore when an active conversation exists.
- [Phase 03-model-management]: Persist model-target changes without touching updatedAt so sidebar ordering remains message-activity-driven.
- [Phase 03-model-management]: Gate model activation with requested-target checks so stale download completions cannot force-switch active runtime.
- [Phase 03-model-management]: Keep requested-vs-active model state split per conversation to preserve non-blocking chat during downloads.
- [Phase 04-memory-system]: Used strict JSON-only extraction prompt with low temperature for WebLLM consistency.
- [Phase 04-memory-system]: Applied exact-text deduplication in storage while using updates_previous for conflict replacement.
- [Phase 04-memory-system]: Integrated memory context into `src/lib/ai/webllm-transport.ts` because `src/lib/ai/chat-transport.ts` no longer exists in codebase.
- [Phase 04-memory-system]: Added `InferenceManager.getEngine()` to support extraction trigger hook access to the loaded local model.
- [Phase 04-memory-system]: Used tokenlens metadata with static context-window fallbacks for robust memory budget calculations.
- [Phase 04-memory-system]: Integrated memory UI into `src/components/chat-layout/ChatLayout.tsx` because legacy `src/components/chat/ChatHeader.tsx` and `src/components/chat/ChatLayout.tsx` paths have drifted.
- [Phase 04-memory-system]: Used optimistic clear-all with delayed wipe and undo toast to keep destructive memory actions reversible.
- [Phase 04-memory-system]: Auto-advanced verify checkpoint under `workflow.auto_advance=true` after preparing a runnable local verification environment.
- [Phase 04-memory-system]: Expose compactContext over-limit state plus context-window targets so transport can enforce safe fallback deterministically.
- [Phase 04-memory-system]: Apply transport-side no-memory fallback and token-target truncation before generation instead of relying on single-pass compaction.
- [Phase 04-memory-system]: Treat prune-threshold as the eviction landing zone and trigger maintenance automatically after successful memory writes.
- [Phase 04-memory-system]: Wire useMemoryExtraction from AIChatInterface with live AI SDK text-part mapping so extraction runs in active chat.
- [Phase 04-memory-system]: Refactor useMemoryExtraction around latest-value refs to eliminate per-message listener churn while keeping fresh lifecycle data.
- [Phase 04-memory-system]: Add extractFacts short-history no-op guard and remove unnecessary MemoryError casting for deterministic extraction behavior.
- [Phase 04-memory-system]: Track pending clear-all operations at module scope and fan out state changes to hook instances so undo remains reliable if panel focus changes.
- [Phase 04-memory-system]: Prevent Sheet outside-interaction dismissal when the interaction originates from Sonner toast elements to preserve one-click undo UX.

### Open Questions

None currently.

### Known Blockers

None currently.

### Technical Debt

| Issue | Location | Severity | Phase 2.2 Fix |
|-------|----------|----------|---------------|
| Race condition in persistence | `useAIChat.ts:74-120` | Critical | Debounced saves + optimistic locking |
| Missing abort implementation | `AIChatInterface.tsx:97` | Critical | AbortSignal propagation through stack |
| Memory leak in transport | `webllm-transport.ts:77-84` | High | Event listener cleanup in finally block |
| Dual state management | `chatStore.ts` + AI SDK | High | Remove legacy, standardize on AI SDK |
| No request deduplication | `modelStore.ts:70-124` | High | In-flight request tracking |
| Tight coupling | `useAIChat.ts:58-123` | Medium | Transport memoization / singleton |
| Inconsistent error handling | Multiple files | Medium | Result<T,E> types + standard patterns |
| Missing Error Boundary | `App.tsx` | Medium | Wrap routes with error boundary |

### Roadmap Evolution

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-18 | Phase 2.1 inserted after Phase 2 | Need routing (/chat, /chat/[id]) and AI SDK UI migration before Phase 3 |
| 2026-02-18 | Phase 2.2 inserted after Phase 2.1 | Codebase is flaky—race conditions, memory leaks, inconsistent patterns. Need stabilization before Model Management. |

---

## Session Continuity

**Last Action:** Completed 04-06 with clear-all undo lifecycle hardening and first-click undo interaction fixes in Memory Panel
**Next Action:** Transition to Phase 5 planning/execution (Polish & PWA)
**Context Hash:** phase-04-memory-system-06-complete-20260219

**Critical Bugs Identified by User (must fix in Phase 2.2):**

| Bug | Symptom | Files Involved |
|-----|---------|----------------|
| Ghost Conversations | Opening `/chat` shows 20+ deleted conversations, "not found" toasts, creation loop | `ChatRoute.tsx`, `useConversations.ts`, `chatStore.ts` |
| Duplicate Sidebar Entries | Same conversation appears multiple times | `AppSidebar.tsx`, `useConversations.ts`, IndexedDB |
| Model Loading on Refresh | Hard refresh breaks model loading, only works via landing page | `App.tsx`, `modelStore.ts`, `ChatLayoutWrapper` |

**Key Decision:** User explicitly requested we stop adding features and stabilize existing code. Focus is on industry-level patterns: Result types, proper cancellation, clean architecture, defensive programming.

**Key Files:**
- `/Users/poak/Documents/personal-project/Lokul/.planning/PROJECT.md` - Project definition
- `/Users/poak/Documents/personal-project/Lokul/.planning/REQUIREMENTS.md` - v1 requirements (56 total)
- `/Users/poak/Documents/personal-project/Lokul/.planning/ROADMAP.md` - Phase structure
- `/Users/poak/Documents/personal-project/Lokul/.planning/audit/STABILITY_AUDIT.md` - Full codebase audit with issues
- `/Users/poak/Documents/personal-project/Lokul/.planning/phases/02.2-stabilization-and-refactor/02.2-CONTEXT.md` - Phase decisions and patterns

---

## Notes

- **CRITICAL:** Phase 2.2 is a pivot — stopping feature development to stabilize existing code
- Codebase audit found race conditions, memory leaks, dual state management, inconsistent error handling
- User wants industry-level patterns: Result<T,E> types, proper cancellation, clean architecture
- Phase 2.2 must be completed before Phase 3 — building Model Management on shaky ground creates unfixable bugs
- Research flagged Phase 4 (Memory System) as HIGH complexity — may need additional research during planning
- Phase 3 (Model Management) flagged as MEDIUM complexity for download UX patterns
- All 56 v1 requirements mapped to exactly one phase with 100% coverage

---

*This file is updated throughout the project lifecycle.*
