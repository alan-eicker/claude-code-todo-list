import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TodoForm } from '.';

expect.extend(toHaveNoViolations);

describe('TodoForm', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(<TodoForm onAdd={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders the input and add button', () => {
    render(<TodoForm onAdd={jest.fn()} />);
    expect(screen.getByLabelText(/new todo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
  });

  it('disables the button when input is empty', () => {
    render(<TodoForm onAdd={jest.fn()} />);
    expect(screen.getByRole('button', { name: /add/i })).toBeDisabled();
  });

  it('enables the button when input has non-whitespace text', async () => {
    render(<TodoForm onAdd={jest.fn()} />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Buy milk');
    expect(screen.getByRole('button', { name: /add/i })).toBeEnabled();
  });

  it('calls onAdd with trimmed text and clears input on submit', async () => {
    const onAdd = jest.fn();
    render(<TodoForm onAdd={onAdd} />);
    await userEvent.type(screen.getByLabelText(/new todo/i), '  Buy milk  ');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(onAdd).toHaveBeenCalledWith('Buy milk');
    expect(screen.getByLabelText(/new todo/i)).toHaveValue('');
  });

  it('does not call onAdd for whitespace-only input', async () => {
    const onAdd = jest.fn();
    render(<TodoForm onAdd={onAdd} />);
    const input = screen.getByLabelText(/new todo/i);
    await userEvent.type(input, '   ');
    await userEvent.keyboard('{Enter}');
    expect(onAdd).not.toHaveBeenCalled();
  });
});
