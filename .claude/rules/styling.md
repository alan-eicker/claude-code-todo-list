# Styling

- **CSS Modules** — required for all component-scoped styles.
- **CSS Custom Properties (CSS Variables)** — use for design tokens: colors, spacing, typography, radii, shadows.
- **Container Queries** — prefer over media queries when the layout depends on the component's container width, not the viewport. Use `@container` for component-level responsiveness and reserve `@media` for true viewport-level breakpoints (e.g., global layout shifts).
- No inline styles except for truly dynamic values (e.g., calculated widths set via JS).
- No CSS-in-JS libraries (styled-components, Emotion, etc.).
- Use `color-mix()` for semi-transparent tints rather than hardcoded `rgba` values. This keeps tints relative to the design token and automatically adapts when the token changes:
  ```css
  /* Preferred */
  background-color: color-mix(in srgb, var(--color-primary) 8%, transparent);
  /* Avoid */
  background-color: rgba(79, 70, 229, 0.08);
  ```
- Use `min-height: 100dvh` (dynamic viewport height) rather than `100vh` for full-height layouts. `100vh` does not account for the collapsible address bar on mobile browsers, which causes layout overflow on first load.

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
