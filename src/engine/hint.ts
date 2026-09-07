import { swap } from './board'
import { findMatches } from './match'
import { findLegalMoves } from './moves'
import type { Grid, Pos, Session } from './types'

/**
 * The idle nudge (design.md §C.3).
 *
 * Finding a move is a game rule, so it lives here and not in `ui/` — the UI is
 * told which two cells to blink, it never searches for them itself (ADR-0002).
 * Nothing in this module is random: the same board always teaches the same move,
 * or a hint would appear to move on its own between two idle periods.
 */

/** Below this a match is a plain three, which teaches the player nothing new. */
const TEACHABLE_SIZE = 4

/**
 * Whether this swap would make a match of four or more, i.e. one that spawns a
 * special. Asked of `findMatches` on a copy rather than re-derived here: a second
 * implementation of matching is exactly the kind of duplicate that drifts.
 *
 * `cells.length >= 4` is the same set of matches as `shape !== 'line3'`, since a
 * `line3` is the only shape with three cells — the count is used because "match of
 * four or more" is what the design promises the player.
 */
function isTeachable(grid: Grid, move: { from: Pos; to: Pos }): boolean {
  return findMatches(swap(grid, move.from, move.to)).some(
    (match) => match.cells.length >= TEACHABLE_SIZE,
  )
}

/**
 * A move worth pointing at, or `null` when there is none to point at.
 *
 * Cost: one `findLegalMoves` pass plus one `findMatches` per legal move, and a
 * legal move list on a settled 9x9 holds a handful of entries — so this stays a
 * small constant factor over the scan the caller would need anyway, not a second
 * quadratic sweep. It is deliberately off the `applySwap` path (NFR-PERF-05):
 * the hook asks for a hint only after five idle seconds.
 */
export function findHint(session: Session): { from: Pos; to: Pos } | null {
  // A finished level has nothing to nudge towards, and `applySwap` would reject
  // the swap anyway.
  if (session.status !== 'playing') return null

  const moves = findLegalMoves(session.grid)
  if (moves.length === 0) return null

  // First teachable move wins, in the row-major order `findLegalMoves` produces;
  // the search stops there instead of ranking the whole list, because "a bigger
  // four" is not a better lesson than "a four".
  for (const move of moves) {
    if (isTeachable(session.grid, move)) return move
  }

  // Everything left makes a plain three, or fires a special with no match at all
  // (a colour bomb swap matches nothing yet clears a lot). Any of them unblocks
  // the player, so take the first.
  return moves[0] ?? null
}
