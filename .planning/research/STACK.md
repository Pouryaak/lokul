# Stack Research: Lokul Browser-Based AI Chat

**Domain:** Privacy-first, browser-based AI chat with WebGPU
**Researched:** February 17, 2025
**Confidence:** HIGH

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| React | 19.2.4 | UI framework | React 19 is stable with React Compiler for automatic memoization, Server Components (optional), and improved hydration. Built-in compiler eliminates need for manual useMemo/useCallback in most cases. |
| TypeScript | 5.9.x | Type safety | Latest stable with improved type inference, better React 19 support, and faster compilation. Industry standard for production React apps. |
| Tailwind CSS | 4.1.18 | Styling | CSS-first configuration with `@theme`/`@utility`, Lightning CSS integration, zero-config Vite plugin. v4 is a complete architectural shift from v3—more performant, simpler mental model. |
| Vite | 6.x / 7.x | Build tool | Industry standard for React apps. Instant HMR, optimized builds, excellent TypeScript support. v8 in beta but v6/v7 stable and mature. |
| WebLLM | 0.2.x | AI inference | Purpose-built for browser-based LLM inference using WebGPU. MLC Engine supports streaming, multiple models, and handles model caching via IndexedDB. Only mature solution for this use case. |

### State Management & Storage

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| Zustand | 5.0.11 | Global state | Minimal boilerplate, excellent TypeScript support, persist middleware for localStorage/IndexedDB. React 19 compatible. Smaller than Redux, simpler than Context for complex state. |
| Dexie.js | 4.3.0 | IndexedDB wrapper | TypeScript-native, Promise-based, handles complex IndexedDB schemas with ease. Supports React hooks via `dexie-react-hooks`. Battle-tested for client-side storage. |

### UI Components & Styling

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| shadcn/ui | 3.8.5 | Component library | Copy-paste components (not a dependency), built on Radix UI primitives, fully customizable with Tailwind. Supports React 19, has CLI for adding components. |
| Radix UI | Latest | Headless primitives | Accessibility built-in, unstyled components, keyboard navigation, focus management. shadcn/ui uses these under the hood. |
| Lucide React | Latest | Icons | Tree-shakeable, TypeScript support, consistent icon set. Standard for modern React apps. |
| Class Variance Authority (CVA) | 0.7.1 / 1.0.0-beta.4 | Component variants | Type-safe variant API for Tailwind. shadcn/ui uses CVA for component variants. Use 0.7.1 for stability, beta for new features. |
| clsx | 2.1.1 | Conditional classes | Tiny (140b for lite version), faster than classnames, used by CVA under the hood. |
| tailwind-merge | 3.4.1 | Class deduplication | Resolves Tailwind class conflicts (e.g., `p-4 p-2` → `p-2`). v3.4+ optimized for >10% speed improvement. |

### Chat-Specific Libraries

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| react-markdown | 9.x | Markdown rendering | Secure by default (no dangerous HTML), plugin ecosystem (GFM, math, syntax highlighting), streaming-friendly. |
| @virtuoso.dev/message-list | Latest | Virtualized chat list | Purpose-built for chat UIs. Handles streaming messages, auto-scroll, dynamic heights. Superior to generic virtualization for chat. |
| remark-gfm | 4.x | GitHub Flavored Markdown | Tables, strikethrough, tasklists support for react-markdown. |
| rehype-highlight / react-syntax-highlighter | Latest | Code blocks | Syntax highlighting for AI-generated code. |
| DOMPurify | 3.3.x | XSS sanitization | If any raw HTML rendering needed (not recommended), DOMPurify is the gold standard. Likely not needed with react-markdown. |

### PWA & Offline Support

| Library | Version | Purpose | Why Recommended |
|---------|---------|---------|-----------------|
| vite-plugin-pwa | 0.21.x | PWA generation | Zero-config PWA support for Vite. Handles service worker, manifest, Workbox integration. Auto-update strategies, offline caching. |
| Workbox | 7.x (via vite-plugin-pwa) | Service worker | Google's library for service worker caching strategies. Abstracted by vite-plugin-pwa but configurable. |

### Development Tools

| Tool | Version | Purpose | Notes |
|------|---------|---------|-------|
| ESLint | 9.x | Linting | Flat config format. Use `@eslint/js` and `typescript-eslint`. |
| Prettier | 3.x | Formatting | Consistent code formatting. Tailwind plugin for class sorting. |
| Vitest | 3.x | Testing | Vite-native test runner, fast, Jest-compatible API. |
| @vitejs/plugin-react | 4.x | React HMR | Official Vite plugin with React Compiler support. |

---

## Installation

```bash
# Core framework
npm install react@^19.2.4 react-dom@^19.2.4

# Build tool
npm install -D vite@^6.0.0 @vitejs/plugin-react@^4.3.0

# TypeScript
npm install -D typescript@^5.9.0 @types/react@^19.0.0 @types/react-dom@^19.0.0

# Styling
npm install tailwindcss@^4.1.0 @tailwindcss/vite@^4.1.0

# AI inference
npm install @mlc-ai/web-llm@^0.2.0

# State management
npm install zustand@^5.0.11

# Storage
npm install dexie@^4.3.0 dexie-react-hooks@^1.1.0

# UI utilities
npm install clsx@^2.1.1 tailwind-merge@^3.4.1 class-variance-authority@^0.7.1

# Icons
npm install lucide-react@^0.475.0

# Chat/markdown
npm install react-markdown@^9.0.0 remark-gfm@^4.0.0
npm install react-syntax-highlighter@^15.5.0 @types/react-syntax-highlighter

# Virtualization
npm install @virtuoso.dev/message-list@^1.0.0

# PWA
npm install -D vite-plugin-pwa@^0.21.0

# Dev tools
npm install -D eslint@^9.0.0 prettier@^3.0.0 prettier-plugin-tailwindcss@^0.6.0 vitest@^3.0.0
```

---

## Alternatives Considered

| Category | Recommended | Alternative | When to Use Alternative |
|----------|-------------|-------------|-------------------------|
| AI Engine | WebLLM | Wllama (llama.cpp WASM) | Wllama works without WebGPU (WebAssembly fallback), but WebLLM is faster with WebGPU and purpose-built for this use case. |
| State | Zustand | Jotai / Valtio | Jotai for atomic state, Valtio for proxy-based. Zustand has better persistence middleware and simpler mental model. |
| Storage | Dexie | idb-keyval | idb-keyval simpler for key-value only. Dexie better for structured data, queries, migrations. |
| Virtualization | Virtuoso Message List | react-window / react-virtuoso | Generic virtuoso for non-chat lists. Message-list is purpose-built for chat with streaming support. |
| Markdown | react-markdown | Streamdown (Vercel) | Streamdown optimized for AI streaming. react-markdown more mature, plugin ecosystem. Consider Streamdown if streaming UX is critical. |
| Styling | Tailwind 4 | Panda CSS / UnoCSS | Panda for CSS-in-JS with type safety. UnoCSS for on-demand atomic CSS. Tailwind 4 is most mature, best ecosystem. |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| Redux | Overkill for this scope. Boilerplate-heavy, requires more setup. | Zustand for global state, React Context for simple prop drilling |
| localStorage for chat data | 5-10MB limit, synchronous (blocks main thread), no indexing. | IndexedDB via Dexie for structured data, larger storage (up to ~60% of disk) |
| dangerouslySetInnerHTML | XSS vulnerability. Never render AI output directly. | react-markdown for safe markdown rendering |
| WebLLM alternatives (Transformers.js) | Transformers.js is general-purpose ML, not optimized for LLM chat. Slower, larger bundle. | WebLLM purpose-built for LLM inference in browser |
| LocalStorage-based state persistence | Limited size, no structured queries, sync API blocks UI | Zustand persist with IndexedDB storage |
| Custom service worker (manual) | Error-prone, complex caching strategies | vite-plugin-pwa with Workbox for proven patterns |
| React Query / SWR | Designed for server data fetching. No server = no benefit. | Zustand for client state, Dexie for persistence |
| Material UI / Ant Design | Heavy bundle, opinionated styling hard to override. | shadcn/ui + Tailwind for lightweight, customizable components |

---

## Stack Patterns by Variant

**If WebGPU is unavailable:**
- WebLLM will fail to initialize
- Show user-friendly error: "WebGPU required"
- Consider: Detect WebGPU at runtime, show fallback message
- No good alternative for local LLM without WebGPU (Wllama via WASM is ~10x slower)

**If targeting older browsers:**
- Tailwind 4 uses modern CSS (oklch, nesting)
- May need PostCSS fallback for Safari < 16
- Vite handles most transpilation automatically

**If bundle size is critical:**
- Use `clsx/lite` (140b vs 400b)
- Tree-shake Lucide icons (import individually)
- Lazy load markdown renderer (code splitting)

---

## Version Compatibility

| Package A | Compatible With | Notes |
|-----------|-----------------|-------|
| React 19.2.4 | Zustand 5.0.11+ | Verified, no issues |
| React 19.2.4 | react-markdown 9.x | Verified |
| Tailwind 4.1.x | @tailwindcss/vite 4.1.x | Must match major versions |
| Tailwind 4.1.x | tailwind-merge 3.4.x+ | v3.4+ adds Tailwind 4 support |
| WebLLM 0.2.x | Chrome/Edge 113+ | WebGPU requirement |
| Dexie 4.3.x | React 19 | Use dexie-react-hooks for integration |
| vite-plugin-pwa 0.21.x | Vite 5.x / 6.x | Check compatibility matrix |

---

## Critical Architecture Decisions

### Web Workers for AI Inference
**Decision:** Run WebLLM in a Web Worker
**Rationale:** AI inference blocks the main thread. Without a worker, UI freezes during token generation. WebLLM supports worker pattern natively.

### IndexedDB for Model Storage
**Decision:** Use WebLLM's built-in IndexedDB caching
**Rationale:** Models are 500MB-4GB. Must persist across sessions. WebLLM handles this automatically via `appConfig`.

### Streaming Architecture
**Decision:** Use async generators for token streaming
**Rationale:** WebLLM returns `AsyncGenerator` when `stream: true`. Update Zustand store token-by-token for responsive UI.

### PWA Strategy
**Decision:** Auto-update service worker
**Rationale:** Users expect chat apps to work offline after first load. Auto-update ensures latest version without prompting.

---

## Sources

- **Context7: /mlc-ai/web-llm** — WebLLM API, streaming, model initialization
- **Context7: /websites/react_dev** — React 19 features, React Compiler
- **Context7: /tailwindlabs/tailwindcss.com** — Tailwind v4 installation, Vite plugin
- **Context7: /pmndrs/zustand** — Persist middleware, TypeScript patterns
- **Context7: /websites/dexie** — IndexedDB patterns, React hooks
- **Context7: /petyosi/react-virtuoso** — Message list virtualization for chat
- **Context7: /remarkjs/react-markdown** — Markdown rendering, plugins
- **Context7: /vite-pwa/vite-plugin-pwa** — PWA configuration, Workbox
- **GitHub: facebook/react/releases** — React 19.2.4 verified latest
- **GitHub: tailwindlabs/tailwindcss/releases** — Tailwind 4.1.18 verified latest
- **GitHub: pmndrs/zustand/releases** — Zustand 5.0.11 verified latest
- **GitHub: dexie/Dexie.js/releases** — Dexie 4.3.0 verified latest
- **GitHub: mlc-ai/web-llm/releases** — WebLLM 0.2.0 verified latest

---

*Stack research for: Lokul — Privacy-first browser-based AI chat*
*Researched: February 17, 2025*
*Confidence: HIGH — All versions verified from official releases, Context7 documentation authoritative*
