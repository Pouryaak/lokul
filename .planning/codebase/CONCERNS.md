# Codebase Concerns

**Analysis Date:** 2026-02-23

## Tech Debt

**Oversized multi-responsibility modules:**
- Issue: Several core files combine many concerns (state, UI orchestration, side effects, and persistence) and exceed maintainable size.
- Files: `src/components/ai-elements/prompt-input.tsx`, `src/lib/ai/webllm-transport.ts`, `src/store/conversationModelStore.ts`, `src/components/ui/sidebar.tsx`, `src/components/landing/DocumentVaultAnimation.tsx`
- Impact: Slower onboarding, higher regression risk, and difficult targeted testing for small changes.
- Fix approach: Split each file by responsibility (state hooks, rendering, adapters, utilities), keep public facade files thin, and add file-level unit tests per extracted unit.

**Inconsistent coding style and typing strictness in imported-style components:**
- Issue: Some components use looser typing (`any`, broad casts) and different style conventions than the rest of the TypeScript codebase.
- Files: `src/components/GradualBlur.tsx`, `src/components/ai-elements/prompt-input.tsx`, `src/components/ai-elements/schema-display.tsx`
- Impact: Reduced static safety and harder lint/type-driven refactoring.
- Fix approach: Replace `any` with explicit types, remove cast-heavy patterns, and align formatting/import/type conventions with project-wide rules.

**Global mutable module state for runtime behavior:**
- Issue: Cross-instance state is stored in module-level singletons instead of scoped stores/hooks.
- Files: `src/components/Chat/AIChatInterface.tsx`, `src/store/conversationModelStore.ts`, `src/lib/memory/compaction.ts`, `src/hooks/useMemory.ts`
- Impact: Hidden coupling across route changes and test runs; behavior depends on prior app history in the same session.
- Fix approach: Move state to scoped Zustand slices or hook-local state with explicit lifecycle reset points.

## Known Bugs

**`refresh` API does not trigger memory reload:**
- Symptoms: Calling `refresh()` from memory hook does not fetch new memory data.
- Files: `src/hooks/useMemory.ts`
- Trigger: `refresh()` increments `setRefreshTick`, but that state is not consumed by `useLiveQuery` dependencies.
- Workaround: Rely on Dexie live updates only; manual refresh is currently ineffective.

**`refreshConversations` API is a no-op:**
- Symptoms: Calling conversation refresh does not re-query conversation data.
- Files: `src/hooks/useConversations.ts`
- Trigger: `refreshConversations()` only clears local error state and does not invalidate/re-run query.
- Workaround: Data updates only when Dexie change notifications fire naturally.

**`syncHiddenInput` prop is exposed but intentionally non-functional:**
- Symptoms: Consumers can pass `syncHiddenInput`, but file input synchronization behavior is not actually supported.
- Files: `src/components/ai-elements/prompt-input.tsx`
- Trigger: Code comment marks it as no longer functional; logic only clears input value when files are empty.
- Workaround: Avoid relying on native hidden file input sync; use component callback outputs instead.

## Security Considerations

**Potential XSS surface via unsanitized `dangerouslySetInnerHTML`:**
- Risk: If untrusted `children` is passed to path display, HTML can be injected into the DOM.
- Files: `src/components/ai-elements/schema-display.tsx`
- Current mitigation: Regex-based highlighting for path placeholders; no explicit sanitizer in this component.
- Recommendations: Sanitize string inputs before injection or render highlighted tokens via React element composition without raw HTML.

**Permissive embedded preview iframe policy:**
- Risk: Previewed pages run with `allow-same-origin` and `allow-scripts`, increasing exposure when loading untrusted URLs.
- Files: `src/components/ai-elements/web-preview.tsx`
- Current mitigation: `sandbox` is present.
- Recommendations: Remove `allow-same-origin` by default, gate risky capabilities behind explicit opt-in, and enforce URL allowlists when used in production-facing surfaces.

**Sensitive data exports are unencrypted:**
- Risk: Exported conversation files are plain JSON/markdown/text and can leak private data if shared or stored insecurely.
- Files: `src/lib/storage/conversation-transfer.ts`
- Current mitigation: Schema validation on import path.
- Recommendations: Add optional passphrase-based encryption for export/import and clear user warnings before export.

## Performance Bottlenecks

**Repeated GPU adapter probing on interval:**
- Problem: Performance panel requests detailed GPU info on each refresh interval.
- Files: `src/components/performance/PerformancePanel.tsx`, `src/lib/performance/gpu-detection.ts`
- Cause: `refreshData()` calls `getGPUInfo()` every 5 seconds and `getGPUInfo()` calls `navigator.gpu.requestAdapter(...)`.
- Improvement path: Cache adapter/device metadata for session duration and only refresh on explicit user action.

**High-frequency persistence of full conversation snapshots during chat:**
- Problem: Large conversation payloads can be repeatedly written while messages stream.
- Files: `src/hooks/use-ai-chat-persistence.ts`, `src/lib/storage/conversations.ts`
- Cause: Debounced persistence writes full conversation snapshots with message arrays rather than append/delta updates.
- Improvement path: Persist incremental message deltas, batch token-stream updates, and commit final assistant message once per response.

**Heavy animation state churn in landing demo components:**
- Problem: Animation scenes perform many sequential state updates and timeout-driven loops.
- Files: `src/components/landing/DocumentVaultAnimation.tsx`, `src/components/landing/PrivacyAnimation.tsx`
- Cause: Long scripted sequences with frequent `setState` calls and multiple async timeout chains.
- Improvement path: Move sequences to timeline abstractions, reduce state writes, and pause animations when offscreen.

## Fragile Areas

**Model loading queue and cancellation orchestration:**
- Files: `src/store/conversationModelStore.ts`, `src/lib/ai/model-engine.ts`, `src/store/modelStore.ts`
- Why fragile: Queue, cancellation, lifecycle transitions, and cross-store synchronization are distributed across multiple module-level states and async flows.
- Safe modification: Add integration tests before changes; preserve ordering guarantees for `queue`, `loadingModelId`, and `engineLoadedModelId`; modify one transition path at a time.
- Test coverage: Partial (`src/store/modelStore.test.ts`) with no E2E route/model switching coverage.

**Streaming transport stall recovery and fallback trimming:**
- Files: `src/lib/ai/webllm-transport.ts`, `src/lib/memory/compaction.ts`, `src/lib/memory/context-builder.ts`
- Why fragile: Stall detection, iterator draining, model re-initialization, and context truncation interact in one path.
- Safe modification: Keep behavior-driven tests for abort/stall/retry scenarios; verify token-stream lifecycle (`text-start`, `text-delta`, `text-end`) on each change.
- Test coverage: No direct tests for transport stall recovery or truncation fallback behavior.

**Prompt input attachment lifecycle and form behavior:**
- Files: `src/components/ai-elements/prompt-input.tsx`
- Why fragile: Combines provider/local modes, drag-drop, paste uploads, object URL lifecycle, and async conversion in one component.
- Safe modification: Extract file lifecycle utilities and test attachment add/remove/cleanup paths independently.
- Test coverage: Not detected for this component.

## Scaling Limits

**Context window ceilings are fixed by model map/fallback:**
- Current capacity: Hardcoded context windows (e.g., `2048` and `8192`) and compaction threshold ratio `0.8`.
- Limit: Large conversations trigger increasingly aggressive trimming/truncation, reducing response quality.
- Scaling path: Introduce model-aware dynamic context policies, summarize archived turns, and persist compacted summaries separately.

**Conversation storage writes entire message arrays:**
- Current capacity: Each save writes full `Conversation.messages` payload.
- Limit: Large threads increase write latency and conflict probability in IndexedDB transactions.
- Scaling path: Use append-only message table with conversation metadata table and periodic compaction.

## Dependencies at Risk

**Potential duplicate motion dependency footprint:**
- Risk: `package.json` includes both `framer-motion` and `motion`, while source imports consistently use `framer-motion`.
- Impact: Larger dependency surface and possible version drift/confusion over animation API source.
- Migration plan: Audit imports and remove unused package(s) after lockfile validation and bundle-size check.

## Missing Critical Features

**No encrypted backup/export flow for privacy-sensitive conversations:**
- Problem: Privacy-first positioning is weakened when exported backups are plaintext.
- Blocks: Safe user-managed backup/transfer for sensitive chats on shared devices or cloud drives.

**No robust manual data refresh hooks despite exposed APIs:**
- Problem: Public refresh methods exist but do not trigger reload in memory/conversation hooks.
- Blocks: Reliable "refresh now" UX for settings panels, admin/debug tooling, and deterministic recovery flows.

## Test Coverage Gaps

**Chat transport and persistence failure paths:**
- What's not tested: Streaming stall recovery, abort races, idempotency replay handling, and persistence recovery UI behavior.
- Files: `src/lib/ai/webllm-transport.ts`, `src/hooks/use-ai-chat-persistence.ts`, `src/components/Chat/AIChatInterface.tsx`
- Risk: Regressions can silently corrupt chat state or lose generated responses.
- Priority: High

**Prompt input file lifecycle and attachment conversion:**
- What's not tested: Blob URL cleanup, conversion failure handling, provider/local mode parity, and drag-drop edge cases.
- Files: `src/components/ai-elements/prompt-input.tsx`
- Risk: Memory leaks, broken uploads, and inconsistent submit behavior.
- Priority: High

**Performance and browser capability flows:**
- What's not tested: GPU detection fallbacks, interval update behavior, and unsupported browser messaging.
- Files: `src/lib/performance/gpu-detection.ts`, `src/components/performance/PerformancePanel.tsx`, `src/lib/performance/memory-monitor.ts`
- Risk: False capability reporting and degraded UX on unsupported devices.
- Priority: Medium

**Coverage breadth across core modules remains limited:**
- What's not tested: Most routes/hooks/stores/components beyond four current tests.
- Files: `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`, `src/lib/storage/conversation-transfer.test.ts`, `src/lib/memory/extraction.test.ts`, `src/store/modelStore.test.ts`
- Risk: Critical behavior changes can ship without automated detection.
- Priority: High

---

*Concerns audit: 2026-02-23*
