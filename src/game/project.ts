import type { Cell, GameEvent, Grid, Pos, Session } from '@/engine'
import type { Step } from './timeline'

/**
 * Replays engine events onto the board the player is looking at.
 *
 * The engine hands back the settled board immediately, so without this the whole
 * cascade would be one jump: the timeline would only be a pause. This walks the
 * board forward one step at a time using nothing but the events themselves — it
 * detects no match, rates no star and adds up only the points the engine already
 * put in the event (invariant 2).
 *
 * The strong claim, and the test that guards it: folding every event of a move
 * over the pre-move session reproduces the session `applySwap` returned, exactly.
 * If that ever fails, the animation is showing the player something untrue.
 */

function clone(grid: Grid): Grid {
  return grid.map((row) => [...row])
}

function write(grid: Grid, pos: Pos, cell: Cell): void {
  const row = grid[pos.row]
  if (row) row[pos.col] = cell
}

function read(grid: Grid, pos: Pos): Cell {
  return grid[pos.row]?.[pos.col] ?? null
}

/**
 * One step's worth of events applied to a display session.
 *
 * `visual` is the beat the timeline invented rather than the engine reported — the
 * slide-over-and-back of a rejected swap. It is a separate parameter because it must
 * NOT spend a move: a reverted swap costs the player nothing (invariant 6), and
 * expressing it as two `swapped` events would charge two (ADR-0010).
 */
export function projectEvents(
  session: Session,
  events: GameEvent[],
  visual?: Step['visual'],
): Session {
  if (events.length === 0 && !visual) return session

  const grid = clone(session.grid)
  let score = session.score
  let movesLeft = session.movesLeft
  let progress = session.progress

  if (visual) {
    // Both kinds do the same thing to the board — exchange the two cells. The
    // difference is only which way round the player is watching it happen.
    const from = read(grid, visual.from)
    const to = read(grid, visual.to)
    write(grid, visual.from, to)
    write(grid, visual.to, from)
  }

  for (const event of events) {
    switch (event.t) {
      case 'swapped': {
        // The move is spent the moment the pieces move, not when the dust settles,
        // so the counter never lags behind what the player just did.
        const from = read(grid, event.from)
        const to = read(grid, event.to)
        write(grid, event.from, to)
        write(grid, event.to, from)
        movesLeft -= 1
        break
      }

      case 'swapReverted':
        // Nothing to project: the pieces end where they started. The rejection is
        // shown by the animation, and it costs no move (invariant 6).
        break

      case 'matched':
        for (const cell of event.cells) write(grid, cell, null)
        score += event.points
        break

      case 'specialActivated':
        write(grid, event.at, null)
        for (const cell of event.cleared) write(grid, cell, null)
        score += event.points
        break

      case 'specialSpawned':
        write(grid, event.at, event.piece)
        break

      case 'fell': {
        // Sources are read before anything is written: a column falling into itself
        // would otherwise overwrite a piece that has not moved yet.
        const moved = event.moves.map((move) => ({
          to: move.to,
          cell: read(grid, move.from),
        }))
        for (const move of event.moves) write(grid, move.from, null)
        for (const move of moved) write(grid, move.to, move.cell)
        break
      }

      case 'refilled':
        for (const cell of event.cells) write(grid, cell.at, cell.piece)
        break

      case 'goalProgressed':
        progress = progress.map((goal, index) =>
          index === event.index ? event.progress : goal,
        )
        break

      case 'reshuffled': {
        // Projectable since ADR-0009: the event carries the board it produced, and
        // `moves.reshuffle` redistributes the same Piece objects, so every id
        // survives. The piece layer therefore sees 49 pieces change position and
        // slides each one home — no animation code anywhere.
        for (let row = 0; row < event.grid.length; row++) {
          const line = event.grid[row]
          if (!line) continue
          for (let col = 0; col < line.length; col++) {
            write(grid, { row, col }, line[col] ?? null)
          }
        }
        break
      }

      case 'levelWon':
      case 'levelLost':
        break

      default: {
        const exhaustive: never = event
        return exhaustive
      }
    }
  }

  return { ...session, grid, score, movesLeft, progress }
}
