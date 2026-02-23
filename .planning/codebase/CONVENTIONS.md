# Coding Conventions

**Analysis Date:** 2026-02-23

## Naming Patterns

**Files:**
- Use `PascalCase.tsx` for most React feature components in `src/components/Chat/AIChatInterface.tsx`, `src/components/chat-layout/ChatLayout.tsx`, and `src/routes/ChatRoute.tsx`.
- Use `kebab-case.ts` for many hooks and utility modules in `src/hooks/use-ai-chat-persistence.ts` and `src/lib/storage/conversation-transfer.ts`.
- Keep existing local directory convention when adding files; match neighboring files in that folder (for example `src/components/ui/Button.tsx` currently uses PascalCase while many other UI files in `src/components/ui/` are lowercase).

**Functions:**
- Use `camelCase` for functions and callbacks (`createConversationAndNavigate` in `src/routes/ChatRoute.tsx`, `persistWithRetry` in `src/hooks/use-ai-chat-persistence.ts`).
- Prefix event handlers with `handle` (`handleSubmit`, `handleSuggestionClick` in `src/routes/ChatRoute.tsx`).
- Prefix custom hooks with `use` (`useAIChat` in `src/hooks/useAIChat.ts`, `useChatPersistence` in `src/hooks/use-ai-chat-persistence.ts`).

**Variables:**
- Use `UPPER_SNAKE_CASE` for module constants (`PERSISTENCE_DEBOUNCE_MS` in `src/hooks/use-ai-chat-persistence.ts`, `LINE_SEPARATOR` in `src/lib/storage/conversation-transfer.ts`).
- Use descriptive boolean prefixes (`isLoading`, `hasCompletedSetup`, `canRetry`) across `src/App.tsx`, `src/store/settingsStore.ts`, and `src/hooks/use-ai-chat-persistence.ts`.

**Types:**
- Use `PascalCase` for interfaces and type aliases (`UseAIChatReturn` in `src/hooks/useAIChat.ts`, `ConversationImportResult` in `src/types/index.ts`).
- Use string-literal union types for finite state (`ErrorCode` in `src/lib/utils/errors.ts`, `DownloadLifecycle` in `src/store/conversationModelStore.ts`).

## Code Style

**Formatting:**
- Tool used: Prettier via `.prettierrc` and scripts in `package.json`.
- Key settings from `.prettierrc`: semicolons enabled, double quotes, `tabWidth: 2`, `printWidth: 100`, trailing commas `es5`, Tailwind class sorting plugin `prettier-plugin-tailwindcss`.

**Linting:**
- Tool used: ESLint flat config in `eslint.config.js`.
- Key rules to follow from `eslint.config.js`: `prefer-const`, `no-duplicate-imports`, `no-debugger`, `react-hooks/rules-of-hooks`, `react-hooks/exhaustive-deps` (warn), no `console.log` (allow only `console.info`, `console.warn`, `console.error`), and `_` prefix allowed for intentionally unused variables.
- Architecture guardrail: `max-lines-per-function` is enforced for `src/{hooks,lib/ai,routes,store}/**/*.{ts,tsx}` via `package.json` script `architecture-check` and rule block in `eslint.config.js`.

## Import Organization

**Order:**
1. React/runtime and third-party packages first (`src/App.tsx`, `src/hooks/useAIChat.ts`).
2. Internal alias imports via `@/` second (`src/hooks/useMemory.ts`, `src/routes/ChatRoute.tsx`).
3. Relative imports last (`./AppSidebar` in `src/components/chat-layout/ChatLayout.tsx`, `./conversation-transfer` in `src/lib/storage/conversation-transfer.test.ts`).

**Path Aliases:**
- Use `@/*` alias configured in `tsconfig.json` (`"@/*": ["src/*"]`).
- Prefer `import type` for type-only dependencies (`src/hooks/use-ai-chat-persistence.ts`, `src/lib/memory/extraction.test.ts`).

## Error Handling

**Patterns:**
- Use typed app errors and mappers from `src/lib/utils/errors.ts` (`toAppError`, `getUserMessage`, discriminated `ErrorCode`).
- Use result-discriminant flow (`kind === "ok" | "err"`) from `src/types/result.ts` and `src/lib/utils/result.ts` for storage/service responses (`src/hooks/useMemory.ts`, `src/hooks/use-ai-chat-persistence.ts`).
- Wrap async I/O with `try/catch` in route and store boundaries, then surface user-safe messages (`toast.error` in `src/routes/ChatRoute.tsx`, `error` state in `src/store/settingsStore.ts`).

## Logging

**Framework:** console

**Patterns:**
- Use structured prefixes (`[SettingsStore]`, `[Memory]`, `[InferenceManager]`) in `src/store/settingsStore.ts`, `src/lib/storage/memory.ts`, and `src/lib/ai/inference.ts`.
- Gate noisy logs behind `import.meta.env.DEV` in state-management paths (`src/store/modelStore.ts`, `src/store/settingsStore.ts`).
- Do not add `console.log`; lint allows only `info`, `warn`, and `error` per `eslint.config.js`.

## Comments

**When to Comment:**
- Use file-level and API-level docblocks for non-trivial modules (`src/store/modelStore.ts`, `src/routes/ChatRoute.tsx`, `src/components/ui/Button.tsx`).
- Use short inline comments only where behavior is non-obvious (`// Optimistically update UI` in `src/store/settingsStore.ts`).

**JSDoc/TSDoc:**
- Public types and exported APIs in `src/types/index.ts` and `src/store/settingsStore.ts` are heavily documented with JSDoc-style blocks.
- Small utility modules often skip verbose docs when intent is obvious (`src/lib/utils/result.ts`).

## Function Design

**Size:**
- Preferred pattern is decomposition into private helpers (`createActions`, `createSyncEngineState`, `queueModelLoad` in `src/store/conversationModelStore.ts`; `usePersistenceController` and `usePersistenceEffects` in `src/hooks/use-ai-chat-persistence.ts`).
- Keep branch-heavy logic in extracted pure helpers where possible (`normalizeConversation`, `toDuplicateConversation` in `src/lib/storage/conversation-transfer.ts`).

**Parameters:**
- Use typed options objects for multi-argument APIs (`UseChatPersistenceOptions` in `src/hooks/use-ai-chat-persistence.ts`, `ConversationImportOptions` in `src/types/index.ts`).

**Return Values:**
- Prefer explicit union return types for success/failure over throwing in lower layers (`Result<T, E>` in `src/types/result.ts`, `ConversationImportResult` in `src/types/index.ts`).
- Throw only for invariant violations and caller misuse (`throw new Error("Root element not found")` in `src/main.tsx`, model guard errors in `src/store/conversationModelStore.ts`).

## Module Design

**Exports:**
- Prefer named exports for hooks, stores, and utility functions (`src/hooks/useAIChat.ts`, `src/lib/storage/conversation-transfer.ts`, `src/store/conversationModelStore.ts`).
- Keep default exports only where route/component ergonomics benefit (`src/App.tsx`, `src/routes/ChatRoute.tsx`, `src/routes/ChatDetailRoute.tsx`).

**Barrel Files:**
- Barrel usage is limited and intentional: `src/lib/utils/index.ts` re-exports `errors` and `result` helpers.
- Most domains import directly from concrete files (`src/lib/storage/conversations.ts`, `src/lib/ai/model-engine.ts`) instead of deep barrel chains.

---

*Convention analysis: 2026-02-23*
