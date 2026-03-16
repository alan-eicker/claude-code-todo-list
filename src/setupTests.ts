import '@testing-library/jest-dom';
import { randomUUID } from 'crypto';

// jsdom does not expose crypto.randomUUID — polyfill using Node's built-in crypto
Object.defineProperty(global, 'crypto', {
  value: { randomUUID },
  configurable: true,
});
