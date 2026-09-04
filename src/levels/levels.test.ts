import { describe, expect, it } from 'vitest'
import { findMatches } from '@/engine/match'
import { generateBoard, hasLegalMove } from '@/engine/moves'
import { seedFrom } from '@/engine/rng'
import { COLORS } from '@/engine/types'
import { FIRST_LEVEL_ID, LAST_LEVEL_ID, LEVELS, levelById } from './levels'

describe('LEVELS', () => {
  it('has six levels numbered 1..6', () => {
    expect(LEVELS.map((level) => level.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it('reports its first and last id', () => {
    expect(FIRST_LEVEL_ID).toBe(1)
    expect(LAST_LEVEL_ID).toBe(6)
  })

  it.each(LEVELS)('level $id is internally consistent', (level) => {
    expect(level.moves).toBeGreaterThan(0)
    expect(level.colors.length).toBeGreaterThanOrEqual(4)
    expect(new Set(level.colors).size).toBe(level.colors.length)
    expect(level.rows).toBeGreaterThanOrEqual(7)
    expect(level.cols).toBeGreaterThanOrEqual(7)
    expect(level.goals.length).toBeGreaterThan(0)
    const [one, two, three] = level.stars
    expect(one).toBeLessThan(two)
    expect(two).toBeLessThan(three)
  })

  it.each(LEVELS)('level $id only uses known colours', (level) => {
    for (const color of level.colors) expect(COLORS).toContain(color)
  })

  it.each(LEVELS)('level $id collect goals only use its own colours', (level) => {
    for (const goal of level.goals) {
      if (goal.kind !== 'collect') continue
      const entries = Object.entries(goal.per)
      expect(entries.length).toBeGreaterThan(0)
      for (const [color, count] of entries) {
        expect(level.colors).toContain(color)
        expect(count).toBeGreaterThan(0)
      }
    }
  })

  it.each(LEVELS)('level $id has a reachable score goal', (level) => {
    // A score goal above the three-star threshold would mean the level cannot be
    // won at all — the first star mark is the floor for winning.
    for (const goal of level.goals) {
      if (goal.kind !== 'score') continue
      expect(goal.target).toBeLessThanOrEqual(level.stars[2])
    }
  })

  it.each(LEVELS.flatMap((level) => [1, 2, 3].map((seed) => [level, seed] as const)))(
    'level $0.id generates a playable board with seed $1',
    (level, seed) => {
      const { grid } = generateBoard(level, seedFrom(seed), 1)
      expect(findMatches(grid)).toEqual([])
      expect(hasLegalMove(grid)).toBe(true)
      expect(grid).toHaveLength(level.rows)
      expect(grid.every((row) => row.length === level.cols)).toBe(true)
    },
  )

  it('gets harder or at least never easier in board size', () => {
    const sizes = LEVELS.map((level) => level.rows * level.cols)
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i]).toBeGreaterThanOrEqual(sizes[i - 1] as number)
    }
  })

  it('looks up by id and misses cleanly', () => {
    expect(levelById(3)?.id).toBe(3)
    expect(levelById(99)).toBeUndefined()
    expect(levelById(0)).toBeUndefined()
  })
})
