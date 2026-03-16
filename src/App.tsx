import { TodoFilter, TodoForm, TodoList, useTodos } from './features/Todos';
import styles from './App.module.css';

export const App = () => {
  const { todos, filter, activeCount, addTodo, toggleTodo, deleteTodo, setFilter } = useTodos();

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Todo List</h1>
        <TodoForm onAdd={addTodo} />
        <TodoFilter filter={filter} activeCount={activeCount} onFilter={setFilter} />
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </main>
  );
}
