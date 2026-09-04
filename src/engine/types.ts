/**
 * Every type the engine speaks. Mirrors docs/specs/core-engine-and-goals/design.md §3.
 *
 * This module is types only — no runtime code, so importing it costs nothing.
 */

export type Color = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'

export const COLORS: readonly Color[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
]

export type Special = 'none' | 'stripedH' | 'stripedV' | 'wrapped' | 'colorBomb'

export type Pos = { row: number; col: number }

export type Piece = { id: number; color: Color; special: Special }

/** `null` means the cell is empty — only ever true while a round is being resolved. */
export type Cell = Piece | null

export type Grid = Cell[][]

/** State of the seeded PRNG, held as a value so a Session stays serialisable (ADR-0003). */
export type RngState = number

export type MatchShape = 'line3' | 'line4' | 'line5' | 'corner'

export type Match = {
  cells: Pos[]
  color: Color
  shape: MatchShape
}

export type GoalSpec =
  | { kind: 'score'; target: number }
  | { kind: 'collect'; per: Partial<Record<Color, number>> }

export type GoalProgress =
  | { kind: 'score'; current: number; target: number; done: boolean }
  | {
      kind: 'collect'
      current: Partial<Record<Color, number>>
      per: Partial<Record<Color, number>>
      done: boolean
    }

export type Stars = 0 | 1 | 2 | 3

export type LevelConfig = {
  id: number
  rows: number
  cols: number
  colors: Color[]
  moves: number
  goals: GoalSpec[]
  /** Three ascending score thresholds for 1, 2 and 3 stars. */
  stars: [number, number, number]
}

export type SessionStatus = 'playing' | 'won' | 'lost'

export type Session = {
  level: LevelConfig
  grid: Grid
  rng: RngState
  movesLeft: number
  score: number
  progress: GoalProgress[]
  status: SessionStatus
  nextPieceId: number
}

/**
 * What happened during one move, in time order. The UI replays this list and
 * computes nothing of its own (invariant 2).
 */
export type GameEvent =
  | { t: 'swapped'; from: Pos; to: Pos }
  | { t: 'swapReverted'; from: Pos; to: Pos }
  | { t: 'matched'; cells: Pos[]; cascade: number; points: number }
  /**
   * Carries the whole piece, not just its kind: `game/` projects each step onto the
   * board it shows, and it cannot invent an id or a colour without duplicating the
   * spawn rule it is forbidden to know (invariant 2).
   */
  | { t: 'specialSpawned'; at: Pos; special: Special; piece: Piece }
  /**
   * `points` is this activation's own share: the cells it was the first to take,
   * plus its activation bonus. Every point the score moves by is carried by some
   * event, or `game/` could not show a score that matches the engine's.
   */
  | { t: 'specialActivated'; at: Pos; special: Special; cleared: Pos[]; points: number }
  | { t: 'fell'; moves: { from: Pos; to: Pos }[] }
  | { t: 'refilled'; cells: { at: Pos; piece: Piece }[] }
  | { t: 'goalProgressed'; index: number; progress: GoalProgress }
  | { t: 'reshuffled' }
  | { t: 'levelWon'; score: number; stars: Stars }
  | { t: 'levelLost' }

export type SwapResult = { session: Session; events: GameEvent[] }

export type Progress = {
  version: 1
  levels: Record<number, { stars: Stars; bestScore: number }>
  unlockedUpTo: number
}
