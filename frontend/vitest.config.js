/**
 * Vitest — frontend.
 *
 * Separate from vite.config.js so tests don't pull in the PWA plugin, which
 * generates a service worker on every run. The `@` alias mirrors vite.config.js.
 */
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    // E2E lives in its own runner.
    exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**'],
  },
});
