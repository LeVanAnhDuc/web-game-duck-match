import { at } from './board'
import type { Color, Grid, Match, MatchShape, Pos } from './types'

/**
 * Match detection. A piece matches on `color` only — a special keeps its colour and
 * takes part in matches exactly like a plain piece (design.md §4).
 */

type Orientation = 'h' | 'v'

/** A maximal straight run of one colour, before any L/T merging. */
type Run = { orientation: Orientation; color: Color; cells: Pos[] }

const MIN_RUN = 3

const key = (pos: Pos) => `${pos.row},${pos.col}`

/** Rows may differ in length in test fixtures, so scan the widest row. */
function maxCols(grid: Grid): number {
  return grid.reduce((widest, row) => Math.max(widest, row.length), 0)
}

/**
 * Walks one line of the grid and emits every maximal run of >= 3 equal colours.
 * An empty cell ends the current run, which is why a hole never bridges two runs.
 */
function runsInLine(
  length: number,
  orientation: Orientation,
  cellAt: (index: number) => { color: Color; pos: Pos } | null,
): Run[] {
  const out: Run[] = []
  let current: { color: Color; cells: Pos[] } | null = null

  const flush = () => {
    if (current && current.cells.length >= MIN_RUN) {
      out.push({ orientation, color: current.color, cells: current.cells })
    }
    current = null
  }

  for (let i = 0; i < length; i++) {
    const cell = cellAt(i)
    if (!cell) {
      flush()
      continue
    }
    if (current && current.color === cell.color) {
      current.cells.push(cell.pos)
      continue
    }
    flush()
    current = { color: cell.color, cells: [cell.pos] }
  }
  flush()

  return out
}

function allRuns(grid: Grid): Run[] {
  const width = maxCols(grid)
  const runs: Run[] = []

  for (let row = 0; row < grid.length; row++) {
    const line = grid[row]
    if (!line) continue
    runs.push(
      ...runsInLine(line.length, 'h', (col) => {
        const cell = at(grid, { row, col })
        return cell ? { color: cell.color, pos: { row, col } } : null
      }),
    )
  }

  for (let col = 0; col < width; col++) {
    runs.push(
      ...runsInLine(grid.length, 'v', (row) => {
        const cell = at(grid, { row, col })
        return cell ? { color: cell.color, pos: { row, col } } : null
      }),
    )
  }

  return runs
}

/**
 * Groups runs that share at least one cell. Only a horizontal and a vertical run can
 * overlap, but the relation is transitive: a column crossing two rows ties all three
 * runs into a single match, so the merge has to close over the whole group rather
 * than pair runs up.
 */
function mergeRuns(runs: Run[]): Run[][] {
  const parent = runs.map((_, i) => i)

  const find = (i: number): number => {
    let root = i
    while (parent[root] !== root) root = parent[root] as number
    return root
  }

  const union = (a: number, b: number) => {
    const rootA = find(a)
    const rootB = find(b)
    if (rootA !== rootB) parent[rootB] = rootA
  }

  // One pass per cell: whoever claimed the cell first absorbs the later run.
  const owner = new Map<string, number>()
  for (let i = 0; i < runs.length; i++) {
    for (const cell of runs[i]?.cells ?? []) {
      const previous = owner.get(key(cell))
      if (previous === undefined) owner.set(key(cell), i)
      else union(previous, i)
    }
  }

  const groups = new Map<number, Run[]>()
  for (let i = 0; i < runs.length; i++) {
    const run = runs[i]
    if (!run) continue
    const root = find(i)
    const group = groups.get(root)
    if (group) group.push(run)
    else groups.set(root, [run])
  }

  return [...groups.values()]
}

function shapeOf(group: Run[], size: number): MatchShape {
  // design.md §4: a straight five outranks an L/T. A five crossed by a three is
  // still a colour bomb, not a wrapped bomb — so a long run wins over `corner`,
  // and that check has to come before the crossing check, not after.
  if (group.some((run) => run.cells.length >= 5)) return 'line5'

  const crossed =
    group.some((run) => run.orientation === 'h') &&
    group.some((run) => run.orientation === 'v')
  if (crossed) return 'corner'
  if (size === 3) return 'line3'
  if (size === 4) return 'line4'
  return 'line5'
}

/** Row-major order is the contract: every consumer reads `cells[0]` as top-left. */
function sortRowMajor(cells: Pos[]): Pos[] {
  return [...cells].sort((a, b) => a.row - b.row || a.col - b.col)
}

export function findMatches(grid: Grid): Match[] {
  return mergeRuns(allRuns(grid)).map((group) => {
    const seen = new Map<string, Pos>()
    for (const run of group) {
      for (const cell of run.cells) seen.set(key(cell), cell)
    }
    const cells = sortRowMajor([...seen.values()])
    return {
      cells,
      color: group[0]?.color as Color,
      shape: shapeOf(group, cells.length),
    }
  })
}
