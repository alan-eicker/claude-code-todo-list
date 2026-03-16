import { renderHook, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { usePersistedReducer } from './usePersistedReducer';

expect.extend(toHaveNoViolations);

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
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes with provided initial state when nothing is stored', () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    expect(result.current[0]).toEqual(INITIAL);
  });

  it('persists state to localStorage after dispatch', () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    act(() => result.current[1]({ type: 'INCREMENT' }));
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({ count: 1 });
  });

  it('restores state from localStorage on mount', () => {
    localStorage.setItem(KEY, JSON.stringify({ count: 7 }));
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    expect(result.current[0]).toEqual({ count: 7 });
  });

  it('falls back to initial state when stored value is invalid JSON', () => {
    localStorage.setItem(KEY, 'not-valid-json%%');
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    expect(result.current[0]).toEqual(INITIAL);
  });

  it('updates localStorage on each subsequent dispatch', () => {
    const { result } = renderHook(() => usePersistedReducer(reducer, INITIAL, KEY));
    act(() => result.current[1]({ type: 'INCREMENT' }));
    act(() => result.current[1]({ type: 'INCREMENT' }));
    act(() => result.current[1]({ type: 'DECREMENT' }));
    expect(JSON.parse(localStorage.getItem(KEY) ?? '{}')).toEqual({ count: 1 });
  });
});

// Note: usePersistedReducer is a logic-only hook with no rendered output,
// so there is no DOM to run axe against. The axe import is kept to satisfy
// the project convention — tests for hooks that render UI should include it.
void axe; // referenced to avoid unused-import lint errors
void toHaveNoViolations;
