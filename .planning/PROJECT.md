# Lokul

## What This Is

Lokul is a ChatGPT-quality AI chat interface that runs **100% in the browser** using WebGPU. **Zero servers**, complete privacy, works offline. All AI inference happens locally on the user's device - no data ever leaves the browser.

## Core Value

**Privacy by architecture, not by promise** - Users can verify with their own eyes (DevTools Network tab shows zero requests) that their conversations never leave their device.

## Requirements

### Validated

- ✓ Chat interface with streaming responses (ChatGPT-style UX) — Phase 2/2.1
- ✓ Model management with 3 tiers — Phase 3
- ✓ Performance monitoring panel — Phase 1/2
- ✓ Local storage for conversations (IndexedDB via Dexie.js) — Phase 2
- ✓ Offline mode (Service Worker + PWA) — Phase 1/5
- ✓ Conversation memory & context management — Phase 4
- ✓ First-run experience (< 60 seconds to first message) — Phase 1
- ✓ Routing (/chat, /chat/[id]) — Phase 2.1
- ✓ AI SDK UI integration — Phase 2.1
- ✓ Stabilized architecture (Result types, cancellation, error boundaries) — Phase 2.2

### Active

- [ ] Full-text search across all conversations
- [ ] Chat deletion with 3-dot menu and confirmation
- [ ] UI/UX polish (buttons, panels, colors, consistency)
- [ ] Keyboard shortcuts

### Out of Scope

- Desktop app (browser-only for v1)
- Mobile app (web only for now)
- Cloud sync (defeats the privacy purpose)
- Custom GPTs/agents (v2+)
- Multi-modal (images/voice — v2+)
- Real-time chat features
- User accounts/authentication (local-only by design)
- Server-side processing or API calls during chat

## Context

**Target Users:**
1. Privacy-Conscious Professionals (developers, writers, researchers)
2. Offline Workers (students, travelers, remote workers)
3. Open Source Enthusiasts (GitHub, HN, Reddit community)

**Technical Environment:**
- React 19 + TypeScript
- Tailwind 4 for styling
- WebLLM (@mlc-ai/web-llm) for AI inference
- WebGPU for GPU acceleration
- Web Workers for background processing
- IndexedDB for local storage
- Service Workers for offline support

**Success Metrics:**
- 10,000+ GitHub stars in first 6 months
- 70%+ first message completion rate
- < 30 seconds first load (Quick Mode)
- < 3 seconds average response time
- < 5% crash rate

## Constraints

**Tech Stack:** React 19, Tailwind 4, WebLLM, WebGPU - Must use modern stack as specified
**Browser Support:** Chrome 120+ and Edge 120+ only (WebGPU requirement)
**Privacy:** No network requests during chat (except initial model download)
**Storage:** Models up to 6.4GB cached locally
**Offline:** Full functionality after first load without internet
**First Load:** < 30 seconds for Quick Mode auto-load

## Current Milestone: v1.1 UI Polish + Search + Delete

**Goal:** Enhance UX with search capability, intuitive delete flow, and visual consistency

**Target features:**
- Full-text search across all conversations (command palette style)
- Chat deletion via 3-dot menu with confirmation dialog
- UI/UX polish (buttons, panels, colors, consistency)
- Keyboard shortcuts (Cmd+K for search)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% browser-based | Privacy-first architecture | ✓ Good |
| WebGPU over WebGL | Performance for AI inference | ✓ Good |
| Local-only storage | Zero data leakage | ✓ Good |
| Three model tiers | Balance speed vs quality vs storage | ✓ Good |
| No user accounts | Simplified UX, no trust required | ✓ Good |
| Open source (MIT) | Verifiable privacy | ✓ Good |

---
*Last updated: 2026-02-23 after v1.1 milestone kickoff*
