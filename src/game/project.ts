import type { Cell, GameEvent, Grid, Pos, Session } from '@/engine'

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

/** One step's worth of events applied to a display session. */
export function projectEvents(session: Session, events: GameEvent[]): Session {
  if (events.length === 0) return session

  const grid = clone(session.grid)
  let score = session.score
  let movesLeft = session.movesLeft
  let progress = session.progress

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
        progress = progress.map((goal, index) => (index === event.index ? event.progress : goal))
        break

      case 'reshuffled':
        // Not projectable: the event carries no board, deliberately — a whole grid
        // in an event would exist only for this. A reshuffle is always the last
        // thing in a move, so the settled session lands right after it.
        break

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
