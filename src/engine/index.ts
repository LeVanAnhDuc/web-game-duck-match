/**
 * The only module `game/` and `ui/` may import from the engine. Everything below
 * it is an implementation detail, and keeping that true is what lets the rules be
 * rewritten without touching a component (ADR-0002).
 */
export { newSession, applySwap } from './session'
export { starsFor } from './goals'
export { findHint } from './hint'
export type {
  Cell,
  Color,
  GameEvent,
  GoalProgress,
  GoalSpec,
  Grid,
  LevelConfig,
  Piece,
  Pos,
  Progress,
  RngState,
  Session,
  SessionStatus,
  Special,
  Stars,
  SwapResult,
} from './types'
export { COLORS } from './types'
