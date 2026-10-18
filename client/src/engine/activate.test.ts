import { describe, expect, it } from 'vitest'
import { formatBoard, parseBoard } from '../../test/helpers/board'
import { activationTargets, resolveClears } from './activate'
import type { Pos } from './types'

const key = (pos: Pos) => `${pos.row},${pos.col}`
const keys = (list: Pos[]) => list.map(key).sort()

describe('activationTargets', () => {
  it('stripedH clears the whole row', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    const hit = activationTargets(grid, { row: 1, col: 2 }, 'stripedH', null)
    expect(hit.every((p) => p.row === 1)).toBe(true)
    expect(hit).toHaveLength(3)
  })

  it('stripedV clears the whole column', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    const hit = activationTargets(grid, { row: 1, col: 2 }, 'stripedV', null)
    expect(hit.every((p) => p.col === 2)).toBe(true)
    expect(hit).toHaveLength(2)
  })

  it('wrapped clears the 3x3 around it, clipped at the edge', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    expect(activationTargets(grid, { row: 0, col: 0 }, 'wrapped', null)).toHaveLength(3)
    expect(activationTargets(grid, { row: 1, col: 1 }, 'wrapped', null)).toHaveLength(8)
  })

  it('wrapped is clipped at the far corner too', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    expect(keys(activationTargets(grid, { row: 2, col: 3 }, 'wrapped', null))).toEqual([
      '1,2',
      '1,3',
      '2,2',
    ])
  })

  it('colorBomb clears every piece of the swapped colour', () => {
    const grid = parseBoard('RBR / BRB / RBR')
    const hit = activationTargets(grid, { row: 1, col: 1 }, 'colorBomb', 'blue')
    expect(hit).toHaveLength(4)
  })

  it('colorBomb falls back to its own colour when nothing was swapped', () => {
    // A bomb caught in someone else's blast has no swapped colour, so it eats its
    // own colour instead of nothing (design.md §4 leaves this case open).
    const grid = parseBoard('R#BRB / BRBR / RBRB')
    const hit = activationTargets(grid, { row: 0, col: 0 }, 'colorBomb', null)
    expect(keys(hit)).toEqual(['0,2', '1,1', '1,3', '2,0', '2,2'])
  })

  it('colorBomb never returns its own cell, even on a colour match', () => {
    const grid = parseBoard('R#RR / BBB')
    const hit = activationTargets(grid, { row: 0, col: 0 }, 'colorBomb', 'red')
    expect(keys(hit)).toEqual(['0,1', '0,2'])
  })

  it('colorBomb finds nothing when the swapped colour is absent', () => {
    const grid = parseBoard('R#RR / BBB')
    expect(activationTargets(grid, { row: 0, col: 0 }, 'colorBomb', 'purple')).toEqual([])
  })

  it('a plain piece clears nothing', () => {
    const grid = parseBoard('RRRR / BBBB')
    expect(activationTargets(grid, { row: 0, col: 0 }, 'none', 'red')).toEqual([])
  })

  it('skips empty cells in a row and in a column', () => {
    expect(
      activationTargets(
        parseBoard('R.R / BBB / GGG'),
        { row: 0, col: 0 },
        'stripedH',
        null,
      ),
    ).toEqual([{ row: 0, col: 2 }])
    expect(
      activationTargets(
        parseBoard('RRR / .BB / GGG'),
        { row: 0, col: 0 },
        'stripedV',
        null,
      ),
    ).toEqual([{ row: 2, col: 0 }])
  })

  it('skips empty cells inside a wrapped blast', () => {
    const grid = parseBoard('R.R / .R. / R.R')
    expect(activationTargets(grid, { row: 1, col: 1 }, 'wrapped', null)).toHaveLength(4)
  })

  it('never includes the activating cell itself', () => {
    const grid = parseBoard('RRR / RRR / RRR')
    const at = { row: 1, col: 1 }
    for (const special of ['stripedH', 'stripedV', 'wrapped', 'colorBomb'] as const) {
      expect(activationTargets(grid, at, special, 'red').map(key)).not.toContain('1,1')
    }
  })
})

describe('resolveClears', () => {
  it('chains a stripe into a bomb sitting in its row', () => {
    //                       row 1: a stripe at col 0, a wrapped bomb at col 1
    const grid = parseBoard('RRRRR / B>B*BBB / GGGGG / YYYYY')
    const out = resolveClears(grid, [{ row: 1, col: 0 }], null)
    expect(out.activations.map((a) => a.special)).toContain('wrapped')
    // the bomb's 3x3 reaches rows 0 and 2
    expect(out.cleared.some((p) => p.row === 2)).toBe(true)
  })

  it('activates each piece at most once', () => {
    const grid = parseBoard('R>R>R / BBBBB / GGGGG')
    const out = resolveClears(grid, [{ row: 0, col: 0 }], null)
    const ids = out.activations.map((a) => `${a.at.row},${a.at.col}`)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('terminates on a board densely packed with specials', () => {
    const row = 'R>R>R>R>R>R>R>R>'
    const grid = parseBoard([row, row, row, row, row, row, row, row].join(' / '))
    const out = resolveClears(grid, [{ row: 0, col: 0 }], null)
    expect(out.cleared.length).toBeLessThanOrEqual(64)
  })

  it('terminates when every piece on an 8x8 board chains into the next', () => {
    // Stripes alternate H/V along rows and columns, so row 0 reaches every column
    // and row 1 reaches every row: the whole board goes, each piece firing once.
    const odd = 'R>R^R>R^R>R^R>R^'
    const even = 'R^R>R^R>R^R>R^R>'
    const grid = parseBoard([odd, even, odd, even, odd, even, odd, even].join(' / '))
    const out = resolveClears(grid, [{ row: 0, col: 0 }], null)
    expect(out.cleared).toHaveLength(64)
    expect(out.activations).toHaveLength(64)
  })

  it('returns the seeds themselves when they hold no special', () => {
    const grid = parseBoard('RRR / BBB / GGG')
    const seeds = [
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
    ]
    const out = resolveClears(grid, seeds, null)
    expect(out.activations).toEqual([])
    expect(keys(out.cleared)).toEqual(['0,0', '0,1', '0,2'])
  })

  it('deduplicates positions reached twice', () => {
    // A stripe on row 1 hits a vertical stripe on col 3; the vertical one clears
    // row 1 col 3 again, and the seed is passed twice on purpose.
    const grid = parseBoard('RRRR / BB>BB^ / GGGG')
    const out = resolveClears(
      grid,
      [
        { row: 1, col: 1 },
        { row: 1, col: 1 },
      ],
      null,
    )
    expect(keys(out.cleared)).toEqual(['0,3', '1,0', '1,1', '1,2', '1,3', '2,3'])
    expect(out.activations.map((a) => a.special)).toEqual(['stripedH', 'stripedV'])
  })

  it('reports activations in trigger order, seed first', () => {
    const grid = parseBoard('RRRRR / B>B*BBB / GGGGG / YYYYY')
    const out = resolveClears(grid, [{ row: 1, col: 0 }], null)
    expect(out.activations[0]).toMatchObject({
      at: { row: 1, col: 0 },
      special: 'stripedH',
    })
    expect(out.activations[1]).toMatchObject({
      at: { row: 1, col: 1 },
      special: 'wrapped',
    })
  })

  it('records what each single activation cleared', () => {
    const grid = parseBoard('RRR / B>BB / GGG')
    const out = resolveClears(grid, [{ row: 1, col: 0 }], null)
    expect(out.activations[0]?.cleared).toEqual([
      { row: 1, col: 1 },
      { row: 1, col: 2 },
    ])
  })

  it('carries a colorBomb chain into pieces of another colour', () => {
    // The bomb eats blue; one of those blues is a vertical stripe that then takes
    // out a yellow piece the bomb could never have reached on its own.
    const grid = parseBoard('R#BBB / GB^GG / YYYY')
    const out = resolveClears(grid, [{ row: 0, col: 0 }], 'blue')
    expect(out.activations.map((a) => a.special)).toEqual(['colorBomb', 'stripedV'])
    expect(keys(out.cleared)).toEqual(['0,0', '0,1', '0,2', '0,3', '1,1', '2,1'])
  })

  it('ignores seeds that are empty or off the board', () => {
    const grid = parseBoard('R.R / BBB')
    const out = resolveClears(
      grid,
      [
        { row: 0, col: 1 },
        { row: 9, col: 9 },
        { row: 0, col: 0 },
      ],
      null,
    )
    expect(keys(out.cleared)).toEqual(['0,0'])
    expect(out.activations).toEqual([])
  })

  it('does not mutate the grid it was given', () => {
    const grid = parseBoard('RRRRR / B>B*BBB / GGGGG / YYYYY')
    const before = formatBoard(grid)
    resolveClears(grid, [{ row: 1, col: 0 }], null)
    expect(formatBoard(grid)).toBe(before)
  })
})
