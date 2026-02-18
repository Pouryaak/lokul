---
phase: 02-chat-interface
plan: 01
type: execute
subsystem: chat
wave: 1
depends_on: []
requires: [CHAT-01, CHAT-02, CHAT-03, CHAT-08, STOR-01]
tech-stack:
  added:
    - Zustand (state management)
    - Dexie (IndexedDB storage)
  patterns:
    - Selector hooks for optimized re-renders
    - Async generators for streaming
    - Auto-save to IndexedDB
key-files:
  created:
    - src/lib/storage/conversations.ts
    - src/hooks/useConversations.ts
  modified:
    - src/store/chatStore.ts
    - src/hooks/useChat.ts
decisions:
  - Use crypto.randomUUID() for message/conversation IDs
  - Auto-generate conversation titles from first 20 chars of first user message
  - Use functional setState updates to avoid stale closures in streaming
  - Export selector hooks from stores to prevent unnecessary re-renders
  - Use Zustand store.subscribe() for reactive conversation list updates
metrics:
  duration: 35 min
  tasks: 3
  files: 4
  commits: 3
  lines-added: ~500
  lines-removed: ~100
completed: 2026-02-18
---

# Phase 02 Plan 01: Chat State Management Summary

**One-liner:** Core chat state management with streaming support, IndexedDB persistence, and conversation management hooks.

## What Was Built

### 1. Conversation Storage Utilities (`src/lib/storage/conversations.ts`)

CRUD operations for conversations using Dexie/IndexedDB:

- `saveConversation()` - Upsert conversation to IndexedDB
- `getConversation(id)` - Retrieve single conversation
- `getAllConversations()` - List all conversations sorted by updatedAt
- `deleteConversation(id)` - Remove conversation
- `updateConversationTitle(id, title)` - Update conversation title
- `generateConversationTitle(firstUserMessage)` - Auto-generate title from first message
- `createConversation(modelId, messages)` - Factory for new conversations
- `addMessageToConversation()` - Immutable message addition

### 2. Chat Store (`src/store/chatStore.ts`)

Zustand store with streaming AI response support:

**State:**
- `messages: Message[]` - All messages in current conversation
- `currentConversationId: string | null` - Active conversation ID
- `isStreaming: boolean` - Generation in progress
- `streamingContent: string` - Accumulated tokens during streaming
- `error: string | null` - Error state
- `metrics: ChatMetrics` - tokensPerSecond, responseTimeMs, totalTokens
- `currentConversation: Conversation | null` - Full conversation object

**Actions:**
- `sendMessage(content)` - Send user message, stream AI response, auto-save
- `appendToken(token)` - Manual token streaming
- `stopGeneration()` - Abort ongoing generation
- `clearChat()` - Reset to new conversation
- `loadConversation(conversation)` - Load existing conversation
- `setError(error)` - Set error state

**Selector Hooks:**
- `useMessages()`, `useIsStreaming()`, `useStreamingContent()`
- `useChatError()`, `useChatMetrics()`
- `useCurrentConversationId()`, `useCurrentConversation()`
- `useSendMessage()`, `useStopGeneration()`, `useClearChat()`

### 3. useChat Hook (`src/hooks/useChat.ts`)

Combined hook for chat operations:

```typescript
const {
  messages,
  isStreaming,
  streamingContent,
  error,
  metrics,
  sendMessage,
  regenerateMessage,  // NEW: Regenerate last AI response
  clearChat,
  stopGeneration,
} = useChat();
```

**regenerateMessage()** implementation:
- Finds last user message in conversation
- Truncates messages array to before that message
- Re-sends the user message to get fresh AI response

### 4. useConversations Hook (`src/hooks/useConversations.ts`)

Conversation list management:

```typescript
const {
  conversations,
  isLoading,
  error,
  loadConversation,      // Load by ID into chat
  deleteConversation,    // Delete by ID, refresh list
  refreshConversations,  // Reload from storage
  createNewConversation, // Clear current chat
} = useConversations();
```

## Key Design Decisions

### Streaming Architecture
- Uses `for await...of inferenceManager.generate()` for token-by-token streaming
- Accumulates content in `streamingContent` state
- Creates final assistant message on completion
- Tracks token count and calculates tokensPerSecond

### Auto-Save Pattern
- Conversation saved to IndexedDB after each assistant message completes
- Title auto-generated from first user message (20 chars, word boundary)
- Uses `saveConversation()` which does upsert (put)

### State Management Patterns
- **Selector hooks** prevent unnecessary re-renders
- **Functional setState** avoids stale closures during streaming
- **Store subscription** for reactive conversation list updates
- **Module-level store reference** for imperative operations (getState/setState)

### Error Handling
- All storage operations wrapped in try/catch
- User-friendly error messages
- DEV-only console logging
- Error state exposed through hooks

## Deviations from Plan

None - plan executed exactly as written.

## Verification

All TypeScript types compile without errors (pre-existing errors in bento-grid.tsx unrelated to this plan).

Key functionality verified:
- [x] All 6 CRUD functions in conversations.ts
- [x] chatStore with streaming support and auto-save
- [x] useChat hook with regenerateMessage
- [x] useConversations hook with full conversation management

## Commits

| Hash | Message |
|------|---------|
| d32cf74 | feat(02-01): create conversation storage utilities |
| d34bf0a | feat(02-01): create chatStore with streaming support |
| 2897c28 | feat(02-01): create useChat and useConversations hooks |

## Self-Check: PASSED

- [x] src/lib/storage/conversations.ts exists
- [x] src/store/chatStore.ts exists
- [x] src/hooks/useChat.ts exists
- [x] src/hooks/useConversations.ts exists
- [x] All commits exist in git log
- [x] TypeScript compiles without new errors

## Next Steps

This plan provides the foundation for:
- Chat UI components (message list, input, streaming indicator)
- Conversation sidebar integration
- Message input with auto-resize
- Real-time streaming display

Plan 02-02 will build the chat UI components on top of this state management layer.
