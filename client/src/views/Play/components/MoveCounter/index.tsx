'use client'

import { useEffect, useRef, useState } from 'react'
import { formatScore, t } from '@/i18n/vi'

/**
 * The moves-and-score strip above the board (design.md §6).
 *
 * The whole strip is one `aria-live="polite"` region rather than two, because a
 * move changes both numbers at once: two regions would queue two announcements
 * for one action and read the second over the first (NFR-A11Y-04).
 *
 * `data-testid` is on the value spans only, never on the label-plus-value pair —
 * the Playwright specs in Task 20 compare the counter's text across a move, so
 * anything but the bare number in there breaks them.
 */

/** design.md §C.5: the last three moves are the ones worth warning about. */
const LOW_MOVES_AT = 3

/**
 * How long the score takes to travel (design.md §C.1). Short enough that the number
 * has arrived before the next swap can be made — a count-up still running under the
 * following move reads as lag, not as reward.
 */
const COUNT_UP_MS = 380

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)'

function prefersReducedMotion(): boolean {
  // Same three guards as `game/useGameSession.ts`: absent during the static
  // export's build-time render, absent in environments that never implemented
  // matchMedia, and able to throw on a malformed query. None of those is a reason
  // to refuse to animate, so the fallback is "no preference stated" (NFR-A11Y-05).
  if (typeof window === 'undefined') return false
  if (typeof window.matchMedia !== 'function') return false
  try {
    return window.matchMedia(REDUCED_MOTION_QUERY).matches
  } catch {
    return false
  }
}

/** Ease out: fast at the start, so the reward is felt before it is read. */
function easeOut(progress: number): number {
  return 1 - (1 - progress) ** 3
}

/**
 * Displays `target` by travelling to it from whatever was on screen.
 *
 * This interpolates the **display** between two numbers the engine already
 * produced — the same thing CSS does to a position — and never computes a score of
 * its own, which is what invariant 2 forbids. Two properties make that visible:
 * the last frame assigns `target` itself rather than an eased value, and the easing
 * is monotone in [0, 1], so no frame can show points that were never awarded.
 */
function useCountUp(target: number, instant: boolean): number {
  const [shown, setShown] = useState(target)

  // The value on screen right now, so a target arriving mid-travel continues from
  // where the eye is instead of restarting from the previous target. It is synced in
  // its own effect, declared first: on the render where `target` changes this runs
  // before the travel below and hands it the frame the player is actually looking at.
  const shownRef = useRef(target)
  useEffect(() => {
    shownRef.current = shown
  }, [shown])

  useEffect(() => {
    const from = shownRef.current
    if (instant || from === target) {
      setShown(target)
      return
    }
    // A drop is a restart, not points being taken away, so there is nothing to
    // reward and nothing to animate — counting backwards would read as a penalty.
    if (target < from) {
      setShown(target)
      return
    }
    if (typeof requestAnimationFrame !== 'function') {
      setShown(target)
      return
    }

    let frame = 0
    let startedAt: number | null = null
    const tick = (now: number) => {
      startedAt ??= now
      const elapsed = now - startedAt
      if (elapsed >= COUNT_UP_MS) {
        // Landing is an assignment, not the tail of an easing curve: that is the
        // only way the HUD is guaranteed to end on the engine's number exactly.
        setShown(target)
        return
      }
      setShown(from + Math.round((target - from) * easeOut(elapsed / COUNT_UP_MS)))
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, instant])

  return instant ? target : shown
}

export function MoveCounter({
  movesLeft,
  score,
  reducedMotion,
}: {
  movesLeft: number
  score: number
  /**
   * Omitted by the play screen, which does not hold this preference for the HUD, so
   * the component reads it itself. Kept as a prop because a caller that already
   * sampled it (the session hook does, for the timeline) should be able to pass one
   * answer down rather than have two places sample the same query.
   */
  reducedMotion?: boolean
}) {
  const reduced = reducedMotion ?? prefersReducedMotion()
  const shownScore = useCountUp(score, reduced)
  const isLow = movesLeft <= LOW_MOVES_AT

  return (
    <div
      aria-live="polite"
      // The attribute is on the strip because "low on moves" is a state of the
      // counter, while the amber and the pulse are on the number that is running out.
      data-low={isLow ? 'true' : undefined}
      className="flex items-baseline justify-between gap-4 rounded-lg bg-surface-card px-4 py-3"
    >
      <p className="flex items-baseline gap-2">
        <span className="text-sm text-ink-muted">{t.movesLeft}</span>
        <span
          data-testid="moves-left"
          // Reduced motion keeps the colour and drops the beat: the warning is
          // still delivered, only the movement goes (NFR-A11Y-05, design.md §C.5).
          style={
            isLow && !reduced
              ? { animation: 'low-moves 900ms ease-in-out infinite' }
              : undefined
          }
          className={`text-2xl font-semibold tabular-nums ${
            isLow ? 'text-accent-amber' : 'text-ink-strong'
          }`}
        >
          {movesLeft}
        </span>
      </p>
      <p className="flex items-baseline gap-2">
        <span className="text-sm text-ink-muted">{t.score}</span>
        {/* Grouping comes from Intl, never from string concatenation (NFR-I18N-03). */}
        <span
          data-testid="score"
          /*
           * Hidden from assistive tech only while the number is travelling. The
           * strip is one polite live region, and twenty intermediate values in it
           * would be twenty announcements for one move (NFR-A11Y-04). The default
           * `aria-relevant` is "additions text", so a subtree going hidden is
           * silent and the value re-appearing when it lands is announced once.
           * The price is that the score is spoken ~380ms after the moves count —
           * and under reduced motion there is no travel, so no delay either.
           */
          aria-hidden={shownScore !== score ? 'true' : undefined}
          className="text-2xl font-semibold tabular-nums text-ink-strong"
        >
          {formatScore(shownScore)}
        </span>
      </p>
    </div>
  )
}
