# Phase 3 Notes: Model Management

Date: 2026-02-18
Status: Pre-planning guardrails from Phase 2.2 stabilization

## What Phase 3 Should Do

Phase 3 remains focused on MODEL-02/03/04/05/06/08 and FIRST-06 from `.planning/REQUIREMENTS.md`:

1. Expose active model clearly in chat UI.
2. Let users switch between Quick / Smart / Genius with progress feedback.
3. Keep model switching seamless (no page reload).
4. Support cancelable downloads with reliable progress/time estimate.
5. Prompt user after first successful chat to download Smart mode.

## Guardrails From Phase 2.2 (Do Not Regress)

1. Keep transport and persistence cancellation intact (`AbortSignal` + cancellation reason flow).
2. Keep persistence reliability behavior intact (versioned save + idempotency + retry/recovery UX).
3. Keep Result-first transport error boundaries and user-safe messaging behavior.
4. Preserve architecture-fit constraints from 02.2 (small functions and lint architecture-check flow).
5. Preserve sidebar stability improvements:
   - conversation list reorders only on real message activity, not on open/select.
   - no route-change loader flicker in sidebar list updates.

## Explicit Risks To Avoid in Phase 3

1. Do not reintroduce global-only model semantics when implementing per-chat model UX.
2. Do not null out active model state during transitions in a way that can retrigger fallback autoload loops.
3. Do not enable service worker dev auto-update loops while validating model-switch UX in local development.
4. Do not mutate `updatedAt`/conversation ordering on chat open; only on actual chat activity.

## Recommended Migration Strategy (Safe Sequence)

1. Behavior first: wire runtime model resolution to `conversation.model` for active chat.
2. State second: keep global engine lifecycle but treat selector choice as conversation-scoped intent.
3. UI third: move model selector from sidebar to input action area (Claude-style pattern).
4. Validation last: verify switching between two existing chats with different models does not reorder/flicker unexpectedly.

## Validation Checklist for Phase 3 PRs

- Switching model does not reload page.
- Switching model does not start infinite autoload loops.
- Opening a conversation does not change ordering unless new message is sent/streamed.
- Sidebar never flashes loading after first mount for route-only changes.
- `npm run type-check` passes.
- Scoped lint for changed files passes; `architecture-check` remains green.
