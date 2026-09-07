import { describe, expect, it } from 'vitest'
import { nextInt, pick, seedFrom, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    expect(nextInt(seedFrom(42), 100)).toEqual(nextInt(seedFrom(42), 100))
  })

  it('advances state so consecutive draws differ', () => {
    const [v1, s1] = nextInt(seedFrom(7), 1000)
    const [v2] = nextInt(s1, 1000)
    expect(v1).not.toBe(v2)
  })

  it('stays inside the range', () => {
    let rng = seedFrom(1)
    for (let i = 0; i < 500; i++) {
      const [value, next] = nextInt(rng, 6)
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThan(6)
      rng = next
    }
  })

  it('covers every bucket over enough draws', () => {
    let rng = seedFrom(3)
    const seen = new Set<number>()
    for (let i = 0; i < 300; i++) {
      const [value, next] = nextInt(rng, 6)
      seen.add(value)
      rng = next
    }
    expect(seen.size).toBe(6)
  })

  it('shuffle keeps the multiset and is deterministic', () => {
    const input = ['a', 'b', 'c', 'd', 'e'] as const
    const [out1] = shuffle(seedFrom(9), input)
    const [out2] = shuffle(seedFrom(9), input)
    expect(out1).toEqual(out2)
    expect([...out1].sort()).toEqual([...input].sort())
  })

  it('shuffle does not mutate its input', () => {
    const input = ['a', 'b', 'c']
    shuffle(seedFrom(2), input)
    expect(input).toEqual(['a', 'b', 'c'])
  })

  it('pick returns a member of the list', () => {
    const [value] = pick(seedFrom(3), ['x', 'y'] as const)
    expect(['x', 'y']).toContain(value)
  })
})
