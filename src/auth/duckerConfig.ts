import type { DuckerConfig, DuckerEnv } from './types'

export const DUCKER_PKCE_KEY = 'ducker.pkce'

/**
 * Ducker ID sign-in is on only when the flag is exactly "true" AND all four values
 * are set. There is no default for any of them here: a missing value means off,
 * never a guess (ADR-0012).
 */
export function readDuckerConfig(raw: DuckerEnv): DuckerConfig | null {
  if (raw.enabled !== 'true') return null
  const { issuer, clientId, scope, profilePath } = raw
  if (!issuer || !clientId || !scope || !profilePath) return null
  // "localhost:3000" parses as a URL with the scheme "localhost:" — refuse it.
  if (!/^https?:\/\//.test(issuer)) return null
  try {
    return {
      issuer: new URL(issuer).origin,
      clientId,
      scope,
      profileUrl: new URL(profilePath, issuer).toString(),
    }
  } catch {
    // A malformed issuer means "not configured"; the game must still load.
    return null
  }
}

/** Read by literal name so Next inlines each one at build time. */
export const DUCKER_CONFIG = readDuckerConfig({
  enabled: process.env.NEXT_PUBLIC_FEATURE_DUCKER_SIGN_IN,
  issuer: process.env.NEXT_PUBLIC_DUCKER_ISSUER,
  clientId: process.env.NEXT_PUBLIC_DUCKER_CLIENT_ID,
  scope: process.env.NEXT_PUBLIC_DUCKER_SCOPE,
  profilePath: process.env.NEXT_PUBLIC_DUCKER_PROFILE_PATH,
})

/** App root — redirect_uri must match the URI registered at Ducker ID exactly. */
export function appRootPath(): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH
  return base ? `${base}/` : '/'
}
