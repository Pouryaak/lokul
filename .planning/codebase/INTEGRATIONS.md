# External Integrations

**Analysis Date:** 2026-02-23

## APIs & External Services

**AI Model Distribution:**
- Hugging Face model hosting - WebLLM model artifacts are referenced via `modelUrl` fields in `src/lib/ai/models.ts` and loaded through `@mlc-ai/web-llm` in `src/lib/ai/inference.ts`.
  - SDK/Client: `@mlc-ai/web-llm` (`src/lib/ai/inference.ts`, `src/workers/inference.worker.ts`)
  - Auth: Not detected (no token/API key usage in `src/`)

**Asset/CDN Dependencies:**
- Google Fonts CSS endpoint - font stylesheet import in `src/styles/globals.css`.
  - SDK/Client: Browser CSS `@import` in `src/styles/globals.css`
  - Auth: Not applicable
- Vercel Blob public assets (Rive `.riv`) - persona animation sources in `src/components/ai-elements/persona.tsx`.
  - SDK/Client: `@rive-app/react-webgl2` in `src/components/ai-elements/persona.tsx`
  - Auth: Public URLs (no auth detected)
- `models.dev` logo CDN - provider logo images in `src/components/ai-elements/model-selector.tsx`.
  - SDK/Client: Browser `<img>` URL usage in `src/components/ai-elements/model-selector.tsx`
  - Auth: Not applicable

**External Deep-link Targets (user-triggered outbound links):**
- Chat providers and tools (ChatGPT, Claude, Cursor, T3, v0, Scira, GitHub) opened via generated URLs in `src/components/ai-elements/open-in-chat.tsx`.
  - SDK/Client: Browser navigation via URL construction in `src/components/ai-elements/open-in-chat.tsx`
  - Auth: User-managed on destination service (not handled in this codebase)

## Data Storage

**Databases:**
- IndexedDB (local browser storage) managed with Dexie.
  - Connection: Not environment-variable based; browser-native IndexedDB in `src/lib/storage/db.ts`
  - Client: `dexie` / `dexie-react-hooks` in `src/lib/storage/db.ts` and `src/hooks/useConversations.ts`

**File Storage:**
- Local filesystem only for user-selected temporary blobs in browser memory/object URLs (`URL.createObjectURL`) in `src/components/ai-elements/prompt-input.tsx`.

**Caching:**
- Service worker + Workbox precache via `vite-plugin-pwa` configuration in `vite.config.ts`.
- Browser cache/IndexedDB usage for model and app data coordinated by WebLLM and storage modules in `src/lib/ai/inference.ts` and `src/lib/storage/db.ts`.

## Authentication & Identity

**Auth Provider:**
- Custom: None (no login/session/account system detected in `src/`).
  - Implementation: Not applicable

## Monitoring & Observability

**Error Tracking:**
- None detected (no Sentry/Datadog/Rollbar SDK usage in `src/`).

**Logs:**
- Browser console logging gated by `import.meta.env.DEV` in modules such as `src/lib/ai/inference.ts`, `src/lib/storage/db.ts`, and `src/lib/ai/webllm-transport.ts`.

## CI/CD & Deployment

**Hosting:**
- Static web app deployment model (Vite SPA + PWA) implied by `vite.config.ts`, `index.html`, and `public/manifest.json`.

**CI Pipeline:**
- Not detected (no `.github/workflows/*.yml` present).

## Environment Configuration

**Required env vars:**
- No required custom runtime env vars detected in source (`VITE_*` references not found under `src/`).
- Vite built-in env flags (`import.meta.env.DEV`) used across modules, including `src/lib/ai/inference.ts`.

**Secrets location:**
- `.env.example` is present at repository root as environment configuration template.
- No secret-dependent integration keys are referenced in code paths under `src/`.

## Webhooks & Callbacks

**Incoming:**
- None for network webhooks/endpoints (no backend webhook handlers detected).
- Browser event callbacks for PWA install lifecycle in `src/hooks/useInstallEligibility.ts` (`beforeinstallprompt`, `appinstalled`).

**Outgoing:**
- None for webhook POST callbacks.
- Outbound user-initiated navigation links in `src/components/ai-elements/open-in-chat.tsx` and landing/footer link modules under `src/components/landing/`.

---

*Integration audit: 2026-02-23*
