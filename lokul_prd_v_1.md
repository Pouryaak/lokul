# LOKUL — Product Requirements Document (PRD)

**Version:** 1.0 \
**Date:** February 17, 2026 \
**Status:** Pre-Development \
**Product:** Lokul — _Your AI. Locally._

---

## 📋 Executive Summary

**What we’re building:** \
A ChatGPT-quality AI chat interface that runs **100% in the browser** using **WebGPU**. **Zero servers**, complete privacy, works offline.

**Why it matters:** \
Every AI chat tool sends your data to the cloud. We don’t. Lokul is browser-based, privacy-first AI with a consumer-grade UX.

**Success metric:** \
**10,000+ GitHub stars** in the first 6 months.

---

## 🎯 Product Vision

### The Problem

- ChatGPT, Claude, Gemini require cloud servers
- Conversations can be logged and used for training
- $20/month subscriptions add up
- Doesn’t work offline
- Privacy-conscious users have no good options

### Our Solution

- AI models run in your browser via WebGPU
- All data stays on your device
- Free forever (no API costs)
- Works offline after first download
- Open source = verifiable privacy

### Not Building (v1)

- ❌ Desktop app (browser-only)
- ❌ Mobile app (web only for now)
- ❌ Cloud sync (defeats the purpose)
- ❌ Custom GPTs/agents (later)
- ❌ Multi-modal (images/voice — later)

---

## 👥 Target Users

### Primary Audience (v1)

1. **Privacy-Conscious Professionals**
   - Developers, writers, researchers
   - Don’t trust cloud AI with sensitive work
   - Will pay $0–$50 one-time for good tools
   - Early adopters, tech-savvy

2. **Offline Workers**
   - Students in libraries, travelers, remote workers
   - Need AI but have unreliable internet
   - Value independence over cutting-edge features

3. **Open Source Enthusiasts**
   - Active on GitHub, HN, Reddit
   - Will star and share if execution is good
   - Want to verify code themselves

### Secondary Audience (v2+)

- Enterprise (self-hosted)
- Educational institutions
- Countries where ChatGPT is blocked

---

## ✨ Core Features (v1 MVP)

### Feature 1: Chat Interface

**What:** \
Clean, ChatGPT-style chat interface with streaming responses.

**User Story:** \
“As a user, I want to chat with AI just like ChatGPT, so I can get immediate value without learning a new UI.”

**Requirements:**

- Single conversation view (no multi-chat in v1)
- Message input box with auto-resize
- Streaming text responses (word-by-word)
- Copy message button
- Regenerate response button
- Clear conversation button
- Markdown rendering (code blocks, lists, formatting)
- Syntax highlighting for code

**Technical Notes:**

- React for UI
- Stream tokens from WebLLM (via Worker)
- Render markdown with `react-markdown` + `remark-gfm`
- Syntax highlighting with Shiki (preferred) or rehype-highlight (fallback)

**Success Criteria:**

- Feels as fast as ChatGPT
- No UI lag during streaming
- Code blocks render properly

---

### Feature 2: Model Management

**What:** \
Simple model switcher with 3 tiers: **Quick**, **Smart**, **Genius**.

**User Story:** \
“As a user, I want to choose between speed and intelligence, without dealing with technical model names.”

**Requirements:**

**Quick Mode**

- Model: Phi-2 2.7B (2-bit quantized, ~80MB)
- Auto-loads on first visit
- Load time: 3–5 seconds
- Label: “⚡ Quick — Fast responses”

**Smart Mode**

- Model: Llama 3.2 3B (4-bit quantized, ~2.8GB)
- Optional download
- Load time: first download 5–10 min, cached = instant
- Label: “🧠 Smart — Better reasoning”
- Recommended default

**Genius Mode**

- Model: Mistral 7B (4-bit quantized, ~6.4GB)
- Optional download
- Load time: first download 10–15 min, cached = instant
- Label: “🚀 Genius — Best quality”
- For power users

**UI Elements**

- Dropdown in header to switch models
- Show current mode always visible
- Download progress with percentage + time estimate
- “Try before you download” comparison view
- Clear storage requirements for each

**Technical Notes:**

- Use WebLLM model registry
- Cache model assets in Cache Storage and/or IndexedDB
- Background download (non-blocking)
- Service Worker supports offline usage after download

**Success Criteria:**

- Model switch is seamless (no page reload)
- Download progress is accurate
- Users understand tradeoffs

---

### Feature 3: Performance Monitoring

**What:** \
Real-time system stats visible to the user.

**User Story:** \
“As a user, I want to know how my device is handling the AI, so I can switch models if needed.”

**Requirements:**

**Always Visible (Collapsible Panel)**

- Memory usage (MB / total available)
- GPU status (Active / Inactive / Not supported)
- Last response time (ms)
- Tokens per second
- Current mode/model

**Visual Indicators**

- 🟢 Green: Optimal (< 50% memory, GPU active)
- 🟡 Yellow: Good (50–75% memory)
- 🔴 Red: Struggling (> 75% memory)

**Proactive Warnings**

- If memory > 75%: suggest switching to Quick
- If no GPU: show “Running on CPU (slower)”
- If browser not supported: show clear error

**Technical Notes:**

- Performance API for timings
- WebGPU detection for capability status
- Measure tokens/sec from streamed output timestamps
- Store peak usage per session

**Success Criteria:**

- Users understand why it’s slow
- Clear warnings prevent crashes
- Performance data is accurate

---

### Feature 4: Local Storage & Persistence

**What:** \
All conversations saved locally, accessible offline.

**User Story:** \
“As a user, I want my conversations saved automatically, without them ever touching a server.”

**Requirements:**

- Auto-save every message
- Conversation history sidebar (simple list)
- Search conversations (later v1.5)
- Export conversation as:
  - Markdown (.md)
  - Text (.txt)
  - JSON (backup)
- Import conversation from JSON
- Clear all data button

**Data Structure (example)**

```js
{
  conversations: [
    {
      id: "uuid",
      title: "First 50 chars of first message",
      created_at: "timestamp",
      updated_at: "timestamp",
      model: "llama-3.2-3b",
      messages: [
        { role: "user", content: "..." },
        { role: "assistant", content: "..." }
      ]
    }
  ],
  settings: {
    default_model: "smart",
    theme: "dark",
    performance_panel_visible: true
  }
}
```

**Storage**

- IndexedDB (conversations, memory)
- localStorage (settings, small data)
- Service Worker cache (models, assets)

**Technical Notes**

- Dexie.js for IndexedDB wrapper
- Auto-generate conversation titles
- Optional compression for long chats (lz-string)

**Success Criteria**

- Data persists across sessions
- Export/import works perfectly
- No data loss

---

### Feature 5: Offline Mode

**What:** \
Full functionality after first load, even without internet.

**User Story:** \
“As a user, I want to use Lokul on a plane or in places with bad internet.”

**Requirements:**

- Service Worker caches everything
- “Offline Ready” badge when cached
- Works without internet after first visit
- Clear indicator: “✅ Works Offline” or “⚠️ Online Required”

**What’s Cached:**

- HTML/CSS/JS bundles
- Downloaded models
- UI assets, fonts, icons
- Conversations (IndexedDB)

**What Requires Internet:**

- First-time model downloads
- App updates
- Nothing else

**Technical Notes:**

- `vite-plugin-pwa` (Workbox under the hood)
- Cache-first for assets
- Stale-while-revalidate for updates
- Model files downloaded via an explicit “Model Download Manager” to avoid silent multi-GB caching

**Success Criteria:**

- Can chat with airplane mode on
- Badge accurately shows offline status
- No confusion about what works offline

---

### Feature 6: Conversation Memory & Context Management

**What:** \
An intelligent memory system that retains user context across long conversations without hitting token limits.

**User Story:** \
“As a user, I want the AI to remember what I told it earlier in the conversation, even after 50+ messages, so I don’t have to repeat myself.”

**The Problem**

- Local models have limited context windows (2K–8K tokens)
- Users expect “infinite memory”
- Naive approaches forget or crash

**Our Solution (OpenClaw-inspired): Three-tier memory + auto-compaction**

**Memory Tier 1: Core Facts (Persistent)**

- Key info about the user (name, goals, preferences, project context)
- Stored in IndexedDB, never deleted
- Always loaded (lightweight, ~200 tokens)

**Memory Tier 2: Daily Context**

- Running log of today’s session
- Reset daily/per-session
- Medium priority (~300 tokens)

**Memory Tier 3: Recent Messages**

- Last 20–40 message pairs (depends on model)
- Full fidelity conversation
- Oldest messages compressed when limit approached

**Requirements**

**Fact Extraction (v1)**

- Regex/pattern-matching for common facts:
  - Name
  - Learning goals
  - Preferences
  - Project context
- Save extracted facts immediately to Core Memory
- No extra AI calls required in v1

**Context Building**

```
[System Prompt] (~100 tokens)
[Core Facts] (~200 tokens)
[Daily Context] (~300 tokens)
[Recent Messages] (remaining tokens)
[User’s new message]
```

**Auto-Compaction**

- Triggers at ~80% of model limit
- Pre-compaction flush:
  1. Ask model to extract key facts
  2. Save to Core Memory
  3. Silent turn (user doesn’t see)
- Summarize older messages
- Notify: “Conversation compressed”

**User-Facing Memory Panel**

- View what Lokul remembers
- Edit facts
- Clear memory

**Token Limit Handling**
| Mode | Context Window | Reserved for System/Memory | Approx. Messages |
|------|----------------|----------------------------|-----------------|
| Quick (Phi-2) | 2,048 | 600 | ~10 |
| Smart (Llama 3.2) | 8,192 | 600 | ~40 |
| Genius (Mistral) | 8,192 | 600 | ~40 |

**Technical Notes**

- IndexedDB schema

```js
{
  corememory: { userName, goals: [], preferences: [], projects: [], customFacts: [] },
  dailylogs: { date, entries: [] },
  conversations: { id, messages: [], summary, tokenCount }
}
```

- Token estimation: ~0.75 words per token (approx)
- Store token counts per message to avoid recalculation

**Success Criteria**

- Remembers key user facts after 50+ messages
- No context limit crashes
- Auto-compaction completes in < 3 seconds
- Memory panel loads in < 100ms
- Export includes memory snapshot

---

### Feature 7: First-Run Experience (CRITICAL)

**What:** \
Smooth onboarding that gets users to their first message in < 60 seconds.

**User Story:** \
“As a first-time user, I want to start chatting immediately, without friction.”

**Flow**

**Step 1: Landing (0s)**

```
┌─────────────────────────────────┐
│   🔥 Lokul                      │
│   Your AI. Locally.             │
│                                 │
│   [Start Chatting]              │
│                                 │
│   No account • Private • Free   │
└─────────────────────────────────┘
```

**Step 2: Setup (5–30s)**

```
┌─────────────────────────────────┐
│   Setting up Lokul...           │
│                                 │
│   ✓ Checking device             │
│   ✓ GPU detected (WebGPU)       │
│   ⟳ Loading Quick Mode (80MB)   │
│                                 │
│   ████████░░░░ 45%             │
│                                 │
│   First time: ~30 seconds       │
│   Next time: Instant ⚡         │
└─────────────────────────────────┘
```

**Step 3: Ready (30s)**

```
┌─────────────────────────────────┐
│   ✓ Lokul is ready!             │
│                                 │
│   Running in Quick Mode         │
│   Upgrade to Smart Mode for     │
│   better answers (2.8GB)        │
│                                 │
│   [Start Chatting]              │
└─────────────────────────────────┘
```

**Step 4: Chat**

- Immediately usable
- Tooltip: “💡 Upgrade to Smart Mode for better answers”
- Dismissible banner: “Download Smart Mode (2.8GB) for better quality”

**Technical Notes**

- Preload Quick Mode in background
- Show honest setup steps (build trust)
- Set realistic time expectations

**Success Criteria**

- < 10% bounce during loading
- Users successfully send first message
- 30%+ download Smart Mode

---

## 🎨 Design Specifications

### Color System

**Light Mode**

```css
--primary: #ff6b35;
--secondary: #ffb84d;
--accent: #ff8c42;
--background: #fff8f0;
--surface: #ffffff;
--text-primary: #1a1a1a;
--text-secondary: #666666;
--border: #e5e5e5;
```

**Dark Mode**

```css
--primary: #ff6b35;
--secondary: #ffb84d;
--accent: #ff8c42;
--background: #0f0f0f;
--surface: #1a1a1a;
--text-primary: #ffffff;
--text-secondary: #a0a0a0;
--border: #2a2a2a;
```

### Typography

```css
--font-main: "Inter", -apple-system, system-ui, sans-serif;
--font-code: "JetBrains Mono", "Courier New", monospace;

--text-xs: 12px;
--text-sm: 14px;
--text-base: 16px;
--text-lg: 18px;
--text-xl: 24px;
--text-2xl: 32px;
--text-3xl: 48px;
```

### Spacing

```css
--space-1: 4px;
--space-2: 8px;
--space-3: 12px;
--space-4: 16px;
--space-6: 24px;
--space-8: 32px;
--space-12: 48px;
```

### Border Radius

```css
--radius-sm: 8px;
--radius-md: 12px;
--radius-lg: 16px;
--radius-full: 999px;
```

### Shadows

```css
--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px rgba(0, 0, 0, 0.07);
--shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
--shadow-glow: 0 0 20px rgba(255, 107, 53, 0.3);
```

---

## ⚙️ Technical Architecture

### Tech Stack

**Frontend**

- Vite
- React 18
- TypeScript
- react-router-dom

**UI System**

- Tailwind CSS
- shadcn/ui (Radix UI)
- lucide-react
- class-variance-authority (cva)
- clsx + tailwind-merge
- sonner (toasts)
- framer-motion (subtle animations)
- cmdk (optional: command palette)
- react-virtuoso (virtualized message list)

**Chat Rendering**

- react-markdown
- remark-gfm
- Shiki (preferred) or rehype-highlight (fallback)
- react-textarea-autosize

**State Management**

- Zustand
- zod (schema validation/migrations)
- immer (optional)

**Storage**

- IndexedDB
- Dexie.js
- localStorage
- lz-string (optional compression)

**Offline/PWA**

- vite-plugin-pwa (Workbox)

**AI Inference**

- WebLLM (@mlc-ai/web-llm)
- WebGPU
- Web Workers
- Comlink

**Performance Metrics**

- web-vitals
- Performance API (timings)

**Error Tracking (optional)**

- Sentry (@sentry/react)

**Deployment**

- Vercel
- Optional later: separate CDN/bucket for model assets

---

### Development Tooling

**Code Quality**

- ESLint 9 (flat config) with TypeScript, React Hooks, and React Refresh rules
- Prettier 3 with Tailwind CSS plugin for class sorting
- VS Code workspace settings for auto-format on save
- VS Code extensions recommendations for consistent IDE setup

**VS Code Workspace Setup**

Shared settings in `.vscode/settings.json`:

- Auto-format on save with Prettier
- ESLint auto-fix on save
- Import organization on save
- 100-character ruler
- LF line endings

**NPM Scripts**

```bash
npm run lint          # Check ESLint rules
npm run lint:fix      # Fix ESLint issues
npm run format        # Format all files with Prettier
npm run format:check  # Check formatting without changes
npm run type-check    # TypeScript type checking
```

---

### File Structure (proposed)

```txt
lokul/
├── public/
│   ├── lokul-logo.png
│   └── manifest.json
├── src/
│   ├── components/
│   │   ├── Chat/
│   │   ├── ModelSelector/
│   │   ├── PerformancePanel/
│   │   ├── Sidebar/
│   │   └── Loading/
│   ├── lib/
│   │   ├── ai/            # WebLLM + worker wrappers
│   │   ├── storage/       # Dexie schema + migrations
│   │   ├── pwa/           # offline helpers
│   │   └── perf/          # performance utilities
│   ├── workers/
│   │   └── inference.worker.ts
│   ├── hooks/
│   ├── store/
│   ├── styles/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── README.md
```

---

## 📊 Success Metrics

### Primary KPIs (v1)

**GitHub Stars**

- Week 1: 500
- Month 1: 2,000
- Month 3: 5,000
- Month 6: 10,000

**User Engagement**

- 70%+ first message completion rate
- 40%+ download Smart Mode
- 50%+ return within 7 days
- < 5% crash rate

**Memory Performance**

- Memory persistence: 100% (no data loss)
- Compaction success rate: > 99%
- Fact extraction accuracy: > 80% (v1), > 95% (v2)

**Technical Performance**

- < 30 seconds first load (Quick Mode)
- < 3 seconds average response time (target)
- < 100ms UI lag during streaming
- 95%+ WebGPU detection rate (Chrome/Edge)

---

## 🚀 Launch Plan

### Pre-Launch (Week -1)

- Name decided (Lokul)
- Design system defined
- Domain purchased (trylokul.com)
- GitHub repo created
- Logo designed (Spark mascot)
- README drafted
- Demo GIF recorded

### Launch Week (Week 0)

**Monday**

- Deploy v1 to trylokul.com
- Open source on GitHub
- Finalize README with screenshots

**Tuesday 9 AM PT**

- Post on Hacker News: “Lokul — ChatGPT that runs 100% in your browser”
- Monitor comments, respond quickly

**Wednesday**

- Post on Reddit (r/selfhosted, r/LocalLLaMA, r/privacy)
- Twitter thread showing offline mode

**Thursday**

- Launch on Product Hunt
- Email tech journalists

**Friday**

- Post on Dev.to
- Share in Discord communities

### Post-Launch (Week 1–4)

- Daily: respond to GitHub issues
- Weekly: ship bug fixes
- Biweekly: add requested features
- Monitor: stars, feedback

---

## 🛣️ Roadmap

### v1.0 (MVP) — Week 0–3

- ✅ Chat interface
- ✅ Model switching (3 tiers)
- ✅ Performance monitoring
- ✅ Local storage
- ✅ Offline mode
- ✅ First-run experience

### v1.1 (Polish) — Week 4–6

- Search conversations
- Better markdown rendering
- Keyboard shortcuts
- Export improvements
- Mobile responsive (basic)

### v1.5 (Power Features) — Week 8–12

- Document upload (PDF)
- Multi-turn context improvements
- Conversation folders
- Custom system prompts

### v2.0 (Advanced) — Month 4–6

- Personal AIs (custom personas)
- Project workspaces
- Image understanding (multi-modal)
- Voice input/output

---

## ❗ Risks & Mitigations

| Risk                       | Impact | Mitigation                                              |
| -------------------------- | ------ | ------------------------------------------------------- |
| WebGPU not supported       | High   | Fallback to CPU/WASM where possible, clear requirements |
| Model too large (bounce)   | High   | Start with tiny Quick Mode, progressive enhancement     |
| Performance issues         | Medium | Proactive warnings, switch suggestion to Quick Mode     |
| Browser crashes            | High   | Memory monitoring, kill-switch, robust error handling   |
| Competition launches first | Medium | Speed > perfection, ship fast                           |
| Users don’t trust privacy  | Medium | Open source, clear privacy promise                      |

---

## ✅ Definition of Done (v1)

v1 is complete when:

- All core features implemented
- Works on Chrome 120+ and Edge 120+
- No critical bugs
- < 3 second average response time (target)
- Offline mode functional
- README complete with GIF
- Deployed to trylokul.com
- GitHub repo public
- Successfully chat with Quick Mode in < 60 seconds from landing
