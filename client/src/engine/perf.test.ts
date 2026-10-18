import { describe, expect, it } from 'vitest'
import { findLegalMoves } from './moves'
import { applySwap, newSession } from './session'
import type { LevelConfig } from './types'

/**
 * NFR-PERF-05: applySwap on the biggest phase-one board must stay under 16ms at
 * p95 — one animation frame. Measured, not assumed, because the cascade loop is
 * the one place where a rule change can quietly cost an order of magnitude.
 */
const big: LevelConfig = {
  id: 6,
  rows: 9,
  cols: 9,
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  moves: 100000,
  goals: [{ kind: 'score', target: Number.MAX_SAFE_INTEGER }],
  stars: [1, 2, 3],
}

describe('applySwap performance', () => {
  it('stays under 16ms at p95 over 1000 moves on a 9x9 board', () => {
    let session = newSession(big, 99)
    const samples: number[] = []

    for (let i = 0; i < 1000; i++) {
      const move = findLegalMoves(session.grid)[0]
      if (!move) break
      const started = performance.now()
      const out = applySwap(session, move.from, move.to)
      samples.push(performance.now() - started)
      session = out.session
    }

    expect(samples.length).toBeGreaterThan(500)
    samples.sort((a, b) => a - b)
    const p95 = samples[Math.floor(samples.length * 0.95)] as number
    expect(p95).toBeLessThan(16)
  })
})
