import type { GameEvent } from '@/engine/types'

/**
 * Turns the engine's event list into animation steps.
 *
 * The engine hands back the settled board immediately, so this is the only thing
 * standing between the player and seeing the outcome before its cause. Each step
 * is rendered, then held for `duration` ms before the next one (ADR-0002).
 */

export const DURATIONS = {
  swap: 140,
  clear: 180,
  fall: 220,
  spawn: 150,
  reshuffle: 300,
  result: 120,
} as const

export type Step = { events: GameEvent[]; duration: number }

/** Events that animate together with the `matched` event that caused them. */
function isClearGroupMember(event: GameEvent): boolean {
  return event.t === 'specialActivated' || event.t === 'specialSpawned'
}

function durationFor(event: GameEvent): number {
  switch (event.t) {
    case 'swapped':
    case 'swapReverted':
      return DURATIONS.swap
    case 'matched':
      return DURATIONS.clear
    case 'fell':
      return DURATIONS.fall
    case 'refilled':
      return DURATIONS.spawn
    case 'reshuffled':
      return DURATIONS.reshuffle
    case 'levelWon':
    case 'levelLost':
      return DURATIONS.result
    // `specialSpawned`, `specialActivated` and `goalProgressed` never lead a step:
    // they are folded into the step whose clear produced them.
    case 'specialSpawned':
    case 'specialActivated':
    case 'goalProgressed':
      return DURATIONS.clear
    default: {
      const exhaustive: never = event
      return exhaustive
    }
  }
}

/**
 * Grouping rules:
 * - a `matched` event absorbs the `specialActivated` / `specialSpawned` events that
 *   follow it, because they are one visual beat: the clear and its blast;
 * - `goalProgressed` is folded into the step before it — the HUD ticks with the
 *   clear that earned it, not a frame later;
 * - everything else gets its own step.
 *
 * Under reduced motion the grouping is identical and every duration is 0, so the
 * queue drains in one chain of immediate ticks and the player jumps straight to the
 * settled board (NFR-A11Y-05).
 */
export function buildTimeline(
  events: GameEvent[],
  opts: { reducedMotion: boolean },
): Step[] {
  const steps: Step[] = []

  for (const event of events) {
    const last = steps.at(-1)

    if (last && isClearGroupMember(event) && last.events[0]?.t === 'matched') {
      last.events.push(event)
      continue
    }

    if (last && event.t === 'goalProgressed') {
      last.events.push(event)
      continue
    }

    steps.push({
      events: [event],
      duration: opts.reducedMotion ? 0 : durationFor(event),
    })
  }

  return steps
}
