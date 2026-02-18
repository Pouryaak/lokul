# State: Lokul

**Project:** Privacy-first AI chat that runs 100% in the browser using WebGPU
**Status:** Milestone complete
**Updated:** 2026-02-18 (14:04 UTC)

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

**Phase:** Phase 2.1 in progress
**Plan:** 02.1-05 complete (5 of ? plans in Phase 2.1)
**Status:** Message actions, conversation clearing, and welcome screen complete

**Progress:**

```
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
- [~] Phase 2.1: AI SDK UI Migration with Routing (5/? plans complete)
  - [x] 02.1-01: AI SDK UI transport layer (WebLLMTransport, useAIChat)
  - [x] 02.1-02: Chat layout infrastructure (sidebar, ChatLayout)
  - [x] 02.1-03: React Router configuration (/chat, /chat/[id])
  - [x] 02.1-04: AI SDK UI integration with routed chat interface
  - [x] 02.1-05: Message actions, conversation clearing, welcome screen
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
| 02.1-05 | 25 min | 3 | 3 | 2026-02-18 |

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

### Open Questions

None currently.

### Known Blockers

None currently.

### Technical Debt

None currently.

### Roadmap Evolution

| Date | Change | Reason |
|------|--------|--------|
| 2026-02-18 | Phase 2.1 inserted after Phase 2 | Need routing (/chat, /chat/[id]) and AI SDK UI migration before Phase 3 |

---

## Session Continuity

**Last Action:** Completed 02.1-05 Message actions, conversation clearing, and welcome screen
**Next Action:** Phase 2.1 Plan 06 - Integration testing and verification
**Context Hash:** chat-actions-20260218

**Key Files:**
- `/Users/poak/Documents/personal-project/Lokul/.planning/PROJECT.md` - Project definition
- `/Users/poak/Documents/personal-project/Lokul/.planning/REQUIREMENTS.md` - v1 requirements (56 total)
- `/Users/poak/Documents/personal-project/Lokul/.planning/ROADMAP.md` - Phase structure
- `/Users/poak/Documents/personal-project/Lokul/src/components/Chat/AIChatInterface.tsx` - Main chat interface with message actions
- `/Users/poak/Documents/personal-project/Lokul/src/components/ai-elements/message.tsx` - AI SDK UI message components
- `/Users/poak/Documents/personal-project/Lokul/src/components/Chat/WelcomeScreen.tsx` - Welcome screen with suggested prompts
- `/Users/poak/Documents/personal-project/Lokul/.planning/phases/02.1-ai-sdk-ui-migration-with-routing/02.1-05-SUMMARY.md` - Latest plan summary

---

## Notes

- Research flagged Phase 4 (Memory System) as HIGH complexity — may need additional research during planning
- Phase 3 (Model Management) flagged as MEDIUM complexity for download UX patterns
- All 56 v1 requirements mapped to exactly one phase with 100% coverage

---

*This file is updated throughout the project lifecycle.*
