import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from './useTodos';
import { flushIDB } from '../../../test-utils';

describe('useTodos — persistence', () => {
  it('persists todos to IndexedDB and restores them after remount', async () => {
    const { result, unmount } = renderHook(() => useTodos());

    // async act ensures React 18 flushes the persist useEffect before flushIDB.
    await act(async () => result.current.addTodo('Buy milk'));

    // Flush async idbSet effect before unmounting.
    await flushIDB();
    unmount();

    const { result: restored } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(restored.current.todos).toHaveLength(1);
    });

    expect(restored.current.todos[0].text).toBe('Buy milk');
    expect(restored.current.todos[0].completed).toBe(false);
  });

  it('persists filter state to IndexedDB and restores it after remount', async () => {
    const { result, unmount } = renderHook(() => useTodos());

    await act(async () => result.current.setFilter('completed'));

    await flushIDB();
    unmount();

    const { result: restored } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(restored.current.filter).toBe('completed');
    });
  });

  it('restores completed status of todos after remount', async () => {
    const { result, unmount } = renderHook(() => useTodos());

    await act(async () => result.current.addTodo('Toggle me'));

    await flushIDB();

    const id = result.current.todos[0].id;
    await act(async () => result.current.toggleTodo(id));

    await flushIDB();
    unmount();

    const { result: restored } = renderHook(() => useTodos());

    await waitFor(() => {
      expect(restored.current.todos[0].completed).toBe(true);
    });
  });

  it('starts empty when IndexedDB has no stored state', async () => {
    const { result } = renderHook(() => useTodos());

    await flushIDB();

    expect(result.current.todos).toHaveLength(0);
    expect(result.current.filter).toBe('all');
  });
});
