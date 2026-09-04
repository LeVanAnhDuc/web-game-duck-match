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

describe('review fuzz', () => {
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
