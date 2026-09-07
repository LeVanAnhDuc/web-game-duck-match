import { defineConfig, devices } from '@playwright/test'

/**
 * Post-deploy smoke test against the published GitHub Pages site.
 *
 * Separate from `playwright.config.ts` because nothing here is served locally:
 * there is no `webServer`, no `out/`, and the URL is the real one. `deploy.yml`
 * runs it after `deploy-pages`; locally it is `yarn verify:live`.
 *
 * The specs use absolute URLs, so no `baseURL` is set — see the comment in
 * `e2e-live/deployed.spec.ts` for the trailing-slash trap that caused.
 */
export default defineConfig({
  testDir: './e2e-live',
  workers: 1,
  // Propagation is handled inside the spec by waiting for the app's own title, so
  // a retry here would only repeat a wait that already happened.
  retries: 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { trace: 'off' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
