'use client'

import type { ReactElement } from 'react'
import type { Color, Piece, Special } from '@/engine'
import { SHAPE_BY_COLOR } from '@/i18n/vi'
import { PieceShape } from '../PieceShape'

/**
 * One viên, as a slab of clay rather than a coloured glyph (design.md §A.4): a
 * chunky body in the piece colour, a 3px lit top edge and a shadow underneath, with
 * the colour's shape pressed into its face.
 *
 * Two nested elements, because they carry different things:
 *
 * - the **outer** one is the tile's identity — every `data-*` the board, the tests
 *   and the css hang off — and it owns the lift, so the selection ring rises with
 *   the piece instead of staying behind on the board.
 * - the **inner** `.tile-body` is the clay: colour, radius, shadow. Its class name
 *   and its `position: relative` are required by `globals.css`, where the
 *   special-piece shimmer is `[data-shimmer='true'] .tile-body::after`.
 *
 * The drawing is `aria-hidden` throughout: the cell `button` in `Board` already
 * carries the whole accessible name (`t.cellLabel`), and depth is never a signal on
 * its own — a selected piece keeps a ring for anyone who cannot perceive 3px
 * (NFR-A11Y-02).
 */

type TileProps = {
  piece: Piece
  selected: boolean
}

/**
 * Static class strings, one per colour. Tailwind scans source text, so a template
 * literal like `bg-piece-${color}` would compile to nothing.
 */
const BODY_BY_COLOR: Record<Color, string> = {
  red: 'bg-piece-red',
  blue: 'bg-piece-blue',
  green: 'bg-piece-green',
  yellow: 'bg-piece-yellow',
  purple: 'bg-piece-purple',
  orange: 'bg-piece-orange',
}

/**
 * The badge that says *which* special a piece is. Four different silhouettes, not
 * four tints: the piece already spends its colour on identity, so the special has
 * to be a shape too — bars across, bars down, a ring, a burst. Same 0-100 box as
 * `PieceShape`, so the two are drawn at one scale.
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
  const special = piece.special

  return (
    <span
      data-testid="tile"
      data-color={piece.color}
      data-shape={shape}
      data-special={special}
      // Absent rather than `false` on purpose: css and tests both key off presence.
      data-selected={selected || undefined}
      data-lifted={selected || undefined}
      data-shimmer={special === 'none' ? undefined : true}
      className={[
        // Only `transform` animates — a width/height transition would relayout the
        // whole grid on every selection (NFR-PERF-06).
        'pointer-events-none block h-full w-full rounded-clay transition-transform duration-150 ease-pop',
        // `ring-4` and the amber are both load-bearing (FR-19, F-02): the cell
        // button's focus ring is `ring-2 ring-accent-pink`, and a selection mark
        // that reads weaker than the focus mark is how persona p03 lost the
        // cursor. Selected must always out-weigh focused, never the reverse.
        selected
          ? '-translate-y-[3px] ring-4 ring-accent-amber ring-offset-2 ring-offset-surface-well'
          : '',
      ].join(' ')}
    >
      <span
        className={[
          'tile-body relative flex h-full w-full items-center justify-center rounded-clay transition-shadow duration-150',
          BODY_BY_COLOR[piece.color],
          // The lit top edge and the drop shadow both live in `--clay-piece`; the
          // lifted variant is the same recipe cast further (globals.css).
          selected ? 'shadow-clay-lift' : 'shadow-clay',
          // A special is the only piece wearing a rim, so it separates from a
          // packed board at a glance rather than only under inspection (F-01).
          // Inset, so it never grows the piece and never shifts the grid.
          special === 'none' ? '' : 'ring-2 ring-inset ring-ink-strong/70',
        ].join(' ')}
      >
        {/* Pressed into the clay rather than laid on it: a dark shape at partial
            opacity reads as an imprint at any piece colour, where a fixed ink would
            fight the four bright ones (NFR-A11Y-01). */}
        {/* The silhouette stays on EVERY piece, special included: two specials of
            different colours must not be separated by colour alone (NFR-A11Y-06,
            and persona p05 is the reason that threshold exists). It only steps
            back, so the badge is the mark that wins the face (design.md §4.1). */}
        <PieceShape
          shape={shape}
          className={[
            'h-[64%] w-[64%] text-surface-base',
            special === 'none' ? 'opacity-50' : 'opacity-25',
          ].join(' ')}
        />

        {special === 'none' ? null : (
          <svg
            viewBox="0 0 100 100"
            data-testid="special-badge"
            data-special={special}
            aria-hidden="true"
            focusable="false"
            className="absolute inset-[10%] fill-ink-strong stroke-ink-strong"
          >
            {BADGE_PATH[special]}
          </svg>
        )}
      </span>
    </span>
  )
}
