import { useReducer, useEffect, type Reducer, type Dispatch } from 'react';

/**
 * Wraps useReducer with localStorage persistence. State is hydrated from
 * localStorage on mount and synced back on every dispatch. Falls back to
 * initialState if the stored value is missing or unparseable.
 *
 * The key should be stable (a constant) — changing it at runtime is not supported.
 */
const usePersistedReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  storageKey: string,
): [S, Dispatch<A>] => {
  const [state, dispatch] = useReducer(reducer, initialState, (init: S): S => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored !== null ? (JSON.parse(stored) as S) : init;
    } catch {
      return init;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Storage may be unavailable (private mode, quota exceeded, etc.)
    }
  }, [storageKey, state]);

  return [state, dispatch];
};

export { usePersistedReducer };
