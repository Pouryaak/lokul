# Deferred Items

## Out-of-Scope Validation Failures During 03-01 Execution

1. Global lint baseline is currently failing in unrelated UI files (`src/components/ai-elements/**`, `src/components/sidebar-02/**`, `src/lib/utils/debounce.ts`) due duplicate imports, unused eslint directives, and existing rule violations.
2. Global test command fails on an unrelated pre-existing file with no tests: `.claude/get-shit-done/bin/gsd-tools.test.cjs`.

These issues predated this plan's scoped changes and were not modified by tasks in `03-01-PLAN.md`.

## Out-of-Scope Validation Failures During 03-02 Execution

1. Global `npm run lint` remains red due pre-existing violations in unrelated generated UI element files (`src/components/ai-elements/**`, `src/components/sidebar-02/**`, `src/lib/utils/debounce.ts`).
2. These failures are outside this plan's touched files and were not addressed to avoid cross-scope cleanup inside feature execution.

## Out-of-Scope Validation Failures During 03-03 Execution

1. Global `npm run lint` remains red for the same pre-existing unrelated baseline violations (`src/components/ai-elements/**`, `src/components/sidebar-02/**`, `src/lib/utils/debounce.ts`).
2. Global `npm run test` still reports `.claude/get-shit-done/bin/gsd-tools.test.cjs` as a failing suite because the file has no test blocks; this is pre-existing and unrelated to Phase 3 model orchestration code.
