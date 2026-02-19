# Phase 4: Memory System - Research

**Researched:** 2026-02-19
**Domain:** Local-first AI memory extraction, context management, IndexedDB persistence
**Confidence:** HIGH

## Summary

Phase 4 implements a three-tier memory system that extracts, stores, and injects user facts across all conversations. The system uses the already-loaded WebLLM model for periodic fact extraction, stores memories in IndexedDB via Dexie, and intelligently manages context window usage to prevent token limit crashes.

The architecture follows the established patterns in the Lokul codebase: functional error handling with `Result<T,E>`, Zustand for UI state, Dexie for persistence, and the AI SDK UI for chat orchestration. Memory extraction happens via a dedicated LLM call using a structured JSON prompt, with duplicate detection and conflict resolution handled in the storage layer.

Context window management uses a two-stage compaction strategy: first trimming conversation history (middle-out), then reducing memory injection if still over limit. The Memory Panel provides a premium UX for viewing, editing, pinning, and clearing facts, using the existing shadcn/ui Sheet component for the overlay.

**Primary recommendation:** Build on existing Dexie schema with version 2 migration, use the already-loaded model for extraction (no separate model), implement token estimation with tokenlens library, and leverage the established Result<T,E> and error handling patterns.

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**Fact Extraction Triggers:**
- Timing: Hybrid approach — periodic extraction every 5 messages PLUS end-of-session extraction on clean session closes (route change, tab visibility change)
- Method: Local LLM pass using the already-loaded model (not regex or separate model)
- Extraction prompt returns structured JSON: `[{"fact": "...", "category": "identity|preference|project", "confidence": "high"}]`
- Confidence Threshold: Only save high-confidence facts (user stated directly and unambiguously)

**Memory Data Model:**
```typescript
interface MemoryFact {
  id: string;
  fact: string;                              // Human-readable statement
  category: "identity" | "preference" | "project";
  confidence: number;                        // 0.0 - 1.0
  mentionCount: number;                      // Increments on duplicate detection
  firstSeen: number;                         // Unix timestamp
  lastSeen: number;                          // Updated on each mention
  lastSeenConversationId: string;            // Link to source conversation
  pinned: boolean;                           // Exempt from eviction (max 10 pinned)
  updatesFactId?: string;                    // For conflict tracking
}
```

**Duplicate & Conflict Handling:**
- Duplicate Detection: Same fact mentioned again → merge with confidence boost (`confidence = Math.min(1.0, existing.confidence + 0.15)`)
- Conflict Detection: Contradictory facts → replace (not merge), reset confidence to baseline

**Storage & Persistence:**
- Storage: Separate IndexedDB table via Dexie (`memory` table)
- Schema Versioning: Dexie version 2 adds memory table
- Indexing: `id, category, lastSeen, confidence, lastSeenConversationId`
- Sync Across Tabs: Refresh from storage when tab becomes active (not real-time sync)

**Memory Organization & Querying:**
- Structure: Flat list with category tags (not hierarchical)
- Relevance Scoring: Hybrid category + recency (not embeddings)
  - Primary sort: Category priority (project > preference > identity)
  - Tiebreaker: Recency (`lastSeen`)

**Eviction Strategy:**
- Hard cap: 150 facts
- Prune threshold: 120 facts (start gradual eviction before hard cap)
- Category expiry: project (60 days), preference (180 days), identity (365 days)
- Eviction Score: `(ageInDays * categoryWeight) / confidence`
- Category weights: project=0.8, preference=0.3, identity=0.5
- Pinned Exemption: Pinned facts (max 10) are never auto-evicted

**Context Injection Strategy:**
- Placement: System prompt, after persona instructions but before conversation history
- Token Budget: Min 150, Max 500, Ideal 350 tokens; Formula: 25% of remaining context space
- Priority Order: Project facts (always) > Preferences (when relevant) > Identity (only if query contains personal pronouns or location references)

**Context Compaction (80% Threshold):**
- Stage 1: Trim conversation history (middle-out, keep first exchange + last 6 messages)
- Stage 2: If still over limit, reduce memory injection (drop identity, halve preferences, keep project)

**Memory Panel UX:**
- Access: Header pill "12 memories ↗" opens right-side overlay sheet
- Layout: Cards grouped by category with color accents
- Editing: Single-click inline edit, double-click full rewrite, "Manage" mode for bulk
- Delete: Immediate with 4-second undo toast
- Clear All: Inline confirmation, visual clear immediately, IndexedDB wipe deferred 8 seconds with undo
- Pinning: Max 10 pinned, exempt from eviction

### Claude's Discretion

- Exact animation timing and easing curves for card interactions
- Specific color values for category accents (use design system)
- Exact threshold values for context compaction (tune per model)
- Text field placeholder copy and empty state messaging
- Pin icon design and hover reveal timing

### Deferred Ideas (OUT OF SCOPE)

- Vector/semantic search: Embeddings for relevance scoring — requires separate model
- Memory import/export: Cross-device memory sync — belongs in Phase 5
- Conversation-specific memory: Per-conversation facts that don't persist globally
- Memory insights: "You've mentioned X 5 times" style analytics
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| MEM-01 | System extracts and saves key user facts (name, preferences, goals) | Extraction via loaded LLM with JSON prompt; storage via Dexie `memory` table |
| MEM-02 | Core Facts memory persists indefinitely across all conversations | IndexedDB persistence with Dexie; tab sync via visibility change refresh |
| MEM-03 | Context window management prevents token limit crashes | Token estimation with tokenlens; two-stage compaction at 80% threshold |
| MEM-04 | Auto-compaction triggers at 80% of model's context limit | Context builder calculates usage; middle-out trimming + memory reduction |
| MEM-05 | User can view what facts the system remembers (Memory Panel) | Sheet component from shadcn/ui; cards with category grouping |
| MEM-06 | User can edit Core Facts directly | Inline editing with blur/Enter save; full edit mode with category selector |
| MEM-07 | User can clear all memory | Deferred deletion with undo toast; 8-second grace period |
</phase_requirements>

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Dexie | 4.3.0 | IndexedDB wrapper with TypeScript support | Already in use for conversations/settings; proven migration pattern |
| Zustand | 5.0.11 | UI state management for memory panel | Already used throughout app; minimal boilerplate |
| tokenlens | 1.3.1 | Token counting and context budgeting | Already in dependencies; designed for LLM context management |
| @ai-sdk/react | 3.0.92 | Chat state and streaming | Already integrated; memory injection via system prompt |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dexie-react-hooks | 1.1.7 | Reactive queries for memory list | For live-updating memory panel without manual refresh |
| framer-motion | 12.34.2 | Card animations and transitions | Already in dependencies; for card hover/enter/exit animations |
| sonner | 2.0.7 | Toast notifications for undo | Already in dependencies; for delete undo and clear all feedback |

### No Additional Dependencies Required
All functionality can be built with existing stack. Token counting uses tokenlens, storage uses Dexie, UI uses existing shadcn/ui components.

## Architecture Patterns

### Recommended Project Structure
```
src/
├── lib/
│   ├── memory/
│   │   ├── extraction.ts       # Fact extraction via LLM
│   │   ├── storage.ts          # Dexie CRUD operations
│   │   ├── context-builder.ts  # Context injection & compaction
│   │   ├── eviction.ts         # Eviction score calculation
│   │   └── types.ts            # Memory-specific types
│   └── storage/
│       ├── db.ts               # Schema v2 with memory table
│       └── migrations.ts       # Dexie migration logic
├── hooks/
│   ├── useMemory.ts            # Memory list & CRUD operations
│   └── useMemoryExtraction.ts  # Extraction trigger logic
├── store/
│   └── memoryStore.ts          # Zustand store for UI state
└── components/
    └── memory/
        ├── MemoryPanel.tsx     # Main sheet overlay
        ├── MemoryCard.tsx      # Individual fact card
        ├── MemoryComposer.tsx  # "+ Remember something" input
        └── MemoryEmptyState.tsx
```

### Pattern 1: Dexie Schema Migration
**What:** Versioned schema upgrades using Dexie's `version()` and `upgrade()` methods
**When to use:** Adding memory table to existing database
**Example:**
```typescript
// Source: Context7 Dexie documentation
export class LokulDatabase extends Dexie {
  memory!: Table<MemoryFact, string>;

  constructor() {
    super("LokulDB");

    // Version 1: Existing schema
    this.version(1).stores({
      settings: "id",
      conversations: "id, createdAt, updatedAt",
    });

    // Version 2: Add memory table
    this.version(2).stores({
      settings: "id",
      conversations: "id, createdAt, updatedAt",
      memory: "id, category, lastSeen, confidence, lastSeenConversationId",
    });
  }
}
```

### Pattern 2: Result<T,E> Error Handling
**What:** Functional error handling with discriminated unions
**When to use:** All async memory operations
**Example:**
```typescript
// Source: src/types/result.ts (existing pattern)
export type Result<T, E> =
  | { readonly kind: "ok"; readonly value: T }
  | { readonly kind: "err"; readonly error: E };

export async function extractFacts(
  messages: Message[]
): Promise<Result<ExtractedFact[], AppError>> {
  try {
    const response = await engine.chat.completions.create({
      messages: extractionPrompt(messages),
      response_format: { type: "json_object" }
    });
    return ok(parseFacts(response));
  } catch (error) {
    return err(memoryExtractionError("Failed to extract facts", error));
  }
}
```

### Pattern 3: Zustand Store with Persistence
**What:** UI state management with optional localStorage persistence for non-sensitive data
**When to use:** Memory panel open/closed state, selected category filter
**Example:**
```typescript
// Source: Context7 Zustand documentation
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MemoryUIState {
  isPanelOpen: boolean;
  selectedCategory: MemoryFact["category"] | "all";
  isManageMode: boolean;
  togglePanel: () => void;
}

export const useMemoryStore = create<MemoryUIState>()(
  persist(
    (set) => ({
      isPanelOpen: false,
      selectedCategory: "all",
      isManageMode: false,
      togglePanel: () => set((s) => ({ isPanelOpen: !s.isPanelOpen })),
    }),
    { name: "memory-ui", partialize: (s) => ({ selectedCategory: s.selectedCategory }) }
  )
);
```

### Pattern 4: Extraction Prompt Engineering
**What:** Structured JSON output via system prompt
**When to use:** Fact extraction from conversation
**Example:**
```typescript
// Source: Phase 4 CONTEXT.md
function createExtractionPrompt(messages: Message[]): Message[] {
  return [
    {
      role: "system",
      content: `Extract memorable facts from this conversation.
Return ONLY a JSON object with format: {"facts": [{"fact": "...", "category": "identity|preference|project", "confidence": 0.0-1.0, "updates_previous": false}]}
Rules:
- Only include high-confidence facts stated directly by the user
- "identity": personal info (name, location, job)
- "preference": likes/dislikes, communication style
- "project": current work, goals, tasks
- Set "updates_previous" to true if this contradicts an earlier fact`
    },
    ...messages.slice(-10) // Last 10 messages for context
  ];
}
```

### Anti-Patterns to Avoid
- **Don't use embeddings for relevance:** User explicitly deferred vector/semantic search
- **Don't extract on every message:** Use periodic (every 5) + end-of-session triggers
- **Don't store confidence as strings:** Use 0.0-1.0 numbers for eviction calculations
- **Don't auto-evict without checking pinned:** Pinned facts must be exempt from eviction

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Token counting | Custom tokenizer | tokenlens library | Already in dependencies; handles model-specific context windows |
| IndexedDB migrations | Custom migration system | Dexie version upgrades | Battle-tested; handles schema changes and data migration |
| Reactive storage queries | Manual polling | dexie-react-hooks useLiveQuery | Automatic re-renders on database changes |
| Toast notifications | Custom toast system | sonner library | Already in dependencies; handles stacking, timeouts, positioning |
| Sheet/overlay UI | Custom modal | shadcn/ui Sheet component | Already in codebase; accessible, animated, mobile-friendly |
| Card animations | CSS transitions | framer-motion | Already in dependencies; handles enter/exit, layout shifts |

**Key insight:** The existing stack (Dexie, Zustand, tokenlens, shadcn/ui, sonner, framer-motion) covers all memory system needs without custom solutions.

## Common Pitfalls

### Pitfall 1: Extraction Blocking UI
**What goes wrong:** Running LLM extraction on main thread freezes the UI
**Why it happens:** InferenceManager runs in Web Worker, but extraction trigger may be synchronous
**How to avoid:** Use `setTimeout` or `requestIdleCallback` to defer extraction; don't await extraction before continuing
**Warning signs:** UI stutters after every 5th message; input field becomes unresponsive

### Pitfall 2: Memory Table Migration Failure
**What goes wrong:** Existing users get errors after schema upgrade
**Why it happens:** Dexie migration fails if existing data conflicts with new indexes
**How to avoid:** Test migration from v1 to v2 with production data; use `.upgrade()` for data transformation
**Warning signs:** "Upgrade failed" errors in console; blank screen on app load

### Pitfall 3: Context Injection Overflow
**What goes wrong:** Injected memory pushes context over token limit
**Why it happens:** Not accounting for memory tokens in context budget calculation
**How to avoid:** Calculate memory tokens before injection; respect 25% budget cap; implement Stage 2 reduction
**Warning signs:** Model errors about context length; truncated responses

### Pitfall 4: Duplicate Detection False Positives
**What goes wrong:** Different facts incorrectly merged as duplicates
**Why it happens:** Simple string matching catches similar but distinct facts
**How to avoid:** Use LLM extraction to flag `updates_previous`; require high confidence for merging
**Warning signs:** Facts disappear or change unexpectedly; user mentions contradictions

### Pitfall 5: Tab Sync Race Conditions
**What goes wrong:** Memory edits in one tab overwritten by another tab
**Why it happens:** Both tabs read, modify, write without coordination
**How to avoid:** Use Dexie's atomic operations; refresh on visibility change; don't cache aggressively
**Warning signs:** Edits don't persist; memory panel shows stale data after tab switch

## Code Examples

### Verified patterns from official sources:

### Dexie Migration with Data Transform
```typescript
// Source: Context7 Dexie documentation
export class LokulDatabase extends Dexie {
  memory!: Table<MemoryFact, string>;

  constructor() {
    super("LokulDB");

    this.version(1).stores({
      settings: "id",
      conversations: "id, createdAt, updatedAt",
    });

    this.version(2)
      .stores({
        settings: "id",
        conversations: "id, createdAt, updatedAt",
        memory: "id, category, lastSeen, confidence, lastSeenConversationId",
      })
      .upgrade(async (tx) => {
        // Any data transformations for v1 -> v2
        console.log("[DB] Upgrading to schema v2");
      });
  }
}
```

### Token Budget Calculation with tokenlens
```typescript
// Source: tokenlens README
import { tokensRemaining, percentOfContextUsed } from "tokenlens";

function calculateMemoryBudget(
  modelId: string,
  conversationTokens: number,
  reserveOutput: number = 500
): number {
  const meta = modelMeta(modelId);
  const contextWindow = meta.contextWindow;

  // Available after conversation and output reserve
  const available = contextWindow - conversationTokens - reserveOutput;

  // Memory gets 25% of remaining, min 150, max 500
  const idealBudget = Math.floor(available * 0.25);
  return Math.max(150, Math.min(500, idealBudget));
}
```

### Context Builder with Compaction
```typescript
// Source: Phase 4 CONTEXT.md decisions
function buildContextWithMemory(
  messages: Message[],
  memories: MemoryFact[],
  modelId: string
): { messages: Message[]; memoryTokens: number } {
  const conversationTokens = estimateTokens(messages);
  const memoryBudget = calculateMemoryBudget(modelId, conversationTokens);

  let selectedMemories = selectMemoriesForInjection(memories, memoryBudget);
  let memoryTokens = estimateMemoryTokens(selectedMemories);

  // Stage 2 compaction if over budget
  if (memoryTokens > memoryBudget) {
    selectedMemories = compactMemories(selectedMemories);
    memoryTokens = estimateMemoryTokens(selectedMemories);
  }

  const systemPrompt = buildSystemPrompt(selectedMemories);

  return {
    messages: [systemPrompt, ...messages],
    memoryTokens,
  };
}
```

### Extraction with Result<T,E>
```typescript
// Source: Existing error patterns in src/lib/utils/errors.ts
export async function extractFacts(
  engine: MLCEngineInterface,
  messages: Message[]
): Promise<Result<ExtractedFact[], AppError>> {
  if (messages.length < 2) {
    return ok([]); // Not enough context
  }

  try {
    const response = await engine.chat.completions.create({
      messages: createExtractionPrompt(messages),
      temperature: 0.1, // Low temp for consistent extraction
      max_tokens: 500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      return ok([]);
    }

    const parsed = JSON.parse(content);
    const facts = (parsed.facts || [])
      .filter((f: ExtractedFact) => f.confidence >= 0.75)
      .map(normalizeFact);

    return ok(facts);
  } catch (error) {
    return err(memoryExtractionError("Failed to extract facts", error));
  }
}
```

### Memory Card with Inline Edit
```typescript
// Source: shadcn/ui patterns with framer-motion
function MemoryCard({ fact, onUpdate }: MemoryCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(fact.fact);

  const handleSave = () => {
    if (editValue.trim() && editValue !== fact.fact) {
      onUpdate(fact.id, { fact: editValue.trim() });
    }
    setIsEditing(false);
  };

  return (
    <motion.div
      layout
      className={cn(
        "rounded-xl border p-4 transition-colors",
        categoryColors[fact.category],
        fact.pinned && "border-l-2 border-l-orange-500"
      )}
      onClick={() => !isEditing && setIsEditing(true)}
    >
      {isEditing ? (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSave()}
          autoFocus
        />
      ) : (
        <p>{fact.fact}</p>
      )}
    </motion.div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Regex-based extraction | LLM-based extraction | Phase 4 decision | Higher accuracy, handles nuance, structured output |
| Embeddings for relevance | Category + recency scoring | Phase 4 decision | No separate model needed, faster, privacy-preserving |
| Hierarchical memory | Flat list with tags | Phase 4 decision | Simpler queries, easier eviction, cleaner UX |
| Real-time sync | Visibility change refresh | Phase 4 decision | Reduced complexity, acceptable consistency |
| Per-conversation memory | Global facts only | Deferred | Simpler v1, per-conversation in future phase |

**Deprecated/outdated:**
- Custom tokenizers: Use tokenlens for model-aware counting
- Embedding-based relevance: Deferred to post-WebLLM architecture
- Server-side memory: Violates privacy-first architecture

## Open Questions

1. **Token estimation accuracy for WebLLM models**
   - What we know: tokenlens provides model metadata including context windows
   - What's unclear: Exact tokenizer match for WebLLM's quantized models
   - Recommendation: Use tokenlens estimates with 10% safety margin; validate during testing

2. **Extraction performance on low-end devices**
   - What we know: Extraction uses loaded model, runs in Web Worker
   - What's unclear: Impact on Quick Mode (Phi-2) extraction quality
   - Recommendation: Test extraction quality per model tier; may need model-specific prompts

3. **Context compaction threshold tuning**
   - What we know: 80% threshold is starting point
   - What's unclear: Optimal threshold varies by model context window size
   - Recommendation: Make threshold configurable per model; start with 80%

## Sources

### Primary (HIGH confidence)
- Context7 `/websites/dexie` - Schema migrations, versioning, upgrade patterns
- Context7 `/pmndrs/zustand` - State management, persistence middleware
- tokenlens README (node_modules) - Token counting, context budgeting APIs
- src/lib/storage/db.ts - Existing Dexie schema patterns
- src/lib/utils/errors.ts - Error handling patterns

### Secondary (MEDIUM confidence)
- Phase 4 CONTEXT.md - User decisions and constraints
- src/types/result.ts - Result<T,E> pattern implementation
- src/hooks/useConversations.ts - Dexie-react-hooks usage patterns

### Tertiary (LOW confidence)
- WebLLM documentation (training data) - May be outdated; verify with actual API

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use
- Architecture: HIGH - Follows established codebase patterns
- Pitfalls: MEDIUM - Based on common Dexie/IndexedDB issues, needs validation

**Research date:** 2026-02-19
**Valid until:** 2026-03-19 (30 days for stable stack)
