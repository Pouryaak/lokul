# Phase 3: Model Management - Research

**Researched:** 2026-02-18  
**Domain:** Conversation-scoped model orchestration, download lifecycle UX, and non-blocking model switching  
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Model Scope Behavior
- Model switching is per-conversation only (not global).
- Opening a conversation always uses that conversation's saved model.
- Switching models mid-conversation keeps the same thread; only future responses use the new model.
- New chats default to Smart mode.

### Switcher Placement UX
- Primary model selector lives in/near input actions (Claude-style interaction pattern).
- Header does not show active model label/badge.
- Sidebar model selector is removed completely.
- Mobile uses the same selector placement as desktop (near input), not a header menu.

### Download Flow States
- Add a dedicated Download Manager in top-right header area.
- Download Manager shows per-model state and availability, including in-progress download progress.
- Selecting an undownloaded model from input selector starts download and opens/focuses Download Manager.
- Downloads are non-blocking; user can continue chatting while download runs.
- On completion, auto-switch to downloaded model when it is still the active requested target.
- Cancel action requires confirmation.
- Failure is surfaced inside Download Manager with inline Retry action.
- Multiple requested downloads run as a queue (one-by-one).
- Status model must be detailed: Queued, Downloading, Compiling, Ready, Failed, Canceled.
- Auto-switch feedback uses both: success toast + selector visual confirmation.

### Smart Prompt Direction
- Smart download prompt flow is removed due Smart-as-default product direction.
- Prompt-related behavior is superseded by model default strategy in this phase.

### Claude's Discretion
- If model X download completes after user manually switched to model Y, do not force-switch; keep Y active and mark X ready.
- Exact microcopy, animation timing, and visual polish for Download Manager/selector feedback.

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 3 product scope, with one explicit roadmap amendment captured above.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MODEL-02 | User can see current active model in UI header | **Needs roadmap/requirement amendment** to match locked decision (no header badge). Implement equivalent visibility in input selector + Download Manager state instead. |
| MODEL-03 | User can switch to Smart Mode via dropdown | Implement conversation-scoped selector near input and conversation-level persistence of `conversation.model`. |
| MODEL-04 | User can switch to Genius Mode via dropdown | Same selector architecture as MODEL-03; supports queued download + deferred auto-switch logic. |
| MODEL-05 | Download progress displays with percentage and time estimate | Use WebLLM `initProgressCallback` progress + elapsed-time-derived estimate, surfaced per model in Download Manager. |
| MODEL-06 | User can cancel an in-progress model download | Use existing model engine termination path, add confirmation modal and explicit per-item canceled state. |
| MODEL-08 | Model switch does not require page reload | Keep route + chat session mounted; swap transport/model intent and engine target without navigation reload. |
| FIRST-06 | Prompt to download Smart Mode shown after first successful chat | **Superseded by locked decision**: remove this prompt and replace with Smart-as-default strategy for new chats/onboarding. |
</phase_requirements>

## Summary

Phase 3 is primarily a state ownership refactor plus a UX relocation. The current system is globally model-scoped: `useModelStore().currentModel` drives chat model usage, autoloads Quick in app bootstrap, and exposes switching in the sidebar (`src/App.tsx:18`, `src/App.tsx:150`, `src/components/chat-layout/AppSidebar.tsx:149`, `src/routes/ChatDetailRoute.tsx:124`). Locked decisions require the opposite: conversation-scoped intent, input-anchored selector, and a dedicated Download Manager in header-right.

The architecture can stay on the current foundations (Zustand + Dexie + WebLLM worker). The key is to split state into: (1) persisted conversation target model, (2) runtime requested model for active conversation, (3) currently loaded engine model, and (4) per-model download lifecycle states. This avoids regressions from Phase 2.2 (ordering semantics, cancellation propagation, route stability) while enabling queued, non-blocking downloads and deterministic auto-switch behavior.

A planning gate exists before implementation: requirements and success criteria still reference now-invalid behavior (header badge and post-first-chat Smart prompt). These must be updated to align with locked context decisions before verification, otherwise implementation will pass product intent but fail phase checks.

**Primary recommendation:** Implement a conversation-scoped model orchestration layer (selector + queue + lifecycle map) and treat `conversation.model` as source of truth, while explicitly amending MODEL-02/FIRST-06 acceptance wording to match the approved scope change.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI composition and route-local state | Existing app baseline; already used in all phase surfaces. |
| Zustand | 5.0.11 | Runtime orchestration state | Existing store pattern for model/settings state; low-friction for queue/lifecycle maps. |
| Dexie + dexie-react-hooks | 4.3.0 / 1.1.7 | Persistent conversation model source of truth + live sidebar updates | Existing persistence path and list reactivity; preserves Phase 2.2 ordering guardrails. |
| @mlc-ai/web-llm | 0.2.80 (project), docs 0.2.81 | Model init + progress + local inference in worker | Official support for worker engines, init progress callbacks, and streaming chat completions. |
| @ai-sdk/react + ai | 3.0.92 / 6.0.90 | Chat lifecycle and streaming transport integration | Current chat stack already wired via `useChat` and custom transport. |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Toast feedback on auto-switch success/failure | Required by locked feedback rule (toast + selector confirmation). |
| ConfirmDialog component | local | Confirmation UX for destructive cancel action | Reuse existing modal pattern for cancel-confirm requirement. |
| React Router DOM | 7.13.0 | Route-scoped conversation selection | Keep active conversation from route params; do not invent parallel routing state. |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zustand queue state | Dedicated queue library (e.g., p-queue) | Additional dependency is unnecessary for single-concurrency model downloads; existing store can serialize with Promise chain/tokenized jobs. |
| Custom persistence mechanism | Keep Dexie + conversation table model field | Dexie is already source of truth; replacing it increases migration risk and regression surface. |
| Header model badge | Input-anchored selector state | Locked decision forbids header active label; selector must carry active confirmation affordance. |

## Current Baseline (What Exists Today)

### Model lifecycle and switching
- Global active model store exists with `currentModel`, `loadModel`, and `cancelDownload` (`src/store/modelStore.ts`).
- Engine already supports in-flight dedupe, retries, and circuit breaker (`src/lib/ai/model-engine.ts`).
- Inference manager already runs in worker and exposes init progress callback (`src/lib/ai/inference.ts`).

### Chat routing and conversation model persistence
- Conversations already persist model as `conversation.model` (`src/lib/storage/conversations.ts:375`).
- `/chat` currently creates a new conversation using global model fallback (`src/routes/ChatRoute.tsx:38`).
- `/chat/:id` currently ignores conversation model at runtime and always uses global loaded model for chat transport (`src/routes/ChatDetailRoute.tsx:124`).

### UI placement mismatch with locked decisions
- Model selector is currently in sidebar (`src/components/chat-layout/AppSidebar.tsx:149`).
- Header currently has no model indicator but has performance controls occupying top-right (`src/components/chat-layout/ChatLayout.tsx:95`, `src/components/chat-layout/ChatLayout.tsx:103`).
- Input section currently has no model actions slot (`src/components/Chat/ai-chat-parts.tsx:117`).

### Bootstrap mismatch with roadmap amendment
- App autoloads Quick model on loading and chat routes (`src/App.tsx:18`, `src/App.tsx:71`, `src/App.tsx:151`).
- Default settings still point to quick-like ID and quick auto-load semantics (`src/lib/storage/settings.ts:17`, `src/lib/storage/settings.ts:19`).

## Architecture Patterns

### Pattern 1: Conversation Model as Source of Truth
**What:** Persist and read active intent from `conversation.model` for the selected route conversation.

**When to use:** Every conversation open, model switch, and new conversation creation.

**Implementation notes:**
- On `/chat/:id` load: resolve `conversation.model` first, then ensure runtime target state reflects it.
- On switch: update only the current conversation model field; do not mutate other conversations.
- Preserve list ordering semantics by avoiding `updatedAt` churn for open/select and model-only metadata updates unless product explicitly wants reorder.

### Pattern 2: Split Runtime State (Requested vs Loaded)
**What:** Maintain separate fields:
- `requestedModelByConversation[conversationId]`
- `engineLoadedModelId`
- `downloadLifecycleByModelId`
- `activeConversationId`

**When to use:** To avoid forced switches and to support queued downloads deterministically.

**Why:** Locked discretion requires “if X completes after user switched to Y, do not force-switch.” This is impossible if only one global `currentModel` exists.

### Pattern 3: Serialized Download Queue with Explicit Lifecycle
**What:** Queue download requests and execute one-by-one with finite states:
`Queued -> Downloading -> Compiling -> Ready` and terminal `Failed` / `Canceled`.

**When to use:** Any request for an undownloaded model while another is active.

**Implementation notes:**
- Reuse existing `modelEngine.loadModel()` execution but orchestrate through queue worker in store/service.
- Keep per-model progress snapshots for Download Manager rendering.
- Inline retry re-enqueues failed item at head (or explicit priority retry) while preserving single concurrency.

### Pattern 4: Non-Blocking Chat During Download
**What:** Continue chat using currently loaded model while target model downloads in background.

**When to use:** Model switch request where target is not ready and another model is available.

**Implementation notes:**
- Selector shows “requested” target; transport keeps using loaded model until switch condition is met.
- On completion, auto-switch only if requested target still matches active conversation target.
- Emit success toast + selector check/highlight as confirmation.

### Pattern 5: Route-Stable UI Composition
**What:** Place selector in input actions on both desktop/mobile; place Download Manager trigger/panel in header-right.

**When to use:** All chat surfaces.

**Implementation notes:**
- Remove sidebar selector entirely.
- Reconcile header-right occupancy with existing performance button (layout stack/adjacent controls).
- Keep route transitions free of sidebar loader flicker regressions from Phase 2.2.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Model binary caching detection | Custom cache probing against browser internals | WebLLM load/init semantics + tracked lifecycle in app state | WebLLM owns artifact cache behavior; app should model status, not reverse-engineer browser cache internals. |
| Global event bus for model status | Ad-hoc pub/sub | Zustand store slices + selector subscriptions | Existing codebase already uses Zustand patterns; lower complexity and better typing. |
| Complex concurrent scheduler | Multi-priority download scheduler | Single-concurrency queue with deterministic order | Locked decision is one-by-one queue; simple serialized worker is sufficient and safer. |
| New modal system | Custom confirm overlay | Existing `ConfirmDialog` component | Already supports destructive confirmations and keyboard/backdrop behavior. |

**Key insight:** The hard part is state coordination, not networking; keep orchestration explicit and deterministic rather than introducing new infrastructure.

## Common Pitfalls

### Pitfall 1: Reintroducing Global Model Semantics
**What goes wrong:** Opening conversation B still uses model from conversation A.
**Why it happens:** Runtime model chosen from global `currentModel` instead of `conversation.model`.
**How to avoid:** Resolve model on route conversation load and bind chat transport to conversation-scoped target.
**Warning signs:** Route changes silently flip model, cross-conversation leakage.

### Pitfall 2: Sidebar Reorder Regressions on Model-Only Events
**What goes wrong:** Conversation jumps in list when user only opens chat or switches model.
**Why it happens:** Updating `updatedAt` for non-message events.
**How to avoid:** Persist model field changes without bumping ordering timestamp unless product intentionally wants reorder.
**Warning signs:** Sidebar order changes after select/open without new messages.

### Pitfall 3: Auto-Switch Race Condition
**What goes wrong:** Download completion force-switches to old target after user picked a different model.
**Why it happens:** Completion handler applies stale request state.
**How to avoid:** Compare completion model with latest requested target for active conversation before switching.
**Warning signs:** Unexpected model jumps after multiple quick switches.

### Pitfall 4: Cancellation Without User Confirmation
**What goes wrong:** Accidental cancel of long download with no safety net.
**Why it happens:** Direct `cancelDownload()` wiring from click.
**How to avoid:** Wrap cancel in confirmation dialog and explicit post-cancel state.
**Warning signs:** User complaints about lost progress after misclick.

### Pitfall 5: Requirement Mismatch at Verification Time
**What goes wrong:** Implementation matches approved context but fails phase verification.
**Why it happens:** MODEL-02/FIRST-06 acceptance text not updated after roadmap amendment.
**How to avoid:** Update phase requirement interpretation before plan finalization.
**Warning signs:** Test script still checks header badge or post-first-chat prompt.

## Code Examples

### Conversation-Scoped Switch Request Handler
```typescript
async function requestConversationModelSwitch(
  conversationId: string,
  targetModelId: string,
  options: { openDownloadManager: () => void }
): Promise<void> {
  await persistConversationModel(conversationId, targetModelId);

  setRequestedModel(conversationId, targetModelId);

  if (isModelReady(targetModelId)) {
    await activateModelForConversation(conversationId, targetModelId);
    showSwitchSuccessToast(targetModelId);
    return;
  }

  enqueueDownload(targetModelId, { conversationId });
  options.openDownloadManager();
}
```

### Queue Worker Completion Guard (stale-request safe)
```typescript
async function onDownloadComplete(modelId: string, conversationId: string): Promise<void> {
  markModelReady(modelId);

  const requested = getRequestedModel(conversationId);
  if (requested !== modelId) {
    // User changed intent after queueing; do not force switch.
    return;
  }

  await activateModelForConversation(conversationId, modelId);
  showSwitchSuccessToast(modelId);
  setSelectorConfirmation(conversationId, modelId);
}
```

### Cancel with Confirmation
```typescript
function handleCancelDownload(modelId: string): void {
  openConfirmDialog({
    title: "Cancel model download?",
    description: "You can retry later from Download Manager.",
    confirmText: "Cancel download",
    onConfirm: () => cancelQueuedOrActiveDownload(modelId),
  });
}
```

## State of the Art (Phase Delta)

| Prior phase text | Updated phase direction | Change trigger | Planning impact |
|------------------|-------------------------|----------------|-----------------|
| Show active model in header | No header model label; selector near input carries active state | Locked context decision | Update acceptance checks and UI test scripts. |
| Post-first-chat Smart prompt | Smart default behavior supersedes prompt | Locked context decision | Remove prompt tasks and replace with default-model/onboarding tasks. |
| Quick-first UX | Smart-default UX | Roadmap amendment | Replace Quick bootstrap paths in app and settings defaults. |

**Deprecated/outdated for this phase:**
- Sidebar model selector as primary control.
- Verification steps that require header model badge.
- FIRST-06 prompt-based Smart download behavior.

## Open Questions

1. **How should conversation ordering behave on model-only updates?**
   - What we know: 02.2 guardrail says no reorder on open/select and avoid route flicker regressions.
   - What's unclear: Whether model-only change should count as meaningful activity for `updatedAt` ordering.
   - Recommendation: Keep ordering unchanged on model-only update for this phase to preserve stability.

2. **How precise must MODEL-05 time estimate be?**
   - What we know: WebLLM progress provides progress ratio + elapsed time callback, not a guaranteed ETA contract.
   - What's unclear: Product tolerance for heuristic ETA variance during compiling/late-stage transitions.
   - Recommendation: Use conservative estimate with fallback text (“estimating...”) and avoid over-promising exactness.

## Sources

### Primary (HIGH confidence)
- Project codebase:
  - `src/store/modelStore.ts` - current global model lifecycle state and callbacks.
  - `src/lib/ai/model-engine.ts` - dedupe/retry/circuit and load orchestration.
  - `src/lib/ai/inference.ts` - worker-backed initialization and progress callback usage.
  - `src/routes/ChatRoute.tsx` - new conversation creation model source.
  - `src/routes/ChatDetailRoute.tsx` - runtime model binding path.
  - `src/components/chat-layout/AppSidebar.tsx` - current sidebar selector placement.
  - `src/components/Chat/ai-chat-parts.tsx` - current input action area.
  - `src/lib/storage/conversations.ts` - conversation model persistence and timestamp behavior.
  - `.planning/phases/03-model-management/03-CONTEXT.md` - locked phase decisions.
  - `.planning/phases/03-model-management/03-NOTES.md` - 02.2 guardrail carryover.

### Secondary (MEDIUM confidence)
- AI SDK UI docs: https://ai-sdk.dev/docs/ai-sdk-ui/chatbot (useChat status/stop/error lifecycle).
- WebLLM docs:
  - https://webllm.mlc.ai/docs/user/basic_usage.html (progress callback + streaming completion support).
  - https://webllm.mlc.ai/docs/user/advanced_usage.html (worker model, cache behavior notes).
  - https://webllm.mlc.ai/docs/user/api_reference.html (MLCEngine config/reload/unload contracts).

### Tertiary (LOW confidence)
- None.

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - existing project stack is explicit and already integrated.
- Architecture: HIGH - patterns are derived from concrete current code paths and locked context decisions.
- Pitfalls: HIGH - directly grounded in observed current implementation and prior phase guardrails.

**Research date:** 2026-02-18  
**Valid until:** 2026-03-20 (30 days; moderate ecosystem churn)
