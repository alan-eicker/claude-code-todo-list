# State Management

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

**Reducer conventions:**

- Action types must be discriminated unions with `UPPER_SNAKE_CASE` string literals:
  ```ts
  type TodoAction =
    | { type: 'ADD_TODO'; payload: string }
    | { type: 'TOGGLE_TODO'; payload: string };
  ```
- Reducers must use exhaustive `switch` statements. Do not add a `default` case when TypeScript fully narrows the union — a missing case becomes a compile error, which is the desired behaviour.
- Custom hooks that return more than one value must export a named return type interface so callers can type destructured values explicitly:
  ```ts
  export interface UseTodosReturn {
    todos: Todo[];
    addTodo: (text: string) => void;
    // ...
  }
  export const useTodos = (): UseTodosReturn => { ... };
  ```

## Data Fetching

- Use **TanStack Query (React Query)** for all async server state.
- Use the **native `fetch` API** — avoid axios unless there is a specific need (e.g., request interceptors at scale).
- Separate server state (TanStack Query) from client/UI state (React state or Redux).
- Always handle loading, error, and empty states explicitly.
