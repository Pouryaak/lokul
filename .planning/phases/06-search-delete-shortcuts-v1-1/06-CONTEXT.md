# Phase 6: Search, Delete & Shortcuts - Context

**Gathered:** 2026-02-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Add full-text search across all conversations with command palette UX, delete chats via 3-dot menu with confirmation, and global keyboard shortcuts (Cmd+K, Cmd+N, Escape). Builds on Phase 5 polished UI foundation.

</domain>

<decisions>
## Implementation Decisions

### Search UI & Results

- **UI Component:** Use the same command palette component as Model selector; fallback to `command-palette.tsx` if not functional
- **Result format:** Minimal — conversation title + matching text snippet (no date, no role)
- **Result limit:** Show 10 results initially, load more on scroll (infinite scroll pattern)
- **Search scope:** Conversation titles + message content (not memory facts)

### Delete Menu Flow

- **Menu items:** Delete, Rename, Export (include all export options: Markdown, JSON, Text)
- **Confirmation dialog:** Include chat title — "Delete '[Chat Title]'? This conversation will be permanently removed."
- **Post-delete navigation:** Navigate to /chat (new conversation)
- **Feedback:** Toast notification "Conversation deleted" (no undo option)

### Keyboard Shortcuts

- **Scope:** Work everywhere (landing page, chat pages, loading screen)
- **Browser conflicts:** Override browser defaults (Cmd+K normally clears address bar)
- **Visual hints:** Show keyboard shortcut hint in sidebar search input using `kbd.tsx` component
- **Escape key:** Close any open overlay/modal/panel (search, dialogs, sheets)

### Result Navigation

- **Click action:** Just open the conversation (no scroll to message, no highlight)
- **Multiple matches:** Show separate result for each match in same conversation
- **Post-click:** Close search automatically after navigation
- **Empty state:** Helpful message with search tips (not just "No results")

### Claude's Discretion

- Exact empty state copy and design
- Loading skeleton while searching
- Debounce timing for search input
- Fuzzy search threshold configuration

</decisions>

<specifics>
## Specific Ideas

- "Use the same fucking component we used for Model selector" — reuse existing command palette pattern
- Keyboard hints should use `kbd.tsx` component already in the project
- Export menu should have parity with existing per-chat export options

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 06-search-delete-shortcuts-v1-1*
*Context gathered: 2026-02-23*
