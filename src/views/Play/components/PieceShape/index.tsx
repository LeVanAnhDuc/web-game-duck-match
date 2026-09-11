'use client'

import type { ReactElement } from 'react'
import type { Shape } from '@/i18n/vi'

/**
 * The one shape set in the product. Six silhouettes, one per piece colour, so two
 * colours can be told apart without seeing colour at all (NFR-A11Y-06).
 *
 * It lives on its own because both call sites need the *same* silhouettes: the
 * board draws them on a clay piece, the goal HUD draws them next to a counter, and
 * a player has to recognise "the triangle I am collecting" in both places. `Tile`
 * and `GoalHud` each used to carry a private copy on a different viewBox — they
 * had already drifted (the HUD's star had different points), which is the debt this
 * module pays.
 */

/**
 * Geometry on a 0-100 box, the size-independent contract: the board scales it to a
 * cell, the HUD to a 20px glyph, and neither needs to know the coordinates.
 *
 * Every shape is inscribed in roughly the same area on purpose — a star that swept
 * the full box would read as heavier than a circle inset to r=36, and "heavier"
 * gets mistaken for "special".
 *
 * No `fill` on any node: the svg paints with `currentColor`, so colour is entirely
 * the caller's business.
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
 * `aria-hidden` is not a detail: the accessible name of a board cell is the
 * button's `aria-label` and of a goal row its `aria-label`. An svg that named
 * itself would make a screen reader read every cell twice.
 */
export function PieceShape({ shape, className }: { shape: Shape; className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      data-shape={shape}
      aria-hidden="true"
      focusable="false"
      fill="currentColor"
      className={className}
    >
      {SHAPE_PATH[shape]}
    </svg>
  )
}
