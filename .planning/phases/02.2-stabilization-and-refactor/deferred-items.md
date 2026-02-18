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
