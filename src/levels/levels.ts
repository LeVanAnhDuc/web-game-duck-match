import type { LevelConfig } from '@/engine/types'

/**
 * The six phase-one levels.
 *
 * Hand written, not generated (FR-12 grows this to 15-20), so difficulty is
 * controlled and each level teaches one thing. The "teaches" comment is the reason
 * a level exists; if it stops teaching that, retune it rather than adding another.
 *
 * **The numbers come from measurement, not from taste.** They were first estimated
 * in design.md §5, then a greedy player — always the first legal move, the weakest
 * strategy there is — was run over three fixed seeds per level. The estimates were
 * far off: level 1 was won in 5 of its 20 moves with six times its score target,
 * so the move budget bit nobody and three stars cost nothing. These values put the
 * goal inside a greedy player's reach and the top star outside it, so a star means
 * something. Star thresholds are per level rather than a formula, because board
 * size changes what a single cascade is worth.
 */
export const LEVELS: readonly LevelConfig[] = [
  {
    // teaches: swapping, and what a cascade does to the score
    id: 1,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 15,
    goals: [{ kind: 'score', target: 2000 }],
    stars: [2000, 4000, 7000],
  },
  {
    // teaches: one long cascade is worth more than several separate matches
    id: 2,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 15,
    goals: [{ kind: 'score', target: 4000 }],
    stars: [4000, 6000, 9000],
  },
  {
    // teaches: aiming at a colour, not only at points
    id: 3,
    rows: 7,
    cols: 7,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 18,
    goals: [{ kind: 'collect', per: { red: 12 } }],
    stars: [4000, 7000, 11000],
  },
  {
    // teaches: two goals at once, on a bigger board
    id: 4,
    rows: 8,
    cols: 8,
    colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 20,
    goals: [
      { kind: 'collect', per: { blue: 12, yellow: 12 } },
      { kind: 'score', target: 4000 },
    ],
    stars: [4000, 6500, 9000],
  },
  {
    // teaches: a sixth colour makes matches rarer, so specials start to matter
    id: 5,
    rows: 8,
    cols: 8,
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    moves: 16,
    goals: [{ kind: 'score', target: 6000 }],
    stars: [6000, 8000, 11000],
  },
  {
    // teaches: the move budget only works out if specials are used on purpose
    id: 6,
    rows: 9,
    cols: 9,
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
    moves: 18,
    goals: [
      { kind: 'collect', per: { purple: 12 } },
      { kind: 'score', target: 4000 },
    ],
    stars: [5000, 7000, 10000],
  },
]

export const FIRST_LEVEL_ID = 1

export const LAST_LEVEL_ID = LEVELS[LEVELS.length - 1]?.id ?? FIRST_LEVEL_ID

export function levelById(id: number): LevelConfig | undefined {
  return LEVELS.find((level) => level.id === id)
}
