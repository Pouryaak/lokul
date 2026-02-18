# Phase 2: Chat Interface - Research

**Researched:** 2026-02-18
**Domain:** React AI Chat Interface, WebLLM Streaming, IndexedDB Storage
**Confidence:** HIGH

## Summary

Phase 2 implements the core chat interface for Lokul, a privacy-first AI chat application. The project already has a solid foundation with WebLLM integration via a Web Worker, Zustand state management, Dexie.js for IndexedDB storage, and Tailwind CSS v4 for styling.

The key technical challenges for this phase are:
1. **Streaming message handling** - Token-by-token streaming from WebLLM without UI lag
2. **Message rendering** - Markdown with syntax highlighting, proper code blocks
3. **State management** - Conversation history, message threading, auto-save
4. **Performance monitoring** - Tokens per second, response time tracking
5. **Storage** - IndexedDB persistence with Dexie.js

The project uses React 19, TypeScript 5.9, and follows strict architectural patterns defined in CLAUDE.md. All AI component libraries specified (blocks.so, prompt-kit.com, kibo-ui.com, shadcn.io/ai) are pre-built solutions that should be researched for integration patterns.

**Primary recommendation:** Build on the existing inference.ts and modelStore.ts patterns, create a chatStore for conversation state, and implement components using the established CVA + Tailwind patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Component Libraries
- **Use pre-built AI component libraries rather than building from scratch**
- blocks.so/ai - for chat UI blocks
- blocks.so/sidebar - for conversation sidebar
- prompt-kit.com - for message components (thinking-bar, blocks, markdown)
- shadcn.io/ai - for AI-themed shadcn components
- kibo-ui.com/code-block - for syntax-highlighted code blocks

#### Chat Layout & Styling
- Different bubble colors AND different alignment for user vs AI messages (user blue right-aligned, AI gray/white left-aligned)
- Timestamps appear on hover only (cleaner look)
- Max width layout for readability (like ChatGPT)
- Spacing like ChatGPT (generous but not wasteful)
- Avatars/icons for both user and AI (like Claude, ChatGPT)
- Fixed input at bottom (standard chat pattern)
- Toolbar above input with regenerate and clear chat buttons

#### Empty State
- Welcome message with suggestions (like ChatGPT)

#### Streaming Behavior
- Cursor blink while AI is "thinking" (before tokens)
- Smooth token fade-in during streaming
- Auto-scroll to bottom (handled by UI components)
- Prominent "Stop generating" button
- Thinking indicator: prompt-kit's thinking-bar component
- Performance stats accessible via action button (not always visible)
- Smooth consistent animation rate for token appearance
- Input disabled while AI is generating (prevent new messages)
- Inline error display with retry button

#### Message Rendering & Markdown
- Code blocks: kibo-ui code-block component with copy button
- Copy button: always visible for last message, hover for older messages
- Markdown: prompt-kit markdown component
- Full markdown support including tables, lists, headings
- Message actions: regenerate, edit, delete

#### Sidebar & Conversation History
- **Use blocks.so/sidebar component for the conversation sidebar**
- Title only (minimal) in conversation list
- Simple heuristic from user message for title generation (first 20 chars)
- Titles must be editable by user (like ChatGPT)
- Confirmation modal before deleting conversation
- Clear highlighting for active conversation (like ChatGPT)

### Claude's Discretion
- Exact color choices for bubbles
- Specific spacing values
- Exact positioning of toolbar buttons
- Error state styling details
- Sidebar collapse/expand behavior
- Mobile responsive adaptations

### Deferred Ideas (OUT OF SCOPE)
- Message queuing (user mentioned for later versions)
- More advanced markdown features (mermaid diagrams, LaTeX math)
- Mobile-specific interactions
- Keyboard shortcuts customization
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-01 | User can type messages in an auto-resizing input field | Use textarea with auto-resize pattern; existing Button component patterns in `/src/components/ui/Button.tsx` |
| CHAT-02 | User can send messages with Enter key or Send button | Standard form pattern with keydown handler; disable during generation |
| CHAT-03 | AI responses stream token-by-token (word-by-word) without UI lag | `inferenceManager.generate()` already returns AsyncGenerator; use Zustand for streaming state |
| CHAT-04 | Messages render with Markdown formatting (bold, italic, lists, code blocks) | `react-markdown` already in dependencies (v9.1.0); use with `remark-gfm` for tables |
| CHAT-05 | Code blocks display with syntax highlighting (Shiki) | `react-syntax-highlighter` already in dependencies (v15.6.6) |
| CHAT-06 | User can copy any message to clipboard with one click | Native Clipboard API; wrap in try-catch for error handling |
| CHAT-07 | User can regenerate the last AI response | Re-trigger generation with same context; store original user message |
| CHAT-08 | User can clear the current conversation | Reset messages array in store; keep conversation ID |
| PERF-03 | Performance panel shows tokens per second during generation | Track token count + timestamp in streaming handler; calculate TPS |
| PERF-04 | Performance panel shows last response time (ms) | Track start time before generation, end time on complete |
| PERF-06 | Warning displayed if memory usage exceeds 75% | Use Performance.memory API (Chrome); check in useEffect |
| PERF-07 | Suggestion to switch to Quick Mode shown if performance degrades | Detect low TPS (< 5) or high memory; show toast/inline suggestion |
| STOR-01 | All conversations auto-save to IndexedDB after every message | Dexie.js already configured; add conversation CRUD in `/src/lib/storage/conversations.ts` |
| STOR-02 | Conversation list displays in sidebar with titles and timestamps | Use existing `db.conversations` table; order by `updatedAt` desc |
| STOR-03 | User can view previous conversations from sidebar | Load conversation by ID; restore messages to chat store |
| STOR-04 | User can delete a conversation | Dexie `delete()` with confirmation modal |
</phase_requirements>

## Standard Stack

### Core (Already Installed)
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | UI framework | Latest stable, concurrent features |
| TypeScript | 5.9.3 | Type safety | Project requirement |
| Tailwind CSS | 4.1.18 | Styling | Already configured with custom theme |
| Zustand | 5.0.11 | State management | Already used for model/settings stores |
| Dexie | 4.3.0 | IndexedDB wrapper | Already configured in `/src/lib/storage/db.ts` |
| @mlc-ai/web-llm | 0.2.80 | AI inference | Already integrated with Web Worker |
| react-markdown | 9.1.0 | Markdown rendering | Already in dependencies |
| react-syntax-highlighter | 15.6.6 | Code highlighting | Already in dependencies |
| remark-gfm | 4.0.1 | GitHub Flavored Markdown | Already in dependencies |
| lucide-react | 0.475.0 | Icons | Already used in existing components |
| class-variance-authority | 0.7.1 | Component variants | Already used in Button component |

### Supporting (To Install)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-dialog | ^1.0.5 | Confirmation modals | Delete conversation confirmation |
| @radix-ui/react-dropdown-menu | ^2.0.6 | Message actions menu | Edit/delete/regenerate actions |
| @radix-ui/react-tooltip | ^1.0.7 | Hover timestamps | Show timestamp on hover |
| uuid | ^9.0.1 | Generate message IDs | For new messages |
| @types/uuid | ^9.0.7 | TypeScript types | Dev dependency |

### Component Libraries (Per User Decision)
| Library | Source | Purpose | Integration Notes |
|---------|--------|---------|-------------------|
| blocks.so/ai | blocks.so/ai | Chat UI blocks | Research installation via npm/shadcn CLI |
| blocks.so/sidebar | blocks.so/sidebar | Conversation sidebar | Locked decision for sidebar |
| prompt-kit.com | prompt-kit.com | thinking-bar, markdown, blocks | Locked for message components |
| kibo-ui.com | kibo-ui.com/code-block | Syntax highlighted code blocks | Locked for code display |
| shadcn.io/ai | shadcn.io/ai | AI-themed shadcn components | Locked for AI-specific UI |

**Installation:**
```bash
# Supporting libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-tooltip uuid
npm install -D @types/uuid

# Component libraries (verify exact package names from official sources)
npm install @blocks/ai @blocks/sidebar prompt-kit kibo-ui
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx      # Main chat container
│   │   ├── MessageList.tsx        # Virtualized message list
│   │   ├── Message.tsx            # Single message component
│   │   ├── MessageInput.tsx       # Auto-resizing input
│   │   ├── StreamingMessage.tsx   # Streaming indicator
│   │   ├── ChatToolbar.tsx        # Regenerate, clear buttons
│   │   └── WelcomeScreen.tsx      # Empty state with suggestions
│   │
│   ├── sidebar/
│   │   ├── Sidebar.tsx            # Main sidebar (blocks.so)
│   │   ├── ConversationList.tsx   # List of conversations
│   │   ├── ConversationItem.tsx   # Single conversation row
│   │   └── EditTitleModal.tsx     # Inline title editing
│   │
│   └── ui/                        # Existing UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       └── ...
│
├── hooks/
│   ├── useChat.ts                 # Main chat state & logic
│   ├── useConversations.ts        # Conversation list management
│   ├── useStreaming.ts            # Streaming message handler
│   └── usePerformance.ts          # Performance metrics
│
├── store/
│   ├── chatStore.ts               # Chat state (messages, streaming)
│   ├── conversationStore.ts       # Conversation list state
│   └── modelStore.ts              # Existing (reference)
│
├── lib/
│   ├── ai/
│   │   ├── inference.ts           # Existing - use for generation
│   │   └── models.ts              # Existing
│   │
│   ├── storage/
│   │   ├── db.ts                  # Existing Dexie setup
│   │   ├── conversations.ts       # Conversation CRUD (NEW)
│   │   └── messages.ts            # Message operations (NEW)
│   │
│   └── utils/
│       ├── markdown.ts            # Markdown processing helpers
│       └── clipboard.ts           # Copy to clipboard helper
│
└── types/
    └── index.ts                   # Already has Message, Conversation types
```

### Pattern 1: Streaming Message Handler
**What:** Async generator pattern for token-by-token streaming from WebLLM
**When to use:** All AI message generation
**Example:**
```typescript
// Source: /src/lib/ai/inference.ts (existing)
async function handleStreamingResponse(
  messages: Message[],
  onToken: (token: string) => void,
  onComplete: () => void,
  onError: (error: Error) => void
) {
  try {
    const stream = inferenceManager.generate(messages);
    for await (const token of stream) {
      onToken(token);
    }
    onComplete();
  } catch (error) {
    onError(error as Error);
  }
}
```

### Pattern 2: Zustand Store with Streaming State
**What:** Store that tracks streaming state alongside messages
**When to use:** Chat state management
**Example:**
```typescript
// Source: CLAUDE.md patterns + existing modelStore.ts
interface ChatState {
  messages: Message[];
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;

  sendMessage: (content: string) => Promise<void>;
  appendToken: (token: string) => void;
  stopGeneration: () => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>()(
  devtools((set, get) => ({
    messages: [],
    isStreaming: false,
    streamingContent: '',
    error: null,

    sendMessage: async (content) => {
      // Add user message
      const userMessage: Message = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: Date.now(),
        conversationId: get().currentConversationId,
      };

      set((state) => ({
        messages: [...state.messages, userMessage],
        isStreaming: true,
        streamingContent: '',
      }));

      // Start streaming
      const messages = get().messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      try {
        for await (const token of inferenceManager.generate(messages)) {
          set((state) => ({
            streamingContent: state.streamingContent + token,
          }));
        }

        // Finalize message
        const assistantMessage: Message = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: get().streamingContent,
          timestamp: Date.now(),
          conversationId: get().currentConversationId,
        };

        set((state) => ({
          messages: [...state.messages, assistantMessage],
          isStreaming: false,
          streamingContent: '',
        }));
      } catch (error) {
        set({
          isStreaming: false,
          error: (error as Error).message,
        });
      }
    },

    stopGeneration: () => {
      inferenceManager.abort();
      set({ isStreaming: false });
    },

    clearChat: () => {
      set({ messages: [], error: null });
    },
  }))
);
```

### Pattern 3: Auto-Save with Dexie
**What:** Persist conversation to IndexedDB after each message
**When to use:** STOR-01 requirement
**Example:**
```typescript
// Source: /src/lib/storage/conversations.ts (to create)
import { db } from './db';
import type { Conversation } from '@/types/index';

export async function saveConversation(conversation: Conversation): Promise<void> {
  await db.conversations.put(conversation);
}

export async function getConversation(id: string): Promise<Conversation | undefined> {
  return await db.conversations.get(id);
}

export async function getAllConversations(): Promise<Conversation[]> {
  return await db.conversations
    .orderBy('updatedAt')
    .reverse()
    .toArray();
}

export async function deleteConversation(id: string): Promise<void> {
  await db.conversations.delete(id);
}

export async function updateConversationTitle(
  id: string,
  title: string
): Promise<void> {
  await db.conversations.update(id, { title, updatedAt: Date.now() });
}
```

### Pattern 4: Auto-Resizing Textarea
**What:** Textarea that grows with content
**When to use:** CHAT-01 requirement
**Example:**
```typescript
// Source: Common React pattern
import { useRef, useEffect, useCallback } from 'react';

function useAutoResize() {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const adjustHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
  }, []);

  useEffect(() => {
    adjustHeight();
  }, [adjustHeight]);

  return { textareaRef, adjustHeight };
}
```

### Pattern 5: Performance Metrics Tracking
**What:** Track tokens per second and response time
**When to use:** PERF-03, PERF-04 requirements
**Example:**
```typescript
// Source: Custom implementation
interface PerformanceMetrics {
  tokensPerSecond: number;
  totalTokens: number;
  startTime: number;
  endTime: number | null;
  responseTimeMs: number | null;
}

function usePerformanceMetrics() {
  const metricsRef = useRef<PerformanceMetrics>({
    tokensPerSecond: 0,
    totalTokens: 0,
    startTime: 0,
    endTime: null,
    responseTimeMs: null,
  });

  const startTracking = useCallback(() => {
    metricsRef.current = {
      tokensPerSecond: 0,
      totalTokens: 0,
      startTime: performance.now(),
      endTime: null,
      responseTimeMs: null,
    };
  }, []);

  const trackToken = useCallback(() => {
    metricsRef.current.totalTokens++;
    const elapsed = (performance.now() - metricsRef.current.startTime) / 1000;
    metricsRef.current.tokensPerSecond = metricsRef.current.totalTokens / elapsed;
  }, []);

  const stopTracking = useCallback(() => {
    metricsRef.current.endTime = performance.now();
    metricsRef.current.responseTimeMs =
      metricsRef.current.endTime - metricsRef.current.startTime;
    return metricsRef.current;
  }, []);

  return { startTracking, trackToken, stopTracking, metrics: metricsRef };
}
```

### Anti-Patterns to Avoid
- **Storing derived state:** Don't store formatted message content; derive from raw messages
- **Synchronous IndexedDB operations:** Always use async/await with Dexie
- **Updating state in render:** Use useEffect for side effects like auto-save
- **Not aborting streams:** Always call inferenceManager.abort() on unmount or stop
- **Storing entire store in localStorage:** Use Dexie for messages, Zustand for UI state only

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown rendering | Custom parser | react-markdown + remark-gfm | Security (XSS), GFM support, maintained |
| Code syntax highlighting | Custom highlighter | react-syntax-highlighter | 100+ languages, themes, accessibility |
| IndexedDB wrapper | Raw IDB API | Dexie.js | Type safety, promises, migrations |
| State management | useState/useReducer | Zustand | Already in project, devtools, selectors |
| Auto-resizing textarea | Manual height calc | Native textarea + scrollHeight | Simple, accessible, no dependencies |
| Copy to clipboard | document.execCommand | navigator.clipboard API | Modern, Promise-based, secure |
| UUID generation | Math.random | crypto.randomUUID() or uuid | Collision-resistant, standard |
| Virtualization (future) | Manual windowing | @virtuoso.dev/message-list | Already in dependencies |

**Key insight:** The project already has most necessary libraries. Focus on integration patterns rather than custom implementations.

## Common Pitfalls

### Pitfall 1: Streaming State Lag
**What goes wrong:** UI freezes or lags during token streaming due to too many re-renders
**Why it happens:** Updating Zustand state on every token causes React re-render cascade
**How to avoid:**
- Use local state for streaming content, batch updates to store
- Use requestAnimationFrame for smooth UI updates
- Consider using a ref for the streaming message content
**Warning signs:** Frame drops in DevTools Performance tab, janky scrolling

### Pitfall 2: Memory Leaks from Streams
**What goes wrong:** Component unmounts but stream continues, causing errors
**Why it happens:** Async generator not properly cancelled
**How to avoid:**
- Always call inferenceManager.abort() in cleanup
- Use AbortController pattern for fetch operations
- Track mounted state with useEffect cleanup
**Warning signs:** "Can't perform React state update on unmounted component" warnings

### Pitfall 3: IndexedDB Transaction Errors
**What goes wrong:** "Transaction inactive" or "Database closed" errors
**Why it happens:** Trying to use DB before it's open, or async operations outside transaction
**How to avoid:**
- Always await db.open() before operations
- Keep async operations within Dexie transaction blocks
- Handle "QuotaExceededError" gracefully
**Warning signs:** Intermittent save failures, data loss

### Pitfall 4: Race Conditions in Message Sending
**What goes wrong:** Messages sent out of order or duplicated
**Why it happens:** Multiple rapid clicks, async state updates
**How to avoid:**
- Disable input while isStreaming is true
- Use functional updates in Zustand
- Generate IDs deterministically or use crypto.randomUUID()
**Warning signs:** Duplicate messages, wrong message order

### Pitfall 5: XSS via Markdown
**What goes wrong:** Malicious content in AI responses executes JavaScript
**Why it happens:** react-markdown with rehype-raw allows HTML
**How to avoid:**
- Don't use rehype-raw unless absolutely necessary
- Use DOMPurify if HTML rendering is required
- Configure react-markdown to only allow safe elements
**Warning signs:** Script tags in AI responses, alert() popups

### Pitfall 6: Performance Panel Accuracy
**What goes wrong:** Tokens per second calculation is inaccurate
**Why it happens:** Not accounting for time to first token, or counting incorrectly
**How to avoid:**
- Start timer on generation start, not first token
- Count actual tokens received, not characters
- Update metrics at most every 100ms for display
**Warning signs:** TPS fluctuates wildly, doesn't match perceived speed

## Code Examples

### Markdown Message Rendering
```typescript
// Source: react-markdown documentation + project dependencies
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
}

export function MarkdownMessage({ content }: MarkdownMessageProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || '');
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          ) : (
            <code className={className} {...props}>
              {children}
            </code>
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
```

### Message Bubble Component
```typescript
// Source: Project patterns from Button.tsx + Context decisions
import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';
import { MarkdownMessage } from './MarkdownMessage';
import type { Message } from '@/types/index';

interface MessageBubbleProps {
  message: Message;
  isStreaming?: boolean;
}

export function MessageBubble({ message, isStreaming }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 py-6',
        isUser ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-blue-500' : 'bg-gray-200'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-white" />
        ) : (
          <Bot className="h-5 w-5 text-gray-700" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-3',
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 text-gray-900'
        )}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{message.content}</p>
        ) : (
          <MarkdownMessage content={message.content} />
        )}

        {/* Streaming indicator */}
        {isStreaming && (
          <span className="ml-1 inline-block h-4 w-2 animate-pulse bg-current" />
        )}
      </div>
    </div>
  );
}
```

### Copy to Clipboard Helper
```typescript
// Source: Modern Clipboard API pattern
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}

// Usage with toast notification
export function useCopyMessage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyMessage = useCallback(async (message: Message) => {
    const success = await copyToClipboard(message.content);
    if (success) {
      setCopiedId(message.id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  }, []);

  return { copyMessage, copiedId };
}
```

### Title Generation Heuristic
```typescript
// Source: Context decision - first 20 chars
export function generateConversationTitle(firstUserMessage: string): string {
  const trimmed = firstUserMessage.trim();

  if (trimmed.length <= 20) {
    return trimmed;
  }

  // Try to break at word boundary
  const truncated = trimmed.slice(0, 20);
  const lastSpace = truncated.lastIndexOf(' ');

  if (lastSpace > 10) {
    return truncated.slice(0, lastSpace) + '...';
  }

  return truncated + '...';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Redux + Thunk | Zustand | 2023+ | Less boilerplate, better TypeScript |
| Raw IDB API | Dexie.js | 2020+ | Promise-based, type-safe |
| Manual Web Workers | WebLLM's CreateWebWorkerMLCEngine | 2024 | Simplified WebLLM integration |
| highlight.js | react-syntax-highlighter | 2019+ | React integration, more themes |
| LocalStorage | IndexedDB | Large data | Better for chat history (unlimited size) |

**Deprecated/outdated:**
- document.execCommand('copy'): Use navigator.clipboard instead
- React.useContext for global state: Use Zustand/Jotai instead
- Class components: Use function components with hooks

## Open Questions

1. **Component Library Installation**
   - What we know: User wants blocks.so, prompt-kit.com, kibo-ui.com, shadcn.io/ai
   - What's unclear: Exact npm package names, installation commands
   - Recommendation: Research each library's official docs for installation; may need to use `npx shadcn add` or direct npm install

2. **Virtualization Threshold**
   - What we know: @virtuoso.dev/message-list is in dependencies
   - What's unclear: When to enable virtualization (message count threshold)
   - Recommendation: Start without virtualization, add when >50 messages cause performance issues

3. **Memory Warning Thresholds**
   - What we know: PERF-06 requires warning at 75%
   - What's unclear: Exact memory.limit API availability across browsers
   - Recommendation: Use Performance.memory for Chrome, graceful degradation for others

4. **Code Block Theme**
   - What we know: kibo-ui code-block component is specified
   - What's unclear: Which syntax highlighting theme to use
   - Recommendation: Use oneDark (matches ChatGPT) or oneLight for light mode

## Sources

### Primary (HIGH confidence)
- `/Users/poak/Documents/personal-project/Lokul/package.json` - Dependencies and versions
- `/Users/poak/Documents/personal-project/Lokul/src/lib/ai/inference.ts` - WebLLM integration pattern
- `/Users/poak/Documents/personal-project/Lokul/src/lib/storage/db.ts` - Dexie.js schema
- `/Users/poak/Documents/personal-project/Lokul/src/store/modelStore.ts` - Zustand patterns
- `/Users/poak/Documents/personal-project/Lokul/src/types/index.ts` - Type definitions
- `/Users/poak/Documents/personal-project/Lokul/CLAUDE.md` - Project architecture guidelines

### Secondary (MEDIUM confidence)
- react-markdown documentation (v9.x) - Markdown rendering patterns
- react-syntax-highlighter documentation (v15.x) - Code highlighting
- Zustand documentation (v5.x) - State management patterns
- Dexie.js documentation (v4.x) - IndexedDB operations

### Tertiary (LOW confidence)
- blocks.so/ai - Component library (could not verify exact API)
- prompt-kit.com - Component library (could not verify exact API)
- kibo-ui.com - Component library (could not verify exact API)
- shadcn.io/ai - Component library (could not verify exact API)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified in package.json
- Architecture: HIGH - Patterns established in existing codebase
- Pitfalls: MEDIUM-HIGH - Based on common React/WebLLM patterns
- Component libraries: LOW-MEDIUM - URLs provided but APIs not verified

**Research date:** 2026-02-18
**Valid until:** 2026-03-18 (30 days for stable stack)

**Key assumptions to verify:**
1. Component libraries can be installed via npm/shadcn CLI
2. react-markdown v9 API is stable (verify during implementation)
3. WebLLM streaming API remains consistent
4. Dexie.js schema supports conversation operations as designed
