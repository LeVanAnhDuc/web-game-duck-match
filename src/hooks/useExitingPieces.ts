'use client'

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { Piece } from '@/engine'

/** One piece and the cell it is drawn at. `exiting` is added by this hook only. */
export type Placed = { piece: Piece; row: number; col: number; exiting?: boolean }

/**
 * Keeps a piece that left the board alive for one beat so CSS can pop it out.
 *
 * `Session.grid` sets a cleared cell to `null` the instant the engine resolves, so a
 * layer that renders the grid directly would simply lose the DOM node and there
 * would be nothing left to animate. Putting a `clearing` flag on the grid was the
 * alternative and it was rejected: `Session` is engine data, and DOM lifetime is the
 * drawing layer's problem (ADR-0010, design.md §B.2). Hence a hook in `ui/`, not a
 * field in `engine/`.
 *
 * The returned flag becomes `data-clearing` on the tile, which is what the
 * `clay-pop` keyframe in `globals.css` hangs off.
 *
 * @param placed the pieces the projected grid currently shows
 * @param ms how long a departed piece is kept — the CSS clear duration, not a `lead`
 */
export function useExitingPieces(placed: Placed[], ms: number): Placed[] {
  /**
   * Last commit's live pieces, by id. This is the memory the projected grid does not
   * have: "gone" can only be computed by comparing two frames.
   */
  const lastSeen = useRef(new Map<number, Placed>())
  /** One timer per exiting id, so pieces that left at different beats leave apart. */
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())
  const [exiting, setExiting] = useState<Placed[]>([])

  /**
   * A layout effect, not a plain effect: the re-render it schedules is flushed
   * before the browser paints, so a cleared piece never shows a frame where it is
   * already missing. In a plain effect that frame would be visible and the pop would
   * animate a node that had just been re-created.
   */
  useLayoutEffect(() => {
    const live = new Set<number>()
    for (const item of placed) live.add(item.piece.id)

    // A piece that reappears within the beat cancels its own removal. Without this
    // the pending timer would fire later and drop a piece that is on the board
    // again — the cascade refill hands the same id back often enough for it to
    // matter.
    for (const id of live) {
      const timer = timers.current.get(id)
      if (timer !== undefined) {
        clearTimeout(timer)
        timers.current.delete(id)
      }
    }

    // Gone = present last commit, absent now. Computed from `lastSeen` rather than
    // from the exiting list, so each departure is detected exactly once and cannot
    // be re-added on a later render.
    const gone: Placed[] = []
    for (const [id, previous] of lastSeen.current) {
      if (live.has(id)) continue
      // Keep the cell it last held: the engine has already forgotten it, and a pop
      // has to happen where the player saw the piece.
      gone.push({ ...previous, exiting: true })
    }

    lastSeen.current = new Map(placed.map((item) => [item.piece.id, item]))

    for (const item of gone) {
      const id = item.piece.id
      timers.current.set(
        id,
        setTimeout(() => {
          timers.current.delete(id)
          setExiting((current) => current.filter((held) => held.piece.id !== id))
        }, ms),
      )
    }

    setExiting((current) => {
      const kept = current.filter((held) => !live.has(held.piece.id))
      // Returning `current` unchanged is what stops the render loop when `placed` is
      // a fresh array on every render, as it is coming out of the projection.
      if (gone.length === 0 && kept.length === current.length) return current
      return [...kept, ...gone]
    })
  }, [placed, ms])

  // Unmount only — an effect whose cleanup ran on every `placed` change would cancel
  // exits that are still mid-flight. This is the one place timers are allowed to die
  // without their piece being dropped from the list, because there is no list left.
  useEffect(() => {
    const pending = timers.current
    return () => {
      for (const timer of pending.values()) clearTimeout(timer)
      pending.clear()
    }
  }, [])

  // Live pieces keep their incoming order and come first; exiting ones follow in the
  // order they left. Both halves are stable across renders, so React has no reason
  // to move a DOM node — and a moved node restarts its transition.
  return exiting.length === 0 ? placed : [...placed, ...exiting]
}
