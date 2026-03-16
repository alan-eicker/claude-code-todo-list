import { renderHook, act } from '@testing-library/react';
import { useTheme } from './useTheme';

const mockMatchMedia = (prefersDark: boolean) => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: prefersDark,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
};

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    mockMatchMedia(false);
  });

  it('defaults to light theme when no preference is stored', () => {
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('defaults to dark when prefers-color-scheme is dark', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('restores stored light preference', () => {
    localStorage.setItem('theme-preference', 'light');
    mockMatchMedia(true); // system says dark, but stored says light
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('light');
  });

  it('restores stored dark preference', () => {
    localStorage.setItem('theme-preference', 'dark');
    const { result } = renderHook(() => useTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('sets data-theme attribute on documentElement', () => {
    const { result } = renderHook(() => useTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe(result.current.theme);
  });

  it('toggleTheme switches from light to dark', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('dark');
  });

  it('toggleTheme switches from dark to light', () => {
    localStorage.setItem('theme-preference', 'dark');
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(result.current.theme).toBe('light');
  });

  it('persists the toggled theme to localStorage', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(localStorage.getItem('theme-preference')).toBe('dark');
  });

  it('updates data-theme attribute after toggle', () => {
    const { result } = renderHook(() => useTheme());
    act(() => result.current.toggleTheme());
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
