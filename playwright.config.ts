import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://127.0.0.1:${PORT}`
// Second export, built with sign-in switched on (scripts/build-e2e-auth.mjs).
const AUTH_PORT = 4174
const AUTH_URL = `http://127.0.0.1:${AUTH_PORT}`
const AUTH_SPEC = /ducker-id-sign-in.spec.ts/

/**
 * E2E runs against the STATIC EXPORT, not the dev server — `out/` is what actually
 * ships, and `output: 'export'` is exactly the mode where a route can work in dev
 * and be missing from the export (ADR-0004).
 *
 * The server is `scripts/serve.mjs` rather than `pnpm dlx serve`: that package has to be
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
  projects: [
    {
      name: 'chromium',
      testIgnore: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ducker-sign-in',
      testMatch: AUTH_SPEC,
      use: { ...devices['Desktop Chrome'], baseURL: AUTH_URL },
    },
  ],
  webServer: [
    {
      // Serves an existing `out/`. `pnpm test:e2e` builds first; CI builds once and
      // then calls `playwright test` directly rather than paying for it twice.
      command: `node scripts/serve.mjs ${PORT} out`,
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `node scripts/serve.mjs ${AUTH_PORT} out-auth`,
      url: AUTH_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
})
