# Phase 5: Polish & PWA - Research

**Researched:** 2026-02-19
**Domain:** Responsive chat UX, long-thread rendering, local export/import, installable PWA UX
**Confidence:** HIGH

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

### Responsive chat layout
- Mobile defaults to chat view with a compact header visible.
- Conversation list on small screens uses a slide-over panel (drawer) over chat.
- On mobile, side panels use single-panel focus (opening one closes others).
- Desktop density is adaptive: comfortable by default, compact on narrower desktop widths.

### Large chat browsing
- For 50+ messages, older history loads in chunked batches while scrolling upward.
- Opening an old conversation lands at the latest message (bottom) by default.
- Streaming auto-scroll behavior stays as currently implemented (no change in this phase).
- Long-thread position indicator/jump UI stays as currently implemented (no change in this phase).

### Export/Import UX
- Export/import lives in a per-chat top bar 3-dot menu.
- Primary export UI shows Markdown, JSON, and Text as equal options.
- JSON import uses guided checks before allowing import completion.
- On conversation ID conflict during import, prompt the user each time (replace vs duplicate).

### PWA install experience
- Surface install via a subtle header action.
- Show install UI only after the first successful chat.
- Use a persistent compact status indicator (icon + short text) in the top-right bar.
- If install is unavailable, hide the install affordance silently.
- If user dismisses install, it may reappear in the next session.
- When app goes offline, rely on status change only (no toast/inline interruption).
- After successful install, hide install action.
- For installed users, show no extra onboarding hint.
- In private/incognito contexts, treat install as unavailable (hide).
- Show install action on both mobile and desktop when eligible.

### Claude's Discretion
- Exact copy text for menu labels, status labels, and guided import step wording.
- Visual styling details for compact header/status indicator as long as behavior decisions above remain intact.

### Deferred Ideas (OUT OF SCOPE)

None - discussion stayed within phase scope.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|-----------------|
| CHAT-09 | Chat interface is responsive (works on desktop and mobile) | Existing sidebar/sheet primitives already support mobile drawer; add compact top bar and mobile single-panel focus state machine |
| CHAT-10 | Message list virtualizes for long conversations (> 50 messages) | Implement upward chunk loading with bounded rendered window and bottom-anchored entry for existing conversations |
| STOR-05 | User can export current conversation as Markdown (.md) | Use deterministic markdown serializer + Blob download flow |
| STOR-06 | User can export current conversation as JSON (.json) | Export canonical conversation schema including metadata/version |
| STOR-07 | User can export current conversation as Text (.txt) | Add plain-text serializer preserving speaker order and timestamps |
| STOR-08 | User can import conversation from JSON backup | Add guided validation + conflict prompt per import when ID already exists |
</phase_requirements>

## Summary

Phase 5 should be planned as an orchestration phase, not a net-new platform phase. The project already has most primitives: responsive sidebar drawer (`src/components/ui/sidebar.tsx`), chat rendering anchored to bottom (`src/components/ai-elements/conversation.tsx`), IndexedDB conversation persistence (`src/lib/storage/conversations.ts`), PWA plugin setup (`vite.config.ts`), and manifest wiring (`index.html`). The work is to unify behavior across mobile/desktop and add import/export + install state UX.

Two high-impact findings shape planning risk. First, current `StatusIndicator` is not aligned with Phase 5 UX (position and behavior), and it appears to treat `useRegisterSW().offlineReady` as a boolean when React docs show it is a tuple; this should be corrected while introducing install-status display. Second, current manifest icon metadata is likely invalid for install quality (`public/manifest.json` uses PNG path but `image/svg+xml`, and lacks explicit 192/512 PNG entries expected by Chromium installability guidance).

**Primary recommendation:** Plan this phase around five vertical slices: (1) responsive shell + single-panel focus controller, (2) long-thread chunking with bottom-first open behavior, (3) unified 3-dot per-chat menu with 3 export serializers and JSON import wizard, (4) install/offline status header indicator with eligibility gating after first successful chat, and (5) manifest/icon and type-safety hardening for PWA hooks.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| React | 19.2.4 | Responsive shell and stateful UI orchestration | Existing app baseline |
| react-router-dom | 7.13.0 | Conversation-scoped route behavior | Existing `/chat` + `/chat/:id` architecture |
| use-stick-to-bottom | 1.1.3 | Preserve current streaming/bottom-stick behavior | Already integrated in conversation container |
| vite-plugin-pwa | 0.21.2 | SW registration, offline readiness hooks | Existing plugin and virtual React hook path |
| Dexie | 4.3.0 | Import conflict checks and persistence writes | Existing conversation storage layer |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| sonner | 2.0.7 | Minimal success/error feedback for import/export actions | Use for non-disruptive feedback only |
| shadcn Sheet/Popover/Dropdown primitives | in-repo | Mobile drawer and top-bar menus | Keep consistency with current UI patterns |
| Browser File APIs (`Blob`, `URL.createObjectURL`, `Blob.text`) | web standard | Export and import file handling | Avoid custom download/upload abstractions |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `@virtuoso.dev/message-list` | `react-virtuoso` | `@virtuoso.dev/message-list` is commercial license; `react-virtuoso` is MIT and better fit for OSS if true list virtualization is needed |
| Custom SW registration logic | direct `navigator.serviceWorker` orchestration | More edge cases and less consistency vs `virtual:pwa-register/react` hook |

**Installation (only if choosing true window virtualization):**
```bash
npm install react-virtuoso
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── components/
│   ├── chat-layout/
│   │   ├── ChatLayout.tsx               # Compact header + status/menus
│   │   ├── chat-topbar-menu.tsx         # 3-dot menu with export/import
│   │   └── install-status-indicator.tsx # Install + offline compact state
│   └── Chat/
│       ├── AIChatInterface.tsx          # Long-thread chunk orchestration
│       └── conversation-history.tsx     # Render-window/chunk logic
├── lib/
│   ├── storage/
│   │   └── conversation-transfer.ts     # export/import serializers + validation
│   └── pwa/
│       └── install-prompt.ts            # beforeinstallprompt/appinstalled hooks
└── hooks/
    └── useInstallEligibility.ts         # eligibility after first successful chat
```

### Pattern 1: Mobile Single-Panel Focus Controller
**What:** One mobile control state for mutually exclusive overlays (sidebar drawer, memory panel, performance panel, download popover/menu).
**When to use:** Any top-bar or side-panel open action on screens `<768px`.
**Example:**
```typescript
// Source: project constraints + existing sidebar/mobile sheet pattern
type MobilePanel = "none" | "sidebar" | "memory" | "performance" | "downloads";

function openMobilePanel(next: Exclude<MobilePanel, "none">) {
  setMobilePanel(next); // opening one implicitly closes others
}
```

### Pattern 2: Bottom-First Conversation Open + Upward Chunk Loading
**What:** Render recent tail first, prepend older chunks when near top.
**When to use:** `messages.length > 50` conversations.
**Example:**
```typescript
// Source: locked decisions for large chat browsing
const CHUNK_SIZE = 30;
const initialStart = Math.max(0, messages.length - CHUNK_SIZE);
const [startIndex, setStartIndex] = useState(initialStart);
const visibleMessages = messages.slice(startIndex);

function maybeLoadOlder(scrollTop: number) {
  if (scrollTop > 120 || startIndex === 0) return;
  setStartIndex((prev) => Math.max(0, prev - CHUNK_SIZE));
}
```

### Pattern 3: Serializer/Adapter Split for Export
**What:** Separate format serialization from download trigger.
**When to use:** Markdown/JSON/Text parity in same menu.
**Example:**
```typescript
// Source: MDN Blob + createObjectURL docs
function downloadFile(contents: string, filename: string, mime: string) {
  const blob = new Blob([contents], { type: mime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
```

### Pattern 4: Guided Import Pipeline
**What:** Multi-step validation before commit: file parse -> schema check -> message integrity -> conflict resolution -> write.
**When to use:** JSON import from 3-dot menu.
**Example:**
```typescript
// Source: existing Conversation type and storage APIs
const parsed = JSON.parse(await file.text());
assertConversationSchema(parsed);
const existing = await getConversation(parsed.id);
if (existing) {
  // prompt replace vs duplicate for each conflict
}
await saveConversation(normalizeImportedConversation(parsed));
```

### Pattern 5: Install State Machine (Eligibility + Prompt + Installed)
**What:** Keep install logic in explicit finite states and hide affordance when unsupported.
**When to use:** Header install action and compact status indicator.
**Example:**
```typescript
// Source: MDN beforeinstallprompt + appinstalled
type InstallState = "hidden" | "eligible" | "prompted" | "installed";

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
  setInstallState("eligible");
});

window.addEventListener("appinstalled", () => {
  deferredPrompt = null;
  setInstallState("installed");
});
```

### Anti-Patterns to Avoid
- **Panel independence on mobile:** independent booleans create overlapping drawers/popovers; use one source of truth.
- **Import direct-to-write:** writing imported JSON before guided validation creates unrecoverable bad records.
- **Treating install APIs as universal:** `beforeinstallprompt` is non-standard and not baseline; no fallback prompt invocation exists.
- **Leaking object URLs:** forgetting `URL.revokeObjectURL` causes memory leaks in long sessions.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File download plumbing | Hidden iframe hacks or data URI hacks | `Blob` + `URL.createObjectURL` + `<a download>` | Standard, supported, simpler cleanup path |
| Service worker install status hooks | Manual mixed SW listeners everywhere | `virtual:pwa-register/react` in one install/status module | Already integrated via plugin; fewer race conditions |
| Chat virtualization from scratch | Custom DOM measurement engine | Chunked render window (locked UX) or `react-virtuoso` if needed | Reduces complexity and regression risk |
| Import schema evolution | Ad hoc field checks in UI components | Central `conversation-transfer` normalizer/validator | Keeps backward compatibility and testability |

**Key insight:** Most Phase 5 risk is orchestration consistency (state machines and edge cases), not missing libraries.

## Common Pitfalls

### Pitfall 1: Incorrect `useRegisterSW` usage in React
**What goes wrong:** Offline/install state appears always ready or behaves inconsistently.
**Why it happens:** React hook returns tuples (`[boolean, setState]`) and callbacks are non-reactive by default.
**How to avoid:** Destructure tuple values correctly and wrap callbacks in stable references.
**Warning signs:** Indicator stuck in ready state; repeated registration side effects.

### Pitfall 2: Manifest icon metadata mismatch
**What goes wrong:** Install prompt quality degrades or installability checks fail on some Chromium flows.
**Why it happens:** `public/manifest.json` currently uses PNG source with SVG MIME type and lacks explicit 192/512 icon entries.
**How to avoid:** Provide valid icon MIME/size pairs and include install-relevant sizes.
**Warning signs:** Browser install UI missing icon or showing generic fallback.

### Pitfall 3: Scroll jump when prepending old messages
**What goes wrong:** User loses reading position while loading older chunks.
**Why it happens:** Prepend without compensating scroll offset delta.
**How to avoid:** Capture container height/scrollTop before prepend, then restore offset after render.
**Warning signs:** View jumps to different message after each upward load.

### Pitfall 4: Importing invalid/partial JSON backups
**What goes wrong:** Corrupted conversations in IndexedDB.
**Why it happens:** JSON parse success is mistaken for schema validity.
**How to avoid:** Validate required conversation/message fields and normalize optional metadata/version.
**Warning signs:** Crashes in `ChatDetailRoute` when mapping messages.

### Pitfall 5: Install affordance shown in unsupported contexts
**What goes wrong:** User sees install UI that does nothing (iOS Chrome/Firefox, already installed mode, private contexts).
**Why it happens:** Eligibility logic does not gate by deferred prompt availability + display mode + post-chat milestone.
**How to avoid:** Show affordance only when all gates pass; otherwise hide silently per locked decision.
**Warning signs:** Click install does nothing or throws due to missing deferred event.

## Code Examples

### Correct `useRegisterSW` React tuple usage
```typescript
// Source: https://vite-pwa-org.netlify.app/frameworks/react
import { useRegisterSW } from "virtual:pwa-register/react";

const {
  offlineReady: [offlineReady],
  needRefresh: [needRefresh],
  updateServiceWorker,
} = useRegisterSW();
```

### Trigger install prompt only from retained event
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
let deferredPrompt: BeforeInstallPromptEvent | null = null;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
});

async function promptInstall() {
  if (!deferredPrompt) return;
  await deferredPrompt.prompt();
  deferredPrompt = null;
}
```

### Export download helper with cleanup
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static
function download(contents: string, filename: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
```

### File import using modern Blob text API
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/Blob
async function readJsonFile(file: File) {
  const text = await file.text();
  return JSON.parse(text);
}
```

### Bottom-anchored chunk strategy for long threads
```typescript
// Source: Phase 5 locked decisions + existing AIChatInterface bottom UX
const CHUNK_SIZE = 30;
const shouldChunk = messages.length > 50;
const initialStart = shouldChunk ? Math.max(0, messages.length - CHUNK_SIZE) : 0;
const visible = messages.slice(startIndex);
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Browser-only install affordance | In-app contextual install affordance via deferred prompt | Mature PWA UX practice | Better install timing and user intent alignment |
| Always-render full chat history | Virtualized/windowed history with load-on-demand | Standard for long-chat UIs | Better memory/scroll performance |
| Ad hoc export formats | Multi-format parity (MD/JSON/TXT) from one canonical conversation model | Current chat product baseline | Lower data-loss risk and predictable backups |

**Deprecated/outdated:**
- Triggering install prompt without user gesture or retained event object.
- Assuming `beforeinstallprompt` is available cross-browser.

## Open Questions

1. **Do we add `react-virtuoso` now or enforce a bounded chunk window first?**
   - What we know: locked requirement is chunked upward loading; package `@virtuoso.dev/message-list` is commercial; current stack already has bottom-stick behavior.
   - What's unclear: whether strict requirement interpretation expects third-party window virtualization vs bounded chunk rendering.
   - Recommendation: plan bounded chunk rendering first (fits locked behavior), keep `react-virtuoso` as fallback if perf verification fails.

2. **What is the canonical import JSON schema version marker?**
   - What we know: `Conversation` has `version` for optimistic persistence; backups should preserve enough fields to restore routing/model behavior.
   - What's unclear: whether import accepts legacy payloads without `version`.
   - Recommendation: include schema version in export envelope and support backward normalization for at least one previous format.

## Sources

### Primary (HIGH confidence)
- `src/components/chat-layout/ChatLayout.tsx` - current header/panel architecture
- `src/components/Chat/AIChatInterface.tsx` - current conversation rendering + bottom behavior
- `src/components/ai-elements/conversation.tsx` - `use-stick-to-bottom` integration
- `src/components/performance/StatusIndicator.tsx` - current offline indicator behavior
- `src/lib/storage/conversations.ts` - persistence APIs for import/export integration points
- `vite.config.ts` - `vite-plugin-pwa` integration
- `public/manifest.json` - manifest/icon current state
- https://vite-pwa-org.netlify.app/frameworks/react - React hook contract (`useRegisterSW` tuples)
- https://developer.mozilla.org/en-US/docs/Web/API/Window/beforeinstallprompt_event
- https://developer.mozilla.org/en-US/docs/Web/API/Window/appinstalled_event
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Making_PWAs_installable
- https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/How_to/Define_app_icons
- https://developer.mozilla.org/en-US/docs/Web/API/Blob
- https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL_static

### Secondary (MEDIUM confidence)
- https://web.dev/learn/pwa/installation-prompt/ - install prompt behavior patterns and constraints
- https://virtuoso.dev/react-virtuoso/ - virtualization behavior and caveats
- https://www.npmjs.com/package/react-virtuoso - OSS license and version signal

### Tertiary (LOW confidence)
- Heuristics around private/incognito detection (browser behavior differs; use eligibility absence as practical signal)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing code and official docs align strongly.
- Architecture: HIGH - Locked decisions map cleanly to current component/store structure.
- Pitfalls: MEDIUM - Some issues (private context behavior nuances) vary across browser versions.

**Research date:** 2026-02-19
**Valid until:** 2026-03-21 (30 days)
