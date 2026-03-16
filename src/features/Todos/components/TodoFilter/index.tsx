import type { FilterType } from '../../types';
import styles from './TodoFilter.module.css';

interface TodoFilterProps {
  filter: FilterType;
  activeCount: number;
  onFilter: (filter: FilterType) => void;
}

const FILTERS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

export const TodoFilter = ({ filter, activeCount, onFilter }: TodoFilterProps) => {
  return (
    <div className={styles.wrapper}>
      <p className={styles.count} aria-live="polite" aria-atomic="true">
        {activeCount} {activeCount === 1 ? 'item' : 'items'} left
      </p>
      <nav aria-label="Filter todos">
        <ul className={styles.filterList}>
          {FILTERS.map(({ value, label }) => (
            <li key={value}>
              <button
                className={styles.filterButton}
                type="button"
                onClick={() => onFilter(value)}
                aria-pressed={filter === value}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
