# Roadmap: Lokul

**Project:** Privacy-first AI chat that runs 100% in the browser using WebGPU
**Core Value:** Privacy by architecture, not by promise
**Created:** 2026-02-17
**Depth:** Standard (5 phases)

---

## Phases

- [ ] **Phase 1: Core Infrastructure** - Foundation for local AI inference with Web Workers, GPU detection, and offline capability
- [ ] **Phase 2: Chat Interface** - Streaming chat with markdown, conversation storage, and basic performance monitoring
- [ ] **Phase 3: Model Management** - Three-tier model system (Quick/Smart/Genius) with download manager
- [ ] **Phase 4: Memory System** - Three-tier memory (Core Facts + Daily Context + Recent Messages) with auto-compaction
- [ ] **Phase 5: Polish & PWA** - Performance panel, responsive design, export/import, and PWA features

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Core Infrastructure | 0/4 | Not started | - |
| 2. Chat Interface | 0/4 | Not started | - |
| 3. Model Management | 0/3 | Not started | - |
| 4. Memory System | 0/3 | Not started | - |
| 5. Polish & PWA | 0/3 | Not started | - |

---

## Phase Details

### Phase 1: Core Infrastructure

**Goal:** Users can load the app, verify WebGPU support, and have Quick Mode ready within 60 seconds

**Depends on:** Nothing (first phase)

**Requirements:** MODEL-01, MODEL-07, PERF-01, PERF-02, PERF-05, STOR-09, OFFL-01, OFFL-02, OFFL-03, OFFL-04, OFFL-05, FIRST-01, FIRST-02, FIRST-03, FIRST-04, FIRST-05

**Success Criteria** (what must be TRUE):

1. User sees "Start Chatting" button within 2 seconds of landing
2. User receives clear error if WebGPU is not supported (with browser compatibility info)
3. User sees honest progress during Quick Mode download (percentage + estimated time)
4. User can send first message within 60 seconds of landing page load
5. App shows "Works Offline" indicator when Service Worker is active
6. Downloaded models persist across browser sessions (cached in IndexedDB)
7. Settings (theme, default model) persist across sessions

**Plans:** 4 plans

Plans:
- [ ] 01-01-PLAN.md — Type definitions, Dexie storage layer, settings persistence, WebGPU detection
- [ ] 01-02-PLAN.md — Web Worker for AI inference, model configurations, inference manager, model store
- [ ] 01-03-PLAN.md — First-run experience: landing page, WebGPU errors, loading progress UI
- [ ] 01-04-PLAN.md — PWA/Service Worker, offline indicator, performance panel, health monitoring

---

### Phase 2: Chat Interface

**Goal:** Users can have natural conversations with streaming responses, formatted messages, and persistent history

**Depends on:** Phase 1

**Requirements:** CHAT-01, CHAT-02, CHAT-03, CHAT-04, CHAT-05, CHAT-06, CHAT-07, CHAT-08, PERF-03, PERF-04, PERF-06, PERF-07, STOR-01, STOR-02, STOR-03, STOR-04

**Success Criteria** (what must be TRUE):

1. User can type in auto-resizing input field and send with Enter or button
2. AI responses stream token-by-token without UI lag or freezing
3. Messages render with Markdown (bold, italic, lists, code blocks with syntax highlighting)
4. User can copy any message to clipboard with one click
5. User can regenerate the last AI response
6. User can clear the current conversation
7. Conversations auto-save after every message and appear in sidebar with titles
8. User can click any previous conversation in sidebar to view it
9. User can delete a conversation from sidebar
10. Performance panel shows tokens/second and last response time during generation
11. Warning appears if memory usage exceeds 75%
12. Suggestion to switch to Quick Mode shown if performance degrades

**Plans:** TBD

---

### Phase 3: Model Management

**Goal:** Users can seamlessly switch between three model tiers based on their quality/speed needs

**Depends on:** Phase 2

**Requirements:** MODEL-02, MODEL-03, MODEL-04, MODEL-05, MODEL-06, MODEL-08, FIRST-06

**Success Criteria** (what must be TRUE):

1. User can see active model name in UI header
2. User can switch to Smart Mode (Llama 3.2 3B) via dropdown with progress display
3. User can switch to Genius Mode (Mistral 7B) via dropdown with progress display
4. Download progress shows percentage and time estimate for large models
5. User can cancel an in-progress model download
6. Model switch happens without page reload (seamless transition)
7. After first successful chat, user sees prompt to download Smart Mode

**Plans:** TBD

---

### Phase 4: Memory System

**Goal:** Users experience contextually aware conversations with effectively infinite memory through fact extraction

**Depends on:** Phase 3

**Requirements:** MEM-01, MEM-02, MEM-03, MEM-04, MEM-05, MEM-06, MEM-07

**Success Criteria** (what must be TRUE):

1. System extracts and saves key user facts (name, preferences, goals) from conversations
2. Core Facts persist indefinitely across all conversations
3. Context window never crashes from token limit (auto-management)
4. Auto-compaction triggers at 80% of model's context limit
5. User can view all remembered facts in Memory Panel
6. User can edit Core Facts directly
7. User can clear all memory with confirmation

**Plans:** TBD

---

### Phase 5: Polish & PWA

**Goal:** Users have a polished, responsive app that works like a native application on all devices

**Depends on:** Phase 4

**Requirements:** CHAT-09, CHAT-10, STOR-05, STOR-06, STOR-07, STOR-08

**Success Criteria** (what must be TRUE):

1. Chat interface is responsive and works on desktop and mobile devices
2. Message list virtualizes for conversations with 50+ messages (no lag)
3. User can export current conversation as Markdown (.md file)
4. User can export current conversation as JSON (.json file)
5. User can export current conversation as Text (.txt file)
6. User can import conversation from JSON backup
7. PWA manifest allows "Add to Home Screen" installation

**Plans:** TBD

---

## Coverage Validation

| Category | Count | Phases |
|----------|-------|--------|
| CHAT | 10 | Phase 2 (8), Phase 5 (2) |
| MODEL | 8 | Phase 1 (2), Phase 3 (6) |
| PERF | 7 | Phase 1 (3), Phase 2 (4) |
| STOR | 9 | Phase 1 (1), Phase 2 (4), Phase 5 (4) |
| OFFL | 5 | Phase 1 (5) |
| FIRST | 6 | Phase 1 (5), Phase 3 (1) |
| MEM | 7 | Phase 4 (7) |
| **Total** | **56** | **100% mapped** |

**Coverage Status:** All 56 v1 requirements mapped to exactly one phase. No orphans. No duplicates.

---

## Dependencies

```
Phase 1 (Core Infrastructure)
    |
    v
Phase 2 (Chat Interface)
    |
    v
Phase 3 (Model Management)
    |
    v
Phase 4 (Memory System)
    |
    v
Phase 5 (Polish & PWA)
```

**Key Dependency Rationale:**

- **Phase 1 before all:** Web Worker architecture and GPU detection must be established first. Refactoring from main-thread inference later is prohibitively expensive.
- **Phase 2 before Phase 3:** Basic streaming chat must work before adding model switching complexity.
- **Phase 3 before Phase 4:** Memory system requires stable context building; context builder requires working chat across models.
- **Phase 4 before Phase 5:** Polish features like export should include memory context; virtualization needs memory system stress testing.

---

## Research Flags

Phases needing deeper research during planning:

| Phase | Flag | Reason |
|-------|------|--------|
| Phase 4 | HIGH | Complex custom logic for fact extraction and compaction; no established patterns |
| Phase 3 | MEDIUM | Download UX patterns need validation; resumable downloads have edge cases |
| Phase 1 | LOW | Well-documented WebLLM worker patterns |
| Phase 2 | LOW | Standard React + streaming patterns |
| Phase 5 | LOW | Established vite-plugin-pwa patterns |

---

## Success Metrics Alignment

| Metric | Phase(s) Contributing |
|--------|----------------------|
| < 30 seconds first load (Quick Mode) | Phase 1 |
| 70%+ first message completion rate | Phase 1, Phase 2 |
| < 3 seconds average response time | Phase 2, Phase 3 |
| < 5% crash rate | Phase 1, Phase 2, Phase 4 |

---

*Last updated: 2026-02-17*
