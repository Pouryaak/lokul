---
status: resolved
trigger: "Investigate the root cause of the model download failure - user clicks Start Chatting, after 1 second shows Download failed, no network error visible"
created: 2026-02-18T00:00:00Z
updated: 2026-02-18T00:00:00Z
---

## Current Focus

hypothesis: CONFIRMED - Model ID format mismatch between app config and WebLLM expected format
test: Examined WebLLM library source code for valid model IDs
expecting: Model IDs must include -MLC suffix
next_action: Report root cause found

## Symptoms

expected: Model downloads successfully, then chat interface appears
actual: Download fails immediately after starting (within 1 second)
errors: "Download failed, failed to download model" shown in UI
reproduction: Test 1 in Phase 2 UAT - click Start Chatting on landing page
started: Always broken (first time testing)

## Eliminated

- hypothesis: WebGPU not available
  evidence: GPU detection exists and WebLLM would throw different error
  timestamp: 2026-02-18T00:00:00Z

- hypothesis: Network error
  evidence: No network error in console, error happens immediately (1 second)
  timestamp: 2026-02-18T00:00:00Z

- hypothesis: Worker not loading
  evidence: Worker instantiation code looks correct, error would be different
  timestamp: 2026-02-18T00:00:00Z

## Evidence

- timestamp: 2026-02-18T00:00:00Z
  checked: src/lib/ai/models.ts
  found: Model ID is "phi-2-q4f16_1" with modelUrl "https://huggingface.co/mlc-ai/phi-2-q4f16_1-MLC"
  implication: Model ID format is missing -MLC suffix required by WebLLM

- timestamp: 2026-02-18T00:00:00Z
  checked: node_modules/@mlc-ai/web-llm/lib/index.js
  found: Valid phi-2 model IDs are "phi-2-q4f16_1-MLC" and "phi-2-q4f32_1-MLC"
  implication: App uses "phi-2-q4f16_1" but WebLLM expects "phi-2-q4f16_1-MLC"

- timestamp: 2026-02-18T00:00:00Z
  checked: node_modules/@mlc-ai/web-llm/lib/index.js
  found: Valid Llama-3.2-3B model ID is "Llama-3.2-3B-Instruct-q4f16_1-MLC"
  implication: App uses "llama-3.2-3b-q4f16_1" but WebLLM expects "Llama-3.2-3B-Instruct-q4f16_1-MLC"

- timestamp: 2026-02-18T00:00:00Z
  checked: node_modules/@mlc-ai/web-llm/lib/index.js
  found: Valid Mistral-7B model ID is "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"
  implication: App uses "mistral-7b-q4f16_1" but WebLLM expects "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"

- timestamp: 2026-02-18T00:00:00Z
  checked: src/lib/ai/inference.ts lines 80-84
  found: CreateWebWorkerMLCEngine called with modelId directly, no error logging around the call
  implication: Errors from WebLLM are thrown but not logged to console before being caught

- timestamp: 2026-02-18T00:00:00Z
  checked: src/store/modelStore.ts lines 112-121
  found: Error caught and stored, but original error stack/context may be lost
  implication: Error message "Failed to download model" is generic, root cause hidden

## Resolution

root_cause: Model ID format mismatch in src/lib/ai/models.ts - all three model IDs are missing the required "-MLC" suffix that WebLLM v0.2.80 expects

fix: Update model IDs to match WebLLM prebuilt config:
  - phi-2-q4f16_1 -> phi-2-q4f16_1-MLC
  - llama-3.2-3b-q4f16_1 -> Llama-3.2-3B-Instruct-q4f16_1-MLC
  - mistral-7b-q4f16_1 -> Mistral-7B-Instruct-v0.3-q4f16_1-MLC

verification: Check WebLLM prebuiltAppConfig.model_list for valid model IDs

files_changed:
  - src/lib/ai/models.ts: Update model IDs to include -MLC suffix
