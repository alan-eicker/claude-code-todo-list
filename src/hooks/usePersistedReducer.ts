import { useState, useEffect, useCallback, useRef, type Reducer, type Dispatch } from 'react';
import { idbGet, idbSet } from '../utils/idb';

/**
 * Wraps a reducer with IndexedDB persistence. State is hydrated from IndexedDB
 * after mount (async) and synced back on every dispatch.
 *
 * Because IndexedDB is asynchronous, the hook returns initialState on the first
 * render and updates once the stored value has been read. This is imperceptible
 * in practice given IndexedDB's speed, but callers should not assume state is
 * fully hydrated on the first render.
 *
 * The key should be stable (a constant) — changing it at runtime is not supported.
 *
 * Note: theme preference is intentionally kept in localStorage (not IndexedDB)
 * because the inline script in index.html must read it synchronously before the
 * first paint to prevent a flash of the wrong colour scheme. IndexedDB is
 * async-only and cannot be used for that purpose.
 */
const usePersistedReducer = <S, A>(
  reducer: Reducer<S, A>,
  initialState: S,
  storageKey: string,
): [S, Dispatch<A>] => {
  const [state, setState] = useState<S>(initialState);

  // Keep a ref in sync so the dispatch closure always reads the latest state
  // without needing to be re-created on every render.
  const stateRef = useRef<S>(initialState);
  stateRef.current = state;

  // Skip the very first persist to avoid overwriting a previously stored value
  // with initialState before the async idbGet (hydrate effect) has returned.
  // All subsequent renders — including the one triggered by hydration — persist
  // state normally.
  const skipFirstPersist = useRef(true);

  const dispatch = useCallback<Dispatch<A>>(
    (action) => {
      const next = reducer(stateRef.current, action);
      stateRef.current = next;
      setState(next);
    },
    [reducer],
  );

  // Hydrate from IndexedDB after mount.
  useEffect(() => {
    idbGet<S>(storageKey)
      .then((stored) => {
        if (stored !== undefined) {
          stateRef.current = stored;
          setState(stored);
        }
      })
      .catch(() => {
        // IndexedDB unavailable — retain initialState.
      });
  }, [storageKey]);

  // Persist to IndexedDB whenever state changes. The initial render is skipped
  // to prevent overwriting stored state with initialState before the async
  // hydrate read above completes.
  useEffect(() => {
    if (skipFirstPersist.current) {
      skipFirstPersist.current = false;
      return;
    }
    idbSet(storageKey, state).catch(() => {
      // Ignore write errors (e.g. storage quota exceeded).
    });
  }, [storageKey, state]);

  return [state, dispatch];
};

export { usePersistedReducer };
