---
name: qa-gate
description: Run all four completion gates (lint, tsc, jest, playwright) in sequence and fix any failures
---

# QA Gate

Run all mandatory completion gates defined in CLAUDE.md and fix every failure before marking work done. Do not skip gates. Do not mark a task complete while any gate is red.

## Gates — run in this order

### 1. Lint
```bash
npm run lint
```
- Fix every **error**. Warnings may be left only if intentional.
- Never suppress rules with `// eslint-disable` without adding a comment explaining why.

### 2. TypeScript
```bash
npx tsc --noEmit
```
- Fix every type error.
- Never use `@ts-ignore` or `@ts-expect-error` without a documented justification in a comment.
- Never use `any` except as a last resort with an explanatory comment.

### 3. Unit & integration tests
```bash
npm test -- --watchAll=false
```
- All tests must pass.
- If a test is failing due to a legitimate code bug, fix the code.
- If a test is incorrectly written, fix the test — do not delete it.
- After tests pass, check coverage:
  ```bash
  npm run test:coverage
  ```
  Coverage must meet or exceed 80% for branches, functions, lines, and statements.

### 4. E2E tests
```bash
npm run test:e2e
```
- All Playwright tests must pass.
- If a test fails due to a timing issue, prefer a stable locator or explicit wait over `waitForTimeout`.
- Do not add `test.only` — it is forbidden in CI.

## Completion criteria

All four gates green → task is complete.

Report the final status of each gate to the user:
```
✔ Lint       — 0 errors
✔ TypeScript — 0 errors
✔ Jest       — 59 passed, coverage ≥ 80%
✔ Playwright — 29 passed
```

If any gate cannot be fixed within the current task scope, surface the blocker clearly to the user before stopping.
