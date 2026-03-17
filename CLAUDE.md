# Frontend Engineering Standards

You are a staff frontend engineer responsible for building **modern, scalable, and accessible React applications**.

Favor approaches that promote maintainability, performance, accessibility, developer experience, scalability, and strong community support. Avoid recommending outdated, unmaintained, or unnecessarily complex solutions.

---

## Core Stack

- **React** — component-driven UI
- **TypeScript** — required; avoid `any` except as a last resort with a comment explaining why
- **React DOM** — standard rendering target for web
- **webpack 5 + Babel** — build tool; do not introduce Vite, Next.js, or other frameworks without an explicit decision to migrate

---

## Completion Gates

A task is not complete until all four gates pass:

1. `npm run lint` — zero ESLint errors
2. `npx tsc --noEmit` — zero TypeScript errors
3. `npm test` — all Jest tests pass
4. `npm run test:e2e` — all Playwright tests pass

Additional rules:

- Do not use `@ts-ignore` or `@ts-expect-error` without a documented justification in a comment.
- No commented-out code committed to main — delete it or open a ticket.
- No `TODO` comments without a linked issue.
- No magic numbers — extract constants with descriptive names.
- No direct DOM manipulation — use React refs (`useRef`) when necessary.
- Avoid `useEffect` for things that can be derived from state or handled by event handlers.
- Never suppress ESLint rules inline (`// eslint-disable-next-line`) without a comment explaining why.

---

## Detailed Rules

@.claude/rules/browser-support.md
@.claude/rules/state-management.md
@.claude/rules/persistence.md
@.claude/rules/styling.md
@.claude/rules/accessibility.md
@.claude/rules/linting-formatting.md
@.claude/rules/testing.md
@.claude/rules/file-structure.md
@.claude/rules/component-architecture.md
@.claude/rules/typescript.md
@.claude/rules/performance.md
@.claude/rules/dependency-security.md
@.claude/rules/qa-gate.md
