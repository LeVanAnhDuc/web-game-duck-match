'use client'

import { useId } from 'react'
import type { Color, GoalProgress } from '@/engine'
import { COLOR_NAME, SHAPE_BY_COLOR, t } from '@/i18n/vi'
import { PieceShape } from '../PieceShape'

/**
 * The goal list, above the board at 375 and in the right-hand column from 768
 * (design.md §6).
 *
 * Two rules shape this file:
 *
 * 1. The `switch` on `kind` ends in a `never` default, exactly as
 *    `src/engine/goals.ts` does. Adding the phase-3 `clearBlockers` kind then
 *    fails to compile here instead of quietly rendering a level with an invisible
 *    goal (ADR-0005).
 * 2. Nothing is identified by colour alone: every collect row also carries the
 *    colour's shape, and its accessible name words the colour out (NFR-A11Y-06).
 */

/** One rendered row. A collect goal contributes one of these per requested colour. */
type GoalRow = {
  key: string
  /** Accessible name — the text equivalent of icon + numbers. */
  label: string
  /**
   * The visible noun. A goal row used to be an icon and two numbers, which reads
   * as "0/12" and nothing else to anyone who cannot resolve a 20px silhouette —
   * persona p05 listed all three of a level's goals as bare numbers and could not
   * say what any of them counted (F-06, FR-21).
   */
  noun: string
  /** Visible text, always "current/target". */
  text: string
  done: boolean
  /** Absent on a score row, which has no piece colour to stand for. */
  color?: Color
}

/**
 * Only the colours the goal asked for, in declaration order — the same filter
 * `goals.ts` applies, so the HUD lists exactly the colours the engine tracks.
 */
function requested(per: Partial<Record<Color, number>>): [Color, number][] {
  return Object.entries(per).flatMap(([color, target]) =>
    typeof target === 'number' ? [[color as Color, target] as [Color, number]] : [],
  )
}

function toRows(progress: GoalProgress[]): GoalRow[] {
  return progress.flatMap((goal, index): GoalRow[] => {
    switch (goal.kind) {
      case 'score':
        return [
          {
            key: `${index}-score`,
            label: t.goalScoreLabel(goal.current, goal.target),
            noun: t.goalScoreShort,
            text: t.goalScore(goal.current, goal.target),
            done: goal.done,
          },
        ]
      case 'collect':
        return requested(goal.per).map(([color, target]) => {
          const current = goal.current[color] ?? 0
          return {
            key: `${index}-${color}`,
            label: t.goalCollectLabel(COLOR_NAME[color], current, target),
            noun: COLOR_NAME[color],
            text: t.goalCollect(current, target),
            // Per colour rather than per goal: a two-colour goal that has finished
            // its reds should tick the red row, not wait for the blues.
            done: current >= target,
            color,
          }
        })
      default: {
        const unhandled: never = goal
        return unhandled
      }
    }
  })
}

/** Static class names so Tailwind's content scan can see every one of them. */
const TEXT_BY_COLOR: Record<Color, string> = {
  red: 'text-piece-red',
  blue: 'text-piece-blue',
  green: 'text-piece-green',
  yellow: 'text-piece-yellow',
  purple: 'text-piece-purple',
  orange: 'text-piece-orange',
}

/**
 * The glyph comes from `ui/shapes.tsx`, the same set the board draws, so the
 * triangle a player is collecting is the triangle they see in the grid. This file
 * used to keep its own 24×24 copy, and the two had already drifted apart.
 */
function ColorShape({ color }: { color: Color }) {
  return (
    <PieceShape
      shape={SHAPE_BY_COLOR[color]}
      className={`h-5 w-5 shrink-0 ${TEXT_BY_COLOR[color]}`}
    />
  )
}

/** A tick, so "done" reads as done and not just as a number that stopped moving. */
function DoneMarker() {
  return (
    <svg
      aria-hidden="true"
      data-goal-done-marker=""
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 text-piece-green"
    >
      <polyline points="4,13 9,18 20,6" />
    </svg>
  )
}

export function GoalHud({ progress }: { progress: GoalProgress[] }) {
  const titleId = useId()
  const rows = toRows(progress)

  // A level with no goals is a config error (goals.ts), not a state worth a header.
  if (rows.length === 0) return null

  return (
    <section className="rounded-lg bg-surface-card px-4 py-3">
      <h2 id={titleId} className="text-sm text-ink-muted">
        {t.goals}
      </h2>
      <ul
        aria-labelledby={titleId}
        className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2"
      >
        {rows.map((row) => (
          <li
            key={row.key}
            aria-label={row.label}
            data-done={row.done ? 'true' : 'false'}
            className={`flex items-center gap-1.5 ${row.done ? 'opacity-60' : ''}`}
          >
            {row.color ? <ColorShape color={row.color} /> : null}
            {/* Shape and word together: the silhouette is the fast channel for a
                player who can resolve it, the word is the one that still works
                when they cannot (NFR-A11Y-06 applied to the HUD, not only the
                bàn). */}
            <span className="text-sm text-ink-muted">{row.noun}</span>
            <span
              className={`text-base font-semibold tabular-nums text-ink-strong ${
                row.done ? 'line-through' : ''
              }`}
            >
              {row.text}
            </span>
            {row.done ? <DoneMarker /> : null}
          </li>
        ))}
      </ul>
    </section>
  )
}
