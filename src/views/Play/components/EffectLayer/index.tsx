'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { GameEvent, Pos } from '@/engine'
import { formatScore } from '@/i18n/vi'

/**
 * The beats that are not a state diff.
 *
 * A slide or a fall is just a piece whose offset changed, so CSS handles it. A sweep
 * running along the row a stripe just ate corresponds to no piece at all, and neither
 * does a floating `+360 ×2` — they are events, not positions. So they get their own
 * layer, driven by `GameEvent[]`, each element removing itself when its animation
 * ends (design.md §B.5, §C.1).
 *
 * Renders NOTHING under reduced motion: a 260ms sweep collapsed to 0ms is a flash,
 * which is worse than no effect at all (NFR-A11Y-05).
 *
 * `aria-hidden` in full — every one of these is decoration over information that the
 * semantic grid and the HUD already carry.
 */

const LIFETIME_MS = 900

type Effect =
  | { id: string; kind: 'sweep-h' | 'sweep-v' | 'burst'; at: Pos }
  | { id: string; kind: 'color-flash'; cells: Pos[] }
  | { id: string; kind: 'score'; at: Pos; points: number; cascade: number }

/** Centre of a set of cells, so a floating number lands over what earned it. */
function centroid(cells: Pos[]): Pos {
  if (cells.length === 0) return { row: 0, col: 0 }
  const total = cells.reduce(
    (sum, cell) => ({ row: sum.row + cell.row, col: sum.col + cell.col }),
    { row: 0, col: 0 },
  )
  return { row: total.row / cells.length, col: total.col / cells.length }
}

function effectsFor(events: GameEvent[], beat: number): Effect[] {
  const out: Effect[] = []

  events.forEach((event, index) => {
    // Keyed by beat and position in the beat: unique within a move, so two sweeps
    // firing in the same cascade round cannot collide on a key.
    const id = `${beat}:${index}`

    if (event.t === 'specialActivated') {
      if (event.special === 'stripedH') out.push({ id, kind: 'sweep-h', at: event.at })
      if (event.special === 'stripedV') out.push({ id, kind: 'sweep-v', at: event.at })
      if (event.special === 'wrapped') out.push({ id, kind: 'burst', at: event.at })
      if (event.special === 'colorBomb') {
        out.push({ id, kind: 'color-flash', cells: event.cleared })
      }
      return
    }

    if (event.t === 'matched') {
      // The engine already worked out the points and the cascade level; this only
      // repeats them (invariant 2). Showing them next to the match is what makes the
      // multiplier learnable — until now it was an invisible rule.
      out.push({
        id,
        kind: 'score',
        at: centroid(event.cells),
        points: event.points,
        cascade: event.cascade,
      })
    }
  })

  return out
}

/** `translate` in cell units, so the layer needs no pixel arithmetic of its own. */
const cellOffset = (at: Pos): CSSProperties => ({
  transform: `translate(calc(${at.col} * var(--cell)), calc(${at.row} * var(--cell)))`,
})

export function EffectLayer({
  events,
  beat,
  reducedMotion,
}: {
  events: GameEvent[]
  beat: number
  reducedMotion: boolean
}) {
  const [live, setLive] = useState<Effect[]>([])
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>())

  useEffect(() => {
    if (reducedMotion || events.length === 0) return
    const added = effectsFor(events, beat)
    if (added.length === 0) return

    setLive((current) => [...current, ...added])

    // One timer per effect, held in a ref and cancelled only on unmount.
    // Returning `clearTimeout` from this effect instead looks tidier and is wrong:
    // React runs the previous cleanup when the next beat arrives, which killed the
    // removal timer for the effects the PREVIOUS beat had added. With leads of
    // 60-200ms against a 900ms lifetime, that leaked every beat of every cascade
    // except the last — invisible, because the keyframes end at opacity 0, but the
    // DOM grew for the rest of the level. Found by a probe, not by looking.
    for (const effect of added) {
      timers.current.set(
        effect.id,
        setTimeout(() => {
          timers.current.delete(effect.id)
          setLive((current) => current.filter((item) => item.id !== effect.id))
        }, LIFETIME_MS),
      )
    }
  }, [events, beat, reducedMotion])

  useEffect(
    () => () => {
      for (const timer of timers.current.values()) clearTimeout(timer)
      timers.current.clear()
    },
    [],
  )

  if (reducedMotion) return null

  return (
    <div
      aria-hidden="true"
      data-testid="effect-layer"
      className="pointer-events-none absolute inset-1 overflow-hidden"
    >
      {live.map((effect) => {
        if (effect.kind === 'color-flash') {
          return (
            <div key={effect.id} data-effect="color-flash">
              {effect.cells.map((cell, index) => (
                <span
                  key={`${cell.row}-${cell.col}`}
                  className="absolute left-0 top-0 h-[var(--cell)] w-[var(--cell)] rounded-clay bg-ink-strong"
                  style={{
                    ...cellOffset(cell),
                    // Staggered so the board reads as being swept, not as blinking.
                    animation: `color-flash 320ms ease-out ${index * 18}ms both`,
                  }}
                />
              ))}
            </div>
          )
        }

        if (effect.kind === 'score') {
          return (
            <span
              key={effect.id}
              data-effect="score"
              className="absolute left-0 top-0 flex h-[var(--cell)] w-[var(--cell)] items-center justify-center gap-1 whitespace-nowrap font-heading text-sm font-bold text-ink-strong drop-shadow"
              style={{
                ...cellOffset(effect.at),
                animation: 'float-up 760ms ease-out both',
              }}
            >
              +{formatScore(effect.points)}
              {effect.cascade >= 2 && (
                <span data-effect="cascade" className="text-accent-amber">
                  ×{effect.cascade}
                </span>
              )}
            </span>
          )
        }

        if (effect.kind === 'burst') {
          return (
            <span
              key={effect.id}
              data-effect="burst"
              className="absolute left-[calc(-1*var(--cell))] top-[calc(-1*var(--cell))] h-[calc(3*var(--cell))] w-[calc(3*var(--cell))] rounded-full bg-accent-amber/60"
              style={{
                ...cellOffset(effect.at),
                animation: 'burst-out 260ms ease-out both',
              }}
            />
          )
        }

        const horizontal = effect.kind === 'sweep-h'
        return (
          <span
            key={effect.id}
            data-effect={effect.kind}
            className={
              horizontal
                ? 'absolute left-0 top-0 h-[var(--cell)] w-[200vw] bg-gradient-to-r from-transparent via-ink-strong to-transparent'
                : 'absolute left-0 top-0 h-[200vh] w-[var(--cell)] bg-gradient-to-b from-transparent via-ink-strong to-transparent'
            }
            style={{
              // The offset has to compose with the centring translate, so it is
              // written out rather than reusing cellOffset here.
              transform: horizontal
                ? `translate(calc(${effect.at.col} * var(--cell) - 100vw + var(--cell) / 2), calc(${effect.at.row} * var(--cell)))`
                : `translate(calc(${effect.at.col} * var(--cell)), calc(${effect.at.row} * var(--cell) - 100vh + var(--cell) / 2))`,
              animation: `${horizontal ? 'sweep-across' : 'sweep-down'} 260ms ease-out both`,
            }}
          />
        )
      })}
    </div>
  )
}
