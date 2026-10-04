import { DUCKER_CONFIG, DUCKER_PKCE_KEY, appRootPath } from './duckerConfig'
import { challengeOf, randomUrlSafeToken } from './pkce'
import type { CallbackResult, DuckerConfig, PendingAuth } from './types'

const CALLBACK_PARAMS = ['code', 'state', 'error', 'error_description', 'iss']

export function redirectUri(): string {
  return new URL(appRootPath(), window.location.origin).toString()
}

function readPending(): PendingAuth | null {
  try {
    const raw = sessionStorage.getItem(DUCKER_PKCE_KEY)
    return raw ? (JSON.parse(raw) as PendingAuth) : null
  } catch {
    return null
  }
}

function clearPending(): void {
  try {
    sessionStorage.removeItem(DUCKER_PKCE_KEY)
  } catch {
    // sessionStorage blocked — behave as if nothing was pending
  }
}

let starting = false

// Back from Ducker ID restores this page from bfcache with the guard still set —
// without this reset the sign-in button would do nothing.
if (typeof window !== 'undefined') {
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) starting = false
  })
}

/** Build the authorize URL and move the whole page to Ducker ID. */
export async function startLogin(config: DuckerConfig): Promise<void> {
  // A double click must not mint a second verifier that overwrites the first one
  // while the browser is already navigating away.
  if (starting) return
  starting = true
  const verifier = randomUrlSafeToken()
  const state = randomUrlSafeToken()
  const pending: PendingAuth = {
    state,
    verifier,
    returnTo: window.location.pathname + window.location.search,
  }
  try {
    sessionStorage.setItem(DUCKER_PKCE_KEY, JSON.stringify(pending))
  } catch {
    starting = false
    return // cannot keep the verifier, so do not leave — we would be stuck at the callback
  }
  try {
    const url = new URL('/oauth/authorize', config.issuer)
    url.searchParams.set('response_type', 'code')
    url.searchParams.set('client_id', config.clientId)
    url.searchParams.set('redirect_uri', redirectUri())
    url.searchParams.set('scope', config.scope)
    url.searchParams.set('state', state)
    url.searchParams.set('code_challenge', await challengeOf(verifier))
    url.searchParams.set('code_challenge_method', 'S256')
    window.location.assign(url.toString())
  } catch (error) {
    starting = false
    clearPending() // the verifier is useless now; do not leave it behind
    throw error
  }
}

/**
 * Read ?code / ?error and strip EXACTLY the OAuth params from the URL — the game's
 * own params stay. A code is single-use; leaving it in the URL would make F5 try to
 * exchange it again.
 */
export function consumeCallback(): CallbackResult | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const error = params.get('error')
  const state = params.get('state')
  if (!code && !error) return null

  const pending = readPending()
  clearPending()
  for (const key of CALLBACK_PARAMS) params.delete(key)
  const query = params.toString()
  window.history.replaceState(
    window.history.state,
    '',
    window.location.pathname + (query ? `?${query}` : '') + window.location.hash,
  )

  // returnTo is restored on success AND on an IdP error: redirect_uri is the bare
  // app root, so without it a cancelled sign-in would drop the page the player was on.
  const returnTo =
    pending && isSafeReturnTo(pending.returnTo) ? pending.returnTo : undefined
  if (error) return { error, returnTo }
  if (!pending || pending.state !== state) return { error: 'state_mismatch' }
  return { code: code ?? undefined, verifier: pending.verifier, returnTo }
}

/** Only a same-origin path may reach replaceState ("//evil" would throw at load). */
function isSafeReturnTo(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\')
  )
}

let captured: CallbackResult | null = null
let didCapture = false
let settledUrl: string | null = null

const currentUrl = () =>
  window.location.pathname + window.location.search + window.location.hash

/** Runs once when the module loads in the browser, before any game code reads the URL. */
export function captureCallback(): void {
  if (didCapture) return
  didCapture = true
  captured = consumeCallback()
  if (captured) settledUrl = currentUrl()
  if (captured?.returnTo) {
    try {
      window.history.replaceState(window.history.state, '', captured.returnTo)
      settledUrl = currentUrl()
    } catch {
      // never let a bad returnTo blank the game at load
    }
  }
}

/**
 * Next's router remembers the URL it hydrated with and writes it back to history
 * once it mounts — which, depending on chunk order, can be AFTER the capture above
 * and brings ?code=…&state=… back. Call this from the first mounted effect: it puts
 * the cleaned URL back if that happened. A no-op (and no location read) when no
 * callback was captured, i.e. always when the feature is off.
 */
export function settleCallbackUrl(): void {
  // One-shot: a later remount (client-side navigation away and back) must not
  // rewrite the URL to a stale value behind the router's back.
  const target = settledUrl
  settledUrl = null
  if (target === null || currentUrl() === target) return
  try {
    window.history.replaceState(window.history.state, '', target)
  } catch {
    // leave the URL alone rather than break the game
  }
}

export function capturedCallback(): CallbackResult | null {
  return captured
}

/** Test only. */
export function resetCaptureForTests(): void {
  captured = null
  didCapture = false
  settledUrl = null
  starting = false
}

// Flag off ⇒ the module does not even read location.search.
if (typeof window !== 'undefined' && DUCKER_CONFIG) captureCallback()
