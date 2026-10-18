import { describe, expect, it } from 'vitest'
import { parseBoard } from '../../test/helpers/board'
import { findMatches } from './match'

const shapes = (text: string) =>
  findMatches(parseBoard(text))
    .map((m) => `${m.color}:${m.shape}:${m.cells.length}`)
    .sort()

const coords = (cells: { row: number; col: number }[]) =>
  cells.map((c) => `${c.row},${c.col}`)

describe('findMatches', () => {
  it('finds nothing on a clean board', () => {
    expect(shapes('RBR / BRB / RBR')).toEqual([])
  })

  it('finds a horizontal run of three', () => {
    expect(shapes('RRR / BGB / GBG')).toEqual(['red:line3:3'])
  })

  it('finds a vertical run of three', () => {
    expect(shapes('RBG / RGB / RBG')).toEqual(['red:line3:3'])
  })

  it('classifies four and five in a line', () => {
    expect(shapes('RRRR / BGBG / GBGB / BGBG')).toEqual(['red:line4:4'])
    expect(shapes('RRRRR / BGBGB / GBGBG / BGBGB / GBGBG')).toEqual(['red:line5:5'])
  })

  it('merges a crossing row and column into one corner match', () => {
    // red row of 3 on the top, red column of 3 down the left
    expect(shapes('RRR / RBG / RGB')).toEqual(['red:corner:5'])
  })

  it('reports two separate matches of different colors', () => {
    expect(shapes('RRR / BBB / GYG')).toEqual(['blue:line3:3', 'red:line3:3'])
  })

  it('ignores runs broken by an empty cell', () => {
    expect(shapes('R.R / BGB / GBG')).toEqual([])
  })

  // --- cases added on top of the plan ---

  it('ignores a vertical run broken by an empty cell', () => {
    expect(shapes('RBG / .GB / RBG')).toEqual([])
  })

  it('treats a run of six or more as line5', () => {
    expect(shapes('RRRRRR / BGBGBG / GBGBGB')).toEqual(['red:line5:6'])
  })

  it('reports two runs of the same color in one row separately', () => {
    expect(shapes('RRRBRRR / BGBGBGB / GBGBGBG')).toEqual(['red:line3:3', 'red:line3:3'])
  })

  it('merges a T shape into one corner match', () => {
    // column of 3 crossing the middle of a row of 3
    expect(shapes('.R. / RRR / .R.')).toEqual(['red:corner:5'])
  })

  it('merges a plus shape and keeps a single set of cells', () => {
    const matches = findMatches(parseBoard('.R.. / RRRR / .R.. / .R..'))
    expect(matches).toHaveLength(1)
    // 4 across plus 4 down, sharing the crossing cell: 7 distinct cells
    expect(matches[0]?.shape).toBe('corner')
    expect(matches[0]?.cells).toHaveLength(7)
  })

  it('lets a straight five outrank the crossing it is part of', () => {
    // design.md §4: five straight beats L/T, so this is line5 (a colour bomb),
    // not corner (a wrapped bomb), even though a column crosses it.
    expect(shapes('RRRRR / R.... / R....')).toEqual(['red:line5:7'])
  })

  it('still reports corner when the longest run is only four', () => {
    expect(shapes('RRRR. / R.... / R....')).toEqual(['red:corner:6'])
  })

  it('merges two rows sharing one column into one corner match', () => {
    // both red rows touch the red column at col 0, so all three runs are one match
    expect(shapes('RRR / RBG / RRR')).toEqual(['red:corner:7'])
  })

  it('sorts cells row-major', () => {
    const matches = findMatches(parseBoard('RRR / RBG / RGB'))
    expect(coords(matches[0]?.cells ?? [])).toEqual(['0,0', '0,1', '0,2', '1,0', '2,0'])
  })

  it('never reports a match shorter than three cells', () => {
    const matches = findMatches(parseBoard('RRRB / RBGB / RGBB'))
    expect(matches.length).toBeGreaterThan(0)
    expect(matches.every((m) => m.cells.length >= 3)).toBe(true)
  })

  it('matches by color alone — specials do not change detection', () => {
    expect(shapes('R>RR / BGBG / GBGB')).toEqual(['red:line3:3'])
    expect(shapes('R#R^R* / BGBG / GBGB')).toEqual(['red:line3:3'])
  })

  it('does not merge runs of different colors that only touch', () => {
    // red row 0, blue column 0 below it — no shared cell, so two matches
    expect(shapes('RRR / BGG / BGG / BYY')).toEqual(['blue:line3:3', 'red:line3:3'])
  })

  it('finds a vertical run in the last column', () => {
    expect(shapes('BGR / GBR / BGR')).toEqual(['red:line3:3'])
  })

  it('handles an empty grid', () => {
    expect(findMatches([])).toEqual([])
  })

  it('reports the color of the matched pieces', () => {
    const matches = findMatches(parseBoard('PPP / RGR / GRG'))
    expect(matches[0]?.color).toBe('purple')
  })
})
