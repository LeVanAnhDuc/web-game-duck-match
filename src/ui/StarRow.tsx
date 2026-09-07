'use client'

import type { Stars } from '@/engine'
import { t } from '@/i18n/vi'

const STAR_POINTS =
  '12,2 14.9,9.2 22.5,9.6 16.6,14.4 18.6,21.8 12,17.6 5.4,21.8 7.4,14.4 1.5,9.6 9.1,9.2'

/**
 * The star rating shown on the play header and inside the result dialog.
 *
 * The row is a single `role="img"` with one accessible name from `t.starsEarned`
 * instead of three named glyphs: a screen reader should say "Đạt 2/3 sao" once,
 * not walk three images and leave the listener to count. The glyphs are therefore
 * `aria-hidden` decoration (NFR-A11Y-04).
 */
export function StarRow({ stars, max }: { stars: Stars | number; max: number }) {
  // `stars` widens to `number` for callers that hold a raw count (best-score rows
  // read from storage, which may be corrupt). Clamping here keeps the label honest:
  // "Đạt 5/3 sao" would be worse than a missing star.
  const filled = Math.min(Math.max(Math.trunc(stars), 0), Math.max(max, 0))

  return (
    <span
      role="img"
      aria-label={t.starsEarned(filled, max)}
      className="inline-flex items-center gap-0.5"
    >
      {Array.from({ length: Math.max(max, 0) }, (_, index) => {
        const isFilled = index < filled
        return (
          <svg
            key={index}
            aria-hidden="true"
            data-star={isFilled ? 'filled' : 'empty'}
            viewBox="0 0 24 24"
            className={`h-5 w-5 ${isFilled ? 'text-piece-yellow' : 'text-ink-muted'}`}
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
