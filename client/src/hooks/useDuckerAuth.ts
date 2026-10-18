import { useEffect, useSyncExternalStore } from 'react'
import type { AuthSnapshot } from '@/auth/types'
import { settleCallbackUrl } from '@/auth/duckerAuth'
import { DUCKER_CONFIG } from '@/auth/duckerConfig'
import {
  getServerSnapshot,
  getSnapshot,
  signIn,
  signOut,
  subscribe,
} from '@/auth/duckerSession'

/**
 * Optional Ducker ID sign-in (ADR-0012). Wraps the external session store so
 * components do not touch the auth modules directly (R-19). `enabled` is false
 * unless the flag and every Ducker value were present at build time.
 */
export function useDuckerAuth(): AuthSnapshot & {
  enabled: boolean
  profileUrl: string | null
  signIn: () => void
  signOut: () => void
} {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  // Runs after Next's router has mounted, so it has the last word on the URL.
  useEffect(() => settleCallbackUrl(), [])
  return {
    ...snapshot,
    enabled: DUCKER_CONFIG !== null,
    profileUrl: DUCKER_CONFIG ? DUCKER_CONFIG.profileUrl : null,
    signIn,
    signOut,
  }
}
