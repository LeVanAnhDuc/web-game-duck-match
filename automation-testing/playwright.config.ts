import "dotenv/config";
import { defineConfig, devices } from "@playwright/test";
import { resolveEnv } from "@/config/env";
import { buildGrepInvert } from "@/config/env-guard";
import { findUrls } from "@/config/urls";

const env = resolveEnv(process.env.ENV);
const includeFull = process.env.FULL === "1";
const isDev = env === "dev";
const grepInvert = buildGrepInvert(env, includeFull);
// Page objects navigate with "./…": GitHub Pages serves the game under /web-game-duck-match/, so the baseURL keeps
// its path and ends with "/" (a leading "/" would drop the path). undefined on an env without a host.
const webUrl = findUrls(env)?.webUrl;
const baseURL = webUrl ? `${webUrl}/` : undefined;

// Dev runs against the STATIC EXPORT of ../client, not `next dev`: `out/` is what GitHub Pages serves, and
// `output: 'export'` is exactly the mode where a route can work in dev and be missing from the export (ADR-0004).
// ../client/scripts/serve.mjs, not `serve -s`: that flag rewrote /play/1/ to the level map. A second export with
// Ducker ID sign-in switched ON against a fake issuer (ADR-0012) is served on its own port for the ducker-id module.
const PORT = 4173;
const AUTH_PORT = 4291;
const AUTH_URL = `http://127.0.0.1:${AUTH_PORT}/`;
const prebuilt = process.env.CLIENT_PREBUILT === "1";
const build = prebuilt ? "" : "pnpm build && pnpm build:e2e-auth && ";

const SIGN_IN = /e2e\/ducker-id\/sign-in\.e2e\.ts$/;

export default defineConfig({
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : [["list"], ["html", { open: "never" }]],
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  use: {
    trace: "retain-on-failure",
    video: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  // "app" first: the playwright-test MCP server (agents) treats the first project as primary.
  // Variants are extra projects named "app-<variant>"; package.json runs --project="app*".
  projects: [
    {
      name: "app",
      testDir: "./src/tests",
      testMatch: [/e2e\/.*\.e2e\.ts$/, /api\/.*\.api\.ts$/, /seed\.spec\.ts$/],
      testIgnore: [SIGN_IN],
      grepInvert,
      use: { ...devices["Desktop Chrome"], baseURL },
    },
    // Ducker ID sign-in against the flag-on export. Only dev has one: the deployed build ships with the flag off.
    ...(isDev
      ? [
          {
            name: "app-auth",
            testDir: "./src/tests",
            testMatch: SIGN_IN,
            grepInvert,
            use: { ...devices["Desktop Chrome"], baseURL: AUTH_URL },
          },
        ]
      : []),
    // One-off data setup (pnpm provision), never part of a normal run.
    {
      name: "provision",
      testDir: "./src/tests/setup",
      testMatch: /.*\.setup\.ts$/,
      workers: 1,
      use: { baseURL },
    },
    { name: "unit", testDir: "./src", testMatch: /.*\.test\.ts$/ },
  ],
  // Boots the game itself on dev (builds both exports first unless CLIENT_PREBUILT=1). The auth server answers 404
  // until the chained build has written ../client/out-auth, and Playwright keeps waiting on a 404.
  webServer:
    isDev && !process.argv.includes("--project=unit")
      ? [
          {
            command: `cd ../client && ${build}node scripts/serve.mjs ${PORT} out`,
            url: `http://127.0.0.1:${PORT}/`,
            reuseExistingServer: !process.env.CI,
            timeout: 600_000,
          },
          {
            command: `cd ../client && node scripts/serve.mjs ${AUTH_PORT} out-auth`,
            url: AUTH_URL,
            reuseExistingServer: !process.env.CI,
            timeout: 600_000,
          },
        ]
      : undefined,
});
