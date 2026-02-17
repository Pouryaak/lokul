# CLAUDE.md - Development Guide for Lokul

This document provides guidelines, best practices, and context for building Lokul. Use this as your source of truth when writing code.

---

## 📋 Project Overview

**Lokul** is a privacy-first AI chat application that runs 100% in the browser using WebGPU. All AI inference happens locally on the user's device.

**Key Principles:**

- Privacy by architecture (not by promise)
- Works offline after first load
- Zero server-side inference
- Open source and auditable

---

## 🎯 Core Philosophy

### **1. Privacy First**

- NO network requests during chat (except initial model download)
- NO analytics or tracking
- NO server-side logging
- Everything stored locally (IndexedDB)

### **2. User Experience**

- Fast first load (< 30 seconds)
- Instant responses (local inference)
- No blocking UI operations
- Progressive enhancement (Quick → Smart → Genius)

### **3. Code Quality**

- Small, focused functions (< 50 lines)
- Single Responsibility Principle
- Modular components
- TypeScript for type safety
- Comprehensive error handling

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────┐
│           React UI Layer                │
│  (Components, Hooks, State Management)  │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Application Layer               │
│  (Business Logic, Orchestration)        │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│          Service Layer                  │
│  (AI Worker, Storage, Performance)      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Infrastructure Layer            │
│  (WebLLM, IndexedDB, WebGPU)            │
└─────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
lokul/
├── public/
│   ├── spark-logo.svg              # App logo
│   └── manifest.json               # PWA manifest
│
├── src/
│   ├── components/                 # React components
│   │   ├── chat/
│   │   │   ├── ChatInterface.tsx   # Main chat container
│   │   │   ├── MessageList.tsx     # Virtualized message list
│   │   │   ├── Message.tsx         # Single message component
│   │   │   ├── MessageInput.tsx    # Input with auto-resize
│   │   │   └── StreamingMessage.tsx # Streaming indicator
│   │   │
│   │   ├── model/
│   │   │   ├── ModelSelector.tsx   # Model dropdown
│   │   │   ├── ModelCard.tsx       # Individual model info
│   │   │   └── DownloadProgress.tsx # Progress UI
│   │   │
│   │   ├── performance/
│   │   │   ├── PerformancePanel.tsx # Stats display
│   │   │   └── StatusIndicator.tsx  # Color-coded status
│   │   │
│   │   ├── sidebar/
│   │   │   ├── Sidebar.tsx         # Main sidebar
│   │   │   ├── ConversationList.tsx # List of chats
│   │   │   └── ConversationItem.tsx # Single chat item
│   │   │
│   │   ├── memory/
│   │   │   ├── MemoryPanel.tsx     # Memory viewer
│   │   │   └── FactItem.tsx        # Individual fact display
│   │   │
│   │   ├── settings/
│   │   │   ├── SettingsPanel.tsx   # Settings drawer
│   │   │   └── SettingsSection.tsx # Grouped settings
│   │   │
│   │   ├── onboarding/
│   │   │   ├── FirstRunSetup.tsx   # Initial setup flow
│   │   │   └── LoadingScreen.tsx   # Model loading UI
│   │   │
│   │   └── ui/                     # Reusable UI components
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Modal.tsx
│   │       ├── Toast.tsx
│   │       └── ... (shadcn/ui components)
│   │
│   ├── lib/                        # Core libraries
│   │   ├── ai/
│   │   │   ├── worker.ts           # Web Worker for AI inference
│   │   │   ├── models.ts           # Model configurations
│   │   │   ├── inference.ts        # Inference orchestration
│   │   │   └── context-builder.ts  # Context window management
│   │   │
│   │   ├── storage/
│   │   │   ├── db.ts               # Dexie schema & migrations
│   │   │   ├── conversations.ts    # Conversation CRUD
│   │   │   ├── memory.ts           # Memory CRUD
│   │   │   └── settings.ts         # Settings persistence
│   │   │
│   │   ├── memory/
│   │   │   ├── fact-extractor.ts   # Pattern-based extraction
│   │   │   ├── context-manager.ts  # Context building
│   │   │   └── compaction.ts       # Auto-compaction logic
│   │   │
│   │   ├── performance/
│   │   │   ├── metrics.ts          # Performance tracking
│   │   │   ├── gpu-detection.ts    # WebGPU capability check
│   │   │   └── memory-monitor.ts   # Memory usage tracking
│   │   │
│   │   └── utils/
│   │       ├── markdown.ts         # Markdown utilities
│   │       ├── token-counter.ts    # Token estimation
│   │       ├── compression.ts      # Optional compression
│   │       └── validators.ts       # Input validation
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useChat.ts              # Chat state & logic
│   │   ├── useModel.ts             # Model switching logic
│   │   ├── usePerformance.ts       # Performance monitoring
│   │   ├── useMemory.ts            # Memory management
│   │   ├── useConversations.ts     # Conversation list
│   │   └── useSettings.ts          # Settings state
│   │
│   ├── store/                      # Zustand stores
│   │   ├── chatStore.ts            # Chat state
│   │   ├── modelStore.ts           # Model state
│   │   ├── settingsStore.ts        # Settings state
│   │   └── uiStore.ts              # UI state (sidebar, panels)
│   │
│   ├── workers/                    # Web Workers
│   │   └── inference.worker.ts     # AI inference worker
│   │
│   ├── types/                      # TypeScript types
│   │   ├── chat.ts
│   │   ├── model.ts
│   │   ├── memory.ts
│   │   └── storage.ts
│   │
│   ├── styles/
│   │   └── globals.css             # Global styles + Tailwind
│   │
│   ├── App.tsx                     # Main app component
│   └── main.tsx                    # Entry point
│
├── .env.example                    # Environment variables template
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 🎨 Component Guidelines

### **Component Size**

- **Maximum 200 lines per component**
- If larger, split into smaller components
- Use composition over inheritance

### **Component Structure**

```tsx
// 1. Imports (grouped)
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useChat } from "@/hooks/useChat";
import type { Message } from "@/types/chat";

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

### **Naming Conventions**

```tsx
// Components: PascalCase
export function ChatInterface() {}

// Functions: camelCase
function handleSubmit() {}

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;

// Types/Interfaces: PascalCase
interface MessageProps {}
type ModelType = "quick" | "smart" | "genius";

// Files: kebab-case
// chat-interface.tsx, use-chat.ts
```

---

## 🔧 Function Guidelines

### **Function Size**

- **Maximum 50 lines per function**
- If larger, extract sub-functions
- Single Responsibility Principle

### **Function Structure**

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
    throw new Error("Conversation is required");
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
    { role: "system", content: systemPrompt },
    { role: "system", content: memoryContext },
    ...recentMessages,
  ];
}

// Helper functions (extracted for clarity)
function getRecentMessages(
  messages: Message[],
  maxTokens: number,
): ContextMessage[] {
  // Implementation
}

function formatMemory(memory: MemoryFacts): string {
  // Implementation
}
```

### **Pure Functions (Preferred)**

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

---

## 🎣 Custom Hooks Guidelines

### **Hook Naming**

- Always prefix with `use`
- Descriptive names: `useChat`, `useModel`, not `useData`

### **Hook Structure**

```typescript
import { useState, useEffect, useCallback } from "react";
import { chatStore } from "@/store/chatStore";

/**
 * Custom hook for managing chat state and operations
 */
export function useChat(conversationId?: string) {
  // 1. State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // 2. Store subscriptions
  const messages = chatStore((state) => state.messages);
  const addMessage = chatStore((state) => state.addMessage);

  // 3. Callbacks (memoized)
  const sendMessage = useCallback(
    async (content: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Logic here
        await addMessage({ role: "user", content });
      } catch (err) {
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    },
    [addMessage],
  );

  // 4. Effects
  useEffect(() => {
    // Setup/cleanup
    return () => {
      // Cleanup
    };
  }, [conversationId]);

  // 5. Return object
  return {
    messages,
    isLoading,
    error,
    sendMessage,
  };
}
```

---

## 💾 State Management (Zustand)

### **Store Structure**

```typescript
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import type { Message } from "@/types/chat";

// 1. Define state interface
interface ChatState {
  // State
  messages: Message[];
  currentConversationId: string | null;
  isStreaming: boolean;

  // Actions
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setStreaming: (streaming: boolean) => void;
}

// 2. Create store
export const useChatStore = create<ChatState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        messages: [],
        currentConversationId: null,
        isStreaming: false,

        // Actions (use 'set' for updates)
        addMessage: (message) =>
          set((state) => ({
            messages: [...state.messages, message],
          })),

        clearMessages: () => set({ messages: [] }),

        setStreaming: (streaming) => set({ isStreaming: streaming }),
      }),
      {
        name: "chat-storage", // localStorage key
        partialize: (state) => ({
          // Only persist certain fields
          messages: state.messages,
        }),
      },
    ),
    { name: "ChatStore" }, // DevTools name
  ),
);
```

### **Store Usage in Components**

```typescript
// ✅ Good: Subscribe to specific slices
const messages = useChatStore((state) => state.messages);
const addMessage = useChatStore((state) => state.addMessage);

// ❌ Bad: Subscribe to entire store (causes unnecessary re-renders)
const store = useChatStore();
```

---

## 🗄️ Storage (IndexedDB with Dexie)

### **Database Schema**

```typescript
import Dexie, { Table } from "dexie";

// 1. Define types
export interface Conversation {
  id: string;
  title: string;
  model: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface MemoryFact {
  id: string;
  key: string;
  value: string;
  updatedAt: number;
}

// 2. Define database class
export class LokulDatabase extends Dexie {
  conversations!: Table<Conversation, string>;
  memory!: Table<MemoryFact, string>;

  constructor() {
    super("LokulDB");

    // 3. Define schema (version 1)
    this.version(1).stores({
      conversations: "id, createdAt, updatedAt",
      memory: "id, key",
    });
  }
}

// 4. Create instance
export const db = new LokulDatabase();
```

### **Database Operations**

```typescript
// CRUD operations (in separate files)

// conversations.ts
export async function saveConversation(
  conversation: Conversation,
): Promise<void> {
  await db.conversations.put(conversation);
}

export async function getConversation(
  id: string,
): Promise<Conversation | undefined> {
  return await db.conversations.get(id);
}

export async function getAllConversations(): Promise<Conversation[]> {
  return await db.conversations.orderBy("updatedAt").reverse().toArray();
}

export async function deleteConversation(id: string): Promise<void> {
  await db.conversations.delete(id);
}
```

---

## 🤖 AI Worker (Web Worker)

### **Worker Setup**

```typescript
// inference.worker.ts
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";

let engine: MLCEngine | null = null;

// Message handler
self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  try {
    switch (type) {
      case "INIT":
        await handleInit(payload);
        break;
      case "GENERATE":
        await handleGenerate(payload);
        break;
      case "ABORT":
        await handleAbort();
        break;
      default:
        throw new Error(`Unknown message type: ${type}`);
    }
  } catch (error) {
    self.postMessage({
      type: "ERROR",
      payload: { error: (error as Error).message },
    });
  }
};

async function handleInit(payload: { model: string }) {
  // Initialize engine
  engine = await CreateMLCEngine(payload.model, {
    initProgressCallback: (progress) => {
      self.postMessage({
        type: "INIT_PROGRESS",
        payload: { progress },
      });
    },
  });

  self.postMessage({ type: "INIT_COMPLETE" });
}

async function handleGenerate(payload: {
  messages: Array<{ role: string; content: string }>;
}) {
  if (!engine) {
    throw new Error("Engine not initialized");
  }

  // Stream generation
  const stream = await engine.chat.completions.create({
    messages: payload.messages,
    stream: true,
    temperature: 0.7,
    max_tokens: 1000,
  });

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content || "";

    self.postMessage({
      type: "GENERATE_CHUNK",
      payload: { chunk: delta },
    });
  }

  self.postMessage({ type: "GENERATE_COMPLETE" });
}

async function handleAbort() {
  // Abort generation
  engine?.interruptGenerate();
}
```

### **Worker Usage (Main Thread)**

```typescript
// lib/ai/inference.ts
import InferenceWorker from "@/workers/inference.worker?worker";

class InferenceManager {
  private worker: Worker;

  constructor() {
    this.worker = new InferenceWorker();
    this.setupListeners();
  }

  private setupListeners() {
    this.worker.onmessage = (event) => {
      const { type, payload } = event.data;

      switch (type) {
        case "INIT_PROGRESS":
          this.handleInitProgress(payload);
          break;
        case "GENERATE_CHUNK":
          this.handleChunk(payload);
          break;
        // ... other cases
      }
    };
  }

  async initModel(model: string) {
    this.worker.postMessage({
      type: "INIT",
      payload: { model },
    });
  }

  async generate(messages: Message[]): Promise<void> {
    this.worker.postMessage({
      type: "GENERATE",
      payload: { messages },
    });
  }

  abort() {
    this.worker.postMessage({ type: "ABORT" });
  }
}

export const inferenceManager = new InferenceManager();
```

---

## 🎨 Styling Guidelines

### **Tailwind CSS Usage**

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

### **CSS Variables (For Theme)**

```css
/* globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light mode */
    --primary: 23 107 53; /* #FF6B35 as RGB */
    --background: 255 248 240;
    --foreground: 26 26 26;
    /* ... more variables */
  }

  .dark {
    /* Dark mode */
    --background: 15 15 15;
    --foreground: 255 255 255;
    /* ... more variables */
  }
}
```

### **Component Variants (CVA)**

```typescript
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-white hover:bg-primary/90',
        secondary: 'bg-secondary text-white hover:bg-secondary/90',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
      },
      size: {
        sm: 'h-8 px-3 text-sm',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-lg',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
```

---

## ⚠️ Error Handling

### **Try-Catch Pattern**

```typescript
// ✅ Good: Comprehensive error handling
async function sendMessage(content: string) {
  try {
    // Validation
    if (!content.trim()) {
      throw new Error("Message cannot be empty");
    }

    // Operation
    const response = await inferenceManager.generate(content);
    return response;
  } catch (error) {
    // Log error (development only)
    if (import.meta.env.DEV) {
      console.error("Failed to send message:", error);
    }

    // User-friendly error
    const message =
      error instanceof Error ? error.message : "Failed to send message";

    // Re-throw or handle
    throw new Error(message);
  }
}
```

### **Error Boundaries**

```tsx
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
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

---

## 🧪 Testing Guidelines

### **Unit Tests (Vitest)**

```typescript
import { describe, it, expect } from "vitest";
import { calculateTokens } from "./token-counter";

describe("calculateTokens", () => {
  it("should calculate tokens for simple text", () => {
    const text = "Hello world";
    const tokens = calculateTokens(text);
    expect(tokens).toBe(3); // ~0.75 words per token
  });

  it("should handle empty strings", () => {
    const tokens = calculateTokens("");
    expect(tokens).toBe(0);
  });

  it("should handle long text", () => {
    const text = "a".repeat(1000);
    const tokens = calculateTokens(text);
    expect(tokens).toBeGreaterThan(0);
  });
});
```

### **Component Tests (React Testing Library)**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
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
});
```

---

## 🚀 Performance Optimization

### **React Performance**

```tsx
import { memo, useMemo, useCallback } from "react";

// 1. Memo expensive components
export const Message = memo(function Message({ message }: MessageProps) {
  return <div>{message.content}</div>;
});

// 2. Memoize expensive calculations
function ChatInterface() {
  const sortedMessages = useMemo(() => {
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  }, [messages]);

  // 3. Memoize callbacks passed to children
  const handleDelete = useCallback(
    (id: string) => {
      deleteMessage(id);
    },
    [deleteMessage],
  );

  return <MessageList messages={sortedMessages} onDelete={handleDelete} />;
}
```

### **Virtualization (Large Lists)**

```tsx
import { Virtuoso } from "react-virtuoso";

function MessageList({ messages }: MessageListProps) {
  return (
    <Virtuoso
      data={messages}
      itemContent={(index, message) => (
        <Message key={message.id} message={message} />
      )}
      followOutput="auto"
    />
  );
}
```

### **Code Splitting**

```tsx
import { lazy, Suspense } from "react";

// Lazy load heavy components
const SettingsPanel = lazy(() => import("./components/settings/SettingsPanel"));

function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SettingsPanel />
    </Suspense>
  );
}
```

---

## 🔒 Security Best Practices

### **Input Validation**

```typescript
// Validate user input
function validateMessage(content: string): string {
  // Trim whitespace
  const trimmed = content.trim();

  // Check length
  if (trimmed.length === 0) {
    throw new Error("Message cannot be empty");
  }

  if (trimmed.length > 10000) {
    throw new Error("Message too long (max 10,000 characters)");
  }

  // Sanitize (if rendering HTML - but we use markdown)
  return trimmed;
}
```

### **XSS Prevention**

```tsx
// ✅ Good: React escapes by default
<div>{userContent}</div>;

// ⚠️ Careful: dangerouslySetInnerHTML
// Only use with sanitized markdown
import DOMPurify from "dompurify";

<div
  dangerouslySetInnerHTML={{
    __html: DOMPurify.sanitize(markdownHTML),
  }}
/>;

// ✅ Better: Use react-markdown (auto-sanitized)
import ReactMarkdown from "react-markdown";

<ReactMarkdown>{userContent}</ReactMarkdown>;
```

---

## 📝 Code Comments

### **When to Comment**

```typescript
// ✅ Good: Complex logic explanation
// Use sliding window approach to keep context under token limit
// while preserving recent conversation history
function trimContext(messages: Message[], maxTokens: number) {
  // Implementation
}

// ✅ Good: Non-obvious behavior
// IndexedDB doesn't support async/await in Safari < 15
// so we wrap in a Promise
function legacySave() {
  // Implementation
}

// ❌ Bad: Obvious code
// Set the value to true
const isActive = true;

// ❌ Bad: Outdated comment
// TODO: Fix this later (from 2 years ago)
```

### **JSDoc for Public APIs**

````typescript
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
````

---

## 🎯 Git Commit Guidelines

### **Commit Message Format**

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

### **Types**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting (no code change)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

### **Examples**

```bash
feat(chat): add streaming message support

Implement token-by-token streaming for AI responses
using async generators and Web Workers.

Closes #42

---

fix(storage): handle IndexedDB quota exceeded error

Add error handling for storage quota and show user-friendly
message when device storage is full.

Fixes #56

---

docs(readme): update installation instructions

Add Node.js version requirement and troubleshooting section.
```

---

## 🚨 Common Pitfalls to Avoid

### **1. Memory Leaks**

```typescript
// ❌ Bad: Event listener not cleaned up
useEffect(() => {
  window.addEventListener("resize", handleResize);
  // Missing cleanup!
}, []);

// ✅ Good: Cleanup in return
useEffect(() => {
  window.addEventListener("resize", handleResize);
  return () => {
    window.removeEventListener("resize", handleResize);
  };
}, []);
```

### **2. Stale Closures**

```typescript
// ❌ Bad: Stale closure in interval
const [count, setCount] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setCount(count + 1); // 'count' is stale!
  }, 1000);
  return () => clearInterval(interval);
}, []); // Empty deps = stale closure

// ✅ Good: Use functional update
useEffect(() => {
  const interval = setInterval(() => {
    setCount((prev) => prev + 1); // Always current
  }, 1000);
  return () => clearInterval(interval);
}, []);
```

### **3. Unnecessary Re-renders**

```typescript
// ❌ Bad: Creating new object/array in render
function Component() {
  return <Child options={{ foo: 'bar' }} />; // New object every render!
}

// ✅ Good: Memoize or define outside
const OPTIONS = { foo: 'bar' };

function Component() {
  return <Child options={OPTIONS} />;
}

// Or use useMemo for dynamic values
const options = useMemo(() => ({ foo: bar }), [bar]);
```

---

## 📚 Additional Resources

### **Documentation**

- [React Docs](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Guide](https://github.com/pmndrs/zustand)
- [Dexie.js Docs](https://dexie.org/)
- [WebLLM Docs](https://github.com/mlc-ai/web-llm)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### **Best Practices**

- [React Best Practices](https://react.dev/learn/thinking-in-react)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
- [Clean Code Principles](https://github.com/ryanmcdermott/clean-code-javascript)

---

## ✅ Development Checklist

Before committing code, ensure:

- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] No ESLint warnings (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Components are < 200 lines
- [ ] Functions are < 50 lines
- [ ] Proper error handling
- [ ] Comments for complex logic
- [ ] No console.logs (except in dev mode)
- [ ] Responsive design tested
- [ ] Accessibility considered (ARIA labels, keyboard nav)
- [ ] Performance optimized (memo, useMemo, useCallback where needed)

---

## 🎯 When in Doubt

1. **Keep it simple** - Simple code > clever code
2. **Make it work** - Working code > perfect code
3. **Make it right** - Then refactor for clarity
4. **Make it fast** - Only optimize bottlenecks

**Remember:** Lokul is privacy-first. Every architectural decision should preserve that principle.

---

**Happy coding! 🚀**
