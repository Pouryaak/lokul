- 2026-02-19: `npm run lint` fails due to pre-existing duplicate imports and architecture lint errors across unrelated UI files under `src/components/ai-elements/**`, `src/components/sidebar-02/**`, and `src/lib/utils/debounce.ts`.
  - Scope: Out of scope for `04-01-PLAN.md` memory storage/extraction implementation.
  - Action: Deferred for dedicated lint cleanup plan.

- 2026-02-19: `npm run lint` still fails during `04-02-PLAN.md` due to the same pre-existing duplicate imports and unrelated architecture violations outside memory-system files.
  - Scope: Out of scope for `04-02-PLAN.md` context management and transport integration tasks.
  - Action: Deferred; memory-system changes verified via `npm run type-check`.
