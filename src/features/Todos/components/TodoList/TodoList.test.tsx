import { render, screen } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TodoList } from '.';
import type { Todo } from '../../types';

expect.extend(toHaveNoViolations);

const todos: Todo[] = [
  { id: '1', text: 'Buy milk', completed: false },
  { id: '2', text: 'Walk dog', completed: true },
];

describe('TodoList', () => {
  it('has no accessibility violations with todos', async () => {
    const { container } = render(
      <TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations when empty', async () => {
    const { container } = render(
      <TodoList todos={[]} onToggle={jest.fn()} onDelete={jest.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders all todo items', () => {
    render(<TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
    expect(screen.getByText('Walk dog')).toBeInTheDocument();
  });

  it('shows empty state message when there are no todos', () => {
    render(<TodoList todos={[]} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.getByText(/no todos here/i)).toBeInTheDocument();
  });

  it('does not show the empty state when todos exist', () => {
    render(<TodoList todos={todos} onToggle={jest.fn()} onDelete={jest.fn()} />);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });
});
