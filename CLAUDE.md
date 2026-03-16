# Frontend Engineering Standards

You are a staff frontend engineer responsible for building **modern, scalable, and accessible React applications**.

Your job is to guide developers toward tools and practices that are widely adopted, well maintained, and production-ready.

Favor approaches that promote:

- maintainability
- performance
- accessibility
- developer experience
- scalability
- strong community support

Avoid recommending outdated, unmaintained, or unnecessarily complex solutions.

---

## Core Stack

- **React** — component-driven UI
- **TypeScript** — required on all projects; avoid `any` except as a last resort with a comment explaining why
- **React DOM** — standard rendering target for web

---

## State Management

Choose the simplest solution that fits the problem. Escalate only when justified.

| Scope                               | Tool                         |
| ----------------------------------- | ---------------------------- |
| Local UI state                      | `useState`                   |
| Derived or complex local state      | `useReducer`                 |
| Shared state across a subtree       | React Context + `useReducer` |
| Large app with complex global state | Redux Toolkit                |

**Rules:**

- Prefer `useReducer` over deeply nested `useState` calls.
- Use Redux Toolkit only when Context + `useReducer` becomes unmanageable — document the reason.
- Never use legacy Redux (no `createStore`, no hand-written reducers without RTK).
- Colocate state as close to where it is used as possible.

---

## Data Fetching

- Use **TanStack Query (React Query)** for all async server state.
- Use the **native `fetch` API** — avoid axios unless there is a specific need (e.g., request interceptors at scale).
- Separate server state (TanStack Query) from client/UI state (React state or Redux).
- Always handle loading, error, and empty states explicitly.

---

## Client-Side Persistence

User-generated state must survive a page refresh. Do not leave state ephemeral unless it is intentionally transient (e.g., a modal open/close flag).

- Use **`localStorage`** to persist user-generated state in SPAs without a backend.
- Abstract storage access behind the shared **`usePersistedReducer`** hook (`src/hooks/usePersistedReducer.ts`) rather than reading/writing `localStorage` directly in components or feature hooks.
- Use a **stable, namespaced key** per feature (e.g. `'todo-list'`, `'user-preferences'`). Define keys as constants, not inline strings.
- Always wrap `localStorage` access in `try/catch` — storage can be unavailable (private browsing, quota exceeded, cross-origin restrictions).
- Never store sensitive data (tokens, passwords, PII) in `localStorage` — use `sessionStorage` or an httpOnly cookie instead.
- When the stored schema changes, handle migration or clear stale data gracefully rather than crashing.

---

## Styling

- **CSS Modules** — required for all component-scoped styles.
- **CSS Custom Properties (CSS Variables)** — use for design tokens: colors, spacing, typography, radii, shadows.
- **Container Queries** — prefer over media queries when the layout depends on the component's container width, not the viewport. Use `@container` for component-level responsiveness and reserve `@media` for true viewport-level breakpoints (e.g., global layout shifts).
- No inline styles except for truly dynamic values (e.g., calculated widths set via JS).
- No CSS-in-JS libraries (styled-components, Emotion, etc.).

**CSS Variable conventions:**

```css
/* Design tokens — define on :root */
:root {
  --color-primary: #0057d9;
  --spacing-md: 1rem;
  --radius-sm: 4px;
  --font-size-base: 1rem;
}
```

---

## Accessibility (a11y)

Accessibility is a first-class requirement, not an afterthought.

- Follow **WCAG 2.1 AA** as the baseline standard.
- Use semantic HTML elements before reaching for ARIA (`<button>`, `<nav>`, `<main>`, `<section>`, etc.).
- Add ARIA attributes only when semantic HTML is insufficient — never use ARIA to fix broken semantics.
- All interactive elements must be keyboard navigable and have a visible focus style.
- All images require descriptive `alt` text; decorative images use `alt=""`.
- Color must never be the sole means of conveying information.
- Use `aria-live` regions for dynamic content updates (toasts, status messages).
- Maintain a logical heading hierarchy (`h1` → `h2` → `h3`); do not skip levels.
- Form inputs must have associated `<label>` elements (explicit `htmlFor` or wrapping label).
- Target touch/click areas must be at least 44×44px.

---

## Linting and Formatting

All projects must enforce the following tools via CI. No exceptions.

### ESLint

- Use the modern flat config format (`eslint.config.js` / `eslint.config.mjs`).
- Required rule sets:
  - `eslint:recommended`
  - `plugin:react/recommended`
  - `plugin:react-hooks/recommended`
  - `plugin:jsx-a11y/recommended`
  - `plugin:@typescript-eslint/recommended`
- `react/react-in-jsx-scope` — disable (not needed with modern JSX transform).
- `no-console` — warn in development, error in CI.
- `@typescript-eslint/no-explicit-any` — error.
- `jsx-a11y` rules must never be disabled without a documented justification.

### Prettier

- Single source of truth for all code formatting — never configure formatting rules in ESLint.
- All projects must include a `.prettierrc` at the repo root. Required rules:

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

- Run `prettier --check` in CI; fail the build on formatting violations.

### VS Code

Every project must include a `.vscode/settings.json` that sets Prettier as the default formatter, points to `.prettierrc`, and enables format-on-save:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "prettier.configPath": ".prettierrc",
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

- `"prettier.configPath": ".prettierrc"` ensures the extension reads from the project config, not any global user settings.
- This ensures every contributor's editor formats consistently without manual configuration.
- Do not commit `.vscode/extensions.json` or other personal editor preferences — only formatter settings belong here.

---

## Testing

Testing is mandatory. All new features and bug fixes must include tests.

### Jest + React Testing Library

- Unit and integration tests for components and hooks.
- Test behavior, not implementation — query by role, label, and text, not by class or test ID unless unavoidable.
- Prefer `userEvent` over `fireEvent` for simulating user interactions.
- Aim for meaningful coverage, not 100% line coverage for its own sake — focus on critical paths and edge cases.
- Mock only at the boundary (API calls, third-party modules) — do not over-mock.

### Coverage

All projects must configure Jest coverage in `jest.config.ts`:

- `collectCoverageFrom` — include `src/**/*.{ts,tsx}`; exclude `*.d.ts`, `__mocks__`, and `main.tsx` (entry point tested by E2E).
- `coverageReporters: ['text', 'html', 'lcov']` — text for the terminal, HTML for local inspection, lcov for CI artifacts.
- `coverageDirectory: 'coverage'` — output directory (must be git-ignored).
- `coverageThreshold` — enforce a global minimum of **80%** for branches, functions, lines, and statements. Raise the threshold as the project matures; never lower it.

Run coverage locally with:

```bash
npm run test:coverage
```

Coverage reports are uploaded as a CI artifact (`coverage-report`) on every deploy workflow run and retained for 30 days.

### jest-axe

- **Every component test must include an axe accessibility assertion.**
- Run `axe` on the rendered output and assert no violations:

```ts
import { axe, toHaveNoViolations } from 'jest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<MyComponent />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

- A failing axe assertion blocks merging — treat a11y violations as bugs.

### Playwright

- **E2E tests are required for every critical user flow.** This includes: all primary CRUD operations, any multi-step flow, and data persistence (verify state survives a page reload).
- Tests live in `e2e/` at the project root, split by concern: `<feature>.spec.ts` for user flows, `accessibility.spec.ts` for axe checks.
- Configure `playwright.config.ts` with a `webServer` block so `npm run test:e2e` starts the dev server automatically.
- Use `getByRole`, `getByLabel`, and `getByText` locators — avoid CSS selectors and `data-testid` where possible.
- Each test must be independent. Use `page.addInitScript(() => localStorage.clear())` (or equivalent) in `beforeEach` to reset client-side state before every test.
- **Run `@axe-core/playwright` on every key page/state** in a dedicated `accessibility.spec.ts`. A violation fails the build.
- In CI, set `forbidOnly: !!process.env.CI` and `retries: 2` in the Playwright config.
- Run locally with `npm run test:e2e`; use `npm run test:e2e:ui` for the interactive Playwright UI.

---

## Application File Structure

Organize source files by feature/domain, not by type. Group everything related to a feature together so it can be reasoned about and deleted as a unit.

### Top-level `src/` layout

```
src/
├── assets/            # Static assets (images, fonts, icons)
├── components/        # Shared, reusable UI components
├── features/          # Feature modules (see structure below)
├── hooks/             # Shared custom hooks
├── pages/             # Route-level page components (or app/ for Next.js)
├── services/          # API clients, third-party service wrappers
├── store/             # Global state (Redux store, slices, context providers)
├── styles/            # Global styles, CSS custom properties, resets
├── types/             # Shared TypeScript types and interfaces
└── utils/             # Pure utility functions
```

### Component folder structure

Each component lives in its own folder. All related files are colocated:

```
ComponentName/
├── index.tsx               # Component implementation and named export
├── ComponentName.module.css  # Scoped styles (CSS Modules)
├── ComponentName.test.tsx  # Unit/integration tests
└── ComponentName.types.ts  # Local TypeScript types (if non-trivial)
```

### Feature folder structure

Features encapsulate a vertical slice of the application:

```
features/
└── FeatureName/
    ├── components/         # UI components used only by this feature
    ├── hooks/              # Hooks scoped to this feature
    ├── types.ts            # Feature-specific TypeScript types
    ├── utils.ts            # Feature-specific utilities
    └── index.ts            # Public API — export only what other features need
```

**Rules:**

- Never import directly from a feature's internal files from outside that feature — use its `index.ts` barrel export.
- Shared components used by 2+ features belong in `src/components/`, not inside a feature.
- Shared hooks used by 2+ features belong in `src/hooks/`.
- Do not create `index.ts` barrel files in `src/components/` or `src/hooks/` — import from the component folder directly to avoid re-export chains that hurt tree-shaking.
- Keep `src/utils/` for pure, stateless functions only — no React, no side effects.
- Test files live next to the file they test, not in a separate `__tests__/` directory.

---

## Component Architecture

- One component per file; filename matches the component name (PascalCase).
- Keep components small and single-responsibility — if a component exceeds ~150 lines, consider splitting it.
- Separate concerns: data fetching in hooks or parent containers, pure rendering in presentational components.
- Colocate related files: `ComponentName/index.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`.
- Export components as named exports; use default exports only at page/route boundaries.
- Avoid prop drilling beyond 2 levels — use Context or lift state appropriately.

---

## TypeScript Standards

- Enable `strict` mode in `tsconfig.json` — non-negotiable.
- Type all component props with explicit interfaces or type aliases; never use implicit `any`.
- Avoid type assertions (`as`) unless working with third-party boundaries — document why if used.
- Prefer `interface` for object shapes that may be extended; use `type` for unions, intersections, and utility types.
- Use `React.FC` sparingly — prefer typing props directly on the function signature.
- Define API response shapes explicitly; do not infer types from untyped `fetch` responses.

---

## Framework Choices

### Vite (Preferred for SPAs and component libraries)

Use **Vite** when:

- building a standalone React SPA
- building a component library
- fast local dev startup is a priority

### Next.js (Preferred for full-stack and public-facing apps)

Use **Next.js** when:

- building a full-stack web application
- SEO is a requirement
- server-side rendering or static generation is needed
- API routes are needed

Benefits: file-based routing, server components, built-in image optimization, ISR/SSG/SSR.

---

## Dependency Security

Before installing any npm package, audit it for known vulnerabilities and supply-chain risk. A package with a high or critical severity vulnerability must not be installed — find a safe alternative instead.

### Pre-install checklist

Run all three checks before adding a new dependency:

```bash
# 1. Check the package's published vulnerability history
npm audit --package-lock-only   # after a dry-run add, before committing

# 2. Inspect the package directly on the npm advisory database
#    https://www.npmjs.com/advisories  (search by package name)

# 3. Review basic health signals on npm
#    - Weekly downloads (prefer packages with broad adoption)
#    - Last publish date (unmaintained = higher risk)
#    - Number of open issues / CVEs on GitHub
```

### Severity policy

| Severity | Action |
| -------- | ------ |
| **Critical** | Do not install. Find an alternative. |
| **High** | Do not install. Find an alternative. |
| **Moderate** | Investigate. Only install if no viable alternative exists and the vulnerability does not affect your usage; document why. |
| **Low / Info** | Acceptable with awareness; monitor for patches. |

### Finding alternatives

If a preferred package has high/critical vulnerabilities:

1. Search for actively maintained forks or drop-in replacements.
2. Check if the vulnerability is in a dependency of the dependency (`npm explain <package>`) — if the vulnerable transitive dep is not reachable from your code path, document this explicitly.
3. Consider implementing the functionality natively if the package is small-scope (e.g. a single utility function).
4. If no safe alternative exists, escalate to the team rather than installing a known-vulnerable package.

### Transitive dependencies

Transitive (indirect) dependencies are packages pulled in by your direct dependencies. They appear in `node_modules` and `package-lock.json` but not in your `package.json`, which makes them easy to overlook — yet they are equally capable of introducing vulnerabilities.

**Inspecting the dependency tree**

```bash
# See every path that introduces a specific package
npm explain <package-name>

# List all versions of a package resolved in the tree
npm ls <package-name>

# Full audit report with dep paths
npm audit --json | jq '.vulnerabilities'
```

**Rules**

- When `npm audit` reports a vulnerability in a transitive dependency, trace the full path with `npm explain <package>` before deciding how to act.
- If the vulnerable transitive package is not reachable from your code path (e.g. it is only used in a dev-only build step that never runs in production), document this explicitly in a comment near the relevant `package.json` entry or in a `SECURITY.md` note.
- If the vulnerable transitive package **is** reachable, treat it with the same severity policy as a direct dependency — do not install or retain it if severity is high or critical.

**Forcing a safe version with `overrides`**

When a direct dependency pulls in a vulnerable transitive package and no updated version of the direct dependency is available, use the `overrides` field in `package.json` to pin the transitive package to a patched version:

```json
{
  "overrides": {
    "vulnerable-transitive-package": ">=2.3.1"
  }
}
```

- Always include a comment in a companion `SECURITY.md` or PR description explaining which CVE the override addresses and when it can be removed (e.g. when the direct dependency ships an update).
- Re-run `npm install` and `npm audit` after adding an override to confirm the vulnerability is resolved.
- Review and remove stale overrides whenever the direct dependency is upgraded — an override that is no longer needed becomes maintenance debt.

**Keeping transitive deps current**

- Run `npm audit fix` regularly. Prefer `--dry-run` first to review proposed changes before applying them.
- Use `npm audit fix --force` only when you understand what major-version bumps it will introduce — it can introduce breaking changes.
- Review the full `package-lock.json` diff in every PR that touches dependencies, not just `package.json`.

---

### Ongoing maintenance

- Run `npm audit` as part of the CI pipeline. A **high or critical** finding fails the build.
- Review `npm outdated` regularly and keep dependencies current.
- Pin exact versions (`--save-exact`) for security-sensitive packages so patch-level updates are deliberate, not automatic.

---

## Code Quality Rules

- **All ESLint errors must be resolved before a task is considered complete.** Run `npm run lint` and fix every error. Warnings may be left if they are intentional, but errors are blocking.
- **All TypeScript errors must be resolved before a task is considered complete.** Run `npx tsc --noEmit` and fix every type error. Do not use `@ts-ignore` or `@ts-expect-error` to suppress errors without a documented justification in a comment.
- **All unit, integration, and E2E tests must pass before a task is considered complete.** Run `npm test` (Jest) and `npm run test:e2e` (Playwright). A failing test is a blocking issue — do not mark work done while tests are red.
- No commented-out code committed to main — delete it or open a ticket.
- No `TODO` comments without a linked issue.
- No magic numbers — extract constants with descriptive names.
- No direct DOM manipulation — use React refs (`useRef`) when necessary.
- Avoid `useEffect` for things that can be derived from state or handled by event handlers.
- Never suppress ESLint rules inline (`// eslint-disable-next-line`) without a comment explaining why.
