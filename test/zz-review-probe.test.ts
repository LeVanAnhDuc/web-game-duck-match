import { describe, expect, it } from 'vitest'
import { resolveBoard } from '@/engine/resolve'
import { initProgress } from '@/engine/goals'
import type { Color, Grid, LevelConfig, Piece, Special } from '@/engine/types'

let id = 1
const p = (color: Color, special: Special = 'none'): Piece => ({ id: id++, color, special })

function gridOf(spec: string[]): Grid {
  const map: Record<string, Color> = { r: 'red', b: 'blue', g: 'green', y: 'yellow', p: 'purple', o: 'orange' }
  return spec.map((row) =>
    row.split(' ').filter(Boolean).map((token) => {
      const color = map[token[0]!]!
      const special: Special =
        token[1] === 'H' ? 'stripedH' : token[1] === 'V' ? 'stripedV' : token[1] === 'W' ? 'wrapped' : token[1] === 'C' ? 'colorBomb' : 'none'
      return p(color, special)
    }),
  )
}

const level: LevelConfig = {
  id: 1,
  rows: 6,
  cols: 6,
  colors: ['red', 'blue', 'green', 'yellow'],
  moves: 30,
  goals: [{ kind: 'score', target: 1_000_000 }],
  stars: [1, 2, 3],
}

describe('probe: swappedColor leaks into cascade rounds', () => {
  it('a colour bomb cleared by a cascade hunts the swapped colour, not its own', () => {
    // Round 0: nothing matched initially; seed the top-left blue stripedH so it fires
    // horizontally. That drops pieces which then form a green match in round 1
    // containing a GREEN colour bomb. The bomb should hunt green (its own colour)
    // because nobody swapped it — but resolveBoard passes the round-0 swappedColor.
    const grid = gridOf([
      'bH y y y y y',
      'g  r b y r b',
      'gC r b y r b',
      'g  r b y r b',
      'y  b r b y r',
      'b  y b r b y',
    ])

    // Deliberately declare that the player swapped the stripe with a RED piece.
    const out = resolveBoard({
      grid,
      rng: 1,
      nextPieceId: 999,
      level,
      score: 0,
      progress: initProgress(level.goals),
      swappedFrom: { row: 0, col: 0 },
      swappedTo: { row: 0, col: 1 },
      swappedColor: 'red',
      seeds: [{ row: 0, col: 0 }],
    })

    const bombActivations = out.events.filter(
      (e) => e.t === 'specialActivated' && e.special === 'colorBomb',
    )
    console.log('bomb activations:', JSON.stringify(bombActivations, null, 1).slice(0, 2000))
    console.log(
      'all events:',
      out.events.map((e) => (e.t === 'specialActivated' ? `${e.t}:${e.special}@${e.at.row},${e.at.col} x${e.cleared.length}` : e.t)).join(' | '),
    )
    expect(bombActivations.length).toBeGreaterThan(0)
  })
})
