# Phase 1: Core Infrastructure — Implementation Context

**Phase Goal:** Users can load the app, verify WebGPU support, and have Quick Mode ready within 60 seconds.

---

## Area 1: Loading Experience

### Setup Screen Design
- **Landing:** Simple hero page with app name (Lokul), tagline ("Privacy-first AI chat"), and prominent "Start Chatting" CTA button
- **Layout:** Centered card design with logo above, single CTA below
- **Background:** Clean gradient or solid color matching branding (warm tones per CLAUDE.md)
- **No distractions:** No navigation, no settings, just the essential call-to-action

### Progress Display
- **Quick Mode auto-loads** on first visit (no user choice needed for initial load)
- **Progress shown:** Percentage (0-100%), loading step label ("Downloading model...", "Initializing WebGPU...")
- **Time estimate:** "About 30 seconds" or "About 2 minutes" based on model size
- **Cancelable:** Yes, user can cancel Quick Mode load and try again later

### Visual Elements
- **Logo:** Spark/flame icon (already in public/lokul-logo.png)
- **Animation:** Subtle pulsing loader, not spinner (feels more modern)
- **Background:** Soft gradient with optional particle/grid animation (WebGPU-themed)
- **Typography:** Clean sans-serif, large heading, smaller explanatory text

---

## Area 2: Error Handling

### WebGPU Not Supported
- **Detection:** Check `navigator.gpu` availability on load
- **Error message:** Clear, non-technical explanation
  - "Your browser doesn't support WebGPU"
  - "Lokul requires Chrome 120+ or Edge 120+"
  - Include browser icons/links for supported browsers
- **Actionable:** Direct links to download Chrome/Edge
- **No fallback:** No polyfill or degraded mode — WebGPU is required

### Model Load Failure
- **Error message:** "Failed to load AI model. Please try again."
- **Action:** "Retry" button to restart download
- **Help:** Link to troubleshooting (check storage space, network)

### Storage Quota Error
- **Error message:** "Not enough storage space"
- **Explanation:** "Quick Mode requires ~100MB free space"
- **Action:** "Free up space and retry"

---

## Area 3: Progress Indicators

### Download Progress
- **Display:** Progress bar (horizontal) with percentage text
- **Position:** Centered below loading text
- **Updates:** Real-time, throttled to 100ms to prevent jitter
- **Visual:** Fill color matches primary brand color

### Time Estimates
- **Format:** "About X seconds remaining" or "About X minutes remaining"
- **Calculation:** Based on download speed (rolling average)
- **Accuracy:** Show ranges for uncertainty ("30-45 seconds")
- **Cap:** Never show > 5 minutes (shows "several minutes" instead)

### Steps Display
- **Current step label:** "Downloading Phi-2 model...", "Compiling shaders...", "Ready!"
- **Step count:** Optional "Step 2 of 3" format
- **Completion:** Clear "Ready to chat!" message before auto-advancing

---

## Area 4: Offline Badge

### Works Offline Indicator
- **Position:** Bottom-left corner or status bar area
- **Icon:** Cloud checkmark icon when offline capable
- **Text:** "Works Offline" (green/positive color)
- **States:**
  - Loading: Hidden or gray "Checking..."
  - Ready: Green "Works Offline"
  - Error: Yellow/Red warning if Service Worker fails

### Online Required State
- **When:** Before Service Worker activation
- **Icon:** Cloud with X or warning triangle
- **Text:** "Online connection required"
- **Subtext:** "First-time setup needs internet"

### Badge Behavior
- **Dismissible:** No, always visible during first load
- **Persistent:** Remains visible in header/status area after first load
- **Tooltip:** Hover shows "App cached for offline use" on hover

---

## Deferred Ideas (for later phases)

- Skip setup option for returning users (Phase 2+)
- Background model download (download Smart Mode while chatting)
- Dark mode toggle during setup (respect system preference for now)
- Onboarding tutorial after first load (Phase 2+)

---

*Created: 2026-02-17*
*Next: Plan Phase 1 execution*
