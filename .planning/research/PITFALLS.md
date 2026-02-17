# Pitfalls Research: Browser-Based AI with WebGPU/WebLLM

**Domain:** Browser-based AI inference using WebLLM and WebGPU
**Researched:** February 17, 2026
**Confidence:** HIGH (based on Context7 documentation, official WebLLM sources, and domain knowledge)

---

## Critical Pitfalls

### Pitfall 1: Main Thread Blocking During Model Operations

**What goes wrong:**
The UI freezes completely during model initialization, downloads, or inference. Users see a frozen page, browser "unresponsive" warnings, or complete lock-ups lasting seconds to minutes.

**Why it happens:**
Developers initialize WebLLM's `MLCEngine` directly on the main thread. Model downloads, shader compilation, and inference are computationally intensive operations that block the JavaScript event loop. Browsers may show "Page Unresponsive" dialogs, causing users to kill the tab.

**How to avoid:**
- **Always use Web Workers** for all WebLLM operations. Use `CreateWebWorkerMLCEngine()` instead of `CreateMLCEngine()`.
- The worker thread handles all ML workloads while the main thread remains responsive.
- Implement `initProgressCallback` in the worker to send progress updates to the main thread for UI updates.

**Warning signs:**
- UI becomes unresponsive during model loading
- Browser shows "Page Unresponsive" dialog
- Input fields stop accepting text during generation
- Scroll behavior becomes janky during streaming

**Phase to address:**
Phase 1 (Core Infrastructure) — Worker architecture must be established before any model operations are implemented.

---

### Pitfall 2: Memory Exhaustion and Browser Crashes

**What goes wrong:**
Browser tab crashes with "Out of Memory" errors, GPU process crashes, or the entire browser becomes unstable. Users lose their conversation history and have to restart.

**Why it happens:**
Local LLMs require significant VRAM (2GB–8GB+ depending on model). Developers fail to:
- Check available GPU memory before loading models
- Monitor memory usage during long conversations
- Handle context window limits properly
- Account for the browser's own memory overhead

**How to avoid:**
- Use `engine.getMaxStorageBufferBindingSize()` to query GPU capabilities before loading models.
- Check `model.vram_required_MB` from `prebuiltAppConfig.model_list` against available resources.
- Implement the three-tier memory system (Core Facts, Daily Context, Recent Messages) to stay within context limits.
- Monitor memory via `engine.runtimeStatsText()` and proactively warn users when approaching limits.
- Implement auto-compaction at 80% of model's context window.

**Warning signs:**
- Tab crashes with "Aw, Snap!" error
- GPU process crashes in browser logs
- Performance degrades significantly during long chats
- Model loading fails silently or hangs

**Phase to address:**
Phase 1 (GPU Detection), Phase 2 (Memory Management) — Detection must happen early; memory management is core to stability.

---

### Pitfall 3: Inadequate WebGPU Compatibility Checking

**What goes wrong:**
App fails silently or shows cryptic errors on browsers without WebGPU support. Users blame the app rather than their browser.

**Why it happens:**
Developers assume WebGPU is available or only check for its existence without proper feature detection. WebGPU support varies by:
- Browser (Chrome 113+, Edge 113+, Firefox behind flags, Safari 17.4+)
- OS (Windows, macOS, Linux — but not all GPUs)
- GPU hardware (some integrated GPUs have limited support)

**How to avoid:**
- Implement comprehensive capability detection before any WebLLM initialization.
- Check for `navigator.gpu` existence and call `navigator.gpu.requestAdapter()` to verify actual support.
- Use `webgpureport.org` patterns for detailed capability checking.
- Provide clear, actionable error messages: "WebGPU not available. Use Chrome 120+ or Edge 120+."
- Offer fallback guidance (different browser, enabling flags) rather than just failing.

**Warning signs:**
- Errors like "Cannot read properties of undefined (reading 'requestAdapter')"
- App hangs on "Initializing..." indefinitely
- Users reporting "doesn't work" without clear errors

**Phase to address:**
Phase 1 (First-Run Experience) — Detection must be the first thing that happens before any model loading.

---

### Pitfall 4: Poor Model Download UX

**What goes wrong:**
Users abandon the app during large model downloads (2.8GB–6.4GB) because of unclear progress, inability to pause/resume, or lack of storage space warnings.

**Why it happens:**
- Downloads happen without user consent or clear communication
- Progress indicators are inaccurate or missing
- No handling for intermittent connectivity
- No cleanup when users switch models mid-download
- Storage quota exceeded errors crash the download

**How to avoid:**
- Always show explicit download UI with accurate progress (bytes downloaded / total bytes).
- Use `initProgressCallback` to provide real-time progress updates.
- Implement resumable downloads using HTTP range requests (Cache API/IndexedDB handles this if configured properly).
- Check `navigator.storage.estimate()` before downloading to warn about insufficient space.
- Allow users to cancel downloads gracefully.
- Use `appConfig.useIndexedDBCache: true` for reliable caching.

**Warning signs:**
- High bounce rate during first-run
- Users reporting "stuck at X%"
- Multiple partial downloads in cache
- Storage quota exceeded errors

**Phase to address:**
Phase 1 (First-Run Experience), Phase 2 (Model Management) — Critical for user retention.

---

### Pitfall 5: Context Window Overflow

**What goes wrong:**
Long conversations crash or produce garbled responses because the total tokens exceed the model's context window (2K–8K tokens for local models).

**Why it happens:**
Developers send the entire conversation history to the model without tracking token counts. Local models have much smaller context windows than cloud APIs (GPT-4 has 128K, local models often have 2K–8K).

**How to avoid:**
- Implement token counting for all messages (~0.75 words per token is a rough estimate).
- Store token counts per message to avoid recalculation.
- Implement the three-tier memory system:
  - Core Facts (always included, ~200 tokens)
  - Daily Context (medium priority, ~300 tokens)
  - Recent Messages (sliding window, remaining tokens)
- Trigger auto-compaction at 80% of context limit.
- Use `engine.resetChat()` to clear history when switching conversations.

**Warning signs:**
- Responses become nonsensical after long conversations
- Model starts repeating or forgetting recent context
- Errors about "context length exceeded"
- Performance degrades as conversation grows

**Phase to address:**
Phase 2 (Chat Interface), Phase 3 (Memory System) — Core to conversation quality.

---

### Pitfall 6: Streaming Implementation Errors

**What goes wrong:**
Streaming responses stutter, show out-of-order text, or fail to display at all. Users see blank screens while tokens are being generated.

**Why it happens:**
- Incorrect async generator handling
- State updates happening too frequently (every token causes a re-render)
- Not handling the final chunk with usage statistics properly
- Race conditions between streaming and user actions (sending new messages, switching models)

**How to avoid:**
- Use `stream: true` with proper async iteration: `for await (const chunk of asyncGenerator)`.
- Batch UI updates (e.g., update every 50ms or every 3-5 tokens) rather than per-token.
- Handle the final chunk separately—it contains `chunk.usage` with performance stats.
- Implement proper cleanup when streaming is interrupted (user sends new message, switches model).
- Use `engine.interruptGenerate()` to stop generation cleanly.

**Warning signs:**
- Text appears in chunks or stutters
- High CPU usage during streaming
- UI becomes unresponsive with fast token generation
- Missing or incorrect token/speed metrics

**Phase to address:**
Phase 2 (Chat Interface) — Critical for perceived performance.

---

### Pitfall 7: Improper Cache Management

**What goes wrong:**
Models re-download on every visit, cache grows unbounded causing storage quota errors, or cached models become corrupted.

**Why it happens:**
- Not using IndexedDB caching (`useIndexedDBCache: true`)
- No cache validation or cleanup logic
- Not checking `hasModelInCache()` before downloading
- Missing cache eviction when storage is full

**How to avoid:**
- Always enable IndexedDB caching: `appConfig: { useIndexedDBCache: true }`.
- Use `hasModelInCache(modelId)` to check before downloading.
- Implement `deleteModelInCache(modelId)` for user-initiated cleanup.
- Monitor storage with `navigator.storage.estimate()` and warn users when approaching limits.
- Version your cache keys to handle model updates.

**Warning signs:**
- Models re-download on every session
- Storage quota exceeded errors
- Slow startup despite previous visits
- Users reporting "takes forever every time"

**Phase to address:**
Phase 1 (First-Run Experience), Phase 2 (Model Management) — Affects every returning user.

---

### Pitfall 8: Ignoring Service Worker Limitations

**What goes wrong:**
Attempting to run WebGPU in a Service Worker context fails or requires experimental flags that users haven't enabled.

**Why it happens:**
WebGPU in Service Workers was only enabled by default in Chrome 124. Earlier versions require `chrome://flags/#enable-experimental-web-platform-features`. Developers assume Service Workers can handle WebGPU operations like Web Workers.

**How to avoid:**
- Use Web Workers for AI inference, not Service Workers.
- Reserve Service Workers for PWA functionality (caching assets, offline support).
- If using Service Workers for WebGPU, clearly document Chrome 124+ requirement.
- Check browser version and provide appropriate warnings.

**Warning signs:**
- "WebGPU is not enabled" errors in Service Worker context
- Features work in development but fail in production build
- Inconsistent behavior across Chrome versions

**Phase to address:**
Phase 1 (Core Infrastructure) — Architecture decision with significant impact.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Web Worker, use main thread | Faster initial implementation | UI freezes, poor UX, browser warnings | Never — always use Workers |
| No token counting | Simpler code | Context overflow crashes, poor responses | Never — implement from day one |
| Simple progress bar (no bytes) | Easier UI | Users don't trust progress, higher bounce | MVP only — improve before launch |
| No memory monitoring | Less code | Crashes, data loss, angry users | Never — monitoring is essential |
| Skip IndexedDB caching | Simpler config | Re-downloads every visit, poor UX | Never — caching is critical |
| Hardcoded model configs | Faster setup | Can't update models without code changes | MVP only — use registry before launch |

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| WebLLM Engine | Creating multiple engine instances | Single engine instance, switch models via `engine.reload()` |
| Web Workers | Not handling worker termination | Proper cleanup with `engine.unload()` and worker termination |
| IndexedDB | Storing large model files in Dexie | Use WebLLM's built-in caching; Dexie for conversations only |
| Cache API | Relying on Cache API alone | Use IndexedDB cache (`useIndexedDBCache: true`) for reliability |
| Vite PWA | Letting Workbox cache model files | Exclude model files from Workbox; handle via WebLLM's download manager |

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Per-token React state updates | High CPU, janky UI | Batch updates (RAF or 50ms throttle) | > 10 tokens/sec |
| No virtualization in message list | Slow scroll, memory bloat | Use `react-virtuoso` for long conversations | > 50 messages |
| Loading full conversation history | Slow startup, memory pressure | Lazy load, pagination | > 20 conversations |
| Synchronous storage operations | UI freezes on save | Use async IndexedDB operations | Every message |
| No cleanup on unmount | Memory leaks, zombie workers | Proper useEffect cleanup | Component unmount |

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Storing conversations in localStorage | Data exposure, size limits | Use IndexedDB only |
| No CSP for Web Workers | XSS via worker injection | Proper CSP headers, validate worker scripts |
| Trusting model outputs without sanitization | XSS via markdown | Sanitize HTML, use `react-markdown` with proper plugins |
| Exposing engine instance to window | Tampering, data extraction | Keep engine in worker, no global exposure |

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| "Loading..." without progress | User thinks app is broken | Show detailed progress: "Downloading 1.2GB / 2.8GB (45%)" |
| No offline indicator | Confusion when features don't work | Clear status: "Online — Smart Mode available" vs "Offline — Quick Mode only" |
| Hidden memory pressure | Sudden crashes without warning | Proactive warnings: "Memory at 75% — switch to Quick Mode?" |
| No model comparison | Users don't understand tradeoffs | Side-by-side comparison before download |
| Silent failures on WebGPU missing | "It just doesn't work" | Clear error with actionable steps: "Use Chrome 120+" |

## "Looks Done But Isn't" Checklist

- [ ] **Streaming:** Often missing proper interruption handling — verify `interruptGenerate()` works mid-stream
- [ ] **Context Management:** Often missing token counting — verify limits are enforced
- [ ] **Error Handling:** Often missing graceful degradation — verify behavior when GPU unavailable
- [ ] **Memory Cleanup:** Often missing `engine.unload()` — verify no memory leaks on model switch
- [ ] **Offline Support:** Often missing cache validation — verify works with airplane mode on
- [ ] **Progress Tracking:** Often inaccurate percentages — verify against actual bytes downloaded
- [ ] **Worker Lifecycle:** Often missing proper termination — verify workers don't accumulate

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Main thread blocking | HIGH | Refactor to Web Workers — requires architectural changes |
| Memory exhaustion | MEDIUM | Implement memory monitoring, add compaction, warn users |
| Context overflow | LOW | Add token counting, implement sliding window for history |
| Cache corruption | LOW | Clear cache, re-download — implement `deleteModelInCache()` |
| Streaming bugs | MEDIUM | Fix async generator handling, add proper cleanup |
| WebGPU detection failure | LOW | Add comprehensive capability checking, better error messages |

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Main Thread Blocking | Phase 1 (Core Infrastructure) | UI remains responsive during 80MB Quick Mode load |
| Memory Exhaustion | Phase 1 (GPU Detection) + Phase 2 (Memory Management) | No crashes during 50-message conversation |
| WebGPU Compatibility | Phase 1 (First-Run Experience) | Clear error on Firefox without flags |
| Poor Download UX | Phase 1 (First-Run Experience) | Progress bar accurate to within 5% |
| Context Window Overflow | Phase 2 (Chat Interface) + Phase 3 (Memory System) | 100-message conversation without quality degradation |
| Streaming Errors | Phase 2 (Chat Interface) | Smooth streaming at 20+ tokens/sec |
| Cache Management | Phase 1 (First-Run) + Phase 2 (Model Management) | Second visit loads instantly |
| Service Worker Confusion | Phase 1 (Core Infrastructure) | Architecture review — Workers for AI, SW for PWA |

## Sources

- WebLLM Official Documentation (Context7): https://context7.com/mlc-ai/web-llm/llms.txt
- WebLLM API Reference: https://github.com/mlc-ai/web-llm/blob/main/docs/user/api_reference.md
- WebLLM Getting Started: https://github.com/mlc-ai/web-llm/blob/main/docs/user/get_started.md
- WebLLM Advanced Usage: https://github.com/mlc-ai/web-llm/blob/main/docs/user/advanced_usage.md
- WebGPU Report: https://webgpureport.org/
- Chrome Service Worker WebGPU Support: https://chromiumdash.appspot.com/commit/8d78510e4aca5ac3cd8ee4a33e96b404eaa43246

---

*Pitfalls research for: Lokul — Browser-based AI chat with WebLLM*
*Researched: February 17, 2026*
