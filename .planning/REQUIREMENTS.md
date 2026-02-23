# Requirements: Lokul

**Defined:** 2026-02-17 (v1.0), 2026-02-23 (v1.1)
**Core Value:** Privacy by architecture, not by promise — Users can verify with their own eyes (DevTools Network tab) that conversations never leave their device

---

## v1.0 Requirements (COMPLETE)

All v1.0 requirements shipped. See MILESTONES.md for details.

---

## v1.1 Requirements

### Search (SRCH)

- [ ] **SRCH-01**: User can open search via Cmd/Ctrl+K keyboard shortcut
- [ ] **SRCH-02**: User can search across all message content in all conversations
- [ ] **SRCH-03**: Search results show matching text with conversation title and context
- [ ] **SRCH-04**: User can click a search result to navigate to that conversation
- [ ] **SRCH-05**: Search input is accessible from sidebar (above New Chat button)

### Delete (DEL)

- [ ] **DEL-01**: Each conversation in sidebar has a 3-dot menu (shadcn DropdownMenu)
- [ ] **DEL-02**: User can click "Delete" from the 3-dot menu
- [ ] **DEL-03**: Delete action shows confirmation dialog (shadcn AlertDialog) before removing
- [ ] **DEL-04**: Confirmed delete removes conversation from IndexedDB and sidebar

### UI/UX Polish (UX)

- [ ] **UX-01**: Buttons have consistent styling across the app
- [ ] **UX-02**: Panels have consistent spacing and visual hierarchy
- [ ] **UX-03**: Colors are consistent with design system
- [ ] **UX-04**: Responsive design works on desktop and mobile viewports

### Keyboard Shortcuts (KEY)

- [ ] **KEY-01**: Cmd/Ctrl+K opens global search
- [ ] **KEY-02**: Cmd/Ctrl+N creates new conversation
- [ ] **KEY-03**: Escape closes search/modal/panel

---

## v2 Requirements (Deferred)

### Advanced Search

- **SRCH-06**: User can filter search by date range
- **SRCH-07**: User can search within current conversation only

### Organization

- **ORG-01**: User can organize conversations into folders
- **ORG-02**: User can favorite/star important conversations

### Advanced Features

- **ADV-01**: User can upload and chat about PDF documents
- **ADV-02**: User can set custom system prompts per conversation
- **ADV-03**: User can configure custom keyboard shortcuts

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync | Violates privacy-first architecture; no server infrastructure |
| User accounts | Adds friction, requires backend, contradicts anonymous design |
| Real-time collaboration | Requires server infrastructure, privacy concerns |
| Voice input/output | High complexity, large models, deferred to v2+ |
| Image understanding | Vision models 10GB+, slow inference, v2 scope |
| Custom GPTs/agents | Complex UI, niche use case, delays MVP |
| Desktop native app | PWA provides native-like experience, lower maintenance |
| Mobile native app | Responsive web sufficient for v1, separate codebase cost |
| Plugin system | Security concerns, maintenance burden, no third-party code |
| Analytics/tracking | Violates zero-tracking promise; use GitHub issues instead |
| Server-side search (Algolia) | Requires network, violates privacy-first |

---

## Traceability

### v1.1 Requirements

| Requirement | Phase | Status |
|-------------|-------|--------|
| SRCH-01 | Phase 6 | Pending |
| SRCH-02 | Phase 6 | Pending |
| SRCH-03 | Phase 6 | Pending |
| SRCH-04 | Phase 6 | Pending |
| SRCH-05 | Phase 6 | Pending |
| DEL-01 | Phase 6 | Pending |
| DEL-02 | Phase 6 | Pending |
| DEL-03 | Phase 6 | Pending |
| DEL-04 | Phase 6 | Pending |
| UX-01 | Phase 7 | Pending |
| UX-02 | Phase 7 | Pending |
| UX-03 | Phase 7 | Pending |
| UX-04 | Phase 7 | Pending |
| KEY-01 | Phase 6 | Pending |
| KEY-02 | Phase 6 | Pending |
| KEY-03 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 16 total
- Mapped to phases: 16
- Unmapped: 0 ✓

---

*Requirements defined: 2026-02-17 (v1.0)*
*Last updated: 2026-02-23 after v1.1 milestone kickoff*
