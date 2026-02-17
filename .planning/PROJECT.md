# Lokul

## What This Is

Lokul is a ChatGPT-quality AI chat interface that runs **100% in the browser** using WebGPU. **Zero servers**, complete privacy, works offline. All AI inference happens locally on the user's device - no data ever leaves the browser.

## Core Value

**Privacy by architecture, not by promise** - Users can verify with their own eyes (DevTools Network tab shows zero requests) that their conversations never leave their device.

## Requirements

### Validated

(Scaffold stage - no features implemented yet)

### Active

- [ ] Chat interface with streaming responses (ChatGPT-style UX)
- [ ] Model management with 3 tiers: Quick (Phi-2, ~80MB), Smart (Llama 3.2 3B, ~2.8GB), Genius (Mistral 7B, ~6.4GB)
- [ ] Performance monitoring panel (memory, GPU status, tokens/sec)
- [ ] Local storage for conversations (IndexedDB via Dexie.js)
- [ ] Offline mode (Service Worker + PWA)
- [ ] Conversation memory & context management (three-tier memory system)
- [ ] First-run experience (< 60 seconds to first message)

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

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| 100% browser-based | Privacy-first architecture | — Pending |
| WebGPU over WebGL | Performance for AI inference | — Pending |
| Local-only storage | Zero data leakage | — Pending |
| Three model tiers | Balance speed vs quality vs storage | — Pending |
| No user accounts | Simplified UX, no trust required | — Pending |
| Open source (MIT) | Verifiable privacy | — Pending |

---
*Last updated: 2026-02-17 after initialization*
