import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import type { GameEvent, Pos, Special } from '@/engine'
import { formatScore } from '@/i18n/vi'
import { EffectLayer } from './EffectLayer'

/**
 * The layer for the beats that are not a state diff (design.md §B.5, §C.1). A slide
 * or a fall is a piece whose offset changed, so CSS owns it; a sweep along the row a
 * stripe just ate belongs to no piece at all, and neither does a floating `+360 ×2`.
 * Those come from `GameEvent[]`, which is why this layer is driven by events and a
 * beat counter instead of by a session.
 *
 * `waitFor` is deliberately absent: it polls on real timers, so mixing it with
 * `vi.useFakeTimers()` either hangs or advances one virtual millisecond per await.
 * Every wait here is an explicit `advanceTimersByTime` inside `act`.
 */

/**
 * Mirrors the module-private `LIFETIME_MS` in `EffectLayer`. It is the outer bound
 * that removes an element the `animationend` never came for; the longest keyframe in
 * globals.css (`float-up`, 760ms) has to fit inside it.
 */
const LIFETIME_MS = 900

const at = (row: number, col: number): Pos => ({ row, col })

const activated = (special: Special, cleared: Pos[] = [at(2, 3)]): GameEvent => ({
  t: 'specialActivated',
  at: at(2, 3),
  special,
  cleared,
  points: 60,
})

/**
 * A three-in-a-row centred on (1,2), so the centroid the float is positioned at is a
 * whole number and the assertion can name it.
 */
const matched = (cascade: number, points = 360): GameEvent[] => [
  {
    t: 'matched',
    cells: [at(1, 1), at(1, 2), at(1, 3)],
    cascade,
    points,
  },
]

const effects = (container: HTMLElement, kind: string) =>
  container.querySelectorAll(`[data-effect="${kind}"]`)

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('EffectLayer', () => {
  /**
   * Four specials, four silhouettes. The mapping is the feature: a stripe that ate
   * its row and a bomb that ate a 3×3 look identical if both just flash, and the
   * player learns what a special does by watching it fire (design.md §B.5).
   */
  it.each([
    ['stripedH', 'sweep-h'],
    ['stripedV', 'sweep-v'],
    ['wrapped', 'burst'],
    ['colorBomb', 'color-flash'],
  ] as const)('turns a %s activation into %s', (special, kind) => {
    const { container } = render(
      <EffectLayer events={[activated(special)]} beat={1} reducedMotion={false} />,
    )

    expect(effects(container, kind)).toHaveLength(1)
    // And only that one: the four branches are separate `if`s over the same event,
    // so a fall-through would draw two effects for one activation.
    const drawn = container.querySelectorAll('[data-effect]')
    expect(Array.from(drawn, (element) => element.getAttribute('data-effect'))).toEqual([
      kind,
    ])
  })

  it('flashes every cell a colour bomb took, positioned per cell', () => {
    const cleared = [at(0, 0), at(3, 4), at(6, 6)]
    const { container } = render(
      <EffectLayer
        events={[activated('colorBomb', cleared)]}
        beat={1}
        reducedMotion={false}
      />,
    )

    // A colour bomb clears cells all over the bàn, so one element at `at` would say
    // nothing about what was eaten — it gets one per cleared cell instead.
    const flashes = container.querySelectorAll<HTMLElement>(
      '[data-effect="color-flash"] > *',
    )
    expect(flashes).toHaveLength(3)
    expect(flashes[1]?.style.transform).toBe(
      'translate(calc(4 * var(--cell)), calc(3 * var(--cell)))',
    )
    // Staggered, so the board reads as being swept rather than blinking at once.
    expect(flashes[0]?.style.animation).not.toBe(flashes[1]?.style.animation)
  })

  it('shows the points and the cascade multiplier that earned them', () => {
    const { container } = render(
      <EffectLayer events={matched(2)} beat={1} reducedMotion={false} />,
    )

    const score = effects(container, 'score')[0]
    expect(score).toBeTruthy()
    // The event's own `points`, formatted by the one formatter (NFR-I18N-03): the
    // layer repeats what the engine already decided and computes nothing (invariant 2).
    expect(score?.textContent).toContain(formatScore(360))
    expect(effects(container, 'cascade')[0]?.textContent).toBe('×2')
    // Over the middle of the match, so the number points at what produced it.
    expect((score as HTMLElement).style.transform).toBe(
      'translate(calc(2 * var(--cell)), calc(1 * var(--cell)))',
    )
  })

  it('omits the multiplier on the first match of a move', () => {
    const { container } = render(
      <EffectLayer events={matched(1)} beat={1} reducedMotion={false} />,
    )

    // Cascade 1 is the ordinary case and carries no bonus, so a `×1` badge would be
    // noise on almost every move — the multiplier only means something from 2 up.
    expect(effects(container, 'score')).toHaveLength(1)
    expect(effects(container, 'cascade')).toHaveLength(0)
  })

  it('renders nothing at all under reduced motion', () => {
    const { container } = render(
      <EffectLayer
        events={[...matched(3), activated('stripedH')]}
        beat={1}
        reducedMotion
      />,
    )

    // Not "renders with a 0ms duration": a 260ms sweep collapsed to 0ms is a flash,
    // which is worse than no effect at all. NFR-A11Y-05 is one branch here rather
    // than a duration scattered across four keyframes (§B.6).
    expect(container.innerHTML).toBe('')
    expect(container.querySelectorAll('[data-effect]')).toHaveLength(0)
    // No timer either — nothing was queued to be cleaned up later.
    expect(vi.getTimerCount()).toBe(0)
  })

  it('hides the whole layer from assistive tech', () => {
    const { container } = render(
      <EffectLayer events={matched(2)} beat={1} reducedMotion={false} />,
    )

    const layer = container.firstElementChild
    // Read as an attribute: happy-dom does not reflect the ARIA IDL properties, so
    // `element.ariaHidden` is undefined even when the attribute is set.
    expect(layer?.getAttribute('aria-hidden')).toBe('true')
    // Every one of these is decoration over information the semantic grid and the
    // HUD already carry, so the layer is hidden once at the top instead of per
    // element — including the score, which the HUD announces properly.
    expect(layer?.querySelectorAll('[data-effect]').length).toBeGreaterThan(0)
  })

  it('draws two beats that carry identical events', () => {
    // React does not throw on a duplicate key, it warns and reconciles the list
    // wrongly — so the only way for a test to see the collision is to watch the
    // warning. Without this spy the case passes even when `beat` is dropped from
    // the id, which is the mistake it exists to catch.
    const warn = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      const { container, rerender } = render(
        <EffectLayer events={matched(2)} beat={1} reducedMotion={false} />,
      )
      expect(effects(container, 'score')).toHaveLength(1)

      // A cascade can produce the same event list twice in a row — same points,
      // same cells — so the events themselves cannot make a unique key. The
      // monotonic `beat` is what separates them, and both floats have to be on
      // screen at once because the beats overlap by design (ADR-0010).
      act(() => {
        vi.advanceTimersByTime(120)
      })
      rerender(<EffectLayer events={matched(2)} beat={2} reducedMotion={false} />)

      expect(effects(container, 'score')).toHaveLength(2)
      expect(effects(container, 'cascade')).toHaveLength(2)
      expect(warn).not.toHaveBeenCalled()
    } finally {
      warn.mockRestore()
    }
  })

  it('takes its effects back down after their lifetime', () => {
    const { container } = render(
      <EffectLayer events={[activated('stripedH')]} beat={1} reducedMotion={false} />,
    )
    expect(effects(container, 'sweep-h')).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(LIFETIME_MS - 1)
    })
    expect(effects(container, 'sweep-h')).toHaveLength(1)

    // The layer is the only thing on the bàn that accumulates nodes, and it holds no
    // game state — so every element it adds has to come back off, or a long level
    // ends up carrying every sweep it ever played (NFR-PERF-06).
    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(effects(container, 'sweep-h')).toHaveLength(0)
    expect(container.querySelectorAll('[data-effect]')).toHaveLength(0)
  })
})
