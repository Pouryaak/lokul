---
phase: 05-polish-and-pwa
plan: 04
subsystem: ui
tags: [pwa, installability, react, vite-plugin-pwa, typescript]

requires:
  - phase: 05-01
    provides: compact chat header shell and mobile-first top bar layout
provides:
  - Install eligibility state machine with session-scoped dismissal suppression
  - Compact header status indicator with silent offline/install transitions
  - First-successful-chat milestone gate for install affordance visibility
  - Manifest icon metadata aligned to install-quality 192/512 PNG entries
affects: [phase-05-polish-and-pwa, pwa, chat-layout]

tech-stack:
  added: []
  patterns:
    - Explicit install state machine (hidden/eligible/prompted/installed)
    - SessionStorage suppression for dismissed install prompt
    - LocalStorage milestone signaling for first successful chat completion

key-files:
  created:
    - src/hooks/useInstallEligibility.ts
    - src/types/pwa.ts
    - src/types/virtual-pwa-register-react.d.ts
  modified:
    - src/components/performance/StatusIndicator.tsx
    - src/hooks/use-ai-chat-persistence.ts
    - src/components/chat-layout/ChatLayout.tsx
    - src/App.tsx
    - src/types/vite-env.d.ts
    - public/manifest.json

key-decisions:
  - "Install affordance stays hidden until both first-chat milestone and deferred install prompt are available"
  - "Install dismissals are session-scoped via sessionStorage so affordance can return next browser session"
  - "Status indicator is rendered in the chat header action cluster instead of floating overlays"

patterns-established:
  - "PWA Browser Event Typing: typed beforeinstallprompt/appinstalled declarations in shared type modules"
  - "Eligibility Gate Composition: installed + prompt availability + first-chat + session suppression evaluated centrally"

requirements-completed: [CHAT-09]

duration: 4 min
completed: 2026-02-19
---

# Phase 5 Plan 04: Install Eligibility and Compact Status Summary

**Header-native install/offline UX with first-chat-gated install eligibility, session-scoped dismissal suppression, and hardened manifest icon metadata.**

## Performance

- **Duration:** 4 min
- **Started:** 2026-02-19T23:27:24Z
- **Completed:** 2026-02-19T23:31:33Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments
- Added `useInstallEligibility` to centralize install state transitions, installed detection, prompt lifecycle, and session dismissal behavior.
- Refactored `StatusIndicator` into a compact header indicator and wired install action visibility to real eligibility state.
- Added first-successful-chat milestone signaling from persistence success path and updated manifest icon entries to install-quality PNG metadata.

## Task Commits

Each task was committed atomically:

1. **Task 1: Build install eligibility state machine and type safety** - `fbc2760` (feat)
2. **Task 2: Refactor status indicator to compact top-right install/offline UX** - `ac70c2e` (feat)
3. **Task 3: Gate install by first successful chat and harden manifest install metadata** - `e7ddf41` (feat)

**Plan metadata:** `[pending]` (docs: complete plan)

## Files Created/Modified
- `src/hooks/useInstallEligibility.ts` - Install eligibility state machine and prompt handling lifecycle.
- `src/types/pwa.ts` - Shared PWA event/type contracts and install gate storage keys.
- `src/types/virtual-pwa-register-react.d.ts` - Typed `virtual:pwa-register/react` module contract.
- `src/components/performance/StatusIndicator.tsx` - Compact header status rendering with conditional install action.
- `src/hooks/use-ai-chat-persistence.ts` - First-successful-chat milestone write on persistence success.
- `public/manifest.json` - Explicit 192x192 and 512x512 PNG icon entries.
- `src/components/chat-layout/ChatLayout.tsx` - Header integration point for status indicator.
- `src/App.tsx` - Removed non-header status indicator usage in loading route.
- `src/types/vite-env.d.ts` - Focused Vite env declarations after moving virtual module typing.

## Decisions Made
- Kept install prompt eligibility fully silent unless all gates pass (prompt availability, first successful chat, not installed, not session-dismissed).
- Treated install dismissals as session-only to align with requirement that affordance can return next session.
- Emitted a same-tab window event when first-chat milestone is reached so install eligibility can update immediately without reload.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added dedicated virtual module declaration for PWA register hook**
- **Found during:** Task 2 (status indicator refactor)
- **Issue:** Type resolution still reported missing `virtual:pwa-register/react` module during editor diagnostics.
- **Fix:** Moved virtual module typing to `src/types/virtual-pwa-register-react.d.ts` and kept `vite-env` focused on env globals.
- **Files modified:** `src/types/virtual-pwa-register-react.d.ts`, `src/types/vite-env.d.ts`
- **Verification:** `npm run type-check` passes without `ts-expect-error` usage in status indicator.
- **Committed in:** `ac70c2e` (part of task commit)

---

**Total deviations:** 1 auto-fixed (1 blocking)
**Impact on plan:** Deviation was required to keep strict typing intact and unblock clean PWA hook integration; no scope creep.

## Issues Encountered
None.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Install/offline UX model is ready and aligned with Phase 5 decisions.
- Remaining phase progress depends on completing 05-03 summary/state closure for full sequencing parity.

## Self-Check: PASSED

- Found summary file: `.planning/phases/05-polish-and-pwa/05-04-SUMMARY.md`
- Found task commits: `fbc2760`, `ac70c2e`, `e7ddf41`

---
*Phase: 05-polish-and-pwa*
*Completed: 2026-02-19*
