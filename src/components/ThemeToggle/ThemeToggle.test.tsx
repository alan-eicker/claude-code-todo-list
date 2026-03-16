import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeToggle } from './index';

expect.extend(toHaveNoViolations);

describe('ThemeToggle', () => {
  it('has no accessibility violations in light mode', async () => {
    const { container } = render(<ThemeToggle theme="light" onToggle={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('has no accessibility violations in dark mode', async () => {
    const { container } = render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('renders "Switch to dark mode" label in light mode', () => {
    render(<ThemeToggle theme="light" onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('renders "Switch to light mode" label in dark mode', () => {
    render(<ThemeToggle theme="dark" onToggle={() => {}} />);
    expect(screen.getByRole('button', { name: 'Switch to light mode' })).toBeInTheDocument();
  });

  it('calls onToggle when clicked', async () => {
    const onToggle = jest.fn();
    render(<ThemeToggle theme="light" onToggle={onToggle} />);
    await userEvent.click(screen.getByRole('button'));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });
});
