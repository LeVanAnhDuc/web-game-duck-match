'use client'

import type { ReactElement } from 'react'
import type { Color, Piece, Special } from '@/engine'
import { SHAPE_BY_COLOR, type Shape } from '@/i18n/vi'

/**
 * One viên, drawn as a shape rather than a coloured blob. The shape is what lets
 * two colours be told apart without seeing colour at all (NFR-A11Y-06), so it is
 * always looked up from `SHAPE_BY_COLOR` and never chosen at the call site.
 *
 * The drawing is `aria-hidden`: the cell `button` in `Board` already carries the
 * whole accessible name (`t.cellLabel`), and an SVG that named itself too would
 * make a screen reader read every cell twice.
 */

type TileProps = {
  piece: Piece
  selected: boolean
}

/**
 * Static class strings, one per colour. Tailwind scans source text, so a template
 * literal like `fill-piece-${color}` would compile to nothing.
 */
const FILL_BY_COLOR: Record<Color, string> = {
  red: 'fill-piece-red',
  blue: 'fill-piece-blue',
  green: 'fill-piece-green',
  yellow: 'fill-piece-yellow',
  purple: 'fill-piece-purple',
  orange: 'fill-piece-orange',
}

/**
 * Geometry on a 0..100 box. Every shape is inscribed in roughly the same area so
 * no colour reads as bigger or heavier than another on the same board.
 */
const SHAPE_PATH: Record<Shape, ReactElement> = {
  circle: <circle cx="50" cy="50" r="36" />,
  square: <rect x="16" y="16" width="68" height="68" rx="10" />,
  triangle: <polygon points="50,14 88,84 12,84" />,
  diamond: <polygon points="50,10 90,50 50,90 10,50" />,
  star: (
    <polygon points="50,12 59.4,39.1 88,39.6 65.2,56.9 73.5,84.4 50,68 26.5,84.4 34.8,56.9 12,39.6 40.6,39.1" />
  ),
  hexagon: <polygon points="50,12 82.9,31 82.9,69 50,88 17.1,69 17.1,31" />,
}

/**
 * The badge that says *which* special a piece is. Four different silhouettes, not
 * four tints: the piece already spends its colour on identity, so the special has
 * to be a shape too — bars across, bars down, a ring, a burst.
 */
const BADGE_PATH: Record<Exclude<Special, 'none'>, ReactElement> = {
  stripedH: (
    <>
      <rect x="24" y="41" width="52" height="7" rx="3.5" />
      <rect x="24" y="52" width="52" height="7" rx="3.5" />
    </>
  ),
  stripedV: (
    <>
      <rect x="41" y="24" width="7" height="52" rx="3.5" />
      <rect x="52" y="24" width="7" height="52" rx="3.5" />
    </>
  ),
  wrapped: (
    <>
      <circle cx="50" cy="50" r="30" fill="none" strokeWidth="6" />
      <circle cx="50" cy="50" r="16" fill="none" strokeWidth="6" />
    </>
  ),
  colorBomb: <polygon points="50,18 58,42 82,50 58,58 50,82 42,58 18,50 42,42" />,
}

export function Tile({ piece, selected }: TileProps) {
  const shape = SHAPE_BY_COLOR[piece.color]

  return (
    <span
      data-testid="tile"
      data-color={piece.color}
      data-shape={shape}
      data-special={piece.special}
      data-selected={selected || undefined}
      className={[
        // Only `transform` animates — a width/height transition would relayout the
        // whole grid on every selection (NFR-PERF-06).
        'pointer-events-none block h-full w-full rounded-lg transition-transform duration-150 ease-pop',
        selected
          ? 'scale-105 ring-2 ring-ink-strong ring-offset-2 ring-offset-surface-card'
          : 'scale-100',
      ].join(' ')}
    >
      <svg
        viewBox="0 0 100 100"
        aria-hidden="true"
        focusable="false"
        className="h-full w-full"
      >
        {/* The thin surface-coloured outline keeps neighbouring pieces of similar
            lightness from merging into one blob (NFR-A11Y-01). */}
        <g
          className={`${FILL_BY_COLOR[piece.color]} stroke-surface-base`}
          strokeWidth="3"
        >
          {SHAPE_PATH[shape]}
        </g>
        {piece.special !== 'none' && (
          <g
            data-testid="special-badge"
            data-special={piece.special}
            className="fill-ink-strong stroke-ink-strong"
          >
            {BADGE_PATH[piece.special]}
          </g>
        )}
      </svg>
    </span>
  )
}
