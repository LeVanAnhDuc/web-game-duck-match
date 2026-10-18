import { spawnSync } from 'node:child_process'
import { existsSync, renameSync, rmSync } from 'node:fs'

/**
 * Builds a SECOND static export with Ducker ID sign-in switched on, into `out-auth/`,
 * for e2e/ducker-id-sign-in.spec.ts. The normal `out/` stays flag-off — it is what
 * deploys, and the rest of the e2e suite must keep proving that build is unchanged.
 *
 * The issuer is a fake host that never resolves: the spec routes every request to it.
 * `out/` is set aside and put back, so the order of this script and `pnpm build` does
 * not matter.
 *
 *   node scripts/build-e2e-auth.mjs
 */
const env = {
  ...process.env,
  NEXT_PUBLIC_BASE_PATH: '',
  NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN: 'true',
  NEXT_PUBLIC_DUCKER_ISSUER: 'http://ducker.test',
  NEXT_PUBLIC_DUCKER_CLIENT_ID: 'e2e-client',
  NEXT_PUBLIC_DUCKER_SCOPE: 'openid profile email',
  NEXT_PUBLIC_DUCKER_PROFILE_PATH: '/profile',
}

const KEEP = 'out-keep'
if (existsSync(KEEP)) rmSync(KEEP, { recursive: true, force: true })
if (existsSync('out')) renameSync('out', KEEP)
try {
  const build = spawnSync('pnpm', ['exec', 'next', 'build'], {
    env,
    stdio: 'inherit',
    shell: true,
  })
  if (build.status !== 0) process.exitCode = build.status ?? 1
  else {
    rmSync('out-auth', { recursive: true, force: true })
    renameSync('out', 'out-auth')
  }
} finally {
  if (existsSync(KEEP)) {
    rmSync('out', { recursive: true, force: true })
    renameSync(KEEP, 'out')
  }
}
