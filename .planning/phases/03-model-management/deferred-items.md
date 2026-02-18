# Deferred Items

## Out-of-Scope Validation Failures During 03-01 Execution

1. Global lint baseline is currently failing in unrelated UI files (`src/components/ai-elements/**`, `src/components/sidebar-02/**`, `src/lib/utils/debounce.ts`) due duplicate imports, unused eslint directives, and existing rule violations.
2. Global test command fails on an unrelated pre-existing file with no tests: `.claude/get-shit-done/bin/gsd-tools.test.cjs`.

These issues predated this plan's scoped changes and were not modified by tasks in `03-01-PLAN.md`.
