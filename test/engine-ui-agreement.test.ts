import { describe, expect, it } from 'vitest'
import { applySwap, newSession } from '@/engine'
import type { GameEvent, Session } from '@/engine'
import { findLegalMoves } from '@/engine/moves'
import { buildTimeline } from '@/game/timeline'
import { projectEvents } from '@/game/project'
import { LEVELS } from '@/levels/levels'

function pointsOf(events: GameEvent[]): number {
  let total = 0
  for (const e of events) {
    if (e.t === 'matched' || e.t === 'specialActivated') total += e.points
  }
  return total
}

/**
 * Does the screen agree with the engine?
 *
 * Every other test checks one side. This one plays six levels × twelve seeds ×
 * sixty pseudo-random legal moves and, after each move, asserts three things that
 * a per-module test structurally cannot:
 *
 *   1. the score moved by exactly the points the events carried — otherwise the
 *      animated score can never add up to the engine's (invariant 2);
 *   2. folding every event of the move over the pre-move session reproduces the
 *      session `applySwap` returned, grid, score and goals alike — otherwise the
 *      animation is showing the player something untrue;
 *   3. no piece id appears twice on the board — a duplicate breaks React keys and
 *      the once-per-id activation guard at the same time (invariants 5 and 9).
 *
 * Written during code review, which is also where it earned its keep: it is what
 * showed the swapped colour leaking out of round 0 into later cascade rounds.
 *
 * The move choice is a hand-rolled LCG rather than the engine rng, deliberately:
 * the point is to walk paths the engine's own sequence would never take.
 */

describe('engine and projection agreement', () => {
  it('projection matches engine over many seeds and levels', () => {
    const problems: string[] = []
    let moves = 0
    for (const level of LEVELS) {
      for (let seed = 1; seed <= 12; seed++) {
        let session: Session = newSession({ ...level, moves: 200, goals: [{ kind: 'score', target: 10_000_000 }] }, seed)
        let rngIndex = seed
        for (let i = 0; i < 60; i++) {
          const legal = findLegalMoves(session.grid)
          if (legal.length === 0) break
          rngIndex = (rngIndex * 1103515245 + 12345) >>> 0
          const move = legal[rngIndex % legal.length]!
          const result = applySwap(session, move.from, move.to)
          moves++
          if (result.events.length === 0) break

          const scoreDelta = result.session.score - session.score
          const evPoints = pointsOf(result.events)
          if (scoreDelta !== evPoints) {
            problems.push(
              `level ${level.id} seed ${seed} move ${i}: score delta ${scoreDelta} != event points ${evPoints}`,
            )
          }

          if (!result.events.some((e) => e.t === 'reshuffled')) {
            const shown = buildTimeline(result.events, { reducedMotion: false }).reduce(
              (acc, step) => projectEvents(acc, step.events),
              session,
            )
            if (JSON.stringify(shown.grid) !== JSON.stringify(result.session.grid)) {
              problems.push(`level ${level.id} seed ${seed} move ${i}: grid diverged`)
            }
            if (shown.score !== result.session.score) {
              problems.push(`level ${level.id} seed ${seed} move ${i}: score diverged ${shown.score} vs ${result.session.score}`)
            }
            if (JSON.stringify(shown.progress) !== JSON.stringify(result.session.progress)) {
              problems.push(`level ${level.id} seed ${seed} move ${i}: progress diverged`)
            }
          }

          session = result.session
          if (session.status !== 'playing') break
          if (problems.length > 8) break
        }
        if (problems.length > 8) break
      }
      if (problems.length > 8) break
    }
    console.log('moves played', moves)
    expect(problems.slice(0, 10)).toEqual([])
  })

  it('duplicate piece ids never appear on the board', () => {
    const problems: string[] = []
    for (const level of LEVELS) {
      for (let seed = 1; seed <= 6; seed++) {
        let session: Session = newSession({ ...level, moves: 200, goals: [{ kind: 'score', target: 10_000_000 }] }, seed)
        let rngIndex = seed
        for (let i = 0; i < 40; i++) {
          const legal = findLegalMoves(session.grid)
          if (legal.length === 0) break
          rngIndex = (rngIndex * 1103515245 + 12345) >>> 0
          const move = legal[rngIndex % legal.length]!
          session = applySwap(session, move.from, move.to).session
          const ids = new Set<number>()
          for (const row of session.grid) {
            for (const cell of row) {
              if (!cell) continue
              if (ids.has(cell.id)) problems.push(`level ${level.id} seed ${seed} move ${i}: duplicate id ${cell.id}`)
              ids.add(cell.id)
            }
          }
          if (problems.length > 5) break
        }
        if (problems.length > 5) break
      }
      if (problems.length > 5) break
    }
    expect(problems.slice(0, 6)).toEqual([])
  })
})
