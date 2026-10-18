import { describe, expect, it } from 'vitest'
import { isAdjacent } from './board'
import { findLegalMoves, hasLegalMove } from './moves'
import { findMatches } from './match'
import { applySwap, newSession } from './session'
import type { LevelConfig, Pos } from './types'

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 3,
  goals: [{ kind: 'score', target: 100 }],
  stars: [100, 200, 300],
}

const key = (from: Pos, to: Pos) => `${from.row},${from.col}-${to.row},${to.col}`

/** An adjacent pair the engine will reject — found, not guessed. */
function illegalPair(grid: Parameters<typeof findLegalMoves>[0]): { from: Pos; to: Pos } {
  const legal = new Set(findLegalMoves(grid).map((move) => key(move.from, move.to)))
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < (grid[row]?.length ?? 0); col++) {
      const from = { row, col }
      for (const to of [
        { row, col: col + 1 },
        { row: row + 1, col },
      ]) {
        if (!isAdjacent(from, to)) continue
        if (to.row >= grid.length || to.col >= (grid[row]?.length ?? 0)) continue
        if (!legal.has(key(from, to))) return { from, to }
      }
    }
  }
  throw new Error('no illegal adjacent pair on this board')
}

describe('newSession', () => {
  it('starts playing, full board, full moves', () => {
    const session = newSession(level, 1)
    expect(session.status).toBe('playing')
    expect(session.movesLeft).toBe(3)
    expect(session.score).toBe(0)
    expect(session.grid.flat().every((cell) => cell !== null)).toBe(true)
  })

  it('starts with no match and a legal move available', () => {
    const session = newSession(level, 7)
    expect(findMatches(session.grid)).toEqual([])
    expect(hasLegalMove(session.grid)).toBe(true)
  })

  it('is reproducible from the seed', () => {
    expect(newSession(level, 5).grid).toEqual(newSession(level, 5).grid)
  })

  it('gives different boards for different seeds', () => {
    const a = JSON.stringify(newSession(level, 1).grid)
    const b = JSON.stringify(newSession(level, 2).grid)
    expect(a).not.toBe(b)
  })

  it('initialises goal progress from the level', () => {
    expect(newSession(level, 1).progress).toEqual([
      { kind: 'score', current: 0, target: 100, done: false },
    ])
  })
})

describe('applySwap', () => {
  it('reverts a swap that makes no match and does not spend a move', () => {
    const session = newSession(level, 1)
    const { from, to } = illegalPair(session.grid)
    const out = applySwap(session, from, to)
    expect(out.events).toEqual([{ t: 'swapReverted', from, to }])
    expect(out.session.movesLeft).toBe(3)
    expect(out.session.grid).toEqual(session.grid)
  })

  it('spends exactly one move on a matching swap', () => {
    const session = newSession(level, 1)
    const move = findLegalMoves(session.grid)[0]!
    const out = applySwap(session, move.from, move.to)
    expect(out.session.movesLeft).toBe(2)
    expect(out.events[0]).toMatchObject({ t: 'swapped' })
  })

  it('scores something on a matching swap', () => {
    const session = newSession(level, 1)
    const move = findLegalMoves(session.grid)[0]!
    expect(applySwap(session, move.from, move.to).session.score).toBeGreaterThan(0)
  })

  it('does not mutate the session it was given', () => {
    const session = newSession(level, 1)
    const before = JSON.stringify(session)
    const move = findLegalMoves(session.grid)[0]!
    applySwap(session, move.from, move.to)
    expect(JSON.stringify(session)).toBe(before)
  })

  it('returns a new session object', () => {
    const session = newSession(level, 1)
    const move = findLegalMoves(session.grid)[0]!
    expect(applySwap(session, move.from, move.to).session).not.toBe(session)
  })

  it('rejects a non-adjacent swap without spending a move or an event', () => {
    const session = newSession(level, 1)
    const out = applySwap(session, { row: 0, col: 0 }, { row: 3, col: 3 })
    expect(out.events).toEqual([])
    expect(out.session).toBe(session)
  })

  it('rejects a swap with a cell outside the board', () => {
    const session = newSession(level, 1)
    const out = applySwap(session, { row: 0, col: 0 }, { row: -1, col: 0 })
    expect(out.events).toEqual([])
    expect(out.session).toBe(session)
  })

  it('leaves the board playable after every move', () => {
    let session = newSession({ ...level, moves: 12 }, 3)
    for (let i = 0; i < 8; i++) {
      const move = findLegalMoves(session.grid)[0]
      if (!move) break
      session = applySwap(session, move.from, move.to).session
      if (session.status !== 'playing') break
      expect(hasLegalMove(session.grid)).toBe(true)
      expect(findMatches(session.grid)).toEqual([])
    }
  })

  it('wins as soon as the goal is met and then refuses further moves', () => {
    const easy: LevelConfig = {
      ...level,
      moves: 30,
      goals: [{ kind: 'score', target: 1 }],
    }
    const session = newSession(easy, 1)
    const move = findLegalMoves(session.grid)[0]!
    const out = applySwap(session, move.from, move.to)
    expect(out.session.status).toBe('won')
    expect(out.events.at(-1)).toMatchObject({ t: 'levelWon' })

    const again = applySwap(out.session, move.from, move.to)
    expect(again.events).toEqual([])
    expect(again.session).toBe(out.session)
  })

  it('reports stars with the win', () => {
    const easy: LevelConfig = {
      ...level,
      moves: 30,
      goals: [{ kind: 'score', target: 1 }],
      stars: [1, 1000000, 2000000],
    }
    const session = newSession(easy, 1)
    const move = findLegalMoves(session.grid)[0]!
    const won = applySwap(session, move.from, move.to).events.at(-1)
    expect(won).toMatchObject({ t: 'levelWon', stars: 1 })
  })

  it('loses when the last move does not finish the goal', () => {
    const hard: LevelConfig = {
      ...level,
      moves: 1,
      goals: [{ kind: 'score', target: 999999 }],
    }
    const session = newSession(hard, 1)
    const move = findLegalMoves(session.grid)[0]!
    const out = applySwap(session, move.from, move.to)
    expect(out.session.status).toBe('lost')
    expect(out.events.at(-1)).toMatchObject({ t: 'levelLost' })
  })

  it('does not lose on a last move that does finish the goal', () => {
    const tight: LevelConfig = {
      ...level,
      moves: 1,
      goals: [{ kind: 'score', target: 1 }],
    }
    const session = newSession(tight, 1)
    const move = findLegalMoves(session.grid)[0]!
    const out = applySwap(session, move.from, move.to)
    expect(out.session.status).toBe('won')
    expect(out.session.movesLeft).toBe(0)
  })

  it('a reverted swap does not end the level even at zero moves left', () => {
    const tight: LevelConfig = {
      ...level,
      moves: 1,
      goals: [{ kind: 'score', target: 999999 }],
    }
    const session = newSession(tight, 1)
    const { from, to } = illegalPair(session.grid)
    const out = applySwap(session, from, to)
    expect(out.session.status).toBe('playing')
    expect(out.session.movesLeft).toBe(1)
  })

  it('is deterministic: same session and move give the same result', () => {
    const session = newSession(level, 11)
    const move = findLegalMoves(session.grid)[0]!
    const a = applySwap(session, move.from, move.to)
    const b = applySwap(session, move.from, move.to)
    expect(JSON.stringify(a)).toBe(JSON.stringify(b))
  })

  it('keeps piece ids unique across many moves', () => {
    let session = newSession(
      { ...level, moves: 40, goals: [{ kind: 'score', target: 1e9 }] },
      4,
    )
    for (let i = 0; i < 20; i++) {
      const move = findLegalMoves(session.grid)[0]
      if (!move) break
      session = applySwap(session, move.from, move.to).session
      const ids = session.grid.flat().map((cell) => cell?.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })
})
