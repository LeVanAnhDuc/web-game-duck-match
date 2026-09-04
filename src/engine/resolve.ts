import { resolveClears } from './activate'
import { at, collapse, refill, setMany } from './board'
import { applyCleared } from './goals'
import { findMatches } from './match'
import { generateBoard, hasLegalMove, reshuffle } from './moves'
import { scoreFor } from './scoring'
import { specialFor } from './specials'
import type {
  Color,
  GameEvent,
  GoalProgress,
  Grid,
  LevelConfig,
  Match,
  Piece,
  Pos,
  RngState,
} from './types'

/**
 * The cascade loop: clear -> spawn specials -> gravity -> refill -> look again.
 *
 * Everything here is one player move's worth of consequences, and the returned
 * `events` list is in the order they happened — that order IS the animation order
 * (ADR-0002), so nothing may be emitted out of sequence for convenience.
 */

/** Defensive bound. A settled board always shrinks the work, so this never trips. */
const MAX_CASCADE_ROUNDS = 60

export type ResolveInput = {
  grid: Grid
  rng: RngState
  nextPieceId: number
  level: LevelConfig
  score: number
  progress: GoalProgress[]
  /** The two cells the player swapped, if this round came from a swap. */
  swappedFrom: Pos | null
  swappedTo: Pos | null
  /** Colour a swapped colour bomb should hunt, if any. */
  swappedColor: Color | null
  /** Cells that clear before any match is considered — a swap-fired special. */
  seeds: Pos[]
}

export type ResolveOutput = {
  grid: Grid
  rng: RngState
  nextPieceId: number
  score: number
  progress: GoalProgress[]
  events: GameEvent[]
}

const key = (pos: Pos) => `${pos.row},${pos.col}`

function contains(match: Match, pos: Pos | null): boolean {
  if (!pos) return false
  return match.cells.some((cell) => cell.row === pos.row && cell.col === pos.col)
}

/**
 * Which cell a match spawns its special on. The rule players learn is "it appears
 * where I touched", so the swapped cell wins whenever the match runs through it —
 * and a swap has two cells, either of which may be the one inside this match.
 */
function spawnFor(match: Match, from: Pos | null, to: Pos | null) {
  if (contains(match, to)) return specialFor(match, to)
  if (contains(match, from)) return specialFor(match, from)
  return specialFor(match, null)
}

function progressChanged(before: GoalProgress, after: GoalProgress): boolean {
  return JSON.stringify(before) !== JSON.stringify(after)
}

export function resolveBoard(input: ResolveInput): ResolveOutput {
  let grid = input.grid
  let rng = input.rng
  let nextPieceId = input.nextPieceId
  let score = input.score
  let progress = input.progress
  const events: GameEvent[] = []

  let pendingSeeds = input.seeds
  let cascade = 0

  for (let round = 0; round < MAX_CASCADE_ROUNDS; round++) {
    const matches = findMatches(grid)
    const matchCells = new Set<string>()
    for (const match of matches) for (const cell of match.cells) matchCells.add(key(cell))

    const seeds = [...matches.flatMap((match) => match.cells), ...pendingSeeds]
    pendingSeeds = []
    if (seeds.length === 0) break

    cascade += 1

    // Specials are decided from the pre-clear board: their colour comes from the
    // match that spawned them, and their cell may itself be about to be cleared.
    const spawns = matches
      .map((match) => {
        const spawn = round === 0 ? spawnFor(match, input.swappedFrom, input.swappedTo) : specialFor(match, null)
        return spawn ? { ...spawn, color: match.color } : null
      })
      .filter((spawn): spawn is { special: Piece['special']; at: Pos; color: Color } =>
        spawn !== null,
      )

    const { cleared, activations } = resolveClears(grid, seeds, input.swappedColor)
    const clearedPieces = cleared
      .map((pos) => at(grid, pos))
      .filter((cell): cell is Piece => cell !== null)

    // Score: each match pays for its own cells so the UI can float a number next
    // to it, and everything the specials took is paid for once, together with the
    // per-activation bonus.
    let roundScore = 0
    for (const match of matches) {
      const points = scoreFor(match.cells.length, cascade, 0)
      roundScore += points
      events.push({ t: 'matched', cells: match.cells, cascade, points })
    }
    const extraCleared = cleared.filter((pos) => !matchCells.has(key(pos))).length
    roundScore += scoreFor(extraCleared, cascade, activations.length)
    score += roundScore

    for (const activation of activations) {
      events.push({
        t: 'specialActivated',
        at: activation.at,
        special: activation.special,
        cleared: activation.cleared,
      })
    }

    grid = setMany(
      grid,
      cleared.map((pos) => ({ at: pos, cell: null })),
    )

    // Spawned specials are written after the clear, so a special born on a cell
    // that was just emptied survives instead of being wiped by its own match.
    for (const spawn of spawns) {
      grid = setMany(grid, [
        {
          at: spawn.at,
          cell: { id: nextPieceId++, color: spawn.color, special: spawn.special },
        },
      ])
      events.push({ t: 'specialSpawned', at: spawn.at, special: spawn.special })
    }

    const fallen = collapse(grid)
    grid = fallen.grid
    events.push({ t: 'fell', moves: fallen.moves })

    const refilled = refill(grid, input.level.colors, rng, nextPieceId)
    grid = refilled.grid
    rng = refilled.rng
    nextPieceId = refilled.nextPieceId
    events.push({ t: 'refilled', cells: refilled.cells })

    const before = progress
    progress = applyCleared(progress, clearedPieces, score)
    progress.forEach((goal, index) => {
      const previous = before[index]
      if (previous && progressChanged(previous, goal)) {
        events.push({ t: 'goalProgressed', index, progress: goal })
      }
    })
  }

  // A board with no legal move is unplayable, and the player did nothing to cause
  // it, so it costs no move: shuffle the same pieces, and only if ten attempts
  // fail build a fresh board (design.md §4).
  if (!hasLegalMove(grid)) {
    const shuffled = reshuffle(grid, rng)
    rng = shuffled.rng
    if (shuffled.settled) {
      grid = shuffled.grid
    } else {
      const fresh = generateBoard(input.level, rng, nextPieceId)
      grid = fresh.grid
      rng = fresh.rng
      nextPieceId = fresh.nextPieceId
    }
    events.push({ t: 'reshuffled' })
  }

  return { grid, rng, nextPieceId, score, progress, events }
}
