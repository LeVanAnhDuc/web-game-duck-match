import { describe, expect, it } from 'vitest'
import { parseBoard } from '../../test/helpers/board'
import { swap } from './board'
import { initProgress } from './goals'
import { findHint } from './hint'
import { findMatches } from './match'
import { findLegalMoves, isLegalSwap } from './moves'
import { seedFrom } from './rng'
import type { Grid, LevelConfig, Pos, Session, SessionStatus } from './types'

const level: LevelConfig = {
  id: 1,
  rows: 4,
  cols: 5,
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  moves: 20,
  goals: [{ kind: 'score', target: 100000 }],
  stars: [1, 2, 3],
}

/**
 * `findHint` reads only `grid` and `status`, so a session is assembled by hand
 * rather than played into shape — a board designed to hold one specific move is
 * the whole point of these fixtures.
 */
function sessionOf(text: string, status: SessionStatus = 'playing'): Session {
  return {
    level,
    grid: parseBoard(text),
    rng: seedFrom(1),
    movesLeft: 20,
    score: 0,
    progress: initProgress(level.goals),
    status,
    nextPieceId: 100,
  }
}

/** Size of the biggest match a move would make, which is what ranking reads. */
function biggestMatch(grid: Grid, move: { from: Pos; to: Pos }): number {
  return findMatches(swap(grid, move.from, move.to)).reduce(
    (largest, match) => Math.max(largest, match.cells.length),
    0,
  )
}

/** Row 2 can be made into four yellows; row 0 can only be made into three reds. */
const THREE_THEN_FOUR = 'RRGBP / BGRPB / YYBYP / PBYGO'

/** No match and no legal swap — the shape of board that forces a reshuffle. */
const DEAD_BOARD = 'RYGG / BBGR / BYRB / YRBY'

describe('findHint', () => {
  it('returns a move that is actually legal', () => {
    const session = sessionOf(THREE_THEN_FOUR)
    const hint = findHint(session)

    expect(hint).not.toBeNull()
    expect(isLegalSwap(session.grid, hint!.from, hint!.to)).toBe(true)
  })

  it.each<SessionStatus>(['won', 'lost'])(
    'returns null when the level is %s',
    (status) => {
      // A finished level has nothing to nudge towards, and offering a move there
      // would invite an input the engine rejects anyway (`applySwap` no-ops).
      expect(findHint(sessionOf(THREE_THEN_FOUR, status))).toBeNull()
    },
  )

  it('returns null when the board has no legal move', () => {
    expect(findHint(sessionOf(DEAD_BOARD))).toBeNull()
  })

  it('prefers a move that would make a match of four or more', () => {
    const session = sessionOf(THREE_THEN_FOUR)

    // The fixture only proves the ranking if the plain fallback is a three: with
    // the first legal move already making four there would be nothing to prefer.
    const fallback = findLegalMoves(session.grid)[0]
    expect(fallback).toBeDefined()
    expect(biggestMatch(session.grid, fallback!)).toBe(3)

    const hint = findHint(session)
    expect(biggestMatch(session.grid, hint!)).toBeGreaterThanOrEqual(4)
  })

  it('falls back to the first legal move when no move makes four', () => {
    const session = sessionOf('RRGBP / BGRPB / YOYGO / PBGYO')
    const moves = findLegalMoves(session.grid)
    expect(moves.every((move) => biggestMatch(session.grid, move) === 3)).toBe(true)

    expect(findHint(session)).toEqual(moves[0])
  })

  it('is deterministic for one session', () => {
    // Invariant 1: no `Math.random` anywhere in the engine, so the same board
    // must always teach the same move — a hint that moved between two idle
    // periods would look like the board had changed underneath the player.
    const session = sessionOf(THREE_THEN_FOUR)
    expect(findHint(session)).toEqual(findHint(session))
    expect(findHint(session)).toEqual(findHint(sessionOf(THREE_THEN_FOUR)))
  })
})
