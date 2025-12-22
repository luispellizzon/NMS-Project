import { defineConfig, devices } from '@playwright/test';

// Use a distinct port for E2E tests to avoid conflicts with local development
const PORT = process.env.PORT || 3001;
const baseURL = `http://localhost:${PORT}`; 

export default defineConfig({
  // Timeout for each test in milliseconds (increased for Firebase operations)
  timeout: 180 * 1000,
  
  // The directory where tests are located
  testDir: './e2e',
  
  // Whether to run tests in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code.
  forbidOnly: !!process.env.CI,

  // Retry failed tests to handle flaky Firebase/network issues
  retries: process.env.CI ? 2 : 1,

  // Reduce workers to prevent overwhelming the dev server
  // Too many parallel browser sessions can cause connection refused errors
  workers: process.env.CI ? 1 : 2,
  
  // Reporter to use. See https://playwright.dev/docs/test-reporters
  reporter: 'html',

  // This block tells Playwright how to start the Next.js dev server.
  webServer: {
    command: `npx next dev --port ${PORT}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },

  use: {
    baseURL,
    trace: 'on-first-retry',
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});