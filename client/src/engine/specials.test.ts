import { describe, expect, it } from 'vitest'
import type { Match } from './types'
import { specialFor } from './specials'

const m = (shape: Match['shape'], cells: [number, number][]): Match => ({
  shape,
  color: 'red',
  cells: cells.map(([row, col]) => ({ row, col })),
})

describe('specialFor', () => {
  it('gives nothing for a plain three', () => {
    expect(
      specialFor(
        m('line3', [
          [0, 0],
          [0, 1],
          [0, 2],
        ]),
        null,
      ),
    ).toBeNull()
  })

  it('gives a horizontal stripe for a horizontal four', () => {
    const out = specialFor(
      m('line4', [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      null,
    )
    expect(out).toEqual({ special: 'stripedH', at: { row: 0, col: 1 } })
  })

  it('gives a vertical stripe for a vertical four', () => {
    const out = specialFor(
      m('line4', [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ]),
      null,
    )
    expect(out?.special).toBe('stripedV')
  })

  it('spawns at the swapped cell when the swap is part of the match', () => {
    const out = specialFor(
      m('line4', [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      { row: 0, col: 3 },
    )
    expect(out?.at).toEqual({ row: 0, col: 3 })
  })

  it('ignores a swapped cell outside the match', () => {
    const out = specialFor(
      m('line4', [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
      ]),
      { row: 5, col: 5 },
    )
    expect(out?.at).toEqual({ row: 0, col: 1 })
  })

  it('gives a color bomb for five, beating the corner rule', () => {
    const five = m('line5', [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ])
    expect(specialFor(five, null)?.special).toBe('colorBomb')
  })

  it('gives a wrapped bomb at the intersection of a corner match', () => {
    const corner = m('corner', [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [2, 0],
    ])
    expect(specialFor(corner, null)).toEqual({
      special: 'wrapped',
      at: { row: 0, col: 0 },
    })
  })

  // --- cases added on top of the plan ---

  it('puts the vertical stripe on the second cell of the run', () => {
    const out = specialFor(
      m('line4', [
        [0, 2],
        [1, 2],
        [2, 2],
        [3, 2],
      ]),
      null,
    )
    expect(out?.at).toEqual({ row: 1, col: 2 })
  })

  it('puts a color bomb in the middle of a five', () => {
    const out = specialFor(
      m('line5', [
        [4, 1],
        [4, 2],
        [4, 3],
        [4, 4],
        [4, 5],
      ]),
      null,
    )
    expect(out).toEqual({ special: 'colorBomb', at: { row: 4, col: 3 } })
  })

  it('picks the lower middle of a run of six', () => {
    const out = specialFor(
      m('line5', [
        [0, 0],
        [1, 0],
        [2, 0],
        [3, 0],
        [4, 0],
        [5, 0],
      ]),
      null,
    )
    expect(out).toEqual({ special: 'colorBomb', at: { row: 2, col: 0 } })
  })

  it('still gives nothing for a three the player swapped into', () => {
    const out = specialFor(
      m('line3', [
        [1, 1],
        [1, 2],
        [1, 3],
      ]),
      { row: 1, col: 2 },
    )
    expect(out).toBeNull()
  })

  it('honours the swapped cell for a five and for a corner', () => {
    const five = m('line5', [
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [0, 4],
    ])
    expect(specialFor(five, { row: 0, col: 4 })?.at).toEqual({ row: 0, col: 4 })

    const corner = m('corner', [
      [0, 0],
      [0, 1],
      [0, 2],
      [1, 0],
      [2, 0],
    ])
    expect(specialFor(corner, { row: 2, col: 0 })?.at).toEqual({ row: 2, col: 0 })
  })

  it('finds the intersection of a T shape, not its first cell', () => {
    const tee = m('corner', [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, 2],
      [2, 1],
    ])
    expect(specialFor(tee, null)).toEqual({ special: 'wrapped', at: { row: 1, col: 1 } })
  })

  it('finds the intersection of a plus shape offset from the origin', () => {
    const plus = m('corner', [
      [3, 5],
      [4, 4],
      [4, 5],
      [4, 6],
      [5, 5],
      [6, 5],
    ])
    expect(specialFor(plus, null)?.at).toEqual({ row: 4, col: 5 })
  })

  it('does not care about the order the cells arrive in', () => {
    const scrambled = m('line4', [
      [0, 3],
      [0, 1],
      [0, 0],
      [0, 2],
    ])
    expect(specialFor(scrambled, null)).toEqual({
      special: 'stripedH',
      at: { row: 0, col: 1 },
    })
  })

  it('keeps the color of the match out of the decision', () => {
    const blue: Match = {
      shape: 'line4',
      color: 'blue',
      cells: [
        { row: 2, col: 0 },
        { row: 3, col: 0 },
        { row: 4, col: 0 },
        { row: 5, col: 0 },
      ],
    }
    expect(specialFor(blue, null)).toEqual({
      special: 'stripedV',
      at: { row: 3, col: 0 },
    })
  })
})
