/**
 * Every number the scoring rules use (design.md §4).
 *
 * They live only here: rebalancing is a one-file change, and no other module is
 * allowed to hard-code a points value — the UI reads points off `matched` events
 * instead of recomputing them (invariant 2).
 */

/** Points for one cleared piece, before the cascade multiplier. */
export const POINTS_PER_PIECE = 60

/** Flat bonus per special activation, on top of the pieces it cleared. */
export const SPECIAL_ACTIVATION_BONUS = 120

/** Multiplier per cascade level, 1-based. The last entry is the cap. */
export const CASCADE_MULTIPLIERS = [1, 2, 3, 4, 5] as const

export function cascadeMultiplier(level: number): number {
  // Clamped at both ends. The upper cap is the rule; the lower one exists because
  // a level of 0 or less can only be a caller bug, and silently scoring x1 keeps
  // the round scoreable instead of poisoning the total with NaN.
  const clamped = Math.min(Math.max(Math.trunc(level), 1), CASCADE_MULTIPLIERS.length)
  return CASCADE_MULTIPLIERS[clamped - 1] ?? 1
}

export function scoreFor(
  pieceCount: number,
  cascade: number,
  activations: number,
): number {
  return (
    pieceCount * POINTS_PER_PIECE * cascadeMultiplier(cascade) +
    activations * SPECIAL_ACTIVATION_BONUS
  )
}
