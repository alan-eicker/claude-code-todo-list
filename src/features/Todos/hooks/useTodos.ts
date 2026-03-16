import { useCallback } from 'react';
import type { FilterType, Todo, TodoAction, TodoState } from '../types';
import { usePersistedReducer } from '../../../hooks/usePersistedReducer';

const STORAGE_KEY = 'todo-list';

const INITIAL_STATE: TodoState = {
  todos: [],
  filter: 'all',
};

const todoReducer = (state: TodoState, action: TodoAction): TodoState => {
  switch (action.type) {
    case 'ADD_TODO':
      return {
        ...state,
        todos: [
          ...state.todos,
          { id: crypto.randomUUID(), text: action.payload.trim(), completed: false },
        ],
      };
    case 'TOGGLE_TODO':
      return {
        ...state,
        todos: state.todos.map((todo) =>
          todo.id === action.payload ? { ...todo, completed: !todo.completed } : todo,
        ),
      };
    case 'DELETE_TODO':
      return {
        ...state,
        todos: state.todos.filter((todo) => todo.id !== action.payload),
      };
    case 'SET_FILTER':
      return { ...state, filter: action.payload };
  }
}

const applyFilter = (todos: Todo[], filter: FilterType): Todo[] => {
  switch (filter) {
    case 'active':
      return todos.filter((t) => !t.completed);
    case 'completed':
      return todos.filter((t) => t.completed);
    default:
      return todos;
  }
}

export interface UseTodosReturn {
  todos: Todo[];
  filter: FilterType;
  activeCount: number;
  addTodo: (text: string) => void;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;
  setFilter: (filter: FilterType) => void;
}

export const useTodos = (): UseTodosReturn => {
  const [state, dispatch] = usePersistedReducer(todoReducer, INITIAL_STATE, STORAGE_KEY);

  const activeCount = state.todos.filter((t) => !t.completed).length;
  const todos = applyFilter(state.todos, state.filter);

  // Stable references so React.memo on child components (e.g. TodoItem) can
  // bail out of re-renders when only unrelated state changes.
  const addTodo = useCallback((text: string) => dispatch({ type: 'ADD_TODO', payload: text }), [dispatch]);
  const toggleTodo = useCallback((id: string) => dispatch({ type: 'TOGGLE_TODO', payload: id }), [dispatch]);
  const deleteTodo = useCallback((id: string) => dispatch({ type: 'DELETE_TODO', payload: id }), [dispatch]);
  const setFilter = useCallback((filter: FilterType) => dispatch({ type: 'SET_FILTER', payload: filter }), [dispatch]);

  return {
    todos,
    filter: state.filter,
    activeCount,
    addTodo,
    toggleTodo,
    deleteTodo,
    setFilter,
  };
}
