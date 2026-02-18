# Lokul Stability Audit Report

**Analysis Date:** 2026-02-18

## Executive Summary

This audit identifies stability risks across four categories: Technical Debt, Flakiness Sources, UX Issues, and Architectural Problems. The codebase is generally well-structured but has several critical areas requiring attention, particularly around error handling, race conditions in storage operations, and incomplete abort functionality.

---

## 1. Technical Debt

### 1.1 Missing Abort Implementation (Critical)

**Location:** `src/components/Chat/AIChatInterface.tsx:97`

```typescript
const handleStop = useCallback(() => {
  // TODO: Implement abort in useAIChat/WebLLMTransport
  console.log("Stop requested");
}, []);
```

**Issue:** The stop generation button is non-functional. Users cannot cancel ongoing AI generation, leading to poor UX and wasted resources.

**Impact:** High - Users stuck waiting for unwanted completions
**Fix:** Implement proper abort signal propagation through `useAIChat` -> `WebLLMTransport` -> `inferenceManager`

---

### 1.2 Unimplemented Privacy Modal (Medium)

**Location:**
- `src/components/Chat/AIChatInterface.tsx:207`
- `src/components/Chat/ChatInterface.tsx:126`

```typescript
<a href="#" onClick={(e) => {
  e.preventDefault();
  // TODO: Open privacy modal
}}>Learn more</a>
```

**Issue:** Privacy link is a no-op, violating user trust expectations.

**Impact:** Medium - Broken UI promise
**Fix:** Create and wire up PrivacyInfoModal component

---

### 1.3 Console Error Logging in Production (Medium)

**Locations:** Multiple files have `console.error` calls gated only by `import.meta.env.DEV` checks.

**Files affected:**
- `src/store/chatStore.ts:267`
- `src/store/settingsStore.ts:96,127,153`
- `src/hooks/useConversations.ts:188,224,255,295`
- `src/lib/performance/gpu-detection.ts:136`

**Issue:** While most errors are wrapped in DEV checks, some paths may still leak console output. Additionally, the pattern is inconsistent.

**Impact:** Low-Medium - Potential log leakage, debugging difficulty
**Fix:** Standardize on a logging utility that respects environment

---

### 1.4 Unused Legacy Components (Low)

**Files:**
- `src/components/Chat/ChatInterface.tsx` - Legacy chat interface, superseded by `AIChatInterface.tsx`
- `src/components/Chat/MessageList.tsx` - Legacy message list
- `src/components/Chat/MessageInput.tsx` - Legacy input component
- `src/components/Sidebar/ConversationSidebar.tsx` - Legacy sidebar

**Issue:** Multiple component implementations exist for the same functionality. The old components are still imported and bundled.

**Impact:** Low - Bundle size bloat, maintenance confusion
**Fix:** Remove unused legacy components after confirming AI SDK UI implementation is stable

---

## 2. Flakiness Sources

### 2.1 Race Condition in Conversation Persistence (High)

**Location:** `src/hooks/useAIChat.ts:74-120`

```typescript
useEffect(() => {
  if (messages.length === 0) return;

  const persistMessages = async () => {
    // ... persistence logic
    await saveConversation(conversation);
  };

  persistMessages();
}, [messages, conversationId, modelId]);
```

**Issue:** The persistence effect runs on every message change without debouncing. Rapid message updates can cause:
1. Out-of-order writes to IndexedDB
2. Partial conversation state being saved
3. Potential data corruption on rapid edits

**Impact:** High - Data integrity risk
**Fix:** Add debouncing (500ms) and implement optimistic locking/versioning

---

### 2.2 Missing Cleanup in WebLLM Transport (High)

**Location:** `src/lib/ai/webllm-transport.ts:42,77-84`

```typescript
private abortController: AbortController | null = null;

async sendMessages({ messages, abortSignal }: {...}) {
  this.abortController = new AbortController();

  if (abortSignal) {
    abortSignal.addEventListener("abort", () => {
      this.abortController?.abort();
    });
  }
  // ... no removal of event listener
}
```

**Issue:** Event listener added to external abortSignal is never removed, causing memory leaks on repeated calls.

**Impact:** High - Memory leak on long sessions
**Fix:** Store cleanup function and call in finally block or cancel handler

---

### 2.3 Unhandled Worker Termination Race (Medium)

**Location:** `src/lib/ai/inference.ts:66-96`

```typescript
async initialize(modelId: string, onProgress?: ...) {
  // Clean up existing worker if any
  if (this.worker) {
    this.terminate();
  }
  // ... create new worker
}
```

**Issue:** No await on termination, potential race if previous initialization is still in progress.

**Impact:** Medium - Worker state inconsistency
**Fix:** Make terminate async and await cleanup, add initialization state lock

---

### 2.4 Missing Error Boundary (Medium)

**Location:** `src/App.tsx` - No error boundary wrapping routes

**Issue:** Any unhandled error in route components will crash the entire application.

**Impact:** Medium - Complete app crash on component errors
**Fix:** Add React Error Boundary around route content

---

### 2.5 Stale Closure in useConversations (Low)

**Location:** `src/hooks/useConversations.ts:85-90`

```typescript
useEffect(() => {
  const unsubscribe = chatStore.subscribe((state) => {
    setActiveConversationId(state.currentConversationId);
  });
  return () => unsubscribe();
}, []);
```

**Issue:** While currently safe, this pattern could become problematic if dependencies are added.

**Impact:** Low - Potential for future bugs
**Fix:** Add eslint-disable comment explaining why empty deps are correct, or use Zustand's selector pattern

---

### 2.6 IndexedDB Connection Not Validated Before Operations (Medium)

**Location:** `src/lib/storage/db.ts:76`

```typescript
export const db = new LokulDatabase();
```

**Issue:** Database is instantiated immediately but connection isn't verified until `initializeDatabase()` is called. Operations before init will fail silently or throw.

**Impact:** Medium - Operations may fail if called before initialization
**Fix:** Add connection state checks or auto-initialize on first operation

---

## 3. UX Issues

### 3.1 No Loading State for Model Switching (High)

**Location:** `src/components/chat-layout/AppSidebar.tsx:192-236`

```typescript
const handleModelChange = useCallback(async (modelId: string) => {
  await loadModel(modelId);  // No loading feedback in sidebar
}, [loadModel]);
```

**Issue:** When user switches models in sidebar, there's no immediate feedback. The button appears unresponsive during the load.

**Impact:** High - Users may click multiple times, causing confusion
**Fix:** Add loading state to model selector, disable during load

---

### 3.2 Error Banner Dismissal (Medium)

**Location:** `src/components/Chat/AIChatInterface.tsx:116-126`

```typescript
{error && (
  <div className="bg-red-500 px-4 py-2 text-center text-sm text-white">
    {error.message}
    <button onClick={() => window.location.reload()}>
      Reload
    </button>
  </div>
)}
```

**Issue:** Error banner can only be dismissed by page reload. No way to dismiss and continue.

**Impact:** Medium - Disruptive UX
**Fix:** Add dismiss button that clears error state

---

### 3.3 No Retry Mechanism for Failed Messages (Medium)

**Location:** `src/components/Chat/AIChatInterface.tsx:79-89`

```typescript
const handleSubmit = useCallback(async (message: { text: string }) => {
  if (!message.text.trim()) return;
  try {
    await sendMessage({ text: message.text });
  } catch (err) {
    toast.error("Failed to send message");
    console.error("Send error:", err);
  }
}, [sendMessage]);
```

**Issue:** Failed messages are lost with no retry option. User must retype.

**Impact:** Medium - User frustration
**Fix:** Preserve message in input on error, add retry button

---

### 3.4 Scroll Position Not Preserved (Low)

**Location:** `src/components/Chat/MessageList.tsx:43-47`

```typescript
useEffect(() => {
  if (bottomRef.current) {
    bottomRef.current.scrollIntoView({ behavior: "smooth" });
  }
}, [messages, streamingContent]);
```

**Issue:** Auto-scroll always happens on every message update. If user scrolls up to read history, new tokens force scroll to bottom.

**Impact:** Low-Medium - Annoying during streaming
**Fix:** Detect user scroll position, only auto-scroll if user is near bottom

---

### 3.5 Missing Input Validation Feedback (Low)

**Location:** `src/components/ai-elements/prompt-input.tsx:834-946`

**Issue:** Textarea has no visual feedback for max length or validation errors.

**Impact:** Low - Users may hit invisible limits
**Fix:** Add character counter and max-length indicator

---

## 4. Architectural Problems

### 4.1 Dual State Management Systems (High)

**Issue:** The codebase has two parallel chat systems:

1. **Legacy:** `chatStore.ts` + `useChat.ts` - Custom Zustand implementation
2. **Current:** `useAIChat.ts` + AI SDK UI - Vercel AI SDK

**Files:**
- Legacy: `src/store/chatStore.ts`, `src/hooks/useChat.ts`
- Current: `src/hooks/useAIChat.ts`, `src/components/Chat/AIChatInterface.tsx`

**Impact:** High - Confusion, maintenance burden, potential state desync
**Fix:** Remove legacy system entirely after migration validation

---

### 4.2 Tight Coupling in useAIChat (Medium)

**Location:** `src/hooks/useAIChat.ts:58-123`

```typescript
export function useAIChat(options: UseAIChatOptions) {
  const transport = new WebLLMTransport({ modelId });  // Created every render
  const chatHelpers = useChat({
    id: conversationId,
    transport,
    messages: initialMessages,
  });
  // ...
}
```

**Issue:** New WebLLMTransport created on every render. While AI SDK may handle this, it's inefficient and could cause connection churn.

**Impact:** Medium - Performance, potential connection issues
**Fix:** Memoize transport or use singleton pattern

---

### 4.3 Direct Store Access Outside React (Medium)

**Location:** `src/hooks/useConversations.ts:18,217,247`

```typescript
const chatStore = useChatStore;  // Direct store reference

// Used imperatively:
chatStore.getState().loadConversation(conversation);
chatStore.getState().clearChat();
```

**Issue:** Direct store access bypasses React's lifecycle, can cause:
- Stale state issues
- Harder to trace data flow
- Testing difficulties

**Impact:** Medium - Architectural debt
**Fix:** Use hooks and props drilling, or context for cross-cutting concerns

---

### 4.4 No Request Deduplication (Medium)

**Location:** `src/store/modelStore.ts:70-124`

```typescript
loadModel: async (modelId: string) => {
  // No check for duplicate in-flight requests
  set({ isLoading: true, ... });
  await inferenceManager.initialize(modelId, ...);
}
```

**Issue:** Multiple rapid calls to `loadModel` will create multiple workers.

**Impact:** Medium - Resource waste, potential race conditions
**Fix:** Add request deduplication or loading state guard

---

### 4.5 Missing Context Window Management (Medium)

**Location:** `src/lib/ai/webllm-transport.ts:86-87`

```typescript
const webLLMMessages = this.convertToWebLLMMessages(messages);
// No truncation or context window management
```

**Issue:** All messages are sent to the model without checking token limits. Long conversations will fail or be truncated unpredictably by WebLLM.

**Impact:** Medium - Silent failures on long conversations
**Fix:** Implement token counting and message truncation strategy

---

### 4.6 Inconsistent Error Handling Patterns (Low)

**Issue:** Multiple error handling patterns exist:

1. **Toast + console:** `src/components/Chat/AIChatInterface.tsx:86-87`
2. **State update:** `src/store/chatStore.ts:259-264`
3. **Throw + catch:** `src/hooks/useConversations.ts:218-227`
4. **Silent fail:** `src/components/Chat/MessageBubble.tsx:66-69`

**Impact:** Low - Inconsistent UX, harder debugging
**Fix:** Standardize on error handling utility

---

## Quick Wins (High Impact, Low Effort)

| Issue | File | Fix |
|-------|------|-----|
| Add dismiss button to error banner | `AIChatInterface.tsx:116-126` | Add onClick to clear error state |
| Remove TODO comments | Multiple | Implement or remove TODOs |
| Add loading state to model selector | `AppSidebar.tsx:192-236` | Use `useIsLoading` from modelStore |
| Fix event listener leak | `webllm-transport.ts:77-84` | Store cleanup and call in finally |
| Add Error Boundary | `App.tsx` | Wrap routes with ErrorBoundary |
| Debounce persistence | `useAIChat.ts:74` | Add 500ms debounce to persist effect |

---

## Critical Path Issues (Fix First)

1. **Race condition in persistence** (`useAIChat.ts`) - Data integrity risk
2. **Missing abort implementation** (`AIChatInterface.tsx:97`) - Core functionality broken
3. **Memory leak in transport** (`webllm-transport.ts`) - Stability risk
4. **No request deduplication** (`modelStore.ts`) - Resource/performance issue

---

## Test Coverage Gaps

The following critical paths have no visible test coverage:

1. **Web Worker lifecycle** - `inference.worker.ts`, `inference.ts`
2. **IndexedDB operations** - `db.ts`, `conversations.ts`, `settings.ts`
3. **Streaming response handling** - `webllm-transport.ts`
4. **Error recovery paths** - All error handlers
5. **Model switching** - `modelStore.ts`, `AppSidebar.tsx`

---

## Recommendations Summary

### Immediate (This Sprint)
1. Fix abort implementation
2. Add debouncing to persistence
3. Fix memory leak in transport
4. Add error boundary

### Short Term (Next 2 Sprints)
1. Remove legacy chat components
2. Standardize error handling
3. Add context window management
4. Implement request deduplication

### Long Term (Next Quarter)
1. Add comprehensive test coverage
2. Implement proper logging system
3. Add performance monitoring
4. Create e2e test suite for critical paths

---

*Audit completed: 2026-02-18*
*Auditor: Claude Code*
