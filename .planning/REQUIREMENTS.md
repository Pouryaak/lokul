# Requirements: Lokul

**Defined:** 2026-02-17
**Core Value:** Privacy by architecture, not by promise — Users can verify with their own eyes (DevTools Network tab) that conversations never leave their device

## v1 Requirements

### Authentication

*No authentication required for v1 — local-only anonymous usage*

### Chat Interface (CHAT)

- [ ] **CHAT-01**: User can type messages in an auto-resizing input field
- [ ] **CHAT-02**: User can send messages with Enter key or Send button
- [ ] **CHAT-03**: AI responses stream token-by-token (word-by-word) without UI lag
- [ ] **CHAT-04**: Messages render with Markdown formatting (bold, italic, lists, code blocks)
- [ ] **CHAT-05**: Code blocks display with syntax highlighting (Shiki)
- [ ] **CHAT-06**: User can copy any message to clipboard with one click
- [ ] **CHAT-07**: User can regenerate the last AI response
- [ ] **CHAT-08**: User can clear the current conversation
- [ ] **CHAT-09**: Chat interface is responsive (works on desktop and mobile)
- [ ] **CHAT-10**: Message list virtualizes for long conversations (> 50 messages)

### Model Management (MODEL)

- [ ] **MODEL-01**: App auto-loads Quick Mode (Phi-2 2.7B, ~80MB) on first visit
- [ ] **MODEL-02**: User can see current active model in UI header
- [ ] **MODEL-03**: User can switch to Smart Mode (Llama 3.2 3B, ~2.8GB) via dropdown
- [ ] **MODEL-04**: User can switch to Genius Mode (Mistral 7B, ~6.4GB) via dropdown
- [ ] **MODEL-05**: Download progress displays with percentage and time estimate
- [ ] **MODEL-06**: User can cancel an in-progress model download
- [ ] **MODEL-07**: Downloaded models persist in cache across browser sessions
- [ ] **MODEL-08**: Model switch does not require page reload (seamless transition)

### Performance Monitoring (PERF)

- [ ] **PERF-01**: Performance panel displays GPU status (Active/Inactive/Not Supported)
- [ ] **PERF-02**: Performance panel shows memory usage (MB / total available)
- [ ] **PERF-03**: Performance panel shows tokens per second during generation
- [ ] **PERF-04**: Performance panel shows last response time (ms)
- [ ] **PERF-05**: Visual indicator shows system health (Green/Yellow/Red)
- [ ] **PERF-06**: Warning displayed if memory usage exceeds 75%
- [ ] **PERF-07**: Suggestion to switch to Quick Mode shown if performance degrades

### Local Storage (STOR)

- [ ] **STOR-01**: All conversations auto-save to IndexedDB after every message
- [ ] **STOR-02**: Conversation list displays in sidebar with titles and timestamps
- [ ] **STOR-03**: User can view previous conversations from sidebar
- [ ] **STOR-04**: User can delete a conversation
- [ ] **STOR-05**: User can export current conversation as Markdown (.md)
- [ ] **STOR-06**: User can export current conversation as JSON (.json)
- [ ] **STOR-07**: User can export current conversation as Text (.txt)
- [ ] **STOR-08**: User can import conversation from JSON backup
- [ ] **STOR-09**: Settings persist across sessions (theme, default model)

### Offline Mode (OFFL)

- [ ] **OFFL-01**: Service Worker caches application assets for offline use
- [ ] **OFFL-02**: Downloaded models remain available offline
- [ ] **OFFL-03**: Clear indicator shows "✅ Works Offline" or "⚠️ Online Required"
- [ ] **OFFL-04**: App functions without internet after first load (with cached model)
- [ ] **OFFL-05**: PWA manifest allows "Add to Home Screen" installation

### First-Run Experience (FIRST)

- [ ] **FIRST-01**: Landing page displays "Start Chatting" button within 2 seconds
- [ ] **FIRST-02**: Setup flow checks device capabilities (WebGPU support)
- [ ] **FIRST-03**: Setup flow shows honest progress steps during Quick Mode load
- [ ] **FIRST-04**: First message can be sent within 60 seconds of landing
- [ ] **FIRST-05**: Clear error shown if WebGPU not supported (browser compatibility)
- [ ] **FIRST-06**: Prompt to download Smart Mode shown after first successful chat

### Memory & Context (MEM)

- [ ] **MEM-01**: System extracts and saves key user facts (name, preferences, goals)
- [ ] **MEM-02**: Core Facts memory persists indefinitely across all conversations
- [ ] **MEM-03**: Context window management prevents token limit crashes
- [ ] **MEM-04**: Auto-compaction triggers at 80% of model's context limit
- [ ] **MEM-05**: User can view what facts the system remembers (Memory Panel)
- [ ] **MEM-06**: User can edit Core Facts directly
- [ ] **MEM-07**: User can clear all memory

## v2 Requirements (Deferred)

### Search & Organization

- **SRCH-01**: User can search conversation history by keyword
- **SRCH-02**: User can organize conversations into folders
- **SRCH-03**: User can favorite/star important conversations

### Advanced Features

- **ADV-01**: User can upload and chat about PDF documents
- **ADV-02**: User can set custom system prompts per conversation
- **ADV-03**: User can configure keyboard shortcuts

### Mobile Enhancements

- **MOB-01**: Swipe gestures for common actions
- **MOB-02**: Optimized mobile keyboard handling
- **MOB-03**: Touch-friendly message actions

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud sync | Violates privacy-first architecture; no server infrastructure |
| User accounts | Adds friction, requires backend, contradicts anonymous design |
| Real-time collaboration | Requires server infrastructure, privacy concerns |
| Voice input/output | High complexity, large models, deferred to v2+ |
| Image understanding | Vision models 10GB+, slow inference, v2 scope |
| Custom GPTs/agents | Complex UI, niche use case, delays MVP |
| Desktop native app | PWA provides native-like experience, lower maintenance |
| Mobile native app | Responsive web sufficient for v1, separate codebase cost |
| Plugin system | Security concerns, maintenance burden, no third-party code |
| Analytics/tracking | Violates zero-tracking promise; use GitHub issues instead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| CHAT-01 | Phase 2 | Pending |
| CHAT-02 | Phase 2 | Pending |
| CHAT-03 | Phase 2 | Pending |
| CHAT-04 | Phase 2 | Pending |
| CHAT-05 | Phase 2 | Pending |
| CHAT-06 | Phase 2 | Pending |
| CHAT-07 | Phase 2 | Pending |
| CHAT-08 | Phase 2 | Pending |
| CHAT-09 | Phase 5 | Pending |
| CHAT-10 | Phase 5 | Pending |
| MODEL-01 | Phase 1 | Pending |
| MODEL-02 | Phase 3 | Pending |
| MODEL-03 | Phase 3 | Pending |
| MODEL-04 | Phase 3 | Pending |
| MODEL-05 | Phase 3 | Pending |
| MODEL-06 | Phase 3 | Pending |
| MODEL-07 | Phase 1 | Pending |
| MODEL-08 | Phase 3 | Pending |
| PERF-01 | Phase 1 | Pending |
| PERF-02 | Phase 1 | Pending |
| PERF-03 | Phase 2 | Pending |
| PERF-04 | Phase 2 | Pending |
| PERF-05 | Phase 1 | Pending |
| PERF-06 | Phase 2 | Pending |
| PERF-07 | Phase 2 | Pending |
| STOR-01 | Phase 2 | Pending |
| STOR-02 | Phase 2 | Pending |
| STOR-03 | Phase 2 | Pending |
| STOR-04 | Phase 2 | Pending |
| STOR-05 | Phase 5 | Pending |
| STOR-06 | Phase 5 | Pending |
| STOR-07 | Phase 5 | Pending |
| STOR-08 | Phase 5 | Pending |
| STOR-09 | Phase 1 | Pending |
| OFFL-01 | Phase 1 | Pending |
| OFFL-02 | Phase 1 | Pending |
| OFFL-03 | Phase 1 | Pending |
| OFFL-04 | Phase 1 | Pending |
| OFFL-05 | Phase 1 | Pending |
| FIRST-01 | Phase 1 | Pending |
| FIRST-02 | Phase 1 | Pending |
| FIRST-03 | Phase 1 | Pending |
| FIRST-04 | Phase 1 | Pending |
| FIRST-05 | Phase 1 | Pending |
| FIRST-06 | Phase 3 | Pending |
| MEM-01 | Phase 4 | Pending |
| MEM-02 | Phase 4 | Pending |
| MEM-03 | Phase 4 | Pending |
| MEM-04 | Phase 4 | Pending |
| MEM-05 | Phase 4 | Pending |
| MEM-06 | Phase 4 | Pending |
| MEM-07 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 56 total
- Mapped to phases: 56
- Unmapped: 0 ✓

---
*Requirements defined: 2026-02-17*
*Last updated: 2026-02-17 after initial definition*
