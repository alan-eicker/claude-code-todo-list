# Component Architecture

- One component per file; filename matches the component name (PascalCase).
- Keep components small and single-responsibility — if a component exceeds ~150 lines, consider splitting it.
- Separate concerns: data fetching in hooks or parent containers, pure rendering in presentational components.
- Colocate related files: `ComponentName/index.tsx`, `ComponentName.module.css`, `ComponentName.test.tsx`.
- Export components as named exports; use default exports only at page/route boundaries.
- Avoid prop drilling beyond 2 levels — use Context or lift state appropriately.
- `React.memo` and `useCallback` must always be used together on list-item components. `React.memo` alone provides no benefit if the parent passes new function references on every render. Wrap the child with `memo` and stabilise every callback prop with `useCallback` in the parent hook:

  ```ts
  // In the hook — stable references
  const toggleTodo = useCallback((id: string) => dispatch(...), [dispatch]);

  // On the component — bail out of re-renders when props are unchanged
  export const TodoItem = memo(TodoItemComponent);
  ```

  When wrapping an arrow function component in `memo`, define the component as a named const first (`TodoItemComponent`) and then export the memoised version (`export const TodoItem = memo(TodoItemComponent)`) so React DevTools and the `react/display-name` lint rule can identify the component correctly.

- Private sub-components used exclusively within one parent file (e.g. icon components like `SunIcon`, `MoonIcon`) may be defined in the same file above the main export. They do not need their own folder. Apply the same rules as any component: arrow function, explicit props interface, `aria-hidden="true"` if decorative.
- Use `crypto.randomUUID()` for client-side ID generation. It is available natively in all modern browsers and in Node 19+. Do not install `uuid`, `nanoid`, or similar libraries for this purpose. Polyfill it in `setupTests.ts` for Jest (jsdom does not expose it by default).
- Enumerable UI options that drive a rendered list (e.g. filter buttons) must be defined as a typed module-level constant rather than inline JSX, keeping the render function declarative:
  ```ts
  const FILTERS: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
  ];
  ```
