# Coding Conventions

**Analysis Date:** 2026-02-17

## Overview

This codebase follows strict conventions defined in `CLAUDE.md`. As the project is in early scaffold stage, these conventions are prescriptive standards that must be followed as development progresses.

## Naming Patterns

**Files:**
- Components: PascalCase with kebab-case filenames (e.g., `ChatInterface.tsx` in `chat-interface.tsx`)
- Utilities: camelCase (e.g., `token-counter.ts`)
- Hooks: Prefixed with `use`, camelCase (e.g., `useChat.ts`)
- Workers: Descriptive name with `.worker.ts` suffix (e.g., `inference.worker.ts`)

**Functions:**
- camelCase for all functions
- Event handlers prefixed with `handle` (e.g., `handleSubmit`, `handleDelete`)
- Async functions should be explicit (e.g., `async function loadModel()`)
- Pure functions preferred over impure

**Variables:**
- camelCase for variables
- UPPER_SNAKE_CASE for constants (e.g., `MAX_RETRIES`, `SYSTEM_TOKENS`)
- Boolean variables should be descriptive (e.g., `isLoading`, `hasMessages`)

**Types:**
- PascalCase for interfaces and types (e.g., `MessageProps`, `ModelType`)
- Descriptive names that indicate purpose
- Use `type` for unions/intersections, `interface` for object shapes

**Components:**
- PascalCase component names (e.g., `ChatInterface`, `MessageList`)
- Props interfaces named with `Props` suffix (e.g., `MessageListProps`)
- Default exports for page components, named exports for reusable components

## Code Style

**Formatting:**
- Use Prettier for consistent formatting
- 2 spaces for indentation
- Single quotes for strings
- Trailing commas required
- Max line length: 80-100 characters

**Linting:**
- ESLint with TypeScript rules
- No unused variables allowed
- Explicit return types on exported functions
- No console.log in production code

**Import Organization:**
1. React imports
2. Third-party libraries (alphabetical)
3. Absolute imports from `@/` (alphabetical)
4. Relative imports (alphabetical)
5. Type imports (grouped at bottom)

Example:
```typescript
import { useState, useCallback } from 'react';
import { create } from 'zustand';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types/chat';
```

**Path Aliases:**
- `@/` maps to `src/` directory
- Used for all imports except relative sibling files

## Component Structure

**Maximum 200 lines per component**

**Component Organization:**
```tsx
// 1. Imports (grouped)
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useChat } from '@/hooks/useChat';
import type { Message } from '@/types/chat';

// 2. Types (component-specific)
interface MessageListProps {
  messages: Message[];
  onMessageDelete?: (id: string) => void;
}

// 3. Component
export function MessageList({ messages, onMessageDelete }: MessageListProps) {
  // 3a. Hooks (in order: state, context, custom)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { regenerateMessage } = useChat();

  // 3b. Event handlers (prefixed with 'handle')
  const handleDelete = (id: string) => {
    onMessageDelete?.(id);
  };

  // 3c. Derived state / memoization
  const hasMessages = messages.length > 0;

  // 3d. Effects (if needed)
  // useEffect(() => { ... }, []);

  // 3e. Early returns (loading, error states)
  if (!hasMessages) {
    return <EmptyState />;
  }

  // 3f. Render
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Message key={message.id} message={message} onDelete={handleDelete} />
      ))}
    </div>
  );
}

// 4. Sub-components (if needed, small and related)
function EmptyState() {
  return <div>No messages yet</div>;
}
```

## Function Design

**Maximum 50 lines per function**

**Function Structure:**
```typescript
/**
 * Builds the context window for AI inference
 * @param conversation - Current conversation
 * @param memory - User memory facts
 * @param maxTokens - Maximum context size
 * @returns Formatted context array
 */
export function buildContext(
  conversation: Conversation,
  memory: MemoryFacts,
  maxTokens: number = 6000,
): ContextMessage[] {
  // 1. Validation
  if (!conversation || conversation.messages.length === 0) {
    throw new Error('Conversation is required');
  }

  // 2. Constants
  const SYSTEM_TOKENS = 100;
  const MEMORY_TOKENS = 200;

  // 3. Build context parts
  const systemPrompt = getSystemPrompt();
  const memoryContext = formatMemory(memory);
  const availableTokens = maxTokens - SYSTEM_TOKENS - MEMORY_TOKENS;

  // 4. Get recent messages
  const recentMessages = getRecentMessages(
    conversation.messages,
    availableTokens,
  );

  // 5. Combine and return
  return [
    { role: 'system', content: systemPrompt },
    { role: 'system', content: memoryContext },
    ...recentMessages,
  ];
}
```

**Pure Functions (Preferred):**
```typescript
// ✅ Good: Pure function (no side effects)
function calculateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// ❌ Bad: Impure function (side effects)
let totalTokens = 0;
function calculateTokens(text: string): number {
  totalTokens += Math.ceil(text.length / 4);
  return totalTokens;
}
```

## Error Handling

**Try-Catch Pattern:**
```typescript
// ✅ Good: Comprehensive error handling
async function sendMessage(content: string) {
  try {
    // Validation
    if (!content.trim()) {
      throw new Error('Message cannot be empty');
    }

    // Operation
    const response = await inferenceManager.generate(content);
    return response;
  } catch (error) {
    // Log error (development only)
    if (import.meta.env.DEV) {
      console.error('Failed to send message:', error);
    }

    // User-friendly error
    const message =
      error instanceof Error ? error.message : 'Failed to send message';

    // Re-throw or handle
    throw new Error(message);
  }
}
```

**Error Boundary Pattern:**
```tsx
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-4 text-center">
            <h2>Something went wrong</h2>
            <p>{this.state.error?.message}</p>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
```

## Logging

**Framework:** Console (development only)

**Patterns:**
- Use `console.error` for errors (development only)
- Use `console.warn` for warnings
- No console.log in production code
- Check `import.meta.env.DEV` before logging

```typescript
if (import.meta.env.DEV) {
  console.error('Failed to send message:', error);
}
```

## Comments

**When to Comment:**
- Complex logic that isn't self-evident
- Non-obvious behavior or browser quirks
- Workarounds for known issues
- JSDoc for all public APIs

**JSDoc for Public APIs:**
```typescript
/**
 * Sends a message and gets AI response
 * @param content - The message content
 * @param options - Optional configuration
 * @returns Promise resolving to AI response
 * @throws {Error} If content is empty or inference fails
 * @example
 * ```ts
 * const response = await sendMessage('Hello!', { stream: true });
 * ```
 */
export async function sendMessage(
  content: string,
  options?: MessageOptions,
): Promise<string> {
  // Implementation
}
```

**Comment Anti-patterns:**
```typescript
// ❌ Bad: Obvious code
// Set the value to true
const isActive = true;

// ❌ Bad: Outdated comment
// TODO: Fix this later (from 2 years ago)
```

## Module Design

**Exports:**
- Named exports for utilities and hooks
- Default exports for page components
- Barrel files (`index.ts`) for clean imports from directories

**Barrel File Pattern:**
```typescript
// components/ui/index.ts
export { Button } from './Button';
export { Card } from './Card';
export { Modal } from './Modal';
```

## Styling Conventions

**Tailwind CSS Usage:**
```tsx
// ✅ Good: Use Tailwind utilities
<button className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90">
  Click me
</button>

// ✅ Good: Extract repeated styles to components
<Button variant="primary" size="lg">Click me</Button>

// ❌ Bad: Inline styles
<button style={{ padding: '8px 16px', backgroundColor: '#FF6B35' }}>
  Click me
</button>
```

**CSS Variables:**
```css
@layer base {
  :root {
    --primary: 23 107 53; /* #FF6B35 as RGB */
    --background: 255 248 240;
    --foreground: 26 26 26;
  }

  .dark {
    --background: 15 15 15;
    --foreground: 255 255 255;
  }
}
```

## Security Conventions

**Input Validation:**
```typescript
// Validate user input
function validateMessage(content: string): string {
  // Trim whitespace
  const trimmed = content.trim();

  // Check length
  if (trimmed.length === 0) {
    throw new Error('Message cannot be empty');
  }

  if (trimmed.length > 10000) {
    throw new Error('Message too long (max 10,000 characters)');
  }

  return trimmed;
}
```

**XSS Prevention:**
```tsx
// ✅ Good: React escapes by default
<div>{userContent}</div>;

// ⚠️ Careful: dangerouslySetInnerHTML
// Only use with sanitized markdown
import DOMPurify from 'dompurify';

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(markdownHTML),
  }}
/>;

// ✅ Better: Use react-markdown (auto-sanitized)
import ReactMarkdown from 'react-markdown';

<ReactMarkdown>{userContent}</ReactMarkdown>;
```

## Git Commit Conventions

**Commit Message Format:**
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(chat): add streaming message support

fix(storage): handle IndexedDB quota exceeded error

docs(readme): update installation instructions
```

---

*Convention analysis: 2026-02-17*
