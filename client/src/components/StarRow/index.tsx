'use client'

import type { Stars } from '@/engine'
import { t } from '@/i18n/vi'

const STAR_POINTS =
  '12,2 14.9,9.2 22.5,9.6 16.6,14.4 18.6,21.8 12,17.6 5.4,21.8 7.4,14.4 1.5,9.6 9.1,9.2'

/** One star lands every this many ms, so three read as three arrivals, not one pop. */
const LAND_STAGGER_MS = 110

/** Matches `--dur-fall`'s spirit: long enough to see the overshoot in `star-land`. */
const LAND_DURATION_MS = 420

/**
 * How the row is announced.
 *
 * `group` is the row's own single `role="img"` with one name from `t.starsEarned` —
 * a screen reader should say "Đạt 2/3 sao" once instead of walking three images.
 * `none` is for a caller that already labels the surrounding block; the row then
 * renders as pure decoration so the same name is not read twice.
 */
export type StarLabelMode = 'group' | 'none'

export type StarRowProps = {
  stars: Stars | number
  max: number
  labelMode?: StarLabelMode
  /**
   * `lg` is the reward moment (the result dialog), where the stars are the subject
   * of the screen rather than a line in a list.
   */
  size?: 'sm' | 'lg'
  /**
   * Play the `star-land` keyframes, staggered. Off by default because the level map
   * shows a settled record, not an award being granted.
   *
   * The caller decides, and must pass `false` under reduced motion: the CSS reset in
   * globals.css collapses `animation-duration` but **not** `animation-delay`, so a
   * staggered star would otherwise sit at its invisible 0% frame for the delay.
   */
  land?: boolean
}

/**
 * The star rating shown on the level map, the play header and inside the result
 * dialog. The glyphs are always `aria-hidden` decoration (NFR-A11Y-04) — the name,
 * when there is one, belongs to the row.
 */
export function StarRow({
  stars,
  max,
  labelMode = 'group',
  size = 'sm',
  land = false,
}: StarRowProps) {
  // `stars` widens to `number` for callers that hold a raw count (best-score rows
  // read from storage, which may be corrupt). Clamping here keeps the label honest:
  // "Đạt 5/3 sao" would be worse than a missing star.
  const filled = Math.min(Math.max(Math.trunc(stars), 0), Math.max(max, 0))
  const labelled = labelMode === 'group'
  const glyphSize = size === 'lg' ? 'h-9 w-9' : 'h-5 w-5'

  return (
    <span
      {...(labelled
        ? { role: 'img', 'aria-label': t.starsEarned(filled, max) }
        : { 'aria-hidden': 'true' as const })}
      className={`inline-flex items-center ${size === 'lg' ? 'gap-1' : 'gap-0.5'}`}
    >
      {Array.from({ length: Math.max(max, 0) }, (_, index) => {
        const isFilled = index < filled
        return (
          <svg
            key={index}
            aria-hidden="true"
            data-star={isFilled ? 'filled' : 'empty'}
            viewBox="0 0 24 24"
            // Longhands, not the `animation` shorthand: the delay is the thing that
            // makes the stars arrive one at a time, and it has to be readable on
            // its own — both by a test and by anyone debugging the stagger.
            style={
              land
                ? {
                    animationName: 'star-land',
                    animationDuration: `${LAND_DURATION_MS}ms`,
                    animationTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    animationDelay: `${index * LAND_STAGGER_MS}ms`,
                    animationFillMode: 'both',
                  }
                : undefined
            }
            className={`${glyphSize} ${isFilled ? 'text-piece-yellow' : 'text-ink-muted'}`}
          >
            {/* Empty stars keep an outline so the total is countable, not implied. */}
            <polygon
              points={STAR_POINTS}
              fill={isFilled ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        )
      })}
    </span>
  )
}
