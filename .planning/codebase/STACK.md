# Technology Stack

**Analysis Date:** 2026-02-23

## Languages

**Primary:**
- TypeScript 5.9.x - Application and domain logic in `src/**/*.ts` and React UI in `src/**/*.tsx`; compiler config in `tsconfig.json`.

**Secondary:**
- CSS (Tailwind CSS v4 syntax) - Global theming and utility layers in `src/styles/globals.css`.
- HTML - Single-page shell in `index.html`.

## Runtime

**Environment:**
- Browser runtime (WebGPU required for inference) enforced by checks in `src/lib/performance/gpu-detection.ts` and worker-based inference in `src/lib/ai/inference.ts`.
- Node.js 18+ for local development and build/test tooling documented in `README.md`.

**Package Manager:**
- npm (scripts in `package.json`).
- Lockfile: present (`package-lock.json`, lockfileVersion 3).

## Frameworks

**Core:**
- React 19.2.4 - UI layer entry in `src/main.tsx`, routed app composition in `src/App.tsx`.
- React Router 7.13.0 - Client routing in `src/App.tsx` and route modules under `src/routes/`.
- Vite 6.4.1 - Dev server and build pipeline configured in `vite.config.ts`.

**Testing:**
- Vitest 3.2.4 - Test runner via `npm run test` in `package.json` with tests in files like `src/lib/memory/extraction.test.ts` and `src/store/modelStore.test.ts`.
- Testing Library (React + user-event) - Component testing dependencies declared in `package.json`.

**Build/Dev:**
- TypeScript compiler 5.9.3 - Type-check/build gate via `tsconfig.json` and `npm run type-check` in `package.json`.
- ESLint 9 + typescript-eslint - Lint and architecture checks in `eslint.config.js` and scripts in `package.json`.
- Prettier 3 + `prettier-plugin-tailwindcss` - Formatting rules in `.prettierrc`.
- Tailwind CSS 4 + `@tailwindcss/vite` - Styling system in `src/styles/globals.css` and plugin setup in `vite.config.ts`.
- `vite-plugin-pwa` - PWA/service worker build integration in `vite.config.ts`, manifest served from `public/manifest.json`.

## Key Dependencies

**Critical:**
- `@mlc-ai/web-llm` (^0.2.80) - Local LLM inference engine used in `src/lib/ai/inference.ts` and worker bridge in `src/workers/inference.worker.ts`.
- `ai` (^6.0.90) + `@ai-sdk/react` (^3.0.92) - Chat UI transport and streaming contracts in `src/lib/ai/webllm-transport.ts` and `src/hooks/useAIChat.ts`.
- `dexie` (^4.3.0) + `dexie-react-hooks` (^1.1.7) - IndexedDB persistence layer in `src/lib/storage/db.ts` and data hooks like `src/hooks/useConversations.ts`.
- `zustand` (^5.0.11) - Client state management in `src/store/modelStore.ts`, `src/store/settingsStore.ts`, `src/store/memoryStore.ts`, and `src/store/conversationModelStore.ts`.

**Infrastructure:**
- `vite-plugin-pwa` (^0.21.2) - Offline/runtime caching integration in `vite.config.ts` with SW registration usage in `src/components/performance/StatusIndicator.tsx`.
- `react-router-dom` (^7.13.0) - Route-driven shell and chat pages in `src/App.tsx` and `src/routes/*.tsx`.
- `@rive-app/react-webgl2` (^4.27.0) - WebGL-based animated persona rendering in `src/components/ai-elements/persona.tsx`.
- `streamdown` + related packages - Markdown/chat rendering styles imported in `src/main.tsx` and sourced in `src/styles/globals.css`.

## Configuration

**Environment:**
- Runtime env access uses Vite env surface (`import.meta.env`) in files such as `src/lib/ai/inference.ts` and `src/lib/storage/db.ts`.
- Required custom env vars for core runtime: Not detected in source (`VITE_*` keys not referenced in `src/`).
- Environment template exists: `.env.example` (present; contents intentionally not inspected).

**Build:**
- `vite.config.ts` - React plugin, Tailwind plugin, PWA plugin, path alias, worker format.
- `tsconfig.json` and `tsconfig.node.json` - TypeScript and path alias configuration.
- `eslint.config.js` - Flat ESLint configuration and architecture constraints.
- `.prettierrc` - Formatting policy.
- `public/manifest.json` and `index.html` - PWA manifest wiring and app shell metadata.

## Platform Requirements

**Development:**
- Node.js 18+ and npm documented in `README.md`.
- Modern browser for local verification (WebGPU checks and browser guidance in `src/lib/performance/gpu-detection.ts`).

**Production:**
- Static SPA deployment target (Vite-built assets) with browser-side inference and storage; entry shell in `index.html` and client bootstrap in `src/main.tsx`.
- Browser must support WebGPU (hard requirement in `src/lib/performance/gpu-detection.ts`).

---

*Stack analysis: 2026-02-23*
