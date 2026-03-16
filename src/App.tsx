import { TodoFilter, TodoForm, TodoList, useTodos } from './features/Todos';
import { ThemeToggle } from './components/ThemeToggle';
import { useTheme } from './hooks/useTheme';
import styles from './App.module.css';

export const App = () => {
  const { todos, filter, activeCount, addTodo, toggleTodo, deleteTodo, setFilter } = useTodos();
  const { theme, toggleTheme } = useTheme();

  return (
    <main className={styles.main}>
      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.heading}>Todo List</h1>
          <div className={styles.themeToggleWrapper}>
            <ThemeToggle theme={theme} onToggle={toggleTheme} />
          </div>
        </header>
        <TodoForm onAdd={addTodo} />
        <TodoFilter filter={filter} activeCount={activeCount} onFilter={setFilter} />
        <TodoList todos={todos} onToggle={toggleTodo} onDelete={deleteTodo} />
      </div>
    </main>
  );
};
