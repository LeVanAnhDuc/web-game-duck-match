import type { DuckerProfile } from '@/auth/types'

/** First letter of the name (or email) for the avatar when there is no picture. */
export function initialOf(profile: DuckerProfile): string {
  const source = profile.name?.trim() || profile.email?.trim() || ''
  return source ? source[0]!.toLocaleUpperCase('vi') : '?'
}
