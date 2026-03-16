import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { TodoFilter } from '.';

expect.extend(toHaveNoViolations);

describe('TodoFilter', () => {
  it('has no accessibility violations', async () => {
    const { container } = render(
      <TodoFilter filter="all" activeCount={3} onFilter={jest.fn()} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders all three filter buttons', () => {
    render(<TodoFilter filter="all" activeCount={3} onFilter={jest.fn()} />);
    expect(screen.getByRole('button', { name: /all/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /active/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /completed/i })).toBeInTheDocument();
  });

  it('marks the active filter button as pressed', () => {
    render(<TodoFilter filter="active" activeCount={2} onFilter={jest.fn()} />);
    expect(screen.getByRole('button', { name: /active/i })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(screen.getByRole('button', { name: /all/i })).toHaveAttribute('aria-pressed', 'false');
  });

  it('displays the correct item count', () => {
    render(<TodoFilter filter="all" activeCount={5} onFilter={jest.fn()} />);
    expect(screen.getByText(/5 items left/i)).toBeInTheDocument();
  });

  it('uses singular "item" when count is 1', () => {
    render(<TodoFilter filter="all" activeCount={1} onFilter={jest.fn()} />);
    expect(screen.getByText(/1 item left/i)).toBeInTheDocument();
  });

  it('calls onFilter with the correct value when a filter is clicked', async () => {
    const onFilter = jest.fn();
    render(<TodoFilter filter="all" activeCount={2} onFilter={onFilter} />);
    await userEvent.click(screen.getByRole('button', { name: /completed/i }));
    expect(onFilter).toHaveBeenCalledWith('completed');
  });
});
