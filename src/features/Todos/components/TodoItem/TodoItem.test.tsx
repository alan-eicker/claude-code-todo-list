import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TodoItem } from '.';
import type { Todo } from '../../types';

expect.extend(toHaveNoViolations);

const activeTodo: Todo = { id: '1', text: 'Buy milk', completed: false };
const completedTodo: Todo = { id: '2', text: 'Walk dog', completed: true };

describe('TodoItem', () => {
  it('has no accessibility violations (active)', async () => {
    const { container } = render(
      <ul>
        <TodoItem todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />
      </ul>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations (completed)', async () => {
    const { container } = render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={jest.fn()} onDelete={jest.fn()} />
      </ul>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders the todo text', () => {
    render(
      <ul>
        <TodoItem todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />
      </ul>,
    );
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('shows checkbox unchecked for active todo', () => {
    render(
      <ul>
        <TodoItem todo={activeTodo} onToggle={jest.fn()} onDelete={jest.fn()} />
      </ul>,
    );
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('shows checkbox checked for completed todo', () => {
    render(
      <ul>
        <TodoItem todo={completedTodo} onToggle={jest.fn()} onDelete={jest.fn()} />
      </ul>,
    );
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('calls onToggle with the todo id when checkbox is clicked', async () => {
    const onToggle = jest.fn();
    render(
      <ul>
        <TodoItem todo={activeTodo} onToggle={onToggle} onDelete={jest.fn()} />
      </ul>,
    );
    await userEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith('1');
  });

  it('calls onDelete with the todo id when delete button is clicked', async () => {
    const onDelete = jest.fn();
    render(
      <ul>
        <TodoItem todo={activeTodo} onToggle={jest.fn()} onDelete={onDelete} />
      </ul>,
    );
    await userEvent.click(screen.getByRole('button', { name: /delete "buy milk"/i }));
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
