---
status: diagnosed
phase: 02-chat-interface
source:
  - 02-01-SUMMARY.md
  - 02-02-SUMMARY.md
  - 02-03-SUMMARY.md
  - 02-04-SUMMARY.md
started: 2026-02-18T12:45:00Z
updated: 2026-02-18T13:00:00Z
---

## Current Test

number: 1
name: Send a Message and Receive AI Response
expected: |
  Type a message in the input field and press Enter. The message appears in the chat with your orange bubble on the right. After a brief moment, the AI responds with a streaming response (tokens appearing word by word in a white bubble on the left).
awaiting: user response

## Tests

### 1. Send a Message and Receive AI Response
expected: Type message, press Enter, see your message in orange bubble (right), AI responds with streaming tokens in white bubble (left)
result: issue
reported: "Cannot get to chat screen. Clicking Start Chatting shows 'Download failed, failed to download model' after 1 second. No network error, no terminal error."
severity: blocker

### 2. Auto-Resizing Input Field
expected: Type a long message that spans multiple lines. The input field grows taller to accommodate the text (up to a max height), then shows a scrollbar.
result: pending

### 3. Copy Message to Clipboard
expected: Hover over any AI message to reveal a copy button. Click it, the button shows a checkmark briefly, and the message content is copied to your clipboard (paste elsewhere to verify).
result: pending

### 4. Regenerate AI Response
expected: After receiving an AI response, click the regenerate button (circular arrow). The last AI response is replaced with a fresh generation.
result: pending

### 5. Clear Current Conversation
expected: Click the "Clear chat" button in the toolbar above the input. The conversation is cleared and you're shown the WelcomeScreen with suggestion cards.
result: pending

### 6. Markdown Rendering in AI Responses
expected: Ask the AI to respond with a code block, list, or table. The AI response shows proper formatting with syntax highlighting for code, bullet points for lists, and proper table structure.
result: pending

### 7. Copy Code Block
expected: When AI responds with a code block, hover over it to see a "Copy" button in the top-right. Click it to copy just the code content (not the entire message).
result: pending

### 8. Conversation List in Sidebar
expected: After sending messages, open the sidebar (if collapsed). You see your conversation listed with a title (auto-generated from your first message) and a relative timestamp (e.g., "just now").
result: pending

### 9. Edit Conversation Title
expected: Hover over a conversation in the sidebar, click the pencil icon. A modal appears with the current title. Edit it, click Save, and the sidebar updates with the new title.
result: pending

### 10. Delete Conversation with Confirmation
expected: Hover over a conversation in the sidebar, click the trash icon. A confirmation dialog appears asking if you're sure. Click Confirm and the conversation is removed from the list.
result: pending

## Summary

total: 10
passed: 0
issues: 1
pending: 9
skipped: 0

## Gaps

- truth: "User can load the app and start chatting after model download completes"
  status: failed
  reason: "User reported: Clicking Start Chatting shows 'Download failed, failed to download model' after 1 second. No network error, no terminal error."
  severity: blocker
  test: 1
  root_cause: "Model ID format mismatch - all three model IDs are missing the required '-MLC' suffix that WebLLM v0.2.80 expects"
  artifacts:
    - path: "src/lib/ai/models.ts"
      issue: "Model IDs missing -MLC suffix (lines 34, 48, 62)"
    - path: "src/lib/ai/inference.ts"
      issue: "Missing error logging around CreateWebWorkerMLCEngine call"
    - path: "src/store/modelStore.ts"
      issue: "Error handling loses original error context"
  missing:
    - "Update model IDs to match WebLLM's prebuilt configuration"
    - "Add proper error logging to diagnose model loading failures"
  debug_session: ".planning/debug/DEBUG-model-download-failed.md"
