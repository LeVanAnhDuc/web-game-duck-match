import { describe, expect, it } from 'vitest'
import { applySwap, newSession } from '@/engine'
import type { LevelConfig } from '@/engine'
import { findLegalMoves } from '@/engine/moves'
import { buildTimeline } from './timeline'
import { projectEvents } from './project'

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 30,
  goals: [{ kind: 'score', target: 1_000_000 }],
  stars: [1, 2, 3],
}

describe('projectEvents', () => {
  it('returns the same session for an empty event list', () => {
    const session = newSession(level, 1)
    expect(projectEvents(session, [])).toBe(session)
  })

  it('spends the move as soon as the pieces move', () => {
    const session = newSession(level, 1)
    const move = findLegalMoves(session.grid)[0]!
    const shown = projectEvents(session, [{ t: 'swapped', ...move }])
    expect(shown.movesLeft).toBe(session.movesLeft - 1)
  })

  it('swaps the two pieces on the shown board', () => {
    const session = newSession(level, 1)
    const move = findLegalMoves(session.grid)[0]!
    const before = {
      from: session.grid[move.from.row]?.[move.from.col],
      to: session.grid[move.to.row]?.[move.to.col],
    }
    const shown = projectEvents(session, [{ t: 'swapped', ...move }])
    expect(shown.grid[move.to.row]?.[move.to.col]).toEqual(before.from)
    expect(shown.grid[move.from.row]?.[move.from.col]).toEqual(before.to)
  })

  it('spends no move on a reverted swap', () => {
    const session = newSession(level, 1)
    const shown = projectEvents(session, [
      { t: 'swapReverted', from: { row: 0, col: 0 }, to: { row: 0, col: 1 } },
    ])
    expect(shown.movesLeft).toBe(session.movesLeft)
    expect(shown.grid).toEqual(session.grid)
  })

  it('empties matched cells and adds only the points the engine reported', () => {
    const session = newSession(level, 1)
    const shown = projectEvents(session, [
      {
        t: 'matched',
        cells: [
          { row: 0, col: 0 },
          { row: 0, col: 1 },
        ],
        cascade: 1,
        points: 137,
      },
    ])
    expect(shown.grid[0]?.[0]).toBeNull()
    expect(shown.grid[0]?.[1]).toBeNull()
    expect(shown.score).toBe(session.score + 137)
  })

  it('does not mutate the session it was given', () => {
    const session = newSession(level, 1)
    const before = JSON.stringify(session)
    projectEvents(session, [
      { t: 'matched', cells: [{ row: 3, col: 3 }], cascade: 1, points: 60 },
    ])
    expect(JSON.stringify(session)).toBe(before)
  })

  it('moves fallen pieces without losing one to its own column', () => {
    const session = newSession(level, 1)
    const top = session.grid[0]?.[0]
    const shown = projectEvents(session, [
      {
        t: 'fell',
        moves: [
          { from: { row: 0, col: 0 }, to: { row: 1, col: 0 } },
          { from: { row: 1, col: 0 }, to: { row: 2, col: 0 } },
        ],
      },
    ])
    expect(shown.grid[1]?.[0]).toEqual(top)
    expect(shown.grid[0]?.[0]).toBeNull()
  })

  it('places a spawned special from the event, not from a guess', () => {
    const session = newSession(level, 1)
    const piece = { id: 9999, color: 'red' as const, special: 'wrapped' as const }
    const shown = projectEvents(session, [
      { t: 'specialSpawned', at: { row: 2, col: 2 }, special: 'wrapped', piece },
    ])
    expect(shown.grid[2]?.[2]).toEqual(piece)
  })

  it('replaces only the goal the engine reported', () => {
    const twoGoals: LevelConfig = {
      ...level,
      goals: [
        { kind: 'score', target: 100 },
        { kind: 'collect', per: { red: 3 } },
      ],
    }
    const session = newSession(twoGoals, 1)
    const shown = projectEvents(session, [
      {
        t: 'goalProgressed',
        index: 1,
        progress: { kind: 'collect', current: { red: 3 }, per: { red: 3 }, done: true },
      },
    ])
    expect(shown.progress[0]).toEqual(session.progress[0])
    expect(shown.progress[1]).toMatchObject({ done: true })
  })

  /**
   * The one that matters: if the projection and the engine ever disagree, the
   * animation is telling the player something that is not true.
   */
  it('reproduces the engine session exactly, over many real moves', () => {
    let session = newSession(level, 21)
    let checked = 0

    for (let i = 0; i < 25; i++) {
      const move = findLegalMoves(session.grid)[0]
      if (!move) break
      const result = applySwap(session, move.from, move.to)

      // No move is skipped any more. A reshuffle used to be unprojectable because
      // its event carried no board; since ADR-0009 it carries one, so EVERY event
      // kind can be replayed and this assertion covers the whole union.
      const shown = buildTimeline(result.events, { reducedMotion: false }).reduce(
        (acc, step) => projectEvents(acc, step.events, step.visual),
        session,
      )

      expect(shown.grid).toEqual(result.session.grid)
      expect(shown.score).toBe(result.session.score)
      expect(shown.movesLeft).toBe(result.session.movesLeft)
      expect(shown.progress).toEqual(result.session.progress)

      session = result.session
      checked += 1
      if (session.status !== 'playing') break
    }

    expect(checked).toBeGreaterThan(5)
  })
})
