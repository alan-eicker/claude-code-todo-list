import { renderHook, act, waitFor } from '@testing-library/react';
import { usePersistedReducer } from './usePersistedReducer';
import { flushIDB } from '../test-utils';

type CountState = { count: number };
type CountAction = { type: 'INCREMENT' } | { type: 'DECREMENT' };

const reducer = (state: CountState, action: CountAction): CountState => {
  switch (action.type) {
    case 'INCREMENT':
      return { count: state.count + 1 };
    case 'DECREMENT':
      return { count: state.count - 1 };
  }
};

const INITIAL: CountState = { count: 0 };
const KEY = 'test-persisted-reducer';

describe('usePersistedReducer', () => {
  it('initializes with provided initial state on first render', () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    expect(result.current[0]).toEqual(INITIAL);
  });

  it('updates state immediately when dispatching an action', async () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    // Use async act so React 18 flushes the useEffect (persist) before we assert.
    await act(async () => result.current[1]({ type: 'INCREMENT' }));
    expect(result.current[0]).toEqual({ count: 1 });
  });

  it('persists state to IndexedDB and restores it after remount', async () => {
    const { result, unmount } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));

    // async act ensures React 18 flushes the persist useEffect before flushIDB.
    await act(async () => result.current[1]({ type: 'INCREMENT' }));

    // Allow the async idbSet effect to flush before unmounting.
    await flushIDB();

    unmount();

    const { result: restored } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));

    await waitFor(() => {
      expect(restored.current[0]).toEqual({ count: 1 });
    });
  });

  it('restores state correctly after multiple dispatches', async () => {
    const { result, unmount } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));

    await act(async () => result.current[1]({ type: 'INCREMENT' }));
    await act(async () => result.current[1]({ type: 'INCREMENT' }));
    await act(async () => result.current[1]({ type: 'DECREMENT' }));

    await flushIDB();
    unmount();

    const { result: restored } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));

    await waitFor(() => {
      expect(restored.current[0]).toEqual({ count: 1 });
    });
  });

  it('returns initialState when nothing has been stored', async () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));

    // Wait for the hydration effect to settle — nothing is stored so state
    // should remain at initialState.
    await flushIDB();
    expect(result.current[0]).toEqual(INITIAL);
  });
});
