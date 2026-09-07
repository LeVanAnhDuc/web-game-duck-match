import { allPieces, at, clone, cols, isAdjacent, rows, swap } from './board'
import { findMatches } from './match'
import { nextInt, shuffle } from './rng'
import type { Cell, Color, Grid, LevelConfig, Piece, Pos, RngState } from './types'

/**
 * Legal moves, deadlock detection and reshuffling.
 *
 * "Legal" is wider than "makes a match", because two swaps activate a special
 * without matching anything (design.md §4):
 *   - a colour bomb swapped with any piece, and
 *   - two specials swapped with each other, which in phase 1 simply activates both
 *     in turn (the merged combo effects are FR-09, phase 2).
 * Everything else has to produce a match, or it is reverted at no cost to the
 * player (invariant 6).
 */

export const MAX_RESHUFFLE_ATTEMPTS = 10
export const MAX_BOARD_GENERATION_ATTEMPTS = 50

export class BoardGenerationFailedError extends Error {
  constructor(level: LevelConfig, attempts: number) {
    super(
      `Level ${level.id} (${level.rows}x${level.cols}, ${level.colors.length} colours) ` +
        `produced no playable board in ${attempts} attempts. This is a level config ` +
        `error, not a runtime condition — fix the level.`,
    )
    this.name = 'BoardGenerationFailedError'
  }
}

function isSpecial(cell: Cell): boolean {
  return cell !== null && cell.special !== 'none'
}

/** Swaps that fire a special on their own, with no match involved. */
export function activatesOnSwap(grid: Grid, a: Pos, b: Pos): boolean {
  const cellA = at(grid, a)
  const cellB = at(grid, b)
  if (!cellA || !cellB) return false
  if (cellA.special === 'colorBomb' || cellB.special === 'colorBomb') return true
  return isSpecial(cellA) && isSpecial(cellB)
}

export function isLegalSwap(grid: Grid, a: Pos, b: Pos): boolean {
  if (!isAdjacent(a, b)) return false
  if (!at(grid, a) || !at(grid, b)) return false
  if (activatesOnSwap(grid, a, b)) return true
  return findMatches(swap(grid, a, b)).length > 0
}

/**
 * Every legal swap on the board. Only right and down neighbours are tried, since
 * a swap is symmetric and the reverse pair would be the same move.
 */
export function findLegalMoves(grid: Grid): { from: Pos; to: Pos }[] {
  const out: { from: Pos; to: Pos }[] = []
  const height = rows(grid)
  const width = cols(grid)

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const from = { row, col }
      for (const to of [
        { row, col: col + 1 },
        { row: row + 1, col },
      ]) {
        if (to.row >= height || to.col >= width) continue
        if (isLegalSwap(grid, from, to)) out.push({ from, to })
      }
    }
  }

  return out
}

export function hasLegalMove(grid: Grid): boolean {
  const height = rows(grid)
  const width = cols(grid)
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const from = { row, col }
      if (isLegalSwap(grid, from, { row, col: col + 1 })) return true
      if (isLegalSwap(grid, from, { row: row + 1, col })) return true
    }
  }
  return false
}

/** A board is ready to play when nothing is already matched and a move exists. */
function isPlayable(grid: Grid): boolean {
  return findMatches(grid).length === 0 && hasLegalMove(grid)
}

function withPieces(grid: Grid, pieces: Piece[]): Grid {
  const next = clone(grid)
  let index = 0
  for (let row = 0; row < rows(next); row++) {
    for (let col = 0; col < cols(next); col++) {
      const line = next[row]
      if (!line || line[col] === null) continue
      line[col] = pieces[index++] ?? null
    }
  }
  return next
}

/**
 * Redistributes the pieces already on the board — the exact same multiset of
 * colours and specials (invariant 8), so a collect goal cannot become impossible
 * or trivial depending on how the shuffle landed.
 *
 * `settled` false means ten shuffles still left the board deadlocked; the caller
 * then generates a fresh board (design.md §4). Throwing here would kill a session
 * over something the player did nothing to cause.
 */
export function reshuffle(
  grid: Grid,
  rng: RngState,
): { grid: Grid; rng: RngState; attempts: number; settled: boolean } {
  const pieces = allPieces(grid)
  let currentRng = rng

  for (let attempt = 1; attempt <= MAX_RESHUFFLE_ATTEMPTS; attempt++) {
    const [shuffled, advanced] = shuffle(currentRng, pieces)
    currentRng = advanced
    const candidate = withPieces(grid, shuffled)
    if (isPlayable(candidate)) {
      return { grid: candidate, rng: currentRng, attempts: attempt, settled: true }
    }
  }

  return {
    grid,
    rng: currentRng,
    attempts: MAX_RESHUFFLE_ATTEMPTS,
    settled: false,
  }
}

/**
 * A fresh board: no pre-existing match, at least one legal move.
 *
 * Colours are chosen cell by cell and rejected while they would complete a run
 * with the two neighbours already placed, which makes a match-free fill the normal
 * outcome rather than something retried into existence. The outer retry only
 * catches the rarer "match-free but deadlocked" case.
 */
export function generateBoard(
  level: LevelConfig,
  rng: RngState,
  nextPieceId: number,
): { grid: Grid; rng: RngState; nextPieceId: number } {
  let currentRng = rng

  for (let attempt = 1; attempt <= MAX_BOARD_GENERATION_ATTEMPTS; attempt++) {
    let id = nextPieceId
    const grid: Grid = Array.from({ length: level.rows }, () =>
      Array.from({ length: level.cols }, () => null as Cell),
    )

    for (let row = 0; row < level.rows; row++) {
      for (let col = 0; col < level.cols; col++) {
        const [candidates, advanced] = shuffle(currentRng, level.colors)
        currentRng = advanced
        const color = candidates.find(
          (candidate) => !completesRun(grid, row, col, candidate),
        )
        const line = grid[row]
        if (!line) continue
        // Every colour would match: fall back to a random one and let the outer
        // playability check decide. Only possible with very few colours.
        const chosen = color ?? (candidates[0] as Color)
        line[col] = { id: id++, color: chosen, special: 'none' }
      }
    }

    if (isPlayable(grid)) return { grid, rng: currentRng, nextPieceId: id }
  }

  throw new BoardGenerationFailedError(level, MAX_BOARD_GENERATION_ATTEMPTS)
}

/** True when placing `color` at (row, col) would finish a run of three. */
function completesRun(grid: Grid, row: number, col: number, color: Color): boolean {
  const left = grid[row]?.[col - 1]
  const left2 = grid[row]?.[col - 2]
  if (left?.color === color && left2?.color === color) return true

  const up = grid[row - 1]?.[col]
  const up2 = grid[row - 2]?.[col]
  return up?.color === color && up2?.color === color
}

/** Random legal move, used by tests and benchmarks rather than by the game. */
export function pickLegalMove(
  grid: Grid,
  rng: RngState,
): [{ from: Pos; to: Pos } | undefined, RngState] {
  const moves = findLegalMoves(grid)
  if (moves.length === 0) return [undefined, rng]
  const [index, advanced] = nextInt(rng, moves.length)
  return [moves[index], advanced]
}
