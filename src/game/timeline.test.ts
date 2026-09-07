import { describe, expect, it } from 'vitest'
import type { GameEvent } from '@/engine/types'
import { DURATIONS, buildTimeline } from './timeline'

const pos = (row: number, col: number) => ({ row, col })

const events: GameEvent[] = [
  { t: 'swapped', from: pos(0, 0), to: pos(0, 1) },
  { t: 'matched', cells: [pos(0, 0)], cascade: 1, points: 60 },
  {
    t: 'specialSpawned',
    at: pos(0, 0),
    special: 'stripedH',
    piece: { id: 1, color: 'red', special: 'stripedH' },
  },
  { t: 'goalProgressed', index: 0, progress: { kind: 'score', current: 60, target: 100, done: false } },
  { t: 'fell', moves: [] },
  { t: 'refilled', cells: [] },
  { t: 'levelWon', score: 60, stars: 1 },
]

describe('buildTimeline', () => {
  it('keeps every event, in order', () => {
    const flat = buildTimeline(events, { reducedMotion: false }).flatMap((s) => s.events)
    expect(flat).toEqual(events)
  })

  it('gives each step a positive duration by default', () => {
    for (const step of buildTimeline(events, { reducedMotion: false })) {
      expect(step.duration).toBeGreaterThan(0)
    }
  })

  it('folds a spawn and a goal tick into the match that caused them', () => {
    const steps = buildTimeline(events, { reducedMotion: false })
    const clearStep = steps.find((s) => s.events[0]?.t === 'matched')
    expect(clearStep?.events.map((e) => e.t)).toEqual([
      'matched',
      'specialSpawned',
      'goalProgressed',
    ])
  })

  it('keeps fall and refill as separate beats', () => {
    const kinds = buildTimeline(events, { reducedMotion: false }).map((s) => s.events[0]?.t)
    expect(kinds.indexOf('fell')).toBeLessThan(kinds.indexOf('refilled'))
    expect(kinds.filter((k) => k === 'fell')).toHaveLength(1)
  })

  it('uses the fall duration for a fall step', () => {
    const steps = buildTimeline(events, { reducedMotion: false })
    expect(steps.find((s) => s.events[0]?.t === 'fell')?.duration).toBe(DURATIONS.fall)
  })

  it('zeroes every duration under reduced motion but keeps the grouping', () => {
    const normal = buildTimeline(events, { reducedMotion: false })
    const reduced = buildTimeline(events, { reducedMotion: true })
    expect(reduced).toHaveLength(normal.length)
    for (const step of reduced) expect(step.duration).toBe(0)
  })

  it('returns no steps for an empty event list', () => {
    expect(buildTimeline([], { reducedMotion: false })).toEqual([])
  })

  it('does not fold a spawn onto a step that is not a match', () => {
    const odd: GameEvent[] = [
      { t: 'reshuffled' },
      {
        t: 'specialSpawned',
        at: pos(1, 1),
        special: 'wrapped',
        piece: { id: 2, color: 'blue', special: 'wrapped' },
      },
    ]
    expect(buildTimeline(odd, { reducedMotion: false })).toHaveLength(2)
  })
})
