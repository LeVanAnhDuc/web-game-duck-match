import type { LevelConfig } from '@/engine/types'

/**
 * The six phase-one levels, exactly as docs/specs/core-engine-and-goals/design.md §5.
 *
 * Hand-written rather than generated (FR-12 will grow this to 15-20) so difficulty
 * is controlled and every level can be tested against fixed seeds. Each level is
 * here to teach one thing; the "teaches" comment is the reason it exists, and if a
 * level stops teaching it, retune the level rather than adding another.
 *
 * Star thresholds are per level, not a formula — a formula cannot be tuned per board
 * size, and board size changes how much score a single cascade is worth.
 */
export const LEVELS: readonly LevelConfig[] = [
  {
    // teaches: swapping and what a cascade is
    id: 1,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 20,
    goals: [{ kind: 'score', target: 1500 }],
    stars: [1500, 2200, 3000],
  },
  {
    // teaches: one long cascade beats several separate matches
    id: 2,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 18,
    goals: [{ kind: 'score', target: 3000 }],
    stars: [3000, 4200, 5500],
  },
  {
    // teaches: aiming at a colour, not only at points
    id: 3,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 20,
    goals: [{ kind: 'collect', per: { red: 15 } }],
    stars: [1800, 2600, 3400],
  },
  {
    // teaches: two goals at once, on a bigger board
    id: 4,
    rows: 8,
    cols: 8,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 22,
    goals: [
      { kind: 'collect', per: { blue: 12, yellow: 12 } },
      { kind: 'score', target: 2000 },
    ],
    stars: [2000, 3000, 4200],
  },
  {
    // teaches: a sixth colour makes matches rarer, so specials start to matter
    id: 5,
    rows: 8,
    cols: 8,
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    moves: 18,
    goals: [{ kind: 'score', target: 5000 }],
    stars: [5000, 6500, 8000],
  },
  {
    // teaches: the move budget only works if specials are used on purpose
    id: 6,
    rows: 9,
    cols: 9,
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    moves: 16,
    goals: [
      { kind: 'collect', per: { purple: 20 } },
      { kind: 'score', target: 4000 },
    ],
    stars: [4000, 5600, 7200],
  },
]

export const FIRST_LEVEL_ID = 1

export const LAST_LEVEL_ID = LEVELS[LEVELS.length - 1]?.id ?? FIRST_LEVEL_ID

export function levelById(id: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === id)
}
