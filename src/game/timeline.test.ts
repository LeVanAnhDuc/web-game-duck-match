import { describe, expect, it } from 'vitest'
import type { GameEvent } from '@/engine/types'
import { LEAD, buildTimeline } from './timeline'

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
  {
    t: 'goalProgressed',
    index: 0,
    progress: { kind: 'score', current: 60, target: 100, done: false },
  },
  { t: 'fell', moves: [] },
  { t: 'refilled', cells: [] },
  { t: 'levelWon', score: 60, stars: 1 },
]

describe('buildTimeline', () => {
  it('keeps every event, in order', () => {
    const flat = buildTimeline(events, { reducedMotion: false }).flatMap((s) => s.events)
    expect(flat).toEqual(events)
  })

  it('gives every beat that animates a positive lead by default', () => {
    // The result step is the exception: nothing follows it, so it leads nothing.
    for (const step of buildTimeline(events, { reducedMotion: false })) {
      const isResult =
        step.events[0]?.t === 'levelWon' || step.events[0]?.t === 'levelLost'
      if (isResult) expect(step.lead).toBe(0)
      else expect(step.lead).toBeGreaterThan(0)
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
    const kinds = buildTimeline(events, { reducedMotion: false }).map(
      (s) => s.events[0]?.t,
    )
    expect(kinds.indexOf('fell')).toBeLessThan(kinds.indexOf('refilled'))
    expect(kinds.filter((k) => k === 'fell')).toHaveLength(1)
  })

  it('uses the fall lead for a fall step', () => {
    const steps = buildTimeline(events, { reducedMotion: false })
    expect(steps.find((s) => s.events[0]?.t === 'fell')?.lead).toBe(LEAD.fall)
  })

  it('leads each beat by the table in design.md §B.4', () => {
    const one = (event: GameEvent) =>
      buildTimeline([event], { reducedMotion: false })[0]?.lead

    expect(one({ t: 'swapped', from: pos(0, 0), to: pos(0, 1) })).toBe(120)
    expect(one({ t: 'matched', cells: [pos(0, 0)], cascade: 1, points: 60 })).toBe(90)
    expect(
      one({
        t: 'specialActivated',
        at: pos(0, 0),
        special: 'stripedH',
        cleared: [pos(0, 1)],
        points: 40,
      }),
    ).toBe(60)
    expect(one({ t: 'fell', moves: [] })).toBe(110)
    expect(one({ t: 'refilled', cells: [] })).toBe(80)
    expect(one({ t: 'reshuffled', grid: [] })).toBe(200)
    expect(one({ t: 'levelWon', score: 60, stars: 1 })).toBe(0)
    expect(one({ t: 'levelLost' })).toBe(0)
  })

  it('exports the lead table from design.md §B.4 verbatim', () => {
    expect(LEAD).toEqual({
      swap: 120,
      swapBack: 140,
      clear: 90,
      sweep: 60,
      fall: 110,
      spawn: 80,
      reshuffle: 200,
      result: 0,
    })
  })

  it('zeroes every lead under reduced motion but keeps the grouping', () => {
    const normal = buildTimeline(events, { reducedMotion: false })
    const reduced = buildTimeline(events, { reducedMotion: true })
    expect(reduced).toHaveLength(normal.length)
    for (const step of reduced) expect(step.lead).toBe(0)
    expect(reduced.map((s) => s.events.map((e) => e.t))).toEqual(
      normal.map((s) => s.events.map((e) => e.t)),
    )
  })

  it('returns no steps for an empty event list', () => {
    expect(buildTimeline([], { reducedMotion: false })).toEqual([])
  })

  it('does not fold a spawn onto a step that is not a match', () => {
    const odd: GameEvent[] = [
      { t: 'reshuffled', grid: [] },
      {
        t: 'specialSpawned',
        at: pos(1, 1),
        special: 'wrapped',
        piece: { id: 2, color: 'blue', special: 'wrapped' },
      },
    ]
    expect(buildTimeline(odd, { reducedMotion: false })).toHaveLength(2)
  })

  it('folds a specialActivated into the match that set it off', () => {
    const cascade: GameEvent[] = [
      { t: 'matched', cells: [pos(0, 0)], cascade: 1, points: 60 },
      {
        t: 'specialActivated',
        at: pos(0, 0),
        special: 'stripedH',
        cleared: [pos(0, 1), pos(0, 2)],
        points: 80,
      },
    ]
    const steps = buildTimeline(cascade, { reducedMotion: false })
    expect(steps).toHaveLength(1)
    expect(steps[0]?.lead).toBe(LEAD.clear)
  })

  describe('a reverted swap', () => {
    const reverted: GameEvent = { t: 'swapReverted', from: pos(2, 3), to: pos(2, 4) }

    it('expands into two beats: slide over, then slide back', () => {
      const steps = buildTimeline([reverted], { reducedMotion: false })
      expect(steps).toHaveLength(2)
      expect(steps.map((s) => s.visual?.kind)).toEqual(['swapOut', 'swapBack'])
    })

    it('carries the same from/to on both beats', () => {
      const steps = buildTimeline([reverted], { reducedMotion: false })
      for (const step of steps) {
        expect(step.visual?.from).toEqual(pos(2, 3))
        expect(step.visual?.to).toEqual(pos(2, 4))
      }
    })

    it('puts the engine event on the second beat only', () => {
      const [out, back] = buildTimeline([reverted], { reducedMotion: false })
      expect(out?.events).toEqual([])
      expect(back?.events).toEqual([reverted])
    })

    it('never turns the revert into swapped events — a revert costs no move (invariant 6)', () => {
      const flat = buildTimeline([reverted], { reducedMotion: false }).flatMap(
        (s) => s.events,
      )
      expect(flat.filter((e) => e.t === 'swapped')).toHaveLength(0)
      expect(flat).toEqual([reverted])
    })

    it('leads the two beats by swap then swapBack', () => {
      const steps = buildTimeline([reverted], { reducedMotion: false })
      expect(steps.map((s) => s.lead)).toEqual([LEAD.swap, LEAD.swapBack])
    })

    it('still expands into two beats under reduced motion, both at lead 0', () => {
      const steps = buildTimeline([reverted], { reducedMotion: true })
      expect(steps.map((s) => s.visual?.kind)).toEqual(['swapOut', 'swapBack'])
      expect(steps.map((s) => s.lead)).toEqual([0, 0])
    })

    it('leaves no visual on steps the engine reported by itself', () => {
      const steps = buildTimeline(events, { reducedMotion: false })
      for (const step of steps) expect(step.visual).toBeUndefined()
    })

    it('does not absorb the beats around it', () => {
      const withRevert: GameEvent[] = [
        reverted,
        {
          t: 'goalProgressed',
          index: 0,
          progress: { kind: 'score', current: 0, target: 100, done: false },
        },
      ]
      const steps = buildTimeline(withRevert, { reducedMotion: false })
      // `goalProgressed` folds into the step before it, which is the swapBack beat.
      expect(steps).toHaveLength(2)
      expect(steps[1]?.events.map((e) => e.t)).toEqual(['swapReverted', 'goalProgressed'])
    })
  })
})
