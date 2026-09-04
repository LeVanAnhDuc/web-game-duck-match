'use client'

import { useEffect, useId, useRef } from 'react'
import type { Stars } from '@/engine'
import { formatScore, t } from '@/i18n/vi'

/**
 * End-of-level dialog, overlaid on the bàn rather than being its own route so the
 * board stays visible behind the result (design §6). It serves both US-01 (win →
 * "Màn tiếp") and US-02 (loss → "Chơi lại"), which is why the action set is
 * derived from `result.status` and `hasNextLevel` instead of being passed in.
 *
 * The focus trap is hand-written: pulling in a dialog library for one screen would
 * outweigh the ~30 lines below, and `<dialog showModal>` is not usable because
 * happy-dom does not implement it, so the a11y tests could never cover it.
 */

/** `Stars` is `0 | 1 | 2 | 3`, so the denominator the player is told is always 3. */
const MAX_STARS = 3

/** Only tabbable descendants matter; the container itself carries `tabIndex={-1}`. */
const FOCUSABLE =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

export type LevelResult = {
  status: 'won' | 'lost'
  stars: Stars
  score: number
}

export type ResultDialogProps = {
  result: LevelResult
  hasNextLevel: boolean
  onReplay: () => void
  onNext: () => void
  onBackToMap: () => void
}

export function ResultDialog({
  result,
  hasNextLevel,
  onReplay,
  onNext,
  onBackToMap,
}: ResultDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const summaryId = useId()
  const isWon = result.status === 'won'

  // `onBackToMap` is read through a ref so Escape keeps working without
  // re-registering the mount effect (which would re-steal focus on every render).
  const backToMapRef = useRef(onBackToMap)
  backToMapRef.current = onBackToMap

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    // Focus the first action rather than the container: a screen reader then reads
    // the dialog name plus the button, and Shift+Tab has a real element to wrap from.
    const first = dialog?.querySelector<HTMLElement>(FOCUSABLE)
    ;(first ?? dialog)?.focus()

    return () => {
      // Returning focus is what makes the dialog non-destructive for keyboard users
      // when the parent unmounts it after "Chơi lại" (NFR-A11Y-02).
      if (opener && document.contains(opener)) opener.focus()
    }
  }, [])

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      backToMapRef.current()
      return
    }
    if (event.key !== 'Tab') return

    const dialog = dialogRef.current
    if (!dialog) return
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (!first || !last) return

    // The browser would move focus out of the dialog at either end, so at the ends
    // we cancel it and place focus ourselves. Anything in between is left alone.
    const active = document.activeElement
    if (event.shiftKey && (active === first || active === dialog)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && active === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 p-4">
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={isWon ? summaryId : undefined}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="w-full max-w-sm rounded-2xl bg-surface-card p-6 text-center shadow-2xl"
      >
        {/* A live region as well as the dialog name: some screen readers announce
            only the name on open, and NFR-A11Y-04 asks for win/loss to be spoken. */}
        <div role="status" aria-live="polite">
          <h2 id={titleId} className="text-2xl font-bold text-ink-strong">
            {isWon ? t.won : t.lost}
          </h2>

          {isWon && (
            <div id={summaryId} className="mt-4">
              {/* Stars are drawn here instead of reusing a shared row because the
                  dialog needs one accessible label over the whole group, not three. */}
              <div
                role="img"
                aria-label={t.starsEarned(result.stars, MAX_STARS)}
                className="flex justify-center gap-1 text-3xl leading-none"
              >
                {Array.from({ length: MAX_STARS }, (_, index) => (
                  <span
                    key={index}
                    aria-hidden="true"
                    className={
                      index < result.stars ? 'text-piece-yellow' : 'text-surface-raised'
                    }
                  >
                    ★
                  </span>
                ))}
              </div>

              <p className="mt-3 flex items-baseline justify-center gap-2">
                <span className="text-sm text-ink-muted">{t.score}</span>
                <span className="text-xl font-semibold tabular-nums text-ink-strong">
                  {formatScore(result.score)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* DOM order is action priority, and the mount effect focuses the first one. */}
        <div className="mt-6 flex flex-col gap-2">
          {isWon && hasNextLevel && (
            <button
              type="button"
              onClick={onNext}
              className="min-h-[44px] rounded-xl bg-piece-green px-4 font-semibold text-ink-strong"
            >
              {t.nextLevel}
            </button>
          )}
          <button
            type="button"
            onClick={onReplay}
            className="min-h-[44px] rounded-xl bg-surface-raised px-4 font-semibold text-ink-strong"
          >
            {t.replay}
          </button>
          <button
            type="button"
            onClick={onBackToMap}
            className="min-h-[44px] rounded-xl px-4 font-semibold text-ink-muted"
          >
            {t.backToMap}
          </button>
        </div>
      </div>
    </div>
  )
}
