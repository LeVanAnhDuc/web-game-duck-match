import type { GameEvent, Pos } from '@/engine/types'

/**
 * Turns the engine's event list into animation beats.
 *
 * The engine hands back the settled board immediately, so this is the only thing
 * standing between the player and seeing the outcome before its cause (ADR-0002).
 *
 * `lead` is **not** how long a beat's animation lasts — it is how long until the
 * next beat starts. The real duration lives in CSS, and keeping the two numbers
 * apart is what lets beats overlap: a cascade leads in 280ms while pieces are
 * still shrinking and a sweep is still running (ADR-0010). Reading this file
 * therefore tells you nothing about animation length; design.md §B.4 is the one
 * place that joins the two columns, and it moves with both.
 */

export const LEAD = {
  swap: 120,
  /** Longer than `swap`: the piece has to settle back before anything else moves. */
  swapBack: 140,
  clear: 90,
  sweep: 60,
  fall: 110,
  spawn: 80,
  reshuffle: 200,
  /** Nothing follows the result beat, so it leads nothing. */
  result: 0,
} as const

export type Step = {
  events: GameEvent[]
  /**
   * A beat the engine never reported. The slide-over-and-back of a rejected swap is
   * an invention of the presentation layer, so it lives in its own field: putting
   * two synthetic `swapped` events in `events` would make projection spend two
   * moves on a swap that costs none (invariant 6, ADR-0010).
   */
  visual?: { kind: 'swapOut' | 'swapBack'; from: Pos; to: Pos }
  lead: number
}

/** Events that animate together with the `matched` event that caused them. */
function isClearGroupMember(event: GameEvent): boolean {
  return event.t === 'specialActivated' || event.t === 'specialSpawned'
}

function leadFor(event: GameEvent): number {
  switch (event.t) {
    case 'swapped':
      return LEAD.swap
    // A lone `swapReverted` never reaches here — it is expanded into two beats with
    // their own leads — but the compiler cannot know that, and `swap` is the honest
    // answer for the beat that starts the movement.
    case 'swapReverted':
      return LEAD.swap
    case 'matched':
      return LEAD.clear
    case 'fell':
      return LEAD.fall
    case 'refilled':
      return LEAD.spawn
    case 'reshuffled':
      return LEAD.reshuffle
    case 'levelWon':
    case 'levelLost':
      return LEAD.result
    // `specialActivated` only leads when it somehow stands alone; grouped, the
    // `matched` beat's `clear` lead wins because that step was pushed first.
    case 'specialActivated':
      return LEAD.sweep
    // `specialSpawned` and `goalProgressed` never lead a step: they are folded into
    // the step whose clear produced them.
    case 'specialSpawned':
    case 'goalProgressed':
      return LEAD.clear
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
 * - a `swapReverted` expands into **two** steps, the only place where one event
 *   becomes more than one beat;
 * - everything else gets its own step.
 *
 * Under reduced motion the grouping and the step count are identical and every lead
 * is 0, so the queue drains in one chain of immediate ticks and the player jumps
 * straight to the settled board (NFR-A11Y-05). The revert still expands, because
 * dropping a beat here would make the reduced-motion path a different state machine
 * from the normal one.
 */
export function buildTimeline(
  events: GameEvent[],
  opts: { reducedMotion: boolean },
): Step[] {
  const steps: Step[] = []
  const lead = (ms: number) => (opts.reducedMotion ? 0 : ms)

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

    if (event.t === 'swapReverted') {
      // The engine reports one fact — the swap was undone — and the player has to
      // see two: the pieces move, then they come back. The first beat carries no
      // event at all, so nothing in it can be mistaken for a move being spent; the
      // second carries the revert, which is where the board is truthful again.
      steps.push({
        events: [],
        visual: { kind: 'swapOut', from: event.from, to: event.to },
        lead: lead(LEAD.swap),
      })
      steps.push({
        events: [event],
        visual: { kind: 'swapBack', from: event.from, to: event.to },
        lead: lead(LEAD.swapBack),
      })
      continue
    }

    steps.push({ events: [event], lead: lead(leadFor(event)) })
  }

  return steps
}
