import type { Todo } from '../../types';
import { TodoItem } from '../TodoItem';
import styles from './TodoList.module.css';

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TodoList = ({ todos, onToggle, onDelete }: TodoListProps) => {
  if (todos.length === 0) {
    return (
      <p className={styles.empty} role="status">
        No todos here. Add one above!
      </p>
    );
  }

  return (
    <ul className={styles.list} aria-label="Todo items">
      {todos.map((todo) => (
        <TodoItem key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  );
}
