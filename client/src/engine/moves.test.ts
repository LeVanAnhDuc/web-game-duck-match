import { describe, expect, it } from 'vitest'
import { colorLetters, formatBoard, parseBoard } from '../../test/helpers/board'
import { findMatches } from './match'
import {
  BoardGenerationFailedError,
  activatesOnSwap,
  findLegalMoves,
  generateBoard,
  hasLegalMove,
  isLegalSwap,
  reshuffle,
} from './moves'
import { seedFrom } from './rng'
import type { LevelConfig } from './types'

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 20,
  goals: [{ kind: 'score', target: 1500 }],
  stars: [1500, 2200, 3000],
}

/**
 * A genuinely deadlocked board: no match on it, and no swap creates one. Found by
 * brute force, because the obvious guess is wrong — a two-colour checkerboard is
 * full of legal moves, since swapping two vertical neighbours lines up three
 * horizontally.
 */
const DEADLOCK = 'RYGG / BBGR / BYRB / YRBY'

describe('isLegalSwap', () => {
  it('accepts a swap that makes a match', () => {
    const grid = parseBoard('RRB / BBR / GGY')
    expect(isLegalSwap(grid, { row: 0, col: 2 }, { row: 1, col: 2 })).toBe(true)
  })

  it('rejects a swap that makes nothing', () => {
    expect(
      isLegalSwap(parseBoard(DEADLOCK), { row: 0, col: 0 }, { row: 0, col: 1 }),
    ).toBe(false)
  })

  it('rejects non-adjacent and identical positions', () => {
    const grid = parseBoard('RRB / BBR / GGY')
    expect(isLegalSwap(grid, { row: 0, col: 0 }, { row: 2, col: 2 })).toBe(false)
    expect(isLegalSwap(grid, { row: 0, col: 0 }, { row: 0, col: 0 })).toBe(false)
  })

  it('rejects a swap involving an empty cell', () => {
    const grid = parseBoard('R.B / BBR / GGY')
    expect(isLegalSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false)
  })
})

describe('activatesOnSwap', () => {
  it('is true for a colour bomb next to a plain piece', () => {
    const grid = parseBoard('R#YGG / BBGR / BYRB / YRBY')
    expect(activatesOnSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true)
  })

  it('is true for two specials swapped together — phase 1 activates both', () => {
    const grid = parseBoard('R>Y*GG / BBGR / BYRB / YRBY')
    expect(activatesOnSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true)
  })

  it('is false for a stripe next to a plain piece — it needs a match', () => {
    const grid = parseBoard('R>YGG / BBGR / BYRB / YRBY')
    expect(activatesOnSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false)
  })

  it('is false for two plain pieces', () => {
    const grid = parseBoard(DEADLOCK)
    expect(activatesOnSwap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })).toBe(false)
  })
})

describe('findLegalMoves', () => {
  it('finds a swap that would make a match', () => {
    expect(findLegalMoves(parseBoard('RRB / BBR / GGY')).length).toBeGreaterThan(0)
  })

  it('reports none on a deadlocked board', () => {
    expect(findLegalMoves(parseBoard(DEADLOCK))).toEqual([])
    expect(hasLegalMove(parseBoard(DEADLOCK))).toBe(false)
  })

  it('counts a colorBomb swap with a normal piece as legal', () => {
    // the board is otherwise deadlocked, so only the bomb can make this true
    expect(hasLegalMove(parseBoard('R#YGG / BBGR / BYRB / YRBY'))).toBe(true)
  })

  it('never reports the same swap twice', () => {
    const keys = findLegalMoves(parseBoard('RRB / BBR / GGY')).map(
      (move) => `${move.from.row},${move.from.col}-${move.to.row},${move.to.col}`,
    )
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('only reports orthogonal neighbours', () => {
    for (const move of findLegalMoves(parseBoard('RRB / BBR / GGY'))) {
      const distance =
        Math.abs(move.from.row - move.to.row) + Math.abs(move.from.col - move.to.col)
      expect(distance).toBe(1)
    }
  })

  it('agrees with hasLegalMove', () => {
    for (const text of ['RRB / BBR / GGY', DEADLOCK, 'RGB / GBR / BRG']) {
      const grid = parseBoard(text)
      expect(hasLegalMove(grid)).toBe(findLegalMoves(grid).length > 0)
    }
  })
})

describe('reshuffle', () => {
  it('keeps the exact multiset of pieces', () => {
    const grid = parseBoard(DEADLOCK)
    const out = reshuffle(grid, seedFrom(4))
    expect(colorLetters(out.grid)).toEqual(colorLetters(grid))
  })

  it('produces a playable board and says so', () => {
    const grid = parseBoard('RBRBG / BRBRG / RBRBY / BRBRY / GGYYR')
    const out = reshuffle(grid, seedFrom(11))
    expect(out.settled).toBe(true)
    expect(hasLegalMove(out.grid)).toBe(true)
    expect(findMatches(out.grid)).toEqual([])
  })

  it('does not mutate the input grid', () => {
    const grid = parseBoard(DEADLOCK)
    const before = formatBoard(grid)
    reshuffle(grid, seedFrom(4))
    expect(formatBoard(grid)).toBe(before)
  })

  it('is deterministic for one seed', () => {
    const grid = parseBoard('RBRBG / BRBRG / RBRBY / BRBRY / GGYYR')
    const a = reshuffle(grid, seedFrom(21))
    const b = reshuffle(grid, seedFrom(21))
    expect(formatBoard(a.grid)).toBe(formatBoard(b.grid))
  })

  it('gives up after ten attempts instead of throwing, so the caller can rebuild', () => {
    // A 2x2 board cannot hold a run of three, so no arrangement of it is ever
    // playable — the one shape where ten shuffles provably cannot settle.
    const out = reshuffle(parseBoard('RB / BR'), seedFrom(1))
    expect(out.settled).toBe(false)
    expect(out.attempts).toBe(10)
  })

  it('advances the rng even when it gives up, so the caller does not loop forever', () => {
    const out = reshuffle(parseBoard('RB / BR'), seedFrom(1))
    expect(out.rng).not.toBe(seedFrom(1))
  })
})

describe('generateBoard', () => {
  it.each([1, 2, 3])('starts with no match and at least one move (seed %i)', (seed) => {
    const { grid } = generateBoard(level, seedFrom(seed), 1)
    expect(findMatches(grid)).toEqual([])
    expect(hasLegalMove(grid)).toBe(true)
  })

  it('fills the whole board with the level size', () => {
    const { grid } = generateBoard(level, seedFrom(1), 1)
    expect(grid).toHaveLength(7)
    expect(grid.every((row) => row.length === 7)).toBe(true)
    expect(grid.flat().every((cell) => cell !== null)).toBe(true)
  })

  it('uses only the level colours and no specials', () => {
    const { grid } = generateBoard(level, seedFrom(1), 1)
    for (const cell of grid.flat()) {
      expect(level.colors).toContain(cell?.color)
      expect(cell?.special).toBe('none')
    }
  })

  it('hands out unique ids and reports the next one', () => {
    const out = generateBoard(level, seedFrom(1), 100)
    const ids = out.grid.flat().map((cell) => cell?.id)
    expect(new Set(ids).size).toBe(49)
    expect(out.nextPieceId).toBe(149)
  })

  it('is deterministic for one seed', () => {
    const a = generateBoard(level, seedFrom(8), 1)
    const b = generateBoard(level, seedFrom(8), 1)
    expect(formatBoard(a.grid)).toBe(formatBoard(b.grid))
  })

  it('works on the biggest phase-one board', () => {
    const big: LevelConfig = {
      ...level,
      rows: 9,
      cols: 9,
      colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    }
    const { grid } = generateBoard(big, seedFrom(99), 1)
    expect(findMatches(grid)).toEqual([])
    expect(hasLegalMove(grid)).toBe(true)
  })

  it('throws a named error for a level that cannot produce a playable board', () => {
    const impossible: LevelConfig = { ...level, rows: 2, cols: 2, colors: ['red'] }
    expect(() => generateBoard(impossible, seedFrom(1), 1)).toThrow(
      BoardGenerationFailedError,
    )
  })
})
