## Deferred Items

### 2026-02-18 - Plan 02.2-01 verification blockers (out of scope)

- `npm run type-check` fails in pre-existing sidebar conversation typing surface:
  - `src/components/Sidebar/ConversationSidebar.tsx:82` (`loadConversation` missing on `UseConversationsReturn`)
  - `src/components/Sidebar/ConversationSidebar.tsx:85` (`memoryWarning` missing on `UseConversationsReturn`)
  - `src/components/Sidebar/ConversationSidebar.tsx:86` (`performanceSuggestion` missing on `UseConversationsReturn`)
  - `src/components/Sidebar/ConversationSidebar.tsx:87` (`clearPerformanceSuggestion` missing on `UseConversationsReturn`)
- These errors are unrelated to Result/error utility infrastructure introduced in plan 02.2-01 and were not modified as part of this plan.

### 2026-02-18 - Plan 02.2-03 verification blocker (out of scope)

- `npm run type-check` fails on pre-existing missing route file:
  - `src/App.tsx:17` (`Cannot find module './routes/ChatDetailRoute'`)
- This failure is unrelated to debounce/listener cleanup changes in plan 02.2-03 and was not modified in this plan.

### 2026-02-18 - Plan 02.2-04 lint baseline issues (out of scope)

- `npm run lint` fails on pre-existing `no-duplicate-imports` violations across many `src/components/ai-elements/*` files.
- `npm run lint` also fails on pre-existing `src/lib/utils/debounce.ts` (`@typescript-eslint/no-this-alias`) introduced outside this plan's scoped files.
- These lint errors are outside Task 1-4 scope (`model-engine`, `modelStore`, `App`, `ChatDetailRoute`) and were not fixed in this plan.

### 2026-02-18 - Plan 02.2-10 lint baseline issues (out of scope)

- `npm run lint` fails on pre-existing `no-duplicate-imports` violations across `src/components/ai-elements/*` and `src/components/sidebar-02/*`.
- `npm run lint` still fails on pre-existing `src/lib/utils/debounce.ts` (`@typescript-eslint/no-this-alias`).
- These issues are outside plan 02.2-10 task scope (persistence cancellation wiring, Result-first orchestration, retry/dismiss recovery UX) and were intentionally deferred.

### 2026-02-18 - Plan 02.2-11 full lint baseline issues (out of scope)

- Updated architecture gate (`architecture-check`) passes for scoped application paths, but repository-wide `npm run lint` still fails on pre-existing duplicate imports in `src/components/ai-elements/*` and `src/components/sidebar-02/*`.
- `npm run lint` also fails on pre-existing `src/lib/utils/debounce.ts` (`@typescript-eslint/no-this-alias`).
- These failures pre-date plan 02.2-11 and are outside this plan's scoped decomposition/config work; they remain deferred.
