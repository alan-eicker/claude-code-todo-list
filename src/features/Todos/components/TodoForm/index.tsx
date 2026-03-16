import { useState, type FormEvent } from 'react';
import styles from './TodoForm.module.css';

interface TodoFormProps {
  onAdd: (text: string) => void;
}

export const TodoForm = ({ onAdd }: TodoFormProps) => {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue('');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <label htmlFor="todo-input" className={styles.label}>
        New todo
      </label>
      <div className={styles.row}>
        <input
          id="todo-input"
          className={styles.input}
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="What needs to be done?"
          autoComplete="off"
        />
        <button className={styles.button} type="submit" disabled={!value.trim()}>
          Add
        </button>
      </div>
    </form>
  );
}
