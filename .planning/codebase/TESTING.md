# Testing Patterns

**Analysis Date:** 2026-02-23

## Test Framework

**Runner:**
- Vitest `^3.2.4` (declared in `package.json`)
- Config: Not detected (`vitest.config.*` is absent; tests run from default Vitest behavior via `package.json` script `"test": "vitest"`)

**Assertion Library:**
- Vitest built-in `expect` API (`src/store/modelStore.test.ts`, `src/lib/storage/conversation-transfer.test.ts`)

**Run Commands:**
```bash
npm run test              # Run Vitest (watch in interactive terminal)
npm run test -- --run     # Run tests once (CI-style)
npm run test -- --coverage  # Coverage command is not configured in scripts; run manually if coverage provider is added
```

## Test File Organization

**Location:**
- Co-located tests next to implementation modules:
  - `src/store/modelStore.test.ts` with `src/store/modelStore.ts`
  - `src/lib/storage/conversation-transfer.test.ts` with `src/lib/storage/conversation-transfer.ts`
  - `src/lib/memory/extraction.test.ts` with `src/lib/memory/extraction.ts`
  - `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx` with `src/components/chat-layout/ChatLayout.tsx`

**Naming:**
- Use `*.test.ts` and `*.test.tsx` suffixes.
- Use descriptive scenario qualifiers for regression tests (`ChatLayout.mobile-sidebar-regression.test.tsx`).

**Structure:**
```text
src/
  <domain>/
    feature.ts
    feature.test.ts
  <component>/
    Component.tsx
    Component.specific-regression.test.tsx
```

## Test Structure

**Suite Organization:**
```typescript
// Pattern from src/lib/storage/conversation-transfer.test.ts
describe("importConversationJson", () => {
  beforeEach(() => {
    getConversationMock.mockReset();
    saveConversationWithVersionMock.mockReset();
  });

  it("imports a valid backup payload", async () => {
    const result = await importConversationJson(exportConversationJson(incoming));
    expect(result.ok).toBe(true);
  });
});
```

**Patterns:**
- Setup pattern: reset mock state in `beforeEach` (`src/store/modelStore.test.ts`, `src/lib/storage/conversation-transfer.test.ts`).
- Teardown pattern: manual restoration for spies where needed (`consoleErrorSpy.mockRestore()` in `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`).
- Assertion pattern: behavioral assertions with `toHaveBeenCalledWith`, `toEqual(expect.objectContaining(...))`, and selective discriminated-union checks.

## Mocking

**Framework:** Vitest `vi`

**Patterns:**
```typescript
// Pattern from src/store/modelStore.test.ts
const { loadModelMock } = vi.hoisted(() => ({
  loadModelMock: vi.fn<(modelId: string) => Promise<void>>(),
}));

vi.mock("@/lib/ai/model-engine", () => ({
  modelEngine: {
    loadModel: loadModelMock,
  },
}));
```

```typescript
// Pattern from src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx
const consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => undefined);
```

**What to Mock:**
- External boundaries and mutable collaborators: storage APIs in `src/lib/storage/conversation-transfer.test.ts`, model engine/storage collaborators in `src/store/modelStore.test.ts`, router + app shell dependencies in `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`.
- Browser APIs for DOM behavior (`window.matchMedia` and `window.innerWidth` in `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`).

**What NOT to Mock:**
- Domain transformation logic under test (for example schema parsing and conflict behavior in `src/lib/storage/conversation-transfer.ts` is exercised directly by `src/lib/storage/conversation-transfer.test.ts`).
- Core state transition logic within the store being validated (`src/store/modelStore.test.ts` validates state effects while mocking only external IO).

## Fixtures and Factories

**Test Data:**
```typescript
// Pattern from src/lib/storage/conversation-transfer.test.ts
function buildConversation(partial: Partial<Conversation> = {}): Conversation {
  return {
    id: partial.id ?? "conversation-1",
    title: partial.title ?? "Imported Conversation",
    // ...defaults
  };
}
```

```typescript
// Pattern from src/lib/memory/extraction.test.ts
function buildMessage(partial: Partial<Message>): Message {
  return {
    id: partial.id ?? "m1",
    role: partial.role ?? "user",
    // ...defaults
  };
}
```

**Location:**
- Fixtures/factories are local to each test file (inline helper functions), not centralized in a shared test utility directory.

## Coverage

**Requirements:** None enforced

**View Coverage:**
```bash
npm run test -- --coverage
```

## Test Types

**Unit Tests:**
- Primary pattern: logic-level unit tests for stores and library modules in `src/store/modelStore.test.ts`, `src/lib/storage/conversation-transfer.test.ts`, and `src/lib/memory/extraction.test.ts`.

**Integration Tests:**
- Focused UI interaction/regression test using jsdom + Testing Library in `src/components/chat-layout/ChatLayout.mobile-sidebar-regression.test.tsx`.

**E2E Tests:**
- Not used (no Playwright/Cypress/Webdriver config detected in repository root).

## Common Patterns

**Async Testing:**
```typescript
// Pattern from src/store/modelStore.test.ts
await Promise.all([
  store.requestModelForConversation("c1", "phi-2-q4f16_1-MLC"),
  store.requestModelForConversation("c1", "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"),
]);
expect(loadOrder).toEqual(["phi-2-q4f16_1-MLC", "Mistral-7B-Instruct-v0.3-q4f16_1-MLC"]);
```

**Error Testing:**
```typescript
// Pattern from src/lib/storage/conversation-transfer.test.ts
const result = await importConversationJson("{not-json");
expect(result).toEqual(
  expect.objectContaining({
    ok: false,
    step: "parse",
    code: "invalid_json",
  })
);
```

---

*Testing analysis: 2026-02-23*
