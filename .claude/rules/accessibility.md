# Accessibility (a11y)

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
- Decorative inline SVGs must carry **both** `aria-hidden="true"` and `focusable="false"`. The `aria-hidden` hides the element from the accessibility tree; `focusable="false"` is still required for IE/legacy Edge which otherwise allows SVG elements to receive focus independently.
- Toggle and filter buttons must use `aria-pressed` (not just a visual active class) to communicate state to assistive technology. `aria-pressed` must always be an explicit `"true"` or `"false"` string — never absent.
- Dynamic text that updates without a page navigation (item counts, status messages) must use `aria-live="polite"` and `aria-atomic="true"` so screen readers announce the full updated string rather than just the changed characters.
- Forms that implement custom JavaScript validation must include `noValidate` on the `<form>` element to suppress the browser's native validation UI and prevent duplicate or inconsistent error messaging.
