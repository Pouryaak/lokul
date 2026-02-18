---
phase: 03-model-management
plan: 02
subsystem: ui
tags: [react, chat-ui, zustand, download-ux]

requires:
  - phase: 03-model-management
    provides: Conversation-scoped model lifecycle state and route-based requested model hydration
provides:
  - Input-adjacent model selector for desktop and mobile chat actions
  - Header-right Download Manager shell with lifecycle, retry, and cancel-confirm interactions
  - Sidebar model controls removed to enforce Claude-style placement
affects: [phase-03-model-management, model-selector, download-manager]

tech-stack:
  added: []
  patterns: [input-anchored model controls, non-blocking header manager panel]

key-files:
  created:
    - src/components/model/InputModelSelector.tsx
    - src/components/model/DownloadManager.tsx
  modified:
    - src/components/chat-layout/AppSidebar.tsx
    - src/components/chat-layout/app-sidebar-parts.tsx
    - src/components/Chat/ai-chat-parts.tsx
    - src/components/chat-layout/ChatLayout.tsx
    - src/components/Chat/AIChatInterface.tsx

key-decisions:
  - "Keep model controls only in the chat input action area and remove sidebar selector surface entirely."
  - "Co-locate Download Manager and Performance controls in header-right while keeping panel interactions non-blocking."

patterns-established:
  - "Model selector state badges communicate requested and active intent without a header model badge."
  - "Download manager shell shows all lifecycle rows with retry/cancel affordances before full orchestration wiring."

requirements-completed: [MODEL-02, MODEL-05, MODEL-06]

duration: 9m
completed: 2026-02-19
---

# Phase 3 Plan 02: Model Control Surface Summary

**Chat input now owns model selection while a dedicated header Download Manager exposes model lifecycle and recovery controls.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-02-19T00:00:00Z
- **Completed:** 2026-02-19T00:09:00Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Removed sidebar model selector and moved model selection to an input-adjacent `InputModelSelector` used directly inside `InputSection`.
- Added `DownloadManager` shell in header-right with per-model lifecycle badges (`Queued`, `Downloading`, `Compiling`, `Ready`, `Failed`, `Canceled`), progress/ETA placeholders, retry action, and cancel confirmation.
- Updated chat layout so Download Manager and Performance controls coexist without overlap regressions.

## Task Commits

Each task was committed atomically:

1. **Task 1: Move model selector from sidebar to input action area** - `47908f3` (feat)
2. **Task 2: Add dedicated Download Manager shell in header-right** - `e8e7f61` (feat)

## Files Created/Modified

- `src/components/model/InputModelSelector.tsx` - Input-area model selector with requested/active/ready visual state labels.
- `src/components/model/DownloadManager.tsx` - Header panel shell with lifecycle rows, progress display, retry, and cancel confirmation.
- `src/components/chat-layout/AppSidebar.tsx` - Removes sidebar model selector render path.
- `src/components/chat-layout/app-sidebar-parts.tsx` - Removes deprecated sidebar `ModelSelector` implementation.
- `src/components/Chat/ai-chat-parts.tsx` - Composes input selector near message actions.
- `src/components/chat-layout/ChatLayout.tsx` - Adds Download Manager trigger in header-right and aligns panel controls.
- `src/components/Chat/AIChatInterface.tsx` - Passes conversation context into input section composition.

## Decisions Made

- Kept model visibility in selector/manager surfaces only to match locked UX direction and avoid reintroducing header model badge behavior.
- Used existing `ConfirmDialog` for cancel confirmation to keep destructive model actions consistent with existing UI semantics.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- Global lint baseline remains red due pre-existing unrelated violations across generated UI element files; tracked in `.planning/phases/03-model-management/deferred-items.md`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- UI surfaces are now present and ready for full queue-driven orchestration wiring and stale-intent guards in Plan 03.

## Self-Check: PASSED

- FOUND: `.planning/phases/03-model-management/03-model-management-02-SUMMARY.md`
- FOUND: `47908f3`
- FOUND: `e8e7f61`

---

*Phase: 03-model-management*
*Completed: 2026-02-19*
