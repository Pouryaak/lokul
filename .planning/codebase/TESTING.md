# Testing Patterns

**Analysis Date:** 2026-02-17

## Overview

The Lokul project is in early scaffold stage with no test infrastructure currently implemented. This document establishes the testing standards and patterns to be followed as development progresses, based on the architecture defined in `CLAUDE.md`.

## Test Framework

**Recommended Stack:**
- **Runner:** Vitest (Vite-native, fast, modern)
- **Assertion Library:** Vitest built-in assertions (Chai-like)
- **DOM Testing:** React Testing Library (@testing-library/react)
- **Mocking:** Vitest built-in mocking (vi.fn, vi.mock)

**Configuration Location:** `vitest.config.ts` (to be created)

**Suggested Configuration:**
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/workers/**', // Web Workers test separately
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

**Run Commands:**
```bash
# Run all tests
npm run test

# Watch mode
npm run test:watch

# Coverage
npm run test:coverage

# UI mode
npm run test:ui
```

## Test File Organization

**Location:** Co-located with source files

**Naming Pattern:**
- Unit tests: `[filename].test.ts` or `[filename].test.tsx`
- Component tests: `[ComponentName].test.tsx`
- Integration tests: `__tests__/[feature].integration.test.ts`

**Structure:**
```
src/
├── components/
│   ├── chat/
│   │   ├── Message.tsx
│   │   ├── Message.test.tsx          # Component test
│   │   └── MessageList.tsx
│   ├── ui/
│   │   ├── Button.tsx
│   │   └── Button.test.tsx           # Component test
├── lib/
│   ├── utils/
│   │   ├── token-counter.ts
│   │   └── token-counter.test.ts     # Unit test
├── hooks/
│   ├── useChat.ts
│   └── useChat.test.ts               # Hook test
├── test/
│   ├── setup.ts                      # Test setup
│   ├── fixtures/
│   │   ├── conversations.ts          # Test data
│   │   └── messages.ts
│   └── mocks/
│       ├── worker.ts                 # Worker mocks
│       └── webllm.ts                 # WebLLM mocks
```

## Test Structure

**Unit Test Pattern:**
```typescript
import { describe, it, expect } from 'vitest';
import { calculateTokens } from './token-counter';

describe('calculateTokens', () => {
  it('should calculate tokens for simple text', () => {
    const text = 'Hello world';
    const tokens = calculateTokens(text);
    expect(tokens).toBe(3); // ~0.75 words per token
  });

  it('should handle empty strings', () => {
    const tokens = calculateTokens('');
    expect(tokens).toBe(0);
  });

  it('should handle long text', () => {
    const text = 'a'.repeat(1000);
    const tokens = calculateTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});
```

**Component Test Pattern:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('should render with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('should apply variant styles', () => {
    render(<Button variant="secondary">Click me</Button>);
    const button = screen.getByText('Click me');
    expect(button).toHaveClass('bg-secondary');
  });

  it('should be disabled when loading', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeDisabled();
  });
});
```

**Hook Test Pattern:**
```typescript
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useChat } from './useChat';

// Mock the store
vi.mock('@/store/chatStore', () => ({
  useChatStore: () => ({
    messages: [],
    addMessage: vi.fn(),
  }),
}));

describe('useChat', () => {
  it('should initialize with empty state', () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle sending message', async () => {
    const { result } = renderHook(() => useChat());

    await act(async () => {
      await result.current.sendMessage('Hello');
    });

    expect(result.current.messages).toHaveLength(1);
  });
});
```

## Mocking

**Framework:** Vitest built-in mocking

**Mock Patterns:**

```typescript
// Mocking a module
vi.mock('@/lib/ai/inference', () => ({
  inferenceManager: {
    generate: vi.fn(),
    abort: vi.fn(),
  },
}));

// Mocking a function
const mockGenerate = vi.fn();
vi.mock('@/lib/ai/inference', () => ({
  inferenceManager: {
    generate: mockGenerate,
  },
}));

// Mocking Web Workers
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  postMessage = vi.fn();
  terminate = vi.fn();
}

// Mocking WebLLM
vi.mock('@mlc-ai/web-llm', () => ({
  CreateMLCEngine: vi.fn().mockResolvedValue({
    chat: {
      completions: {
        create: vi.fn(),
      },
    },
    interruptGenerate: vi.fn(),
  }),
}));

// Mocking IndexedDB/Dexie
vi.mock('@/lib/storage/db', () => ({
  db: {
    conversations: {
      put: vi.fn(),
      get: vi.fn(),
      toArray: vi.fn().mockResolvedValue([]),
    },
  },
}));
```

**What to Mock:**
- External APIs and services
- Web Workers
- Database operations (IndexedDB)
- AI/ML inference calls
- Browser APIs (WebGPU, localStorage)
- Non-deterministic operations (random, Date.now)

**What NOT to Mock:**
- Simple utility functions
- React itself
- Standard library functions (unless testing integration)

## Fixtures and Factories

**Test Data Location:** `src/test/fixtures/`

**Fixture Pattern:**
```typescript
// src/test/fixtures/messages.ts
import type { Message } from '@/types/chat';

export const createMessage = (overrides: Partial<Message> = {}): Message => ({
  id: crypto.randomUUID(),
  role: 'user',
  content: 'Test message',
  timestamp: Date.now(),
  ...overrides,
});

export const mockMessages: Message[] = [
  createMessage({ role: 'user', content: 'Hello' }),
  createMessage({ role: 'assistant', content: 'Hi there!' }),
];

// src/test/fixtures/conversations.ts
import type { Conversation } from '@/types/chat';

export const createConversation = (
  overrides: Partial<Conversation> = {}
): Conversation => ({
  id: crypto.randomUUID(),
  title: 'Test Conversation',
  model: 'Llama-3.1-8B-Instruct-q4f32_1-MLC',
  messages: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
  ...overrides,
});
```

## Coverage

**Target Coverage:**
- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

**Critical Paths (100% coverage required):**
- `src/lib/ai/inference.ts`
- `src/lib/storage/db.ts`
- `src/lib/utils/validators.ts`
- All utility functions in `src/lib/utils/`

**View Coverage:**
```bash
npm run test:coverage
# Opens HTML report in coverage/
```

## Test Types

**Unit Tests:**
- Scope: Individual functions and components
- Location: Co-located with source
- Focus: Pure logic, input/output validation

**Integration Tests:**
- Scope: Feature workflows
- Location: `src/__tests__/`
- Focus: Component interaction, data flow

Example:
```typescript
// src/__tests__/chat.integration.test.tsx
describe('Chat Flow', () => {
  it('should send message and receive response', async () => {
    render(<ChatInterface />);

    const input = screen.getByPlaceholderText('Type a message...');
    fireEvent.change(input, { target: { value: 'Hello' } });
    fireEvent.click(screen.getByText('Send'));

    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByTestId('ai-response')).toBeInTheDocument();
    }, { timeout: 30000 });
  });
});
```

**E2E Tests:**
- Framework: Playwright (recommended)
- Location: `e2e/`
- Focus: Critical user journeys

Example:
```typescript
// e2e/chat.spec.ts
import { test, expect } from '@playwright/test';

test('user can send a message', async ({ page }) => {
  await page.goto('/');

  await page.fill('[data-testid="message-input"]', 'Hello');
  await page.click('[data-testid="send-button"]');

  await expect(page.locator('[data-testid="message-list"]')).toContainText('Hello');
});
```

## Common Patterns

**Async Testing:**
```typescript
// ✅ Good: Testing async operations
it('should load conversation', async () => {
  const { result } = renderHook(() => useConversations());

  await act(async () => {
    await result.current.loadConversation('123');
  });

  expect(result.current.currentConversation).toBeDefined();
});

// ✅ Good: Testing loading states
it('should show loading state', async () => {
  const { result } = renderHook(() => useChat());

  act(() => {
    result.current.sendMessage('Hello');
  });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
```

**Error Testing:**
```typescript
// ✅ Good: Testing error handling
it('should handle errors', async () => {
  const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  mockGenerate.mockRejectedValueOnce(new Error('Inference failed'));

  const { result } = renderHook(() => useChat());

  await act(async () => {
    await result.current.sendMessage('Hello');
  });

  expect(result.current.error).toBeInstanceOf(Error);
  expect(result.current.error?.message).toBe('Inference failed');

  consoleSpy.mockRestore();
});
```

**Event Handler Testing:**
```typescript
// ✅ Good: Testing user interactions
it('should handle message deletion', () => {
  const onDelete = vi.fn();
  render(<Message message={mockMessage} onDelete={onDelete} />);

  fireEvent.click(screen.getByLabelText('Delete message'));

  expect(onDelete).toHaveBeenCalledWith(mockMessage.id);
});
```

## Testing Web Workers

**Worker Mock:**
```typescript
// src/test/mocks/worker.ts
export class MockWorker {
  url: string;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((error: ErrorEvent) => void) | null = null;

  constructor(url: string) {
    this.url = url;
  }

  postMessage(data: any) {
    // Simulate worker response
    setTimeout(() => {
      if (this.onmessage) {
        this.onmessage(new MessageEvent('message', {
          data: { type: 'INIT_COMPLETE' }
        }));
      }
    }, 0);
  }

  terminate() {}
}

// In test setup
global.Worker = MockWorker as any;
```

## Testing IndexedDB

**Dexie Mock:**
```typescript
// src/test/mocks/dexie.ts
import 'fake-indexeddb/auto';

// Use fake-indexeddb for testing
// Install: npm install -D fake-indexeddb
```

## Test Setup

**Setup File:** `src/test/setup.ts`
```typescript
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock crypto.randomUUID
global.crypto = {
  ...global.crypto,
  randomUUID: () => 'test-uuid-123',
};

// Mock matchMedia
global.matchMedia = vi.fn().mockImplementation(query => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: vi.fn(),
  removeListener: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
}));

// Mock WebGPU
global.navigator.gpu = {
  requestAdapter: vi.fn(),
};

// Clean up after each test
import { cleanup } from '@testing-library/react';
afterEach(() => {
  cleanup();
});
```

## CI/CD Integration

**GitHub Actions:**
```yaml
# .github/workflows/test.yml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - uses: codecov/codecov-action@v3
```

---

*Testing analysis: 2026-02-17*
