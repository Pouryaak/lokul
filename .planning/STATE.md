# State: Lokul

**Project:** Privacy-first AI chat that runs 100% in the browser using WebGPU
**Status:** Roadmap created, ready for Phase 6 planning
**Updated:** 2026-02-23

---

## Project Reference

**Core Value:** Privacy by architecture, not by promise — Users can verify with their own eyes (DevTools Network tab) that conversations never leave their device

**Current Milestone:** v1.1 UI Polish + Search + Delete

**Target Users:**
1. Privacy-Conscious Professionals (developers, writers, researchers)
2. Offline Workers (students, travelers, remote workers)
3. Open Source Enthusiasts (GitHub, HN, Reddit community)

---

## Current Position

**Milestone:** v1.1 UI Polish + Search + Delete
**Phase:** Phase 6 (Search, Delete & Shortcuts)
**Current Plan:** 03 of 3
**Status:** Plan 03 complete - Global Keyboard Shortcuts
**Last Activity:** 2026-02-23 — Completed Plan 06-03 (Global Keyboard Shortcuts)

**Progress:**

```
v1.1 Progress: [████░░░░░░░░░░░░░░░░] 50%

Phase 6: Search, Delete & Shortcuts [3/3 plans complete]
Phase 7: UI/UX Polish [Not started]
```

---

## v1.1 Roadmap Summary

| Phase | Goal | Requirements | Plans |
|-------|------|--------------|-------|
| 6. Search, Delete & Shortcuts | Search, delete, keyboard navigation | SRCH-01 to SRCH-05, DEL-01 to DEL-04, KEY-01 to KEY-03 | 3 plans |
| 7. UI/UX Polish | Visual consistency | UX-01 to UX-04 | 2 plans |

**Total v1.1 Requirements:** 16 (100% mapped)

---

## v1.0 Completion Summary

**Milestone v1.0: COMPLETE** (2026-02-23)

| Phase | Plans | Status |
|-------|-------|--------|
| 1. Core Infrastructure | 4/4 | ✓ Complete |
| 2. Chat Interface | 5/5 | ✓ Complete |
| 2.1. AI SDK UI Migration | 7/7 | ✓ Complete |
| 2.2. Stabilization & Refactor | 6/6 | ✓ Complete |
| 3. Model Management | 3/3 | ✓ Complete |
| 4. Memory System | 6/6 | ✓ Complete |
| 5. Polish & PWA | 4/4 | ✓ Complete |

**Shipped Features:**
- Chat interface with streaming responses
- Model management with 3 tiers (Quick/Smart/Genius)
- Performance monitoring panel
- Local storage for conversations (IndexedDB)
- Offline mode (Service Worker + PWA)
- Conversation memory & context management
- First-run experience
- Routing (/chat, /chat/[id])
- AI SDK UI integration
- Stabilized architecture (Result types, cancellation, error boundaries)

---

## v1.1 Target Features

- [x] Full-text search across all conversations (MiniSearch 7.2.0)
- [x] Chat deletion via 3-dot menu with confirmation (existing DropdownMenu + ConfirmDialog)
- [ ] UI/UX polish (buttons, panels, colors, consistency)
- [x] Keyboard shortcuts (react-hotkeys-hook 5.2.4)

---

## Accumulated Context

### Decisions Made (v1.1)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-23 | 2-phase structure for v1.1 | Core features (search, delete, shortcuts) cluster naturally; UI polish is separate cleanup pass |
| 2026-02-23 | MiniSearch for full-text search | Actively maintained, zero dependencies, browser-native, better than abandoned Lunr.js |
| 2026-02-23 | react-hotkeys-hook for shortcuts | React-specific, actively maintained, excellent DX with useHotkeys hook |
| 2026-02-23 | Use existing DropdownMenu + ConfirmDialog | No new shadcn components needed, reuse existing patterns |
| 2026-02-23 | No undo for delete | Simpler UX, delete is permanent with confirmation dialog protection |
| 2026-02-23 | Inline rename in sidebar | Simpler UX than modal, Enter/Escape keyboard support |
| 2026-02-23 | Hover-only menu in sidebar | Cleaner UI, menu only visible on hover in expanded state |
| 2026-02-23 | Override browser Cmd+K/Cmd+N defaults | Consistent app experience, preventDefault on shortcuts |
| 2026-02-23 | Platform-aware keyboard hints | Show ⌘ on macOS, Ctrl on other platforms for better UX |
| 2026-02-23 | Priority-based overlay closing | Escape closes search > memory > performance panels in order |
| 2026-02-23 | MiniSearch fuzzy=0.2 with prefix matching | Flexible matching that catches typos while maintaining relevance |
| 2026-02-23 | Title boost 2x in search | Matches in conversation title ranked higher than content matches |
| 2026-02-23 | Lazy search index initialization | Build index on first search, not app load, for faster startup |
| 2026-02-23 | 300ms search debounce | Reduce unnecessary queries while maintaining responsive feel |
| 2026-02-23 | Extended CommandPalette for controlled query | Enable external MiniSearch integration while keeping UI consistent |

### Decisions Made (v1.0)

| Date | Decision | Rationale |
|------|----------|-----------|
| 2026-02-17 | 5-phase roadmap structure | Standard depth, natural delivery boundaries from requirements |
| 2026-02-17 | Phase 1 = Infrastructure first | Web Worker architecture must be established early |
| 2026-02-17 | Use shadcn/ui patterns with CVA for variants | Consistent, composable component API |
| 2026-02-18 | Use crypto.randomUUID() for IDs | Standard, cryptographically secure ID generation |
| 2026-02-18 | Auto-generate conversation titles from first message | User-friendly, reduces manual title entry |
| 2026-02-18 | Use react-markdown for AI message rendering | Full markdown support with XSS-safe rendering |
| 2026-02-18 | Use sonner for toast notifications | Lightweight, modern toast library |
| 2026-02-18 | Use shadcn sidebar primitives for chat layout | Collapsible sidebar with built-in state management |
| 2026-02-18 | Use BrowserRouter for client-side routing | URL-based navigation and deep linking |
| 2026-02-18 | Use ChatTransport interface for WebLLM integration | Standard AI SDK UI pattern for custom transports |
| 2026-02-18 | Model IDs must include -MLC suffix | WebLLM v0.2.80 requires suffix for prebuilt model IDs |

### v1.0 Technical Debt (RESOLVED)

All critical technical debt from v1.0 was addressed in Phase 2.2:
- ✓ Race conditions in persistence
- ✓ Missing abort implementation
- ✓ Memory leaks in transport
- ✓ Dual state management
- ✓ Request deduplication
- ✓ Inconsistent error handling
- ✓ Missing Error Boundary

---

## Session Continuity

**Last Action:** Completed Plan 06-01 (Search Index & Command Palette)
**Next Action:** Phase 6 complete! Run `/gsd-plan-phase 7` to plan UI/UX Polish

**Key Files:**
- `.planning/PROJECT.md` - Project definition (v1.1 active)
- `.planning/REQUIREMENTS.md` - v1.1 requirements (16 mapped)
- `.planning/ROADMAP.md` - Phase structure (updated with Phase 6, 7)
- `.planning/phases/06-search-delete-shortcuts-v1-1/06-01-SUMMARY.md` - Plan 01 summary (Search)

---

*Milestone v1.1 started: 2026-02-23*
*Roadmap created: 2026-02-23*
*Phase 6 completed: 2026-02-23*
