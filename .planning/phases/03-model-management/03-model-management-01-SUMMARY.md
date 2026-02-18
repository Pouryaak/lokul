---
phase: 03-model-management
plan: 01
subsystem: ui
tags: [zustand, webllm, routing, indexeddb]

requires:
  - phase: 02.2-stabilization-and-refactor
    provides: Result-first error boundaries, cancellation guardrails, and persistence reliability patterns
provides:
  - Conversation-scoped model orchestration state with requested-vs-loaded tracking
  - Smart-default chat bootstrap and route hydration from persisted conversation model targets
  - Model-target persistence updates that do not reorder sidebar conversations
affects: [phase-03-model-management, model-switching, chat-routing]

tech-stack:
  added: []
  patterns: [conversation-scoped model intent, single-concurrency model load queue]

key-files:
  created:
    - src/store/conversationModelStore.ts
    - .planning/phases/03-model-management/deferred-items.md
  modified:
    - src/store/modelStore.ts
    - src/lib/storage/conversations.ts
    - src/routes/ChatRoute.tsx
    - src/routes/ChatDetailRoute.tsx
    - src/lib/storage/settings.ts
    - src/App.tsx

key-decisions:
  - "Delegate in-chat model switch requests from modelStore to conversationModelStore when an active conversation exists."
  - "Persist model-target changes without touching updatedAt so sidebar ordering remains message-activity-driven."

patterns-established:
  - "Conversation model orchestration: store requested target per conversation and queue model loads sequentially."
  - "Route hydration: /chat/:id hydrates requested model from conversation.model and keeps thread ID stable during switches."

requirements-completed: [MODEL-03, MODEL-04, MODEL-08, FIRST-06]

duration: 7m
completed: 2026-02-18
---

# Phase 3 Plan 01: Conversation-Scoped Model Orchestration Summary

**Conversation-scoped model intent with queued loading and Smart-default route bootstrap now drives model behavior per thread.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-02-18T23:00:46Z
- **Completed:** 2026-02-18T23:07:36Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments

- Built `conversationModelStore` to track active conversation, requested model targets, engine-loaded model, and per-model lifecycle (`Queued`, `Downloading`, `Compiling`, `Ready`, `Failed`, `Canceled`) with a single-concurrency queue.
- Added `updateConversationModelTarget` persistence helper so model-only conversation updates preserve `updatedAt` and avoid sidebar reorder regressions.
- Wired route/bootstrap behavior to Smart defaults: `/chat` creates Smart-target conversations, app autoload defaults to Smart, and `/chat/:id` hydrates runtime target from `conversation.model` while preserving the same conversation thread.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build conversation-scoped model orchestration state** - `f8018ef` (feat)
2. **Task 2: Wire routes and bootstrap to Smart-default conversation semantics** - `45bd964` (feat)

## Files Created/Modified

- `src/store/conversationModelStore.ts` - Conversation-scoped model intent, lifecycle map, and sequential load queue.
- `src/store/modelStore.ts` - Delegates active conversation model requests and forwards engine/progress events into conversation lifecycle state.
- `src/lib/storage/conversations.ts` - Adds model-target update helper that preserves sidebar ordering.
- `src/routes/ChatRoute.tsx` - Creates Smart-default conversations on `/chat`.
- `src/routes/ChatDetailRoute.tsx` - Hydrates requested model from persisted conversation target and avoids blocking chat while switching.
- `src/lib/storage/settings.ts` - Smart-default settings baseline (`defaultModel`, no Quick autoload).
- `src/App.tsx` - Smart-default model bootstrap in loading and chat routes.

## Decisions Made

- Use conversation-scoped request delegation only when a conversation is active, preserving existing global bootstrap behavior outside chat routes.
- Keep model-target persistence orthogonal to message activity by preserving `updatedAt` on model-only writes.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Global `npm run lint` fails due pre-existing, out-of-scope baseline issues in unrelated files (`src/components/ai-elements/**`, `src/components/sidebar-02/**`, `src/lib/utils/debounce.ts`).
- Global `npm run test` fails due a pre-existing file without test cases: `.claude/get-shit-done/bin/gsd-tools.test.cjs`.
- Logged both items to `.planning/phases/03-model-management/deferred-items.md` without modifying unrelated code.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Conversation-level model intent and Smart-default bootstrap foundations are in place for Phase 3 UI/download manager work.
- Deferred baseline lint/test cleanup remains outside this plan's scope and should be handled in a dedicated maintenance pass.

## Self-Check: PASSED

- FOUND: `.planning/phases/03-model-management/03-model-management-01-SUMMARY.md`
- FOUND: `f8018ef`
- FOUND: `45bd964`

---

*Phase: 03-model-management*
*Completed: 2026-02-18*
