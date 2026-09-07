'use client'

import { useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { Pos, Session } from '@/engine'
import { Tile } from './Tile'
import { useExitingPieces, type Placed } from './useExitingPieces'

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

/**
 * Tells a fall from a swap, and remembers which pieces just landed.
 *
 * Gravity is straight down, so a changed COLUMN is only ever a swap — that is enough
 * to pick the right easing without threading the event list down here. Landing is
 * held as state with a timer rather than derived, because the attribute has to go
 * back off for the CSS animation to be able to run again on the next fall.
 */
function useMotion(placed: Placed[]): Motion {
  const previous = useRef(new Map<number, Pos>())
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const [landed, setLanded] = useState<Set<number>>(() => new Set())

  const swapping = new Set<number>()
  for (const entry of placed) {
    const before = previous.current.get(entry.piece.id)
    if (before && before.col !== entry.col) swapping.add(entry.piece.id)
  }

  useLayoutEffect(() => {
    const fell: number[] = []
    for (const entry of placed) {
      const before = previous.current.get(entry.piece.id)
      if (before && entry.row > before.row && entry.col === before.col) {
        fell.push(entry.piece.id)
      }
    }

    previous.current = new Map(
      placed.map((entry) => [entry.piece.id, { row: entry.row, col: entry.col }]),
    )
    if (fell.length === 0) return

    setLanded((current) => {
      const next = new Set(current)
      for (const id of fell) next.add(id)
      return next
    })

    for (const id of fell) {
      const existing = timers.current.get(id)
      if (existing) clearTimeout(existing)
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id)
          setLanded((current) => {
            if (!current.has(id)) return current
            const next = new Set(current)
            next.delete(id)
            return next
          })
        }, LAND_MS),
      )
    }
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
}: {
  session: Session
  selected: Pos | null
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
      ))}
    </div>
  )
}
