import { pick } from './rng'
import type { Cell, Color, Grid, Piece, Pos, RngState } from './types'

/**
 * Immutable grid operations. Nothing here mutates its input — `applySwap` has to
 * stay pure so React sees a new reference and "replay" cannot inherit old state
 * (invariant 4).
 */

export function rows(grid: Grid): number {
  return grid.length
}

export function cols(grid: Grid): number {
  return grid[0]?.length ?? 0
}

export function inBounds(grid: Grid, pos: Pos): boolean {
  return pos.row >= 0 && pos.row < rows(grid) && pos.col >= 0 && pos.col < cols(grid)
}

export function at(grid: Grid, pos: Pos): Cell {
  return grid[pos.row]?.[pos.col] ?? null
}

export function clone(grid: Grid): Grid {
  return grid.map((row) => [...row])
}

export function set(grid: Grid, pos: Pos, cell: Cell): Grid {
  const next = clone(grid)
  const row = next[pos.row]
  if (row) row[pos.col] = cell
  return next
}

/** Batch version of `set` — one copy instead of one per write. */
export function setMany(grid: Grid, writes: { at: Pos; cell: Cell }[]): Grid {
  const next = clone(grid)
  for (const write of writes) {
    const row = next[write.at.row]
    if (row) row[write.at.col] = write.cell
  }
  return next
}

export function swap(grid: Grid, a: Pos, b: Pos): Grid {
  const next = clone(grid)
  const rowA = next[a.row]
  const rowB = next[b.row]
  if (!rowA || !rowB) return next
  const cellA = rowA[a.col] ?? null
  rowA[a.col] = rowB[b.col] ?? null
  rowB[b.col] = cellA
  return next
}

export function isAdjacent(a: Pos, b: Pos): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

export function samePos(a: Pos, b: Pos): boolean {
  return a.row === b.row && a.col === b.col
}

export function allPositions(grid: Grid): Pos[] {
  const out: Pos[] = []
  for (let row = 0; row < rows(grid); row++) {
    for (let col = 0; col < cols(grid); col++) out.push({ row, col })
  }
  return out
}

export function allPieces(grid: Grid): Piece[] {
  return grid.flat().filter((cell): cell is Piece => cell !== null)
}

/**
 * Gravity. Pieces fall straight down only — never diagonally (design.md §4).
 * `moves` reports only cells that actually changed row, so the UI animates
 * nothing that did not move.
 */
export function collapse(grid: Grid): { grid: Grid; moves: { from: Pos; to: Pos }[] } {
  const next = clone(grid)
  const moves: { from: Pos; to: Pos }[] = []
  const height = rows(grid)

  for (let col = 0; col < cols(grid); col++) {
    let writeRow = height - 1
    for (let row = height - 1; row >= 0; row--) {
      const cell = next[row]?.[col] ?? null
      if (!cell) continue
      if (row !== writeRow) {
        const target = next[writeRow]
        const source = next[row]
        if (target && source) {
          target[col] = cell
          source[col] = null
          moves.push({ from: { row, col }, to: { row: writeRow, col } })
        }
      }
      writeRow--
    }
  }

  return { grid: next, moves }
}

/** Fills every empty cell from the top, drawing colours from the session rng. */
export function refill(
  grid: Grid,
  colors: readonly Color[],
  rng: RngState,
  nextPieceId: number,
): {
  grid: Grid
  cells: { at: Pos; piece: Piece }[]
  rng: RngState
  nextPieceId: number
} {
  const next = clone(grid)
  const cells: { at: Pos; piece: Piece }[] = []
  let currentRng = rng
  let currentId = nextPieceId

  for (let row = 0; row < rows(grid); row++) {
    for (let col = 0; col < cols(grid); col++) {
      const line = next[row]
      if (!line || line[col]) continue
      const [color, advanced] = pick(currentRng, colors)
      currentRng = advanced
      const piece: Piece = { id: currentId++, color, special: 'none' }
      line[col] = piece
      cells.push({ at: { row, col }, piece })
    }
  }

  return { grid: next, cells, rng: currentRng, nextPieceId: currentId }
}
