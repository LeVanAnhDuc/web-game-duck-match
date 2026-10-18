'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Pos, Session } from '@/engine'
import { Tile } from '../Tile'
import { useExitingPieces, type Placed } from '@/hooks/useExitingPieces'

/**
 * The layer that moves.
 *
 * Every piece is one absolutely positioned element keyed by `Piece.id`, offset with
 * `translate`. When the projected board changes, a piece's offset changes and CSS
 * interpolates it — so a swap slides and a fall falls without a line of animation
 * code anywhere (ADR-0010). `Piece.id` being unique and never reused (invariant 9)
 * is what makes that work: React keeps the node, so the node can travel.
 *
 * `aria-hidden` in full. Everything a screen reader or the keyboard needs lives in
 * the semantic grid inside `Board`, which never moves.
 */

/** A cleared piece stays this long to shrink out. Pairs with --dur-clear. */
const CLEAR_MS = 180
/** How long the landing squash runs. Pairs with the clay-land keyframe. */
const LAND_MS = 160

function placedFrom(session: Session): Placed[] {
  const out: Placed[] = []
  for (let row = 0; row < session.grid.length; row++) {
    const line = session.grid[row]
    if (!line) continue
    for (let col = 0; col < line.length; col++) {
      const piece = line[col]
      if (piece) out.push({ piece, row, col })
    }
  }
  return out
}

type Motion = { landed: Set<number>; swapping: Set<number> }

/** A short window during which a swapped piece keeps the swap easing. */
const SWAP_MS = 160

/**
 * Tells a fall from a swap, and remembers which pieces just landed.
 *
 * Gravity is straight down, so a changed COLUMN is only ever a swap — enough to pick
 * the right easing without threading the event list down here.
 *
 * Both sets are state with a per-id timer rather than values derived during render.
 * Derived was wrong twice over: the landing attribute has to go back off before the
 * CSS animation can run again on the next fall, and a render-derived `swapping` was
 * lost on the very next re-render — a beat publish or a selection change inside the
 * 140ms window switched the element from the swap curve back to the springy fall
 * curve mid-transition. Found by probing the DOM across two renders.
 */
function useMotion(placed: Placed[]): Motion {
  const previous = useRef(new Map<number, Pos>())
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())
  const [landed, setLanded] = useState<Set<number>>(() => new Set())
  const [swapping, setSwapping] = useState<Set<number>>(() => new Set())

  useLayoutEffect(() => {
    const fell: number[] = []
    const swapped: number[] = []
    for (const entry of placed) {
      const before = previous.current.get(entry.piece.id)
      if (!before) continue
      if (before.col !== entry.col) swapped.push(entry.piece.id)
      else if (entry.row > before.row) fell.push(entry.piece.id)
    }

    previous.current = new Map(
      placed.map((entry) => [entry.piece.id, { row: entry.row, col: entry.col }]),
    )

    const schedule = (ids: number[], kind: string, ms: number, set: typeof setLanded) => {
      if (ids.length === 0) return
      set((current) => {
        const next = new Set(current)
        for (const id of ids) next.add(id)
        return next
      })
      for (const id of ids) {
        const key = `${kind}:${id}`
        const existing = timers.current.get(key)
        if (existing) clearTimeout(existing)
        timers.current.set(
          key,
          setTimeout(() => {
            timers.current.delete(key)
            set((current) => {
              if (!current.has(id)) return current
              const next = new Set(current)
              next.delete(id)
              return next
            })
          }, ms),
        )
      }
    }

    schedule(fell, 'land', LAND_MS, setLanded)
    schedule(swapped, 'swap', SWAP_MS, setSwapping)
  }, [placed])

  useLayoutEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer)
      timers.current.clear()
    },
    [],
  )

  return { landed, swapping }
}

export function PieceLayer({
  session,
  selected,
  hint = null,
  rejected = null,
}: {
  session: Session
  selected: Pos | null
  /**
   * The move the idle timer suggested, if any. It is drawn here rather than on
   * the grid's wells because a well is exactly the size of the piece sitting in
   * it and is painted *under* this layer — a nudge down there is covered by an
   * opaque piece and reaches nobody (design.md §2.3).
   */
  hint?: { from: Pos; to: Pos } | null
  /** The pair the engine refused, drawn here for the same reason as `hint`. */
  rejected?: { from: Pos; to: Pos } | null
}) {
  const placed = placedFrom(session)
  const shown = useExitingPieces(placed, CLEAR_MS)
  const { landed, swapping } = useMotion(placed)

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-1">
      {shown.map((entry) => (
        <div
          key={entry.piece.id}
          data-testid="tile-slot"
          data-piece-id={entry.piece.id}
          data-row={entry.row}
          data-col={entry.col}
          data-clearing={entry.exiting ? 'true' : undefined}
          data-landed={landed.has(entry.piece.id) ? 'true' : undefined}
          data-moving={swapping.has(entry.piece.id) ? 'swap' : undefined}
          className="absolute left-0 top-0 h-[var(--cell)] w-[var(--cell)]"
          style={
            {
              transform: `translate(calc(${entry.col} * var(--cell)), calc(${entry.row} * var(--cell)))`,
              // NOT a percentage. Percentage padding resolves against the nearest
              // POSITIONED ancestor for an absolute element — that is the whole
              // layer, not this cell — which shrank every piece to a sixth of its
              // size. Measured in the browser, not guessed.
              padding: 'calc(var(--cell) * 0.06)',
            } as CSSProperties
          }
        >
          {/* Its own box, and deliberately transform-free: the slot above owns
              `translate` for the cell it lives in, and `hint-nudge` animates
              `transform` too. One element carrying both would park the piece in
              the wrong cell for the whole animation. */}
          <div
            data-rejected={
              !entry.exiting &&
              rejected !== null &&
              ((rejected.from.row === entry.row && rejected.from.col === entry.col) ||
                (rejected.to.row === entry.row && rejected.to.col === entry.col))
                ? 'true'
                : undefined
            }
            data-hint={
              !entry.exiting &&
              hint !== null &&
              ((hint.from.row === entry.row && hint.from.col === entry.col) ||
                (hint.to.row === entry.row && hint.to.col === entry.col))
                ? 'true'
                : undefined
            }
            className="h-full w-full"
          >
            <Tile
              piece={entry.piece}
              selected={
                !entry.exiting &&
                selected !== null &&
                selected.row === entry.row &&
                selected.col === entry.col
              }
            />
          </div>
        </div>
      ))}
    </div>
  )
}
