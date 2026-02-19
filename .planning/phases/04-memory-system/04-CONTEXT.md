# Phase 4: Memory System - Context

**Gathered:** 2026-02-19
**Status:** Ready for planning

---

<domain>
## Phase Boundary

Phase 4 delivers a three-tier memory system that extracts, stores, and injects key facts about the user across all conversations. The AI becomes contextually aware with "effectively infinite memory" through intelligent fact extraction, automatic context management, and a premium Memory Panel UX for user control.

**Core Value:** Privacy-preserving memory that accumulates locally, enhancing conversation quality without ever leaving the device.

**Success Criteria from ROADMAP:**
1. System extracts and saves key user facts (name, preferences, goals) from conversations
2. Core Facts persist indefinitely across all conversations
3. Context window never crashes from token limit (auto-management)
4. Auto-compaction triggers at 80% of model's context limit
5. User can view all remembered facts in Memory Panel
6. User can edit Core Facts directly
7. User can clear all memory with confirmation

</domain>

---

<decisions>
## Implementation Decisions

### Fact Extraction Triggers

- **Timing:** Hybrid approach — periodic extraction every 5 messages PLUS end-of-session extraction on clean session closes (route change, tab visibility change)
- **Method:** Local LLM pass using the already-loaded model (not regex or separate model)
  - Extraction prompt is short and fast, returns structured JSON
  - Output format: `[{"fact": "...", "category": "identity|preference|project", "confidence": "high"}]`
- **Confidence Threshold:** Only save high-confidence facts
  - **High confidence:** User stated directly and unambiguously ("I'm a React developer")
  - **Low confidence:** Inferred, hedged, or mentioned once in passing ("I think I might try Svelte")
- **Sensitivity:** Extract everything (no automatic exclusion), user manages via Memory Panel

### Memory Data Model

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

### Duplicate & Conflict Handling

- **Duplicate Detection:** Same fact mentioned again → merge with confidence boost
  - `confidence = Math.min(1.0, existing.confidence + 0.15)`
  - `mentionCount += 1`
  - Update `lastSeen` timestamp
- **Conflict Detection:** Contradictory facts → replace (not merge)
  - Example: "User is based in Copenhagen" → "User is based in London"
  - Reset confidence to baseline on replacement
  - LLM extraction prompt should flag `updates_previous: true` for contradictions

### Storage & Persistence

- **Storage:** Separate IndexedDB table via Dexie (`memory` table)
- **Schema Versioning:** Dexie version 2 adds memory table
- **Indexing:** `id, category, lastSeen, confidence, lastSeenConversationId`
- **Migrations:** Versioned with Dexie's append-only migration pattern
- **Sync Across Tabs:** Refresh from storage when tab becomes active (not real-time sync)

### Memory Organization & Querying

- **Structure:** Flat list with category tags (not hierarchical)
- **Secondary Index:** Built at load time for fast category filters
- **Relevance Scoring:** Hybrid category + recency (not embeddings)
  - Primary sort: Category priority (project > preference > identity)
  - Tiebreaker: Recency (`lastSeen`)
  - Bonus: Keyword overlap between current user message and fact text

### Eviction Strategy

- **Limits:**
  - Hard cap: 150 facts
  - Prune threshold: 120 facts (start gradual eviction before hard cap)
  - Category expiry: project (60 days), preference (180 days), identity (365 days)
- **Eviction Score:** `(ageInDays * categoryWeight) / confidence`
  - Category weights: project=0.8, preference=0.3, identity=0.5
  - Higher score = evict first
- **Pinned Exemption:** Pinned facts (max 10) are never auto-evicted

### Context Injection Strategy

- **Placement:** System prompt, after persona instructions but before conversation history
- **Format:** Structured sections with headers

```
## What you know about this user

Current work:
- Building a local-first AI chat app with WebLLM
- Currently implementing a memory extraction system

Preferences:
- Prefers direct answers without preamble
- Uses TypeScript, minimal abstraction

About user:
- Solo developer based in Copenhagen
```

- **Token Budget:** Variable based on conversation length
  - Min: 150 tokens, Max: 500 tokens, Ideal: 350 tokens
  - Formula: 25% of remaining context space after reserving for response
- **Priority Order:** Project facts (always) > Preferences (when relevant) > Identity (only if query contains personal pronouns or location references)
- **Omit Empty:** Skip memory section entirely if sparse, rather than rendering empty headers
- **Attribution:** No "why" context — just the facts

### Context Compaction (80% Threshold)

Two-stage compaction when context window fills:

**Stage 1:** Trim conversation history (middle-out, keep first exchange + last 6 messages)
**Stage 2:** If still over limit, reduce memory injection:
- Drop identity facts entirely
- Halve preferences (keep only high-confidence)
- Keep project facts intact

Protect pinned facts from Stage 2 reduction, but they still respect token budget.

### Memory Panel UX

**Access:**
- Header pill: "12 memories ↗" in conversation header
- Click opens right-side overlay sheet (conversation stays visible, dimmed)
- Click outside dismisses
- Keyboard shortcut: Cmd/Ctrl+Shift+M (secondary)

**Layout:**
- Cards not lists — each fact is a card with category color accent
- Grouped by category with smooth section separators
- Confidence indicator: thin fill bar (not number)

**Editing:**
- **Tier 1 (Quick fix):** Single-click to inline edit, Enter to save, Escape to cancel
- **Tier 2 (Full rewrite):** Double-click expands card to textarea with category selector
- **Tier 3 (Bulk):** "Manage" mode enables selection checkboxes with bottom action bar
- Delete: Immediate with 4-second undo toast (no confirmation dialogs)
- Save confirmation: Brief green accent pulse on left border

**Manual Adding:**
Three natural entry points:
1. **Composer at bottom:** "+ Remember something..." text field, auto-classifies via LLM
2. **Highlight to remember:** Select text in AI response → "🧠 Remember" floating action
3. **Conversational seeding:** First conversation welcomes user to share anything

Manual facts get lower initial confidence (0.6 vs 0.75 for extracted) but boost faster on repetition.

**Clear All Memory:**
1. Trigger at bottom of panel (muted color, not red)
2. Inline confirmation shows exact count: "This will remove all 12 facts"
3. Visual clear immediately, but IndexedDB wipe deferred 8 seconds
4. Persistent bottom bar with progress bar: "Memory cleared [Undo] 8s ████████░░"
5. Post-clear: Empty state with gentle illustration + "No memories yet. I'll learn as we talk."

**Pinning:**
- Pin icon appears on card hover only
- Pinned cards get subtle 1px left-border accent (brand orange)
- Soft cap: 10 pinned facts maximum
- Pinned facts exempt from eviction but still respect token budget

**Search/Filter:**
- Category tabs/filters only (no text search)
- No distinction between auto-extracted vs manual facts (all equal)

</decisions>

---

<specifics>
## Specific Ideas

**Extraction Prompt Template:**
```
Extract memorable facts from this conversation segment.
Return only a JSON array. Only include high-confidence facts stated directly by the user.

Return format: [{"fact": "...", "category": "identity|preference|project", "confidence": "high", "updates_previous": false}]

Conversation:
[last N messages]
```

**Memory Index Pattern:**
```typescript
type MemoryIndex = Record<MemoryFact["category"], MemoryFact[]>;
function buildIndex(facts: MemoryFact[]): MemoryIndex {
  // Rebuild after every extraction pass
}
```

**Category Color Accents:**
- Project: Blue/cyan accent
- Preference: Purple accent
- Identity: Green accent

**Empty State Design:**
```
        🧠
   No memories yet.
   I'll learn as we talk.
```

</specifics>

---

<deferred>
## Deferred Ideas

- **Vector/semantic search:** Embeddings for relevance scoring — requires separate model, deferred to post-WebLLM architecture
- **Memory import/export:** Cross-device memory sync — belongs in Phase 5 (Polish & PWA) or v2
- **Conversation-specific memory:** Per-conversation facts that don't persist globally — new capability, separate phase
- **Memory insights:** "You've mentioned X 5 times" style analytics — nice-to-have, not core

</deferred>

---

<claude_discretion>
## Claude's Discretion

The following areas have flexibility during implementation:

- Exact animation timing and easing curves for card interactions
- Specific color values for category accents (use design system)
- Exact threshold values for context compaction (tune per model)
- Text field placeholder copy and empty state messaging
- Pin icon design and hover reveal timing

All other decisions are locked based on user input.

</claude_discretion>

---

*Phase: 04-memory-system*
*Context gathered: 2026-02-19*
