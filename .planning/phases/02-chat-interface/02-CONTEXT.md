# Phase 2: Chat Interface - Context

**Gathered:** 2026-02-18
**Status:** Ready for planning

<domain>
## Phase Boundary

Chat interface for local AI conversations with streaming responses, message history, and conversation management. Users can have natural conversations, view past chats, and manage their conversation history.

</domain>

<decisions>
## Implementation Decisions

### Component Libraries
- **Use pre-built AI component libraries rather than building from scratch**
- blocks.so/ai - for chat UI blocks
- blocks.so/sidebar - for conversation sidebar
- prompt-kit.com - for message components (thinking-bar, blocks, markdown)
- shadcn.io/ai - for AI-themed shadcn components
- kibo-ui.com/code-block - for syntax-highlighted code blocks

### Chat Layout & Styling
- Different bubble colors AND different alignment for user vs AI messages (user blue right-aligned, AI gray/white left-aligned)
- Timestamps appear on hover only (cleaner look)
- Max width layout for readability (like ChatGPT)
- Spacing like ChatGPT (generous but not wasteful)
- Avatars/icons for both user and AI (like Claude, ChatGPT)
- Fixed input at bottom (standard chat pattern)
- Toolbar above input with regenerate and clear chat buttons

### Empty State
- Welcome message with suggestions (like ChatGPT)

### Streaming Behavior
- Cursor blink while AI is "thinking" (before tokens)
- Smooth token fade-in during streaming
- Auto-scroll to bottom (handled by UI components)
- Prominent "Stop generating" button
- Thinking indicator: prompt-kit's thinking-bar component
- Performance stats accessible via action button (not always visible)
- Smooth consistent animation rate for token appearance
- Input disabled while AI is generating (prevent new messages)
- Inline error display with retry button

### Message Rendering & Markdown
- Code blocks: kibo-ui code-block component with copy button
- Copy button: always visible for last message, hover for older messages
- Markdown: prompt-kit markdown component
- Full markdown support including tables, lists, headings
- Message actions: regenerate, edit, delete

### Sidebar & Conversation History
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

</decisions>

<specifics>
## Specific Ideas

- "Just like ChatGPT" for spacing, layout, and title editing
- Specific component library references:
  - prompt-kit.com/docs/thinking-bar
  - prompt-kit.com/blocks
  - prompt-kit.com/docs/markdown
  - kibo-ui.com/components/code-block
  - blocks.so/ai
  - blocks.so/sidebar
  - shadcn.io/ai

</specifics>

<deferred>
## Deferred Ideas

- Message queuing (user mentioned for later versions)
- More advanced markdown features (mermaid diagrams, LaTeX math)
- Mobile-specific interactions
- Keyboard shortcuts customization

</deferred>

---

*Phase: 02-chat-interface*
*Context gathered: 2026-02-18*
