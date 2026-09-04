import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`

/**
 * E2E runs against the STATIC EXPORT, not the dev server — `out/` is what actually
 * ships, and `output: 'export'` is exactly the mode where a route can work in dev
 * and be missing from the export (ADR-0004).
 *
 * The server is `scripts/serve.mjs` rather than `npx serve`: that package has to be
 * fetched on a cold machine, and its `-s` flag rewrites unknown paths to
 * index.html, which quietly answered /play/1/ with the level map and broke four
 * tests for a reason that had nothing to do with the app.
 *
 * One worker, not the width-per-project fan-out the sibling games use: the specs
 * here loop the four widths themselves, and the full-level playthrough drives a
 * long deterministic sequence that is easier to read when nothing else competes for
 * the port.
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? 'github' : [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    // Serves an existing `out/`. `yarn test:e2e` builds first; CI builds once and
    // then calls `playwright test` directly rather than paying for it twice.
    command: `node scripts/serve.mjs ${PORT} out`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
})
