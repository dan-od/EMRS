import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright — role-based E2E.
 *
 * Serial by design: every test shares one local database, so parallel workers
 * would interleave on the same rows and stats.
 */
export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/globalSetup.js',
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  timeout: 45_000,
  expect: { timeout: 10_000 },

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Logs each role in once and stores its session for the rest of the suite.
    { name: 'setup', testMatch: /auth\.setup\.js/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['setup'],
      testIgnore: /auth\.setup\.js/,
    },
  ],

  webServer: [
    {
      command: 'npm --prefix ../backend start',
      url: 'http://localhost:5000/api/health',
      reuseExistingServer: true,
      timeout: 60_000,
      stdout: 'ignore',
    },
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
