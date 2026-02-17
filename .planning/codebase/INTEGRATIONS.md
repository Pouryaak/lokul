# External Integrations

**Analysis Date:** 2026-02-17

## APIs & External Services

**No External APIs Required**

This codebase is designed to operate with zero external API dependencies. The architecture is privacy-first with no server-side components.

**Planned Integrations (None Currently):**
- No REST APIs
- No GraphQL endpoints
- No third-party SDKs
- No analytics services
- No tracking pixels

## Data Storage

**Local-Only Storage Architecture:**

**IndexedDB:**
- Location: Browser's IndexedDB API
- Purpose: Persistent storage of conversations, user settings, and memory facts
- Schema: Defined in `/Users/poak/Documents/personal-project/Lokul/src/lib/storage/` (per CLAUDE.md)
- Tables:
  - `conversations` - Chat history and metadata
  - `memory` - Extracted user facts and preferences
  - `settings` - Application configuration

**LocalStorage:**
- Usage: Minimal (Zustand persistence for UI state)
- Purpose: Theme preferences, sidebar state, ephemeral UI settings

**Cache Storage:**
- Service Worker cache for offline PWA support
- Model files cached via browser's Cache API
- Application shell and assets for offline functionality

**File Storage:**
- Local filesystem only (via browser download APIs for exports)
- No cloud storage integration
- No file upload server processing

**Caching:**
- Service Worker caching strategy for offline support
- Model file caching via WebLLM's built-in caching
- No external CDN dependencies (optional for deployment)

## Authentication & Identity

**Auth Provider:** None

**Authentication Approach:**
- No user accounts required
- No login/signup flow
- No identity provider integration
- Anonymous by design

**Rationale:**
- Privacy-first architecture eliminates need for user identification
- All data stored locally on device
- No server-side session management
- No JWT or OAuth tokens

## Monitoring & Observability

**Error Tracking:** None

**Rationale:** No external error tracking to maintain privacy guarantees

**Local Logging:**
- Console logging in development mode only (`import.meta.env.DEV`)
- No production error reporting
- User-facing error messages for critical failures

**Performance Monitoring:**
- Built-in Performance Panel (per CLAUDE.md)
- Local metrics tracking via `/Users/poak/Documents/personal-project/Lokul/src/lib/perf/`
- WebGPU capability detection
- Memory usage monitoring
- Token generation speed tracking

**Logs:**
- Browser console (development only)
- No remote log aggregation
- No log shipping or external log services

## CI/CD & Deployment

**Hosting:**
- Static site hosting (GitHub Pages, Netlify, Vercel, or any static host)
- No server-side rendering required
- No backend API hosting needed

**CI Pipeline:** None detected (project in scaffolded state)

**Recommended CI/CD (per CLAUDE.md conventions):**
- TypeScript compilation check (`npm run type-check`)
- ESLint validation (`npm run lint`)
- Code formatting (`npm run format`)
- Build verification (`npm run build`)

## Environment Configuration

**Required Environment Variables:** None

**Optional Environment Variables:**
- No environment configuration required for core functionality
- Build-time variables only (if needed for deployment configuration)

**Secrets Location:**
- No secrets required (no API keys, no database credentials)
- No `.env` file needed in production
- No key management service integration

## Webhooks & Callbacks

**Incoming Webhooks:** None

**Outgoing Webhooks:** None

**Rationale:**
- No server-to-server communication
- No event-driven external integrations
- No third-party service notifications

## Browser APIs Used

**Core Browser APIs:**
- WebGPU - GPU acceleration for AI inference
- Web Workers - Background AI processing (`/Users/poak/Documents/personal-project/Lokul/src/workers/inference.worker.ts`)
- Service Worker - PWA and offline support
- IndexedDB - Local database storage
- LocalStorage - UI state persistence
- Cache API - Asset and model caching

**React APIs:**
- React 18 Concurrent Features
- Hooks (useState, useEffect, useCallback, useMemo)
- Context API (minimal usage, Zustand preferred)

## Network Communication

**Network Requests:**
- Initial model download (one-time, from CDN or configured source)
- PWA asset caching
- No ongoing network requests during chat
- No telemetry or analytics pings

**Offline Capability:**
- Full offline support after initial load
- All AI inference happens locally
- No network dependencies for core functionality

**CORS Considerations:**
- Model files served from same-origin or configured CDN
- Service Worker intercepts and caches requests
- No cross-origin API calls

## Security Considerations

**Input Validation:**
- Client-side input sanitization
- DOMPurify for HTML sanitization (if rendering markdown)
- Message length limits (10,000 characters max)

**XSS Prevention:**
- React's built-in escaping
- `dangerouslySetInnerHTML` avoided where possible
- DOMPurify for markdown rendering

**Content Security Policy:**
- No external scripts loaded
- Worker-src for Web Workers
- No connect-src restrictions (only for model download)

---

*Integration audit: 2026-02-17*
