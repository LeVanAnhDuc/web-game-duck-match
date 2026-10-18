/**
 * PKCE (RFC 7636): the stand-in for a client_secret in an app that runs entirely in
 * the browser. The verifier is minted per sign-in, lives seconds, is used once.
 */

const VERIFIER_BYTES = 32

function toBase64Url(bytes: ArrayBuffer): string {
  const binary = String.fromCharCode(...new Uint8Array(bytes))
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** base64url random string — used for both code_verifier and state. */
export function randomUrlSafeToken(): string {
  return toBase64Url(crypto.getRandomValues(new Uint8Array(VERIFIER_BYTES)).buffer)
}

/** challenge = BASE64URL(SHA256(ASCII(verifier))) — method S256. */
export async function challengeOf(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return toBase64Url(digest)
}
