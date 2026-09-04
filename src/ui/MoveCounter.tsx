'use client'

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
export function MoveCounter({ movesLeft, score }: { movesLeft: number; score: number }) {
  return (
    <div
      aria-live="polite"
      className="flex items-baseline justify-between gap-4 rounded-lg bg-surface-card px-4 py-3"
    >
      <p className="flex items-baseline gap-2">
        <span className="text-sm text-ink-muted">{t.movesLeft}</span>
        <span
          data-testid="moves-left"
          className="text-2xl font-semibold tabular-nums text-ink-strong"
        >
          {movesLeft}
        </span>
      </p>
      <p className="flex items-baseline gap-2">
        <span className="text-sm text-ink-muted">{t.score}</span>
        {/* Grouping comes from Intl, never from string concatenation (NFR-I18N-03). */}
        <span
          data-testid="score"
          className="text-2xl font-semibold tabular-nums text-ink-strong"
        >
          {formatScore(score)}
        </span>
      </p>
    </div>
  )
}
