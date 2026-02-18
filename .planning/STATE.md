# State: Lokul

**Project:** Privacy-first AI chat that runs 100% in the browser using WebGPU
**Status:** Milestone complete
**Updated:** 2026-02-18 (16:59 UTC)

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

**Phase:** Phase 2.2 - Stabilization & Refactor
**Plan:** 02.2-06 next (4/6 plans complete)
**Status:** IN PROGRESS - executing stabilization plans

**Progress:**

[██████████] 100%
[=====>..............] 25% (Phase 2 in progress)
```

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
- [ ] Phase 2.2: Stabilization & Refactor (IN PROGRESS - fix race conditions, establish error patterns, remove tech debt)
- [ ] Phase 3: Model Management
- [ ] Phase 4: Memory System
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

**Last Action:** Completed 02.2-05 - fixed ghost conversation creation loop, sidebar duplicates, and stop-generation wiring
**Next Action:** Execute 02.2-06 plan to finish stabilization phase
**Context Hash:** stabilization-phase-02.2-05-complete-20260218

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
