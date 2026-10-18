import { at, isAdjacent, swap } from './board'
import { allDone, initProgress, starsFor } from './goals'
import { findMatches } from './match'
import { activatesOnSwap, generateBoard } from './moves'
import { resolveBoard } from './resolve'
import { seedFrom } from './rng'
import type { Color, GameEvent, LevelConfig, Pos, Session, SwapResult } from './types'

/**
 * The engine's whole public surface: start a level, apply one swap.
 *
 * `applySwap` is pure. It never writes to the session it was handed (invariant 4),
 * and it returns the board as it will finally be — after every cascade — together
 * with the ordered list of what happened. The UI animates that list; it decides
 * nothing (invariant 2).
 */

export function newSession(level: LevelConfig, seed: number): Session {
  const generated = generateBoard(level, seedFrom(seed), 1)

  return {
    level,
    grid: generated.grid,
    rng: generated.rng,
    movesLeft: level.moves,
    score: 0,
    progress: initProgress(level.goals),
    status: 'playing',
    nextPieceId: generated.nextPieceId,
  }
}

/**
 * Which cells a swap-fired special starts from, and the colour a colour bomb
 * hunts. Read from the board AFTER the swap, because that is where the pieces are
 * when they fire.
 */
function swapSeeds(
  grid: Session['grid'],
  from: Pos,
  to: Pos,
): { seeds: Pos[]; swappedColor: Color | null } {
  const movedTo = at(grid, to)
  const movedFrom = at(grid, from)
  if (!movedTo || !movedFrom) return { seeds: [], swappedColor: null }

  const toIsSpecial = movedTo.special !== 'none'
  const fromIsSpecial = movedFrom.special !== 'none'

  // Two specials: phase 1 has no merged combo (FR-09), so each simply fires.
  if (toIsSpecial && fromIsSpecial) {
    return { seeds: [to, from], swappedColor: null }
  }

  if (movedTo.special === 'colorBomb') {
    return { seeds: [to], swappedColor: movedFrom.color }
  }
  if (movedFrom.special === 'colorBomb') {
    return { seeds: [from], swappedColor: movedTo.color }
  }

  return { seeds: [], swappedColor: null }
}

export function applySwap(session: Session, from: Pos, to: Pos): SwapResult {
  // A finished level, a non-adjacent pair or an empty cell is not a move at all —
  // not even a rejected one, so it produces no event to animate.
  if (session.status !== 'playing') return { session, events: [] }
  if (!isAdjacent(from, to)) return { session, events: [] }
  if (!at(session.grid, from) || !at(session.grid, to)) return { session, events: [] }

  const swapped = swap(session.grid, from, to)
  const fires = activatesOnSwap(session.grid, from, to)

  // Nothing happened: put it back and charge nothing. Probing the board must be
  // free, or players lose levels to exploration (invariant 6).
  if (!fires && findMatches(swapped).length === 0) {
    return { session, events: [{ t: 'swapReverted', from, to }] }
  }

  const events: GameEvent[] = [{ t: 'swapped', from, to }]
  const { seeds, swappedColor } = fires
    ? swapSeeds(swapped, from, to)
    : { seeds: [], swappedColor: null }

  const resolved = resolveBoard({
    grid: swapped,
    rng: session.rng,
    nextPieceId: session.nextPieceId,
    level: session.level,
    score: session.score,
    progress: session.progress,
    swappedFrom: from,
    swappedTo: to,
    swappedColor,
    seeds,
  })
  events.push(...resolved.events)

  const movesLeft = session.movesLeft - 1

  // Win and loss are decided once, here, after the cascade has settled — a cascade
  // that earns the goal on the very last move still wins (invariant 7).
  const won = allDone(resolved.progress)
  const status = won ? 'won' : movesLeft <= 0 ? 'lost' : 'playing'

  if (won) {
    events.push({
      t: 'levelWon',
      score: resolved.score,
      stars: starsFor(resolved.score, session.level.stars),
    })
  } else if (status === 'lost') {
    events.push({ t: 'levelLost' })
  }

  return {
    session: {
      level: session.level,
      grid: resolved.grid,
      rng: resolved.rng,
      movesLeft,
      score: resolved.score,
      progress: resolved.progress,
      status,
      nextPieceId: resolved.nextPieceId,
    },
    events,
  }
}
