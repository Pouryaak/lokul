# Phase 3: Model Management - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 delivers conversation-scoped model management with seamless switching, non-blocking download UX, and explicit download lifecycle visibility.

User approved a roadmap amendment during context discussion:
- Remove Quick mode from active UX strategy.
- Default new chats to Smart mode.
- Replace "post-first-chat Smart download prompt" behavior with direct Smart-default behavior.

This is a scope-level product decision and should be reflected in roadmap/requirements updates before final verification.

</domain>

<decisions>
## Implementation Decisions

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

</decisions>

<specifics>
## Specific Ideas

- "Like Claude": model selection interaction anchored near message input actions.
- UX priority: non-blocking, smooth, user-centric switching/downloading.
- Download visibility should be explicit and centralized in a header-right manager panel.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 3 product scope, with one explicit roadmap amendment captured above.

</deferred>

---

*Phase: 03-model-management*
*Context gathered: 2026-02-18*
