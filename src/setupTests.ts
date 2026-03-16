import '@testing-library/jest-dom';
import { randomUUID } from 'crypto';

// jsdom does not expose crypto.randomUUID — polyfill using Node's built-in crypto
Object.defineProperty(global, 'crypto', {
  value: { randomUUID },
  configurable: true,
});

// jsdom does not implement window.matchMedia — provide a no-op stub so components
// that read prefers-color-scheme (e.g. useTheme) work in the test environment.
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});
