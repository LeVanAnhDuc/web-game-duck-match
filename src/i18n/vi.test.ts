import { describe, expect, it } from 'vitest'
import { COLORS } from '@/engine/types'
import { COLOR_NAME, SHAPE_BY_COLOR, formatScore, t } from './vi'

/** The keys later tasks import by name (plan.md Task 13, step 3). */
const REQUIRED_KEYS = [
  'appTitle',
  'levelMapTitle',
  'levelLabel',
  'locked',
  'bestScore',
  'noProgressYet',
  'movesLeft',
  'score',
  'goals',
  'goalScore',
  'goalCollect',
  'replay',
  'backToMap',
  'nextLevel',
  'won',
  'lost',
  'starsEarned',
  'loading',
  'boardLabel',
  'cellLabel',
  'selected',
  'reshuffled',
] as const

describe('i18n', () => {
  it('formats scores with vi-VN grouping', () => {
    expect(formatScore(1234567)).toBe(new Intl.NumberFormat('vi-VN').format(1234567))
  })

  it('gives every colour a distinct shape', () => {
    const shapes = Object.values(SHAPE_BY_COLOR)
    expect(new Set(shapes).size).toBe(shapes.length)
  })

  it('has no empty string', () => {
    for (const value of Object.values(t)) {
      if (typeof value === 'string') expect(value.length).toBeGreaterThan(0)
    }
  })

  it('exports every key later tasks import', () => {
    for (const key of REQUIRED_KEYS) expect(t).toHaveProperty(key)
  })

  it('is frozen so no screen can patch a string at runtime', () => {
    expect(Object.isFrozen(t)).toBe(true)
    expect(() => {
      // @ts-expect-error — assigning to a frozen object is the thing under test
      t.score = 'Points'
    }).toThrow()
  })

  it('covers all six engine colours with a shape and a name', () => {
    expect(Object.keys(SHAPE_BY_COLOR).sort()).toEqual([...COLORS].sort())
    expect(Object.keys(COLOR_NAME).sort()).toEqual([...COLORS].sort())
  })

  it('names every colour distinctly in Vietnamese', () => {
    const names = Object.values(COLOR_NAME)
    expect(new Set(names).size).toBe(names.length)
    expect(COLOR_NAME.red).toBe('đỏ')
    expect(COLOR_NAME.blue).toBe('xanh dương')
    expect(COLOR_NAME.green).toBe('xanh lá')
    expect(COLOR_NAME.yellow).toBe('vàng')
    expect(COLOR_NAME.purple).toBe('tím')
    expect(COLOR_NAME.orange).toBe('cam')
  })

  it('labels a level by its number', () => {
    expect(t.levelLabel(3)).toBe('Màn 3')
  })

  it('formats a score goal with grouping on both sides', () => {
    expect(t.goalScore(1500, 3000)).toBe(`${formatScore(1500)}/${formatScore(3000)}`)
  })

  it('formats a collect goal as plain integers, never grouped', () => {
    expect(t.goalCollect(1, 15)).toBe('1/15')
    expect(t.goalCollect(1000, 2000)).toBe('1000/2000')
  })

  it('states earned stars out of the maximum', () => {
    expect(t.starsEarned(2, 3)).toContain('2/3')
  })

  it('names a cell by its 1-based position and colour', () => {
    const label = t.cellLabel(0, 1, COLOR_NAME.red)
    expect(label).toContain('1')
    expect(label).toContain('2')
    expect(label).toContain('đỏ')
  })

  it('spells out both goal rows for screen readers', () => {
    expect(t.goalScoreLabel(1500, 3000)).toContain(formatScore(3000))
    expect(t.goalCollectLabel(COLOR_NAME.purple, 8, 20)).toContain('tím')
    expect(t.goalCollectLabel(COLOR_NAME.purple, 8, 20)).toContain('8/20')
  })

  it('returns a non-empty string from every template function', () => {
    const produced = [
      t.levelLabel(1),
      t.goalScore(0, 1),
      t.goalCollect(0, 1),
      t.starsEarned(0, 3),
      t.cellLabel(0, 0, COLOR_NAME.blue),
      t.goalScoreLabel(0, 1),
      t.goalCollectLabel(COLOR_NAME.blue, 0, 1),
    ]
    for (const value of produced) expect(value.length).toBeGreaterThan(0)
  })

  it('leaves no unsubstituted placeholder in any string', () => {
    for (const value of Object.values(t)) {
      if (typeof value === 'string') expect(value).not.toMatch(/[{}]|%[sd]/)
    }
  })
})
