import { DUCKER_CONFIG } from './duckerConfig'
import { capturedCallback, startLogin } from './duckerAuth'
import { exchangeCode, fetchProfile } from './duckerRequests'
import type { AuthSnapshot, CallbackResult, DuckerConfig } from './types'

const IDLE: AuthSnapshot = { status: 'idle', profile: null }
const SIGNED_OUT: AuthSnapshot = { status: 'signed-out', profile: null }

let snapshot: AuthSnapshot = IDLE
let started = false
const listeners = new Set<() => void>()

function set(next: AuthSnapshot): void {
  snapshot = next
  listeners.forEach((listener) => listener())
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getSnapshot(): AuthSnapshot {
  return snapshot
}

/** The static HTML knows nothing about a session — the first render is always idle. */
export function getServerSnapshot(): AuthSnapshot {
  return IDLE
}

/**
 * Exchange code → profile exactly ONCE per page load (StrictMode and remounts are
 * safe). Every failure only drops to signed-out: sign-in is an extra, not a gate.
 * The default parameters are injection points for tests, not config defaults.
 */
export function startSession(
  config: DuckerConfig | null = DUCKER_CONFIG,
  callback: CallbackResult | null = capturedCallback(),
): void {
  if (started || !config) return
  started = true
  if (!callback || callback.error || !callback.code || !callback.verifier) {
    set(SIGNED_OUT)
    return
  }
  set({ status: 'loading', profile: null })
  exchangeCode(config, callback.code, callback.verifier)
    .then((tokens) => fetchProfile(config, tokens.accessToken))
    .then(
      (profile) => set({ status: 'signed-in', profile }),
      () => set(SIGNED_OUT),
    )
}

export function signIn(): void {
  if (DUCKER_CONFIG) void startLogin(DUCKER_CONFIG).catch(() => {
      // silent: sign-in is optional (startLogin already released its guard)
    })
}

/** Forget the profile in memory. The Ducker ID session stays — that is SSO. */
export function signOut(): void {
  set(SIGNED_OUT)
}

export function resetSessionForTests(): void {
  snapshot = IDLE
  started = false
  listeners.clear()
}

if (typeof window !== 'undefined') startSession()
