'use client'

import { useEffect, useRef } from 'react'
import type { KeyboardEvent } from 'react'
import type { LevelConfig, Session } from '@/engine'
import { formatScore, t } from '@/i18n/vi'

/**
 * The step in front of "Chơi lại" (FR-22).
 *
 * It exists because of a reproduction, not a hunch. On the play screen Tab has
 * exactly three stops — `Về bản đồ`, one bàn cell, then this button — so a player
 * moving through the page with a keyboard lands on a level-destroying control on
 * their third press. Persona p03 did precisely that, pressed Enter, and read the
 * fresh board and the reset counters as the game malfunctioning rather than as
 * something she had just done (`docs/ux-reviews/2026-09-11-red-routes-full.md`
 * F-07, re-diagnosed in design.md §2.1).
 *
 * The confirm is **conditional on purpose**. A restart on an untouched board
 * destroys nothing, and a dialog there would be a toll booth in front of a free
 * road. `isLevelInProgress` is the whole rule.
 */

/**
 * Whether restarting would throw away work the player has done.
 *
 * Pure and exported so the decision can be tested without a DOM, and so the play
 * screen never grows its own private copy of "in progress".
 *
 * Two signals rather than one: a swap that matched costs a move, and a swap that
 * did not costs nothing (invariant 6) — but the second kind still leaves the
 * player somewhere, with a board they have been reading. Score alone would miss
 * moves spent for nothing; moves alone would miss a first match that scored
 * before any move was deducted in the player's mind.
 */
export function isLevelInProgress(session: Session, level: LevelConfig): boolean {
  return session.movesLeft < level.moves || session.score > 0
}

export type ConfirmRestartProps = {
  /** Only the score is read — the dialog names the number it is about to destroy. */
  session: Session
  onConfirm: () => void
  onCancel: () => void
}

const FOCUSABLE = 'button:not([disabled])'

export function ConfirmRestart({ session, onConfirm, onCancel }: ConfirmRestartProps) {
  const dialog = useRef<HTMLDivElement>(null)

  /**
   * Focus lands on **cancel**, not on confirm. The player most likely to meet this
   * dialog is the one who arrived at the restart button by accident, so the
   * default action has to be the one that changes nothing.
   */
  useEffect(() => {
    const buttons = dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    buttons?.[buttons.length - 1]?.focus()
  }, [])

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onCancel()
      return
    }
    if (event.key !== 'Tab') return

    // A confirm that lets focus escape back to the board is a confirm the player
    // can walk around without answering.
    const buttons = dialog.current?.querySelectorAll<HTMLElement>(FOCUSABLE)
    if (!buttons || buttons.length === 0) return
    const first = buttons[0]
    const last = buttons[buttons.length - 1]
    if (!first || !last) return

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-surface-base/80 p-4"
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialog}
        role="alertdialog"
        aria-modal="true"
        aria-label={t.confirmRestartTitle}
        data-testid="confirm-restart"
        className="w-full max-w-sm rounded-2xl bg-surface-card p-6 text-center shadow-2xl"
      >
        <h2 className="text-xl font-bold text-ink-strong">{t.confirmRestartTitle}</h2>

        {/*
          Both halves are said, and the order matters. Persona p02's stated fear
          was losing what she had already earned; the answer to it is the second
          line, so it is the line that closes the paragraph rather than the one
          buried in front of the warning (F-10 and F-07 share this sentence).
        */}
        <p className="mt-3 text-sm text-ink-muted">
          {t.confirmRestartLoses(formatScore(session.score))}
        </p>
        <p className="mt-1 text-sm text-ink-muted">{t.confirmRestartKeeps}</p>

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            data-testid="confirm-restart-yes"
            onClick={onConfirm}
            className="min-h-[44px] rounded-xl bg-accent-danger px-4 font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong"
          >
            {t.replay}
          </button>
          <button
            type="button"
            data-testid="confirm-restart-no"
            onClick={onCancel}
            className="min-h-[44px] rounded-xl bg-surface-raised px-4 font-semibold text-ink-strong focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-strong"
          >
            {t.confirmRestartCancel}
          </button>
        </div>
      </div>
    </div>
  )
}
