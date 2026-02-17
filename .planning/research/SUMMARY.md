# Project Research Summary

**Project:** Lokul
**Domain:** Privacy-first, browser-based AI chat with WebGPU
**Researched:** February 17, 2026
**Confidence:** HIGH

## Executive Summary

Lokul is a privacy-first AI chat application that runs entirely in the browser using WebGPU for local inference. Based on comprehensive research, the recommended approach uses React 19 with TypeScript, Tailwind CSS v4, and Vite as the core stack, with WebLLM handling AI inference via Web Workers. This architecture enables true offline operation while maintaining responsive UI performance.

The key insight from research is that browser-based AI requires careful separation of concerns: AI inference must run in Web Workers to prevent UI blocking, storage must use IndexedDB (not localStorage) for multi-GB model caching, and context window management is critical since local models have much smaller limits (2K-8K tokens) than cloud alternatives. The three-tier memory system (Core Facts + Daily Context + Recent Messages) is essential for delivering quality conversations within these constraints.

Primary risks are memory exhaustion (models require 2GB-8GB VRAM), WebGPU compatibility gaps (Chrome 113+ required), and context window overflow. These are mitigated through comprehensive GPU detection before initialization, proactive memory monitoring with user warnings, and automatic compaction at 80% of context limits. The architecture must be established correctly from Phase 1 — refactoring from main-thread inference to Web Workers later is prohibitively expensive.

## Key Findings

### Recommended Stack

The stack is built around mature, production-ready libraries with strong TypeScript support. React 19 provides the React Compiler for automatic memoization, eliminating manual useMemo/useCallback in most cases. WebLLM is the only mature solution for browser-based LLM inference — alternatives like Transformers.js are general-purpose and significantly slower.

**Core technologies:**
- **React 19.2.4**: UI framework — React Compiler eliminates manual memoization, Server Components optional
- **TypeScript 5.9.x**: Type safety — industry standard, improved React 19 support
- **Tailwind CSS 4.1.18**: Styling — CSS-first with Lightning CSS, zero-config Vite plugin
- **Vite 6.x**: Build tool — instant HMR, optimized builds, standard for React apps
- **WebLLM 0.2.x**: AI inference — purpose-built for browser LLM, only mature solution
- **Zustand 5.0.11**: State management — minimal boilerplate, persist middleware for IndexedDB
- **Dexie.js 4.3.0**: IndexedDB wrapper — TypeScript-native, Promise-based, migration support
- **shadcn/ui 3.8.5**: Component library — copy-paste components on Radix primitives

### Expected Features

Research confirms users expect streaming responses, markdown rendering, and conversation history as table stakes. Lokul's differentiators are privacy-by-architecture (verifiable, not promised), 100% offline operation, and the three-tier memory system for effectively infinite context.

**Must have (table stakes):**
- Streaming responses — ChatGPT/Claude set the standard; WebLLM supports via AsyncGenerator
- Markdown rendering with syntax highlighting — code blocks expected in AI responses
- Conversation history sidebar — users reference past chats; standard pattern
- Message input with auto-resize — static inputs feel broken
- Copy/regenerate/clear conversation — basic chat operations
- Dark/light mode — modern apps expected to respect preference
- Export conversations — data portability builds trust

**Should have (competitive):**
- 100% offline operation — core differentiator via Service Worker + WebLLM
- Multi-tier model system (Quick/Smart/Genius) — trade speed for quality
- Three-tier memory system — "infinite" context via fact extraction
- Real-time performance panel — transparency builds trust
- Zero-account onboarding — removes major friction vs competitors
- PWA install — native-like experience

**Defer (v2+):**
- Cloud sync — violates privacy-first principle
- Voice I/O — high complexity, browser API limitations
- Image understanding — vision models 10GB+, slow inference
- Custom GPTs/agents — complex UI, niche use case

### Architecture Approach

The architecture follows a four-layer pattern: Presentation (React components), Application (Zustand stores), Service (AI, storage, performance), and Infrastructure (Web Workers, IndexedDB, WebGPU). This separation enables testing, allows backend flexibility, and keeps UI responsive.

**Major components:**
1. **Web Worker with MLCEngine** — AI inference off main thread; prevents UI blocking
2. **Inference Service** — Orchestrates AI requests, handles streaming via async generators
3. **Context Builder** — Assembles conversation context; manages token limits
4. **Dexie.js Storage Layer** — Conversations, memory facts, settings persistence
5. **Zustand Stores** — Domain-specific state (chat, model, settings, UI)
6. **Service Worker** — PWA functionality, offline asset caching

### Critical Pitfalls

Research identified eight critical pitfalls, with three requiring immediate attention in Phase 1:

1. **Main Thread Blocking** — Always use Web Workers (`CreateWebWorkerMLCEngine`). Main-thread inference causes "Page Unresponsive" dialogs. Recovery cost: HIGH (requires architectural refactor).

2. **Memory Exhaustion** — Check GPU capabilities before loading models. Monitor via `engine.runtimeStatsText()`. Implement three-tier memory and auto-compaction at 80% limits. Local models need 2GB-8GB VRAM.

3. **WebGPU Compatibility** — Not universal (Chrome 113+, Edge 113+, Safari 17.4+). Check `navigator.gpu` and `requestAdapter()` before initialization. Provide clear error messages with actionable steps.

4. **Context Window Overflow** — Local models have 2K-8K token limits vs 128K for GPT-4. Implement token counting (~0.75 words/token) and sliding window context management.

5. **Poor Download UX** — Models are 2.8GB-6.4GB. Show explicit progress with bytes downloaded/total. Check `navigator.storage.estimate()` before downloading. Allow graceful cancellation.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Infrastructure
**Rationale:** Foundation must be correct before building features. Web Worker architecture and GPU detection are expensive to refactor later.
**Delivers:** Working Web Worker inference, GPU detection, basic storage schema
**Addresses:** WebGPU compatibility check, first-run experience, Quick Mode auto-load
**Avoids:** Main thread blocking, WebGPU detection failure, cache management issues
**Research Flag:** LOW — well-documented WebLLM patterns, standard PWA setup

### Phase 2: Chat Interface
**Rationale:** Core UX must work before adding advanced features. Streaming and context management are foundational.
**Delivers:** Streaming chat, message input, markdown rendering, conversation storage
**Uses:** WebLLM streaming, react-markdown, Dexie conversations store
**Implements:** Context builder with basic token counting
**Avoids:** Context window overflow, streaming implementation errors
**Research Flag:** LOW — standard patterns from WebLLM docs

### Phase 3: Model Management
**Rationale:** Multi-tier model system is a key differentiator but requires stable chat foundation.
**Delivers:** Model selector, download manager with progress, model switching
**Uses:** WebLLM model registry, IndexedDB caching
**Implements:** Download progress UI, storage quota checks
**Avoids:** Poor download UX, cache corruption
**Research Flag:** MEDIUM — download UX patterns need validation during implementation

### Phase 4: Memory System
**Rationale:** Three-tier memory is complex but essential for quality. Deferred until core chat works.
**Delivers:** Fact extraction, auto-compaction, memory panel
**Uses:** Context builder enhancement, memory store
**Implements:** Three-tier memory (Core Facts + Daily Context + Recent Messages)
**Avoids:** Context window overflow, memory exhaustion
**Research Flag:** HIGH — complex custom logic, needs detailed design research

### Phase 5: Polish & PWA
**Rationale:** PWA features and performance panel enhance UX but aren't blocking.
**Delivers:** PWA install, performance panel, keyboard shortcuts, mobile responsive
**Uses:** vite-plugin-pwa, WebGPU metrics
**Implements:** Performance monitoring, offline badge
**Avoids:** Service worker limitations (keep AI in Web Workers)
**Research Flag:** LOW — standard PWA patterns

### Phase Ordering Rationale

- **Infrastructure before UI:** Web Worker architecture must be established in Phase 1. Refactoring from main-thread inference later is prohibitively expensive.
- **Chat before models:** Basic streaming chat must work before adding model switching complexity.
- **Models before memory:** Memory system requires stable context building; context builder requires working chat.
- **Core before polish:** PWA and performance panel are enhancements, not blockers.

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Memory System):** Complex custom logic for fact extraction and compaction; no established patterns
- **Phase 3 (Model Management):** Download UX patterns need validation; resumable downloads have edge cases

Phases with standard patterns (skip research-phase):
- **Phase 1 (Core Infrastructure):** Well-documented WebLLM worker patterns
- **Phase 2 (Chat Interface):** Standard React + streaming patterns
- **Phase 5 (Polish & PWA):** Established vite-plugin-pwa patterns

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All versions verified from official releases; Context7 documentation authoritative |
| Features | HIGH | Based on PRD analysis, competitive analysis, and WebLLM capabilities |
| Architecture | HIGH | Standard patterns from WebLLM docs, Zustand/Dexie best practices |
| Pitfalls | HIGH | Context7 WebLLM documentation, official API reference, Chrome feature status |

**Overall confidence:** HIGH

### Gaps to Address

- **Token counting accuracy:** ~0.75 words/token is an estimate. May need per-model tokenizers for precision during Phase 4.
- **Fact extraction quality:** Pattern-based extraction in three-tier memory needs validation. May require iteration during Phase 4.
- **Mobile WebGPU support:** Limited real-world data on mobile GPU performance. Monitor during Phase 5.
- **Model registry updates:** WebLLM model list changes. Need strategy for updating without code changes.

## Sources

### Primary (HIGH confidence)
- Context7: /mlc-ai/web-llm — WebLLM API, streaming, worker patterns, caching
- Context7: /websites/react_dev — React 19 features, React Compiler
- Context7: /tailwindlabs/tailwindcss.com — Tailwind v4 installation, Vite plugin
- Context7: /pmndrs/zustand — Persist middleware, TypeScript patterns
- Context7: /websites/dexie — IndexedDB patterns, React hooks
- WebLLM Official GitHub — Advanced usage, API reference

### Secondary (MEDIUM confidence)
- WebGPU MDN — GPU compute in browser
- Chrome Service Worker WebGPU Support — chromiumdash.appspot.com
- WebGPU Report — webgpureport.org

### Tertiary (LOW confidence)
- ChatGPT/Claude competitive analysis — training data, public feature lists

---

*Research completed: February 17, 2026*
*Ready for roadmap: yes*
