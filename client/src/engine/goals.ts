import type { Color, GoalProgress, GoalSpec, LevelConfig, Piece, Stars } from './types'

/**
 * Goal evaluation. Adding a goal kind must touch this file and types.ts and
 * nothing else — that is the test ADR-0005 sets for the module boundary — so every
 * switch on `kind` below ends in a `default` that assigns to a `never`. The
 * phase-3 `clearBlockers` and phase-4 `deliver` kinds therefore stop compiling
 * here until they are handled, instead of falling through and being ignored at
 * runtime while the tests stay green.
 */

/** Only the colours the goal actually asked for, with their targets. */
function requested(per: Partial<Record<Color, number>>): [Color, number][] {
  return Object.entries(per).flatMap(([color, target]) =>
    typeof target === 'number' ? [[color as Color, target] as [Color, number]] : [],
  )
}

function zeroed(per: Partial<Record<Color, number>>): Partial<Record<Color, number>> {
  return Object.fromEntries(requested(per).map(([color]) => [color, 0]))
}

function collectDone(
  current: Partial<Record<Color, number>>,
  per: Partial<Record<Color, number>>,
): boolean {
  return requested(per).every(([color, target]) => (current[color] ?? 0) >= target)
}

/**
 * A special keeps the colour it was made from (design.md §4), so it counts towards
 * a collect goal exactly like the plain piece it replaced.
 */
function countByColor(cleared: Piece[]): Partial<Record<Color, number>> {
  const counts: Partial<Record<Color, number>> = {}
  for (const piece of cleared) counts[piece.color] = (counts[piece.color] ?? 0) + 1
  return counts
}

export function initProgress(goals: GoalSpec[]): GoalProgress[] {
  return goals.map((goal): GoalProgress => {
    switch (goal.kind) {
      case 'score':
        return { kind: 'score', current: 0, target: goal.target, done: 0 >= goal.target }
      case 'collect': {
        // `current` starts with an explicit zero per requested colour so the HUD can
        // render "0/8" from progress alone, without also reading the level config.
        const current = zeroed(goal.per)
        // `per` is copied: progress travels through every Session, and it must not
        // hand out a reference into the shared LevelConfig.
        return {
          kind: 'collect',
          current,
          per: { ...goal.per },
          done: collectDone(current, goal.per),
        }
      }
      default: {
        const unhandled: never = goal
        return unhandled
      }
    }
  })
}

/**
 * `score` is the session's **running total**, not this round's delta, so calling
 * this twice with the same total is a no-op and a score goal can never double
 * count. Pure: every returned goal is a new object (invariant 4).
 */
export function applyCleared(
  progress: GoalProgress[],
  cleared: Piece[],
  score: number,
): GoalProgress[] {
  const gained = countByColor(cleared)

  return progress.map((goal): GoalProgress => {
    switch (goal.kind) {
      case 'score':
        return { ...goal, current: score, done: score >= goal.target }
      case 'collect': {
        const current = { ...goal.current }
        for (const [color, target] of requested(goal.per)) {
          // Capped at the target: the HUD shows "8/8" and never "11/8", and a goal
          // that is already done stops emitting goalProgressed events.
          current[color] = Math.min((current[color] ?? 0) + (gained[color] ?? 0), target)
        }
        return { ...goal, current, done: collectDone(current, goal.per) }
      }
      default: {
        const unhandled: never = goal
        return unhandled
      }
    }
  })
}

/** Empty progress is done — a level with no goals is a config error, not a stall. */
export function allDone(progress: GoalProgress[]): boolean {
  return progress.every((goal) => goal.done)
}

export function starsFor(score: number, stars: LevelConfig['stars']): Stars {
  const [one, two, three] = stars
  if (score >= three) return 3
  if (score >= two) return 2
  if (score >= one) return 1
  return 0
}

/**
 * How many points short of the next star a score is, or `null` once all three are
 * earned (FR-20).
 *
 * The thresholds have always been in `LevelConfig`; nothing ever showed them. Every
 * win in the 2026-09-11 persona run scored one star out of three — one of them at
 * 132% of the level's goal — and both players who said anything about it said some
 * version of "why only one?". A three-star system only pulls a player back if the
 * player can see what the next star costs.
 *
 * Lives beside `starsFor` so the two can never disagree about a boundary: this
 * returns 0 exactly where `starsFor` would award the next star.
 */
export function pointsToNextStar(
  score: number,
  stars: LevelConfig['stars'],
): number | null {
  const next = stars.find((threshold) => score < threshold)
  return next === undefined ? null : next - score
}
