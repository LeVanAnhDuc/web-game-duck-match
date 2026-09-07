import { describe, expect, it } from 'vitest'
import { formatBoard, parseBoard } from '../../test/helpers/board'
import { at, collapse, isAdjacent, refill, set, swap } from './board'
import { seedFrom } from './rng'

describe('board', () => {
  it('reads a cell by position', () => {
    const grid = parseBoard('RRB / GBR / YYY')
    expect(at(grid, { row: 1, col: 0 })?.color).toBe('green')
  })

  it('reads out of bounds as empty instead of throwing', () => {
    const grid = parseBoard('RR / GG')
    expect(at(grid, { row: 9, col: 9 })).toBeNull()
  })

  it('swap returns a new grid and leaves the input untouched', () => {
    const grid = parseBoard('RB / GY')
    const next = swap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })
    expect(formatBoard(next)).toBe('BR / GY')
    expect(formatBoard(grid)).toBe('RB / GY')
  })

  it('set returns a new grid and leaves the input untouched', () => {
    const grid = parseBoard('RB / GY')
    const next = set(grid, { row: 0, col: 0 }, null)
    expect(formatBoard(next)).toBe('.B / GY')
    expect(formatBoard(grid)).toBe('RB / GY')
  })

  it('keeps specials through a round trip', () => {
    expect(formatBoard(parseBoard('R>B* / G#Y^'))).toBe('R>B* / G#Y^')
  })

  it('isAdjacent accepts orthogonal neighbours only', () => {
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 1, col: 0 })).toBe(true)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 0 })).toBe(false)
  })

  it('collapse drops pieces straight down and reports the moves', () => {
    const grid = parseBoard('R.. / .G. / ..B')
    const { grid: after, moves } = collapse(grid)
    expect(formatBoard(after)).toBe('... / ... / RGB')
    // B already sits on the bottom row, so only R and G actually move.
    expect(moves).toHaveLength(2)
    expect(moves.every((move) => move.from.col === move.to.col)).toBe(true)
  })

  it('collapse reports nothing when the board is already settled', () => {
    const { moves } = collapse(parseBoard('RGB / GBR / BRG'))
    expect(moves).toEqual([])
  })

  it('collapse keeps stack order within a column', () => {
    const grid = parseBoard('R.. / G.. / ...')
    expect(formatBoard(collapse(grid).grid)).toBe('... / R.. / G..')
  })

  it('refill fills only empty cells, from the rng, with fresh ids', () => {
    const grid = parseBoard('... / ... / RGB')
    const out = refill(grid, ['red', 'blue'], seedFrom(5), 100)
    expect(out.cells).toHaveLength(6)
    expect(out.grid.flat().every((cell) => cell !== null)).toBe(true)
    expect(out.nextPieceId).toBe(106)
    expect(new Set(out.cells.map((cell) => cell.piece.id)).size).toBe(6)
    expect(out.cells.every((cell) => ['red', 'blue'].includes(cell.piece.color))).toBe(true)
  })

  it('refill is deterministic for one seed', () => {
    const grid = parseBoard('... / ... / RGB')
    const a = refill(grid, ['red', 'blue', 'green'], seedFrom(5), 1)
    const b = refill(grid, ['red', 'blue', 'green'], seedFrom(5), 1)
    expect(formatBoard(a.grid)).toBe(formatBoard(b.grid))
  })

  it('refill on a full board changes nothing', () => {
    const grid = parseBoard('RGB / GBR / BRG')
    const out = refill(grid, ['red'], seedFrom(1), 50)
    expect(out.cells).toEqual([])
    expect(out.nextPieceId).toBe(50)
  })
})
