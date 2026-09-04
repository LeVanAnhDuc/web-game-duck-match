import { defineConfig, devices } from '@playwright/test'

/**
 * E2E runs against the STATIC EXPORT, not the dev server — `out/` is what actually
 * ships, and `output: 'export'` is exactly the mode where a route can build fine in
 * dev and be missing in the export (ADR-0004).
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'list' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3100',
    trace: 'on-first-retry',
  },
  webServer: {
    command: 'yarn build && npx serve out -l 3100 -s',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
