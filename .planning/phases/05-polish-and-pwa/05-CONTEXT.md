# Phase 5: Polish & PWA - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Deliver a polished, responsive chat experience across desktop and mobile, support export of the current conversation as Markdown/JSON/Text, support JSON conversation import, and provide installable PWA behavior. This phase clarifies how these scoped capabilities should behave, without adding new capabilities.

</domain>

<decisions>
## Implementation Decisions

### Responsive chat layout
- Mobile defaults to chat view with a compact header visible.
- Conversation list on small screens uses a slide-over panel (drawer) over chat.
- On mobile, side panels use single-panel focus (opening one closes others).
- Desktop density is adaptive: comfortable by default, compact on narrower desktop widths.

### Large chat browsing
- For 50+ messages, older history loads in chunked batches while scrolling upward.
- Opening an old conversation lands at the latest message (bottom) by default.
- Streaming auto-scroll behavior stays as currently implemented (no change in this phase).
- Long-thread position indicator/jump UI stays as currently implemented (no change in this phase).

### Export/Import UX
- Export/import lives in a per-chat top bar 3-dot menu.
- Primary export UI shows Markdown, JSON, and Text as equal options.
- JSON import uses guided checks before allowing import completion.
- On conversation ID conflict during import, prompt the user each time (replace vs duplicate).

### PWA install experience
- Surface install via a subtle header action.
- Show install UI only after the first successful chat.
- Use a persistent compact status indicator (icon + short text) in the top-right bar.
- If install is unavailable, hide the install affordance silently.
- If user dismisses install, it may reappear in the next session.
- When app goes offline, rely on status change only (no toast/inline interruption).
- After successful install, hide install action.
- For installed users, show no extra onboarding hint.
- In private/incognito contexts, treat install as unavailable (hide).
- Show install action on both mobile and desktop when eligible.

### Claude's Discretion
- Exact copy text for menu labels, status labels, and guided import step wording.
- Visual styling details for compact header/status indicator as long as behavior decisions above remain intact.

</decisions>

<specifics>
## Specific Ideas

- "On each chat, on top bar, we should have a 3 dot menu, and there we should have import/export."
- Keep existing behavior where explicitly requested (streaming auto-scroll and long-thread position UI).

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope.

</deferred>

---

*Phase: 05-polish-and-pwa*
*Context gathered: 2026-02-19*
