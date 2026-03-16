import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { App } from './App';

expect.extend(toHaveNoViolations);

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('has no accessibility violations on initial render', async () => {
    const { container } = render(<App />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders the page heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { name: /todo list/i })).toBeInTheDocument();
  });

  it('shows the empty state initially', () => {
    render(<App />);
    expect(screen.getByText(/no todos here/i)).toBeInTheDocument();
  });

  it('adds a new todo', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Buy milk');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText('Buy milk')).toBeInTheDocument();
  });

  it('marks a todo as completed', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Walk dog');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  it('deletes a todo', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Read book');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('button', { name: /delete "read book"/i }));
    expect(screen.queryByText('Read book')).not.toBeInTheDocument();
  });

  it('filters todos by active', async () => {
    render(<App />);

    await userEvent.type(screen.getByLabelText(/new todo/i), 'Active task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Done task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));

    await userEvent.click(screen.getByRole('checkbox', { name: /mark "done task"/i }));
    await userEvent.click(screen.getByRole('button', { name: 'Active' }));

    expect(screen.getByText('Active task')).toBeInTheDocument();
    expect(screen.queryByText('Done task')).not.toBeInTheDocument();
  });

  it('persists todos across a simulated page refresh', async () => {
    const { unmount } = render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Persistent task');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    unmount();

    render(<App />);
    expect(screen.getByText('Persistent task')).toBeInTheDocument();
  });

  it('persists completed state across a simulated page refresh', async () => {
    const { unmount } = render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Complete me');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.click(screen.getByRole('checkbox', { name: /mark "complete me"/i }));
    unmount();

    render(<App />);
    expect(screen.getByRole('checkbox', { name: /mark "complete me"/i })).toBeChecked();
  });

  it('updates the active count', async () => {
    render(<App />);
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Task one');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    await userEvent.type(screen.getByLabelText(/new todo/i), 'Task two');
    await userEvent.click(screen.getByRole('button', { name: /add/i }));
    expect(screen.getByText(/2 items left/i)).toBeInTheDocument();
  });
});
