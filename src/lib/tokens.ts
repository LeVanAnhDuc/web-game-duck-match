/**
 * The token values, in code, mirrored from `docs/design-system/match-3/MASTER.md`.
 *
 * They live here rather than only in `tailwind.config.ts` for two reasons: the
 * config cannot be imported by a test, and these numbers were **chosen by
 * measurement** (ADR-0008) — so a test asserts they still hold. Change a value
 * here and `tokens.test.ts` will tell you whether it still clears the floor.
 */

export const SURFACE = {
  /** the page — darkest, so the board reads as a slab lying on it */
  base: '#17111F',
  /** the clay slab holding the whole board */
  board: '#241B31',
  /**
   * the hollow of an empty cell. Only 1.08:1 against `board` ON PURPOSE — the hole
   * is drawn by an inset shadow, not by a colour step. Do not "fix" this.
   */
  well: '#1C1526',
  card: '#31253F',
  raised: '#423356',
  inkStrong: '#F7F3FF',
  inkMuted: '#C9BBDB',
} as const

/**
 * The load-bearing palette of the product: six pieces the player must tell apart at
 * a glance. Measured at 4.16:1 minimum against `board` and ΔE 50 between the closest
 * pair. The set this replaced sat at 2.57:1 and ΔE 23 — below the 3:1 floor for
 * graphical objects, with red and orange genuinely hard to separate.
 *
 * Colour is never the only signal: each one also owns a shape (NFR-A11Y-06).
 */
export const PIECE_COLORS = {
  red: '#FF5470',
  blue: '#3B9EFF',
  green: '#3DD68C',
  yellow: '#FFD24A',
  purple: '#A855F7',
  orange: '#F97316',
} as const

/** UI accents. Deliberately excludes a violet: it would sit next to the purple piece. */
export const ACCENT = {
  pink: '#EC4899',
  amber: '#F59E0B',
} as const
