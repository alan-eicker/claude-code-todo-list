# Testing

Testing is mandatory. All new features and bug fixes must include tests.

## Jest + React Testing Library

- Unit and integration tests for components and hooks.
- Test behavior, not implementation — query by role, label, and text, not by class or test ID unless unavoidable.
- Prefer `userEvent` over `fireEvent` for simulating user interactions.
- Aim for meaningful coverage, not 100% line coverage for its own sake — focus on critical paths and edge cases.
- Mock only at the boundary (API calls, third-party modules) — do not over-mock.
- Every test suite that reads or writes `localStorage` must call `localStorage.clear()` in `beforeEach`. Never rely on test ordering to provide a clean slate.
- Logic-only hooks (no rendered DOM output) cannot be passed to `axe`. Import `jest-axe` anyway to satisfy the project convention, mark the imports as intentionally unused with `void`, and include a comment explaining why no axe assertion is present:
  ```ts
  // Note: this hook renders no DOM — axe imported to satisfy project convention.
  void axe;
  void toHaveNoViolations;
  ```
- Shared test fixtures (mock objects, test data) must be module-level constants defined before the `describe` block, not inside individual `it` callbacks. This avoids accidental mutation across tests and keeps setup readable.
- jsdom is missing several browser APIs used by this project. Add all polyfills and stubs to `src/setupTests.ts` — do not patch globals inline inside individual test files. Current required stubs: `crypto.randomUUID` (via Node's built-in `crypto`), `window.matchMedia`.

## Coverage

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

## jest-axe

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

## Playwright

- **E2E tests are required for every critical user flow.** This includes: all primary CRUD operations, any multi-step flow, and data persistence (verify state survives a page reload).
- Tests live in `e2e/` at the project root, split by concern: `<feature>.spec.ts` for user flows, `accessibility.spec.ts` for axe checks.
- Configure `playwright.config.ts` with a `webServer` block so `npm run test:e2e` starts the dev server automatically.
- Use `getByRole`, `getByLabel`, and `getByText` locators — avoid CSS selectors and `data-testid` where possible.
- Each test must be independent. Reset `localStorage` in `beforeEach` using the `goto + evaluate(clear) + reload` pattern — **not** `addInitScript`. Using `addInitScript` re-runs the clear on every subsequent `reload`, which breaks persistence tests that intentionally reload to verify saved state:
  ```ts
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });
  ```
- Repeated or ambiguous locators that require scoping (e.g. filter buttons inside a `<nav>`) must be extracted into a named helper function at the top of the spec file rather than duplicated inline:
  ```ts
  const filterNav = (page: Page) => page.getByRole('navigation', { name: 'Filter todos' });
  ```
- **Run `@axe-core/playwright` on every key page/state** in a dedicated `accessibility.spec.ts`. A violation fails the build.
- In CI, set `forbidOnly: !!process.env.CI` and `retries: 2` in the Playwright config.
- Run locally with `npm run test:e2e`; use `npm run test:e2e:ui` for the interactive Playwright UI.
