import type { RngState } from './types'

/**
 * mulberry32, the single source of randomness in the engine (ADR-0003).
 *
 * The state is a value, not an object, and every function returns the next state
 * alongside its result. That is what keeps `applySwap` pure: calling it twice with
 * the same Session gives the same answer (invariant 4).
 *
 * `Math.imul` and `Math.floor` are fine here — only `Math.random` is banned.
 */

export function seedFrom(n: number): RngState {
  return n >>> 0
}

/** One step of the generator: a unit float in [0, 1) plus the next state. */
function step(rng: RngState): [unit: number, next: RngState] {
  const next = (rng + 0x6d2b79f5) >>> 0
  let t = next
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [unit, next]
}

export function nextInt(rng: RngState, maxExclusive: number): [number, RngState] {
  const [unit, next] = step(rng)
  return [Math.floor(unit * maxExclusive), next]
}

export function pick<T>(rng: RngState, items: readonly T[]): [T, RngState] {
  const [index, next] = nextInt(rng, items.length)
  return [items[index] as T, next]
}

/** Fisher-Yates. Returns a new array; the input is left alone. */
export function shuffle<T>(rng: RngState, items: readonly T[]): [T[], RngState] {
  const out = [...items]
  let current = rng
  for (let i = out.length - 1; i > 0; i--) {
    const [j, next] = nextInt(current, i + 1)
    current = next
    const swapped = out[i] as T
    out[i] = out[j] as T
    out[j] = swapped
  }
  return [out, current]
}
