import { samePos } from './board'
import type { Match, Pos, Special } from './types'

/**
 * Which special a match spawns, and where.
 *
 * The spawn position is deliberately predictable: the cell the player just swapped
 * whenever that cell is part of the match, so a player can aim a stripe or a bomb
 * (design.md §4). Only when the match was made by a cascade — nobody swapped
 * anything — does the position fall back to the middle of the run.
 */

const SPECIAL_BY_SHAPE: Record<Match['shape'], Special | null> = {
  line3: null,
  line4: null, // orientation decides — see `stripeFor`
  line5: 'colorBomb',
  corner: 'wrapped',
}

const sortRowMajor = (cells: Pos[]): Pos[] =>
  [...cells].sort((a, b) => a.row - b.row || a.col - b.col)

/** A line4 lies in one row or one column; a single row means it is horizontal. */
function stripeFor(cells: Pos[]): Special {
  const first = cells[0]
  const horizontal = first !== undefined && cells.every((cell) => cell.row === first.row)
  return horizontal ? 'stripedH' : 'stripedV'
}

/**
 * The cell where the two branches of an L/T cross: the only one with a neighbour on
 * both axes inside the match. Derived instead of stored, because `Match` carries the
 * cell set and nothing else.
 */
function intersectionOf(cells: Pos[]): Pos | undefined {
  const present = new Set(cells.map((cell) => `${cell.row},${cell.col}`))
  const has = (row: number, col: number) => present.has(`${row},${col}`)
  return cells.find(
    (cell) =>
      (has(cell.row, cell.col - 1) || has(cell.row, cell.col + 1)) &&
      (has(cell.row - 1, cell.col) || has(cell.row + 1, cell.col)),
  )
}

export function specialFor(
  match: Match,
  swapped: Pos | null,
): { special: Special; at: Pos } | null {
  const cells = sortRowMajor(match.cells)
  const special =
    match.shape === 'line4' ? stripeFor(cells) : SPECIAL_BY_SHAPE[match.shape]
  if (!special) return null

  const onSwappedCell = swapped !== null && cells.some((cell) => samePos(cell, swapped))
  if (onSwappedCell && swapped) return { special, at: swapped }

  // Lower middle on an even run: `line5` covers runs of 6+, which have no true centre.
  const middle = cells[Math.floor((cells.length - 1) / 2)]
  const fallback = match.shape === 'corner' ? (intersectionOf(cells) ?? middle) : middle
  return fallback ? { special, at: fallback } : null
}
