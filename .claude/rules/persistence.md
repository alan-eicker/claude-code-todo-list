# Client-Side Persistence

User-generated state must survive a page refresh. Do not leave state ephemeral unless it is intentionally transient (e.g., a modal open/close flag).

## IndexedDB (primary persistence store)

- Use **IndexedDB** to persist all user-generated state. It is the only storage mechanism that handles structured data, large payloads, and concurrent reads/writes correctly.
- Never call `indexedDB` directly in components or hooks — use the shared helpers in `src/utils/idb.ts` (`idbGet`, `idbSet`) and access them exclusively via the **`usePersistedReducer`** hook (`src/hooks/usePersistedReducer.ts`).
- Use a **stable, namespaced key** per feature (e.g. `'todo-list'`, `'user-preferences'`). Define keys as constants, not inline strings.
- Because IndexedDB is **asynchronous**, the hook hydrates state after mount. The app renders with `initialState` on the first render and updates once the stored value is read. Do not assume state is fully hydrated on the first render.
- Always handle IndexedDB errors silently with `.catch()` — storage can be unavailable (private browsing, quota exceeded). Fall back to `initialState` gracefully rather than crashing.
- When the stored schema changes, handle migration or clear stale data on read rather than crashing.
- Never store sensitive data (tokens, passwords, PII) in IndexedDB — use an httpOnly cookie instead.
- In tests, use `fake-indexeddb` to mock IndexedDB. A fresh `IDBFactory` instance is created before every test in `setupTests.ts` to guarantee isolation. In Playwright E2E tests, call `indexedDB.deleteDatabase('todo-list-db')` in `beforeEach` to reset state.

## localStorage (theme preference only)

- `localStorage` is used **exclusively** for the `theme-preference` key. This is a deliberate exception: the inline `<script>` in `index.html` must read the stored theme synchronously before the first paint to prevent a flash of the wrong colour scheme. IndexedDB is async-only and cannot serve this purpose.
- Do not use `localStorage` for any other state. All other persistent state goes through IndexedDB via `usePersistedReducer`.
- Always wrap `localStorage` access in `try/catch` — it can be unavailable in private browsing or cross-origin contexts.
- Never store sensitive data (tokens, passwords, PII) in `localStorage`.
