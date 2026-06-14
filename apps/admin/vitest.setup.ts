import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';

// Cleanup after each test case (e.g., clearing jsdom)
afterEach(() => {
  cleanup();
});

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://127.0.0.1:3001/api';
