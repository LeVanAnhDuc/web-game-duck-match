'use client'

import { useRef, useState } from 'react'
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react'
import type { Pos, Session } from '@/engine'
import { COLOR_NAME, t } from '@/i18n/vi'
import { Tile } from './Tile'

/**
 * The bàn, and the only place player input becomes a move. It renders what the
 * session says and reports one thing upward — `onSwap(from, to)`. It never decides
 * whether a swap is legal; that is `applySwap`'s job (invariant 2), so an illegal
 * swap still round-trips through the engine and comes back as a revert animation.
 *
 * Two input models share one selection state on purpose: a drag is the fast path
 * for a mouse, but tap-then-tap is what a touch user with a motor impairment can
 * actually perform, and arrow keys plus Enter are what makes a whole màn playable
 * with no pointer at all (NFR-A11Y-02).
 */

type BoardProps = {
  session: Session
  busy: boolean
  onSwap: (from: Pos, to: Pos) => void
}

const ARROW_STEP: Record<string, Pos | undefined> = {
  ArrowUp: { row: -1, col: 0 },
  ArrowDown: { row: 1, col: 0 },
  ArrowLeft: { row: 0, col: -1 },
  ArrowRight: { row: 0, col: 1 },
}

/**
 * `isAdjacent` and `samePos` exist in `engine/board.ts` but that module is private
 * (ADR-0002) — `engine/index.ts` is the only door, and it does not export them.
 * Two lines of arithmetic are cheaper than widening the engine's public surface
 * for the UI's convenience.
 */
function samePos(a: Pos, b: Pos): boolean {
  return a.row === b.row && a.col === b.col
}

function isAdjacent(a: Pos, b: Pos): boolean {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col) === 1
}

/** Reads the cell a DOM event happened in, so the 49 cells need no 49 closures. */
function posFromTarget(target: EventTarget | null): Pos | null {
  const button = (target as Element | null)?.closest?.('button[data-row]')
  if (!button) return null

  const row = Number(button.getAttribute('data-row'))
  const col = Number(button.getAttribute('data-col'))
  return Number.isFinite(row) && Number.isFinite(col) ? { row, col } : null
}

export function Board({ session, busy, onSwap }: BoardProps) {
  const { rows, cols } = session.level

  /**
   * The cursor of the roving tabindex: exactly one cell is reachable with Tab, and
   * the arrow keys move which one. 49 tab stops would make the bàn unusable with a
   * keyboard, which is the failure mode NFR-A11Y-02 exists to prevent.
   */
  const [focused, setFocused] = useState<Pos>({ row: 0, col: 0 })
  const [selected, setSelected] = useState<Pos | null>(null)

  const cellRefs = useRef(new Map<string, HTMLButtonElement>())
  /** Where the current press started, so `pointerup` can tell a drag from a tap. */
  const dragStart = useRef<Pos | null>(null)

  const cellKey = (pos: Pos) => `${pos.row}:${pos.col}`

  /** State and DOM focus have to move together, or Tab would return to a stale cell. */
  function moveFocus(pos: Pos) {
    setFocused(pos)
    cellRefs.current.get(cellKey(pos))?.focus()
  }

  /**
   * One press on a cell, whatever produced it. Selecting a second, non-adjacent
   * cell re-selects rather than doing nothing: a mis-aimed tap should visibly move
   * the selection, not leave the player guessing which cell is still armed.
   */
  function press(pos: Pos) {
    setFocused(pos)

    if (!selected) {
      setSelected(pos)
      return
    }
    if (samePos(selected, pos)) {
      setSelected(null)
      return
    }
    if (isAdjacent(selected, pos)) {
      setSelected(null)
      onSwap(selected, pos)
      return
    }
    setSelected(pos)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const pos = posFromTarget(event.target)
    if (!pos) return

    // Invariant 3: while the timeline is playing, the board accepts nothing at all
    // — including focus moves, so a held arrow key cannot outrun the animation.
    if (busy) return

    const step = ARROW_STEP[event.key]
    if (step) {
      event.preventDefault()
      moveFocus({
        row: Math.min(rows - 1, Math.max(0, pos.row + step.row)),
        col: Math.min(cols - 1, Math.max(0, pos.col + step.col)),
      })
      return
    }

    if (event.key === 'Enter' || event.key === ' ') {
      // Without this the button's own click would fire a second press.
      event.preventDefault()
      press(pos)
      return
    }

    if (event.key === 'Escape') {
      event.preventDefault()
      setSelected(null)
    }
  }

  function handlePointerDown(event: PointerEvent<HTMLDivElement>) {
    if (busy) return
    const pos = posFromTarget(event.target)
    if (!pos) return
    dragStart.current = pos

    // Touch pointers get implicit capture, which would retarget `pointerup` back
    // to the cell the finger started on and turn every drag into a tap.
    const element = event.target as Element
    if (element.hasPointerCapture?.(event.pointerId)) {
      element.releasePointerCapture(event.pointerId)
    }
  }

  function handlePointerUp(event: PointerEvent<HTMLDivElement>) {
    const start = dragStart.current
    dragStart.current = null
    if (busy || !start) return

    const pos = posFromTarget(event.target)
    if (!pos) return

    // Released where it started: a tap, which feeds the same selection state as
    // the keyboard so tap-then-tap works without any dragging.
    if (samePos(start, pos)) {
      press(pos)
      return
    }

    if (isAdjacent(start, pos)) {
      setFocused(pos)
      setSelected(null)
      onSwap(start, pos)
    }
    // A drag ending anywhere else is a cancelled gesture, not a move.
  }

  return (
    // The 9×9 bàn at 375px would have to shrink cells below the 44px touch target,
    // so it is allowed to overflow into its own scroller instead — the one recorded
    // exception to NFR-A11Y-03 (docs/04-state/backlog.md §Nợ kỹ thuật).
    <div className="max-w-full overflow-x-auto">
      <div
        role="grid"
        aria-label={t.boardLabel}
        aria-busy={busy}
        onKeyDown={handleKeyDown}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={() => {
          dragStart.current = null
        }}
        className="mx-auto grid w-fit rounded-xl bg-surface-card p-1"
        style={
          {
            '--cols': cols,
            '--cell': 'clamp(38px, calc(min(100vw - 2rem, 560px) / var(--cols)), 64px)',
            gridTemplateColumns: 'repeat(var(--cols), var(--cell))',
            gridAutoRows: 'var(--cell)',
          } as CSSProperties
        }
      >
        {Array.from({ length: rows }, (_, row) => (
          // `contents` keeps the ARIA row that owns the gridcells without adding a
          // box that would break the single CSS grid the cells are laid out in.
          <div key={row} role="row" className="contents">
            {Array.from({ length: cols }, (_, col) => {
              const piece = session.grid[row]?.[col] ?? null
              const isSelected = selected !== null && samePos(selected, { row, col })

              return (
                <div
                  key={col}
                  role="gridcell"
                  aria-selected={isSelected}
                  className="flex items-center justify-center"
                >
                  {/* An empty cell exists only mid-resolution, and the UI is only
                      ever handed settled boards — but it must still render a cell,
                      not a button with nothing to name it. */}
                  {piece && (
                    <button
                      type="button"
                      ref={(element) => {
                        if (element) cellRefs.current.set(cellKey({ row, col }), element)
                        else cellRefs.current.delete(cellKey({ row, col }))
                      }}
                      data-testid={`cell-${row}-${col}`}
                      data-row={row}
                      data-col={col}
                      tabIndex={focused.row === row && focused.col === col ? 0 : -1}
                      aria-label={t.cellLabel(
                          row,
                          col,
                          COLOR_NAME[piece.color],
                          t.specialName(piece.special) || undefined,
                        )}
                      // `touch-none` stops the browser scrolling the page instead of
                      // giving us the pointermove of a drag across the bàn.
                      className="flex h-[var(--cell)] w-[var(--cell)] touch-none items-center justify-center p-[6%] focus:outline-none focus-visible:rounded-lg focus-visible:ring-2 focus-visible:ring-ink-muted"
                    >
                      <Tile piece={piece} selected={isSelected} />
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
