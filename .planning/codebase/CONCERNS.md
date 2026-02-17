# Codebase Concerns

**Analysis Date:** 2026-02-17

## Critical Issues

### Empty Project Scaffold
- **Issue:** Project is entirely scaffold/planned with zero implementation
- **Files:** All files in `/Users/poak/Documents/personal-project/Lokul/src/` are empty or minimal
  - `App.tsx`: 5 lines (returns null)
  - `main.tsx`: 1 line (comment only)
  - `workers/inference.worker.ts`: 1 line (comment only)
  - All component directories: contain only `.gitkeep` files
  - All lib directories: contain only `.gitkeep` files
  - All hooks: empty
  - All stores: empty
  - All styles: empty
- **Impact:** Complete implementation needed from scratch
- **Fix approach:** Begin systematic implementation following CLAUDE.md architecture

### No TypeScript Configuration
- **Issue:** `tsconfig.json` is missing
- **Impact:** TypeScript compilation will fail; no type checking enabled
- **Fix approach:** Create `tsconfig.json` with strict settings per CLAUDE.md guidelines

### No Build Configuration
- **Issue:** `vite.config.ts` is empty scaffold (exports empty object)
- **Files:** `/Users/poak/Documents/personal-project/Lokul/vite.config.ts`
- **Impact:** Cannot build, run, or develop the application
- **Fix approach:** Implement Vite config with React plugin, PWA support, worker configuration

### No Styling Configuration
- **Issue:** `tailwind.config.ts` is empty scaffold
- **Files:** `/Users/poak/Documents/personal-project/Lokul/tailwind.config.ts`
- **Impact:** No styling system available; UI cannot be built
- **Fix approach:** Configure Tailwind with CSS variables per CLAUDE.md design system

## Tech Debt

### Missing Package Dependencies
- **Issue:** `package.json` contains no dependencies
- **Files:** `/Users/poak/Documents/personal-project/Lokul/package.json`
- **Impact:** No libraries installed; cannot import React, WebLLM, or any dependencies
- **Required packages per PRD:**
  - React 18+ with TypeScript
  - @mlc-ai/web-llm (WebLLM for AI inference)
  - Zustand (state management)
  - Dexie.js (IndexedDB wrapper)
  - Tailwind CSS
  - Vite with PWA plugin
  - react-markdown + remark-gfm
  - Comlink (Web Worker communication)
  - web-vitals
- **Fix approach:** Install all dependencies with npm/yarn

### Missing Core Infrastructure

**Web Worker Infrastructure:**
- **Issue:** AI inference worker is not implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/workers/inference.worker.ts` (empty)
- **Impact:** Cannot run AI models; core feature blocked
- **Requirements per CLAUDE.md:**
  - WebLLM engine initialization
  - Message handling (INIT, GENERATE, ABORT)
  - Progress callbacks
  - Streaming response handling
  - Error handling

**Storage Layer:**
- **Issue:** No IndexedDB/Dexie implementation
- **Files:** All files in `/Users/poak/Documents/personal-project/Lokul/src/lib/storage/` are empty
- **Impact:** Cannot persist conversations, memory, or settings
- **Requirements:**
  - Database schema (conversations, memory, settings)
  - CRUD operations
  - Migration strategy

**State Management:**
- **Issue:** No Zustand stores implemented
- **Files:** All files in `/Users/poak/Documents/personal-project/Lokul/src/store/` are empty
- **Impact:** No application state management
- **Requirements:**
  - Chat store (messages, streaming state)
  - Model store (current model, download progress)
  - Settings store (user preferences)
  - UI store (sidebar, panels)

**AI Integration:**
- **Issue:** No WebLLM integration
- **Files:** All files in `/Users/poak/Documents/personal-project/Lokul/src/lib/ai/` are empty
- **Impact:** Cannot load or run AI models
- **Requirements:**
  - Model configurations (Quick/Smart/Genius modes)
  - Inference orchestration
  - Context window management

## Security Considerations

### No Input Validation
- **Issue:** No validation utilities implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/lib/utils/validators.ts` (doesn't exist)
- **Impact:** XSS vulnerabilities when rendering user content
- **Requirements per CLAUDE.md:**
  - Message length validation (max 10,000 chars)
  - Content sanitization
  - Markdown rendering security (DOMPurify or react-markdown)

### No Error Boundaries
- **Issue:** React error boundaries not implemented
- **Impact:** Application crashes will unmount entire UI
- **Fix approach:** Implement ErrorBoundary component per CLAUDE.md pattern

## Performance Bottlenecks

### No WebGPU Detection
- **Issue:** GPU detection not implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/lib/performance/gpu-detection.ts` (empty)
- **Impact:** Cannot detect browser capabilities or provide fallbacks
- **Requirements:**
  - WebGPU support detection
  - Memory capacity estimation
  - Performance tier classification

### No Memory Monitoring
- **Issue:** Memory tracking not implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/lib/performance/memory-monitor.ts` (empty)
- **Impact:** Cannot prevent out-of-memory crashes
- **Risk:** Browser crashes when loading large models (6.4GB Genius mode)

### No Performance Metrics
- **Issue:** Performance tracking not implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/lib/performance/metrics.ts` (empty)
- **Impact:** Cannot measure response times or optimize
- **Requirements per PRD:**
  - < 30 seconds first load (Quick Mode)
  - < 3 seconds average response time
  - < 100ms UI lag during streaming

## Fragile Areas

### Missing PWA Configuration
- **Issue:** Service worker and manifest not configured
- **Files:**
  - `/Users/poak/Documents/personal-project/Lokul/public/manifest.json` (exists but needs verification)
  - `/Users/poak/Documents/personal-project/Lokul/src/lib/pwa/` (empty)
- **Impact:** Offline mode (core feature) will not work
- **Requirements:**
  - vite-plugin-pwa configuration
  - Service worker for offline caching
  - Model asset caching strategy

### No Memory Management
- **Issue:** Memory fact extraction and compaction not implemented
- **Files:** `/Users/poak/Documents/personal-project/Lokul/src/lib/memory/` (doesn't exist)
- **Impact:** Cannot persist user preferences/context across sessions
- **Requirements per PRD:**
  - Fact extraction from conversations
  - Context window management
  - Auto-compaction logic

## Test Coverage Gaps

### No Testing Framework
- **Issue:** No test files or configuration
- **Impact:** Cannot verify functionality or prevent regressions
- **Requirements per CLAUDE.md:**
  - Vitest for unit testing
  - React Testing Library for components
  - Test coverage for:
    - Token calculation
    - Context building
    - Storage operations
    - Component rendering

## Scaling Limits

### Model Download Strategy
- **Issue:** No download management implemented
- **Impact:** Users cannot download models; core feature blocked
- **Requirements per PRD:**
  - Quick Mode: Phi-2 2.7B (~80MB) - auto-load
  - Smart Mode: Llama 3.2 3B (~2.8GB) - optional
  - Genius Mode: Mistral 7B (~6.4GB) - optional
  - Background download with progress
  - Storage quota handling

### Browser Compatibility
- **Issue:** No browser detection or fallbacks
- **Impact:** Will fail silently on unsupported browsers
- **Requirements:**
  - Chrome 120+ and Edge 120+ support
  - WebGPU fallback handling
  - Clear error messages for unsupported browsers

## Dependency Risks

### Core Dependencies Not Installed
- **Risk:** All dependencies need installation
- **High-risk packages:**
  - @mlc-ai/web-llm: Core AI functionality (complex integration)
  - WebLLM model downloads: Large assets (up to 6.4GB)
  - Web Workers: Complex threading model
  - IndexedDB: Storage limitations vary by browser

### Missing Development Tools
- **Issue:** No linting, formatting, or type-checking configured
- **Impact:** Code quality cannot be maintained
- **Requirements per CLAUDE.md:**
  - ESLint configuration
  - Prettier configuration
  - TypeScript strict mode

## Missing Critical Features

### Chat Interface (Core Feature)
- **Status:** Not implemented
- **Components needed:**
  - `ChatInterface.tsx` (main container)
  - `MessageList.tsx` (virtualized list)
  - `Message.tsx` (individual message)
  - `MessageInput.tsx` (auto-resize input)
  - `StreamingMessage.tsx` (streaming indicator)

### Model Selector (Core Feature)
- **Status:** Not implemented
- **Components needed:**
  - `ModelSelector.tsx` (dropdown)
  - `ModelCard.tsx` (model info)
  - `DownloadProgress.tsx` (progress UI)

### First-Run Experience (Core Feature)
- **Status:** Not implemented
- **Components needed:**
  - `FirstRunSetup.tsx` (initial setup flow)
  - `LoadingScreen.tsx` (model loading UI)

## Implementation Priority

**Phase 1 (Critical):**
1. Install dependencies
2. Configure TypeScript, Vite, Tailwind
3. Implement basic React app structure
4. Set up Web Worker scaffold

**Phase 2 (Core):**
1. Implement WebLLM integration
2. Build chat interface components
3. Add storage layer (Dexie.js)
4. Set up state management (Zustand)

**Phase 3 (Essential):**
1. Add PWA configuration
2. Implement error boundaries
3. Add input validation
4. Set up testing framework

**Phase 4 (Polish):**
1. Add performance monitoring
2. Implement memory management
3. Add GPU detection
4. Complete test coverage

---

*Concerns audit: 2026-02-17*
