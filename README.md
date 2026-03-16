# Todo List

A lightweight, accessible todo app built with React and TypeScript. Todos persist across page reloads via `localStorage` and the UI supports both light and dark themes.

**Live demo:** https://alan-eicker.github.io/claude-code-todo-list/

---

## Tech stack

| Layer | Tool |
|---|---|
| UI | React 18 |
| Language | TypeScript 5 (strict mode) |
| Build | webpack 5 + Babel |
| Styling | CSS Modules + CSS custom properties |
| Unit tests | Jest 29 + React Testing Library + jest-axe |
| E2E tests | Playwright + @axe-core/playwright |
| Linting | ESLint 9 (flat config) |
| Formatting | Prettier |

---

## Prerequisites

- **Node.js 20+** — the CI pipeline runs on Node 20; using an older version may produce unexpected results.
- **npm 10+** — comes bundled with Node 20.

---

## Getting started

```bash
# 1. Clone the repository
git clone https://github.com/alan-eicker/claude-code-todo-list.git
cd claude-code-todo-list

# 2. Install dependencies
npm install

# 3. Install Playwright browsers (required for E2E tests)
npx playwright install --with-deps chromium

# 4. Start the development server
npm run dev
```

The app is served at `http://localhost:8080`.

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the webpack development server at `http://localhost:8080` |
| `npm run build` | Produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally via `npx serve` |
| `npm run lint` | Run ESLint across the entire project |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing (used in CI) |
| `npm test` | Run all Jest unit and integration tests |
| `npm run test:watch` | Run Jest in watch mode |
| `npm run test:coverage` | Run Jest and generate a coverage report in `coverage/` |
| `npm run test:e2e` | Run all Playwright E2E tests (starts the dev server automatically) |
| `npm run test:e2e:ui` | Open the Playwright interactive UI |
| `npm run test:e2e:debug` | Run E2E tests in debug mode |

---

## Project structure

```
todo-list/
├── e2e/                          # Playwright E2E tests
│   ├── todo-app.spec.ts          # Feature and user-flow tests
│   └── accessibility.spec.ts     # Axe accessibility checks
├── src/
│   ├── components/               # Shared, reusable UI components
│   │   └── ThemeToggle/
│   ├── features/                 # Feature modules (vertical slices)
│   │   └── Todos/
│   │       ├── components/       # UI components scoped to this feature
│   │       │   ├── TodoFilter/
│   │       │   ├── TodoForm/
│   │       │   ├── TodoItem/
│   │       │   └── TodoList/
│   │       ├── hooks/
│   │       │   └── useTodos.ts   # State management for the todo feature
│   │       ├── types.ts          # Feature-specific TypeScript types
│   │       └── index.ts          # Public barrel export
│   ├── hooks/                    # Shared custom hooks
│   │   ├── usePersistedReducer.ts  # localStorage persistence wrapper
│   │   └── useTheme.ts           # Light/dark theme management
│   ├── styles/
│   │   └── global.css            # CSS design tokens and global resets
│   ├── App.tsx
│   ├── main.tsx
│   └── setupTests.ts             # Jest global setup (jsdom polyfills)
├── .github/workflows/
│   └── deploy.yml                # CI/CD pipeline (test → deploy to GitHub Pages)
├── .vscode/
│   └── settings.json             # Prettier format-on-save config
├── eslint.config.mjs
├── jest.config.ts
├── playwright.config.ts
├── webpack.config.js
├── tsconfig.json                 # Root — composite project references only
├── tsconfig.app.json             # App source type-checking (browser target)
├── tsconfig.test.json            # Jest/ts-jest overrides (Node/CommonJS target)
└── CLAUDE.md                     # Engineering standards and AI coding guidelines
```

Each component follows the colocation pattern:

```
ComponentName/
├── index.tsx
├── ComponentName.module.css
└── ComponentName.test.tsx
```

---

## Architecture overview

### State management

The `Todos` feature uses a `useReducer`-based approach with a discriminated union action type. State is persisted to `localStorage` via the shared `usePersistedReducer` hook, which hydrates from storage on mount and syncs on every dispatch.

```
App
 └── useTodos          (state + actions via usePersistedReducer)
      ├── TodoForm      (local input state via useState)
      ├── TodoFilter    (reads filter, dispatches SET_FILTER)
      └── TodoList
           └── TodoItem (memoised; receives stable callbacks via useCallback)
```

### Theming

Theme preference (`light` | `dark`) is stored under the `theme-preference` key in `localStorage`. An inline `<script>` in `index.html` reads this value and sets `data-theme` on `<html>` before the first paint, preventing a flash of the wrong colour scheme. The `useTheme` hook then manages subsequent toggles.

### Persistence

All user-generated state goes through `usePersistedReducer`. Direct `localStorage` reads and writes in components are prohibited — use the hook.

### TypeScript configuration

The project uses three tsconfig files, each with a distinct purpose:

| File | Purpose |
|---|---|
| `tsconfig.json` | Root config. Contains no compiler options — acts only as a composite project reference pointer for `tsc` and VS Code. |
| `tsconfig.app.json` | Used for type-checking application source (`src/`). Targets modern browsers (`ES2020`, DOM libs), enforces `strict` mode, and sets `noEmit: true` since webpack/Babel handle transpilation. |
| `tsconfig.test.json` | Used by Jest via `ts-jest`. Overrides `module: "CommonJS"` and `moduleResolution: "node"` because Jest runs in Node, not a browser bundler. Also sets `noEmit: false` so ts-jest can emit code to execute. |

The separation prevents test-environment overrides (CommonJS modules, Node resolution) from leaking into the app type-check and vice versa. Always run `npx tsc --noEmit` against `tsconfig.app.json` (the default) to validate application types.

---

## Testing

### Unit and integration tests (Jest)

```bash
npm test                  # run all tests
npm run test:coverage     # run with coverage report
```

Coverage thresholds are enforced at **80%** for branches, functions, lines, and statements. The build fails if any threshold is not met.

Every component test includes an `axe` accessibility assertion via `jest-axe`. A failing axe check is treated as a bug and blocks merging.

### E2E tests (Playwright)

```bash
npm run test:e2e          # headless Chromium, starts dev server automatically
npm run test:e2e:ui       # interactive Playwright UI
npm run test:e2e:debug    # step through tests with the Playwright inspector
```

E2E tests cover all primary CRUD operations, filtering, data persistence across page reloads, theme toggling, and full-page axe scans. Each test resets `localStorage` before running to ensure isolation.

The Playwright report is written to `playwright-report/`. Open `playwright-report/index.html` to inspect results after a run.

---

## Deployment

Deployment is fully automated via GitHub Actions. It is triggered by pushing a version tag to the `master` branch.

### Release process

```bash
# 1. Bump the version in package.json
npm version patch   # or minor / major

# 2. Push the commit and the generated tag
git push origin master --follow-tags
```

The workflow (`.github/workflows/deploy.yml`) will:

1. Verify the tag is on `master`
2. Run lint, type-check, Jest (with coverage), and Playwright
3. Upload the coverage report as a CI artifact (retained for 30 days)
4. Build the app with the correct GitHub Pages base path
5. Deploy `dist/` to GitHub Pages

**The deploy job will not run if any test step fails.**

### Manual production preview

To verify the production build locally before tagging a release:

```bash
npm run build
npm run preview
```

This is the correct way to run Lighthouse audits — the dev server produces artificially low performance scores.

---

## Editor setup

The repo includes `.vscode/settings.json` that configures Prettier as the default formatter with format-on-save enabled. Install the [Prettier – Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) VS Code extension and formatting will work automatically.

No additional editor configuration is required.

---

## Contributing

### Before you start

1. Read `CLAUDE.md` — it defines the engineering standards for this project, covering state management, styling, accessibility, testing, performance, and security. All rules there apply to every contribution.

### Completion gates

A task is not done until all four gates pass locally:

```bash
npm run lint              # zero errors
npx tsc --noEmit          # zero type errors
npm test                  # all tests pass, coverage ≥ 80%
npm run test:e2e          # all E2E tests pass
```

CI enforces the same gates on every tagged release. Do not open a PR with failing checks.

### Key conventions

- **Arrow functions everywhere** — no `function` declarations for components or hooks.
- **Named exports** — default exports only at page/route boundaries.
- **Feature barrel imports** — import from `src/features/Todos` (the `index.ts`), never from internal feature paths.
- **No direct `localStorage` access** — use `usePersistedReducer` for persistent state.
- **New components require tests** — including at minimum an axe assertion and a render smoke test.
- **New E2E flows go in the appropriate spec file** — feature flows in `todo-app.spec.ts`, accessibility checks in `accessibility.spec.ts`.
