import { at as cellAt, cols, inBounds, rows } from './board'
import type { Color, Grid, Pos, Special } from './types'

/**
 * Special-piece activation and activation chains (design.md §4).
 *
 * A special fires when it is *cleared* — by a match containing it, or by another
 * special's blast. Chains run until nothing new is caught, and the only thing
 * stopping a stripe and a bomb from firing each other forever is that a piece
 * activates at most once per round, tracked by `Piece.id` (invariant 5, NFR-REL-04).
 *
 * Nothing here writes to the grid. Clearing is the caller's job, so both functions
 * read one fixed snapshot of the board — which is also why a position identifies a
 * piece unambiguously for the whole call.
 */

/** One special going off: where it stood, what it was, and what it took with it. */
export type Activation = { at: Pos; special: Special; cleared: Pos[] }

export type ClearResult = { cleared: Pos[]; activations: Activation[] }

const key = (pos: Pos) => `${pos.row},${pos.col}`

const copy = (pos: Pos): Pos => ({ row: pos.row, col: pos.col })

/**
 * The cells one activation clears, **excluding `at` itself** — the caller already
 * knows the special is going. Cells holding no piece are skipped so the result is
 * always a list of real removals.
 *
 * `swappedColor` only matters to `colorBomb`: it is the colour of the piece the
 * player swapped the bomb with. A bomb caught in someone else's blast has no such
 * partner, so it falls back to its own colour rather than fizzling.
 */
export function activationTargets(
  grid: Grid,
  at: Pos,
  special: Special,
  swappedColor: Color | null,
): Pos[] {
  const out: Pos[] = []

  switch (special) {
    case 'none':
      return out

    case 'stripedH': {
      for (let col = 0; col < cols(grid); col++) {
        const pos = { row: at.row, col }
        if (col !== at.col && cellAt(grid, pos)) out.push(pos)
      }
      return out
    }

    case 'stripedV': {
      for (let row = 0; row < rows(grid); row++) {
        const pos = { row, col: at.col }
        if (row !== at.row && cellAt(grid, pos)) out.push(pos)
      }
      return out
    }

    case 'wrapped': {
      for (let row = at.row - 1; row <= at.row + 1; row++) {
        for (let col = at.col - 1; col <= at.col + 1; col++) {
          const pos = { row, col }
          if (row === at.row && col === at.col) continue
          // The 3x3 is clipped at the edge, not wrapped around it.
          if (inBounds(grid, pos) && cellAt(grid, pos)) out.push(pos)
        }
      }
      return out
    }

    case 'colorBomb': {
      const target = swappedColor ?? cellAt(grid, at)?.color ?? null
      if (!target) return out
      for (let row = 0; row < rows(grid); row++) {
        for (let col = 0; col < cols(grid); col++) {
          const pos = { row, col }
          if (row === at.row && col === at.col) continue
          if (cellAt(grid, pos)?.color === target) out.push(pos)
        }
      }
      return out
    }
  }
}

/**
 * Expands `seeds` — the cells a round decided to clear — through every special
 * caught in the blast, and reports the full clear set plus one entry per activation
 * in trigger order.
 *
 * A FIFO worklist, so the blast reads outwards from the seeds: a stripe fires, then
 * the specials it hit, then theirs. Termination is structural rather than a guard —
 * a position is cleared once and a piece id activates once, so the queue can only
 * grow a bounded number of times (NFR-REL-04). The loop re-reads `queue.length`
 * every step on purpose; entries are appended while it runs.
 */
export function resolveClears(
  grid: Grid,
  seeds: Pos[],
  swappedColor: Color | null,
): ClearResult {
  const queue: Pos[] = seeds.map(copy)
  const cleared: Pos[] = []
  const clearedKeys = new Set<string>()
  const activatedIds = new Set<number>()
  const activations: Activation[] = []

  for (let cursor = 0; cursor < queue.length; cursor++) {
    const pos = queue[cursor]
    if (!pos) continue

    // Off the board or an empty cell: there is nothing to remove and nothing to
    // fire, so it never enters `cleared` either.
    const piece = cellAt(grid, pos)
    if (!piece) continue

    if (clearedKeys.has(key(pos))) continue
    clearedKeys.add(key(pos))
    cleared.push(pos)

    if (piece.special === 'none' || activatedIds.has(piece.id)) continue
    activatedIds.add(piece.id)

    const targets = activationTargets(grid, pos, piece.special, swappedColor)
    activations.push({ at: copy(pos), special: piece.special, cleared: targets })
    for (const target of targets) queue.push(target)
  }

  return { cleared, activations }
}
