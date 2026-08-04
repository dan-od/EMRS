import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    setupFiles: ['./tests/setup.mjs'],
    // These tests hit a real database; running files in parallel would let
    // them interleave on shared tables.
    fileParallelism: false,
    hookTimeout: 20000,
    testTimeout: 20000,
  },
});
