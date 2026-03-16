import { renderHook, act } from '@testing-library/react';
import { useTodos } from './useTodos';

const STORAGE_KEY = 'todo-list';

describe('useTodos — persistence', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('persists todos to localStorage under the "todo-list" key', () => {
    const { result } = renderHook(() => useTodos());

    act(() => result.current.addTodo('Buy milk'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.todos).toHaveLength(1);
    expect(stored.todos[0].text).toBe('Buy milk');
    expect(stored.todos[0].completed).toBe(false);
  });

  it('persists filter state to localStorage', () => {
    const { result } = renderHook(() => useTodos());

    act(() => result.current.setFilter('completed'));

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.filter).toBe('completed');
  });

  it('restores todos after a simulated page refresh', () => {
    const { result, unmount } = renderHook(() => useTodos());

    act(() => result.current.addTodo('Persisted task'));
    unmount();

    const { result: restored } = renderHook(() => useTodos());
    expect(restored.current.todos).toHaveLength(1);
    expect(restored.current.todos[0].text).toBe('Persisted task');
  });

  it('restores filter state after a simulated page refresh', () => {
    const { result, unmount } = renderHook(() => useTodos());

    act(() => result.current.setFilter('active'));
    unmount();

    const { result: restored } = renderHook(() => useTodos());
    expect(restored.current.filter).toBe('active');
  });

  it('restores completed status of todos after a simulated page refresh', () => {
    const { result, unmount } = renderHook(() => useTodos());

    act(() => result.current.addTodo('Toggle me'));
    const id = result.current.todos[0].id;
    act(() => result.current.toggleTodo(id));
    unmount();

    const { result: restored } = renderHook(() => useTodos());
    expect(restored.current.todos[0].completed).toBe(true);
  });

  it('starts empty when localStorage has no stored state', () => {
    const { result } = renderHook(() => useTodos());
    expect(result.current.todos).toHaveLength(0);
    expect(result.current.filter).toBe('all');
  });
});
