import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, render } from '@testing-library/react'
import { newSession } from '@/engine'
import type { LevelConfig, Piece, Pos, Session } from '@/engine'
import { PieceLayer } from './index'

/**
 * The layer under test is the whole animation mechanism (ADR-0010), so most of
 * these cases are about identity and geometry rather than about looks: a piece is
 * one DOM node keyed by `Piece.id`, and it moves because its `translate` changed
 * between two renders. Nothing here drives an animation — happy-dom has no layout
 * and no compositor — so what is asserted is the input CSS gets.
 *
 * `waitFor` is deliberately absent: it polls on real timers, which either hangs
 * under `vi.useFakeTimers()` or advances one virtual millisecond per await. Every
 * wait here is an explicit `advanceTimersByTime` inside `act`.
 */

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 5,
  goals: [{ kind: 'score', target: 1000 }],
  stars: [1, 2, 3],
}
const session = newSession(level, 1)

/**
 * Mirrors the module-private `CLEAR_MS` in `PieceLayer`, which pairs with
 * `--dur-clear` in globals.css. A test cannot import it, but it has to know when
 * the pop window is over — if the two numbers ever drift apart, the piece is either
 * dropped mid-animation or kept after it, and this is the assertion that notices.
 */
const CLEAR_MS = 180

function pieceAt(row: number, col: number): Piece {
  const piece = session.grid[row]?.[col]
  if (!piece) throw new Error(`fixture has no piece at ${row},${col}`)
  return piece
}

/**
 * Sessions are built by hand rather than by playing a move: `applySwap` would
 * cascade, refill and re-seed the rng, and then no assertion could say which piece
 * was supposed to end up where. These two helpers give the one-cell change each
 * case needs, leaving every other piece and every id untouched.
 */
function exchange(source: Session, a: Pos, b: Pos): Session {
  const grid = source.grid.map((line) => [...line])
  const lineA = grid[a.row]
  const lineB = grid[b.row]
  if (!lineA || !lineB) throw new Error('fixture out of range')
  const held = lineA[a.col] ?? null
  lineA[a.col] = lineB[b.col] ?? null
  lineB[b.col] = held
  return { ...source, grid }
}

function clearCell(source: Session, at: Pos): Session {
  const grid = source.grid.map((line) => [...line])
  const line = grid[at.row]
  if (!line) throw new Error('fixture out of range')
  line[at.col] = null
  return { ...source, grid }
}

/** The positioned element for one piece — the node whose survival is the mechanism. */
function slot(container: HTMLElement, piece: Piece): HTMLElement {
  const element = container.querySelector<HTMLElement>(`[data-piece-id="${piece.id}"]`)
  if (!element) throw new Error(`no slot rendered for piece ${piece.id}`)
  return element
}

const expectedTransform = (row: number, col: number) =>
  `translate(calc(${col} * var(--cell)), calc(${row} * var(--cell)))`

beforeEach(() => {
  vi.useFakeTimers()
})

afterEach(() => {
  vi.clearAllTimers()
  vi.useRealTimers()
})

describe('PieceLayer', () => {
  it('renders one element per piece, and each id exactly once', () => {
    const { container } = render(<PieceLayer session={session} selected={null} />)

    const slots = container.querySelectorAll('[data-piece-id]')
    expect(slots).toHaveLength(49)

    // A duplicate id would break the React key and the once-per-id activation
    // guard at the same time (invariant 9), and the symptom would be an animation
    // jumping to the wrong cell rather than an exception.
    const ids = Array.from(slots, (element) => element.getAttribute('data-piece-id'))
    expect(new Set(ids).size).toBe(49)

    const fromGrid = session.grid.flat().map((cell) => String(cell?.id))
    expect(new Set(ids)).toEqual(new Set(fromGrid))
  })

  it('offsets every piece by its own row and col in cell units', () => {
    const { container } = render(<PieceLayer session={session} selected={null} />)

    // All 49, not a sample: a transposed row/col or an off-by-one would still look
    // plausible on one cell and put the whole board a cell out of line with the
    // semantic grid, which shares the same `--cell` (ADR-0010).
    for (let row = 0; row < level.rows; row++) {
      for (let col = 0; col < level.cols; col++) {
        const element = slot(container, pieceAt(row, col))
        expect(element.style.transform).toBe(expectedTransform(row, col))
        expect(element.getAttribute('data-row')).toBe(String(row))
        expect(element.getAttribute('data-col')).toBe(String(col))
      }
    }
  })

  it('keeps the same DOM node when a piece moves to a new cell', () => {
    const { container, rerender } = render(
      <PieceLayer session={session} selected={null} />,
    )

    const travelling = pieceAt(0, 0)
    const neighbour = pieceAt(0, 1)
    const before = slot(container, travelling)
    const neighbourBefore = slot(container, neighbour)
    expect(before.style.transform).toBe(expectedTransform(0, 0))

    rerender(
      <PieceLayer
        session={exchange(session, { row: 0, col: 0 }, { row: 0, col: 1 })}
        selected={null}
      />,
    )

    // THE mechanism. `key = piece.id` means React updates this node's style rather
    // than replacing it, so the browser has an old and a new `translate` on one
    // element and interpolates between them. If the key changed — keyed by cell, or
    // by index — React would swap two nodes, both transitions would start from
    // their end state, and nothing on the board would ever animate.
    const after = slot(container, travelling)
    expect(after).toBe(before)
    expect(after.style.transform).toBe(expectedTransform(0, 1))

    // Same node, other direction: a swap is two pieces travelling, not one moving
    // into a hole.
    expect(slot(container, neighbour)).toBe(neighbourBefore)
    expect(neighbourBefore.style.transform).toBe(expectedTransform(0, 0))
  })

  it('hides the whole layer from assistive tech', () => {
    const { container } = render(<PieceLayer session={session} selected={null} />)

    const layer = container.firstElementChild
    // Read as an attribute: happy-dom does not reflect the ARIA IDL properties, so
    // `element.ariaHidden` is undefined even when the attribute is set.
    expect(layer?.getAttribute('aria-hidden')).toBe('true')
    // One `aria-hidden` on the layer is what keeps the drawing out of the a11y tree
    // entirely — the name, the role and the keyboard all live on the semantic grid
    // in `Board`, which never moves.
    expect(layer?.querySelectorAll('[data-piece-id]')).toHaveLength(49)
  })

  it('pads with a calc on --cell, never a percentage', () => {
    const { container } = render(<PieceLayer session={session} selected={null} />)

    // Percentage padding on an absolutely positioned element resolves against the
    // nearest POSITIONED ancestor — the whole layer, not the cell — which shrank
    // every piece to about a sixth of its size. The unit is the bug, so the unit is
    // what is asserted.
    const style = slot(container, pieceAt(2, 3)).getAttribute('style') ?? ''
    expect(style).toContain('calc(var(--cell)')
    expect(slot(container, pieceAt(2, 3)).style.padding).not.toContain('%')
  })

  it('keeps a cleared piece for one beat, marked clearing, then drops it', () => {
    const { container, rerender } = render(
      <PieceLayer session={session} selected={null} />,
    )

    const doomed = pieceAt(3, 3)
    rerender(
      <PieceLayer session={clearCell(session, { row: 3, col: 3 })} selected={null} />,
    )

    // The engine nulls the cell the instant it resolves, so without
    // `useExitingPieces` the node would be gone before the pop could run (§B.2).
    const held = container.querySelectorAll(`[data-piece-id="${doomed.id}"]`)
    expect(held).toHaveLength(1)
    expect(held[0]?.getAttribute('data-clearing')).toBe('true')
    // It pops where the player last saw it, not at the layer's origin.
    expect(held[0]).toBeInstanceOf(HTMLElement)
    expect((held[0] as HTMLElement).style.transform).toBe(expectedTransform(3, 3))
    expect(container.querySelectorAll('[data-piece-id]')).toHaveLength(49)

    act(() => {
      vi.advanceTimersByTime(CLEAR_MS - 1)
    })
    expect(container.querySelectorAll(`[data-piece-id="${doomed.id}"]`)).toHaveLength(1)

    act(() => {
      vi.advanceTimersByTime(1)
    })
    expect(container.querySelectorAll(`[data-piece-id="${doomed.id}"]`)).toHaveLength(0)
    expect(container.querySelectorAll('[data-piece-id]')).toHaveLength(48)
  })

  it('marks only the piece standing in the selected cell', () => {
    const { container } = render(
      <PieceLayer session={session} selected={{ row: 4, col: 2 }} />,
    )

    const marked = container.querySelectorAll('[data-selected]')
    expect(marked).toHaveLength(1)
    // Selection is a cell, but the lift belongs to the piece: the layer has to
    // resolve one to the other, and getting it wrong lifts a piece the player did
    // not touch.
    expect(slot(container, pieceAt(4, 2)).contains(marked[0] ?? null)).toBe(true)
  })

  it('never marks an exiting piece as selected', () => {
    const { container, rerender } = render(
      <PieceLayer session={session} selected={{ row: 3, col: 3 }} />,
    )
    expect(container.querySelectorAll('[data-selected]')).toHaveLength(1)

    // An exiting piece keeps the cell it left, so it still matches `selected` by
    // coordinates. It must not be lifted: a piece that is popping cannot be armed
    // for a swap, and the ring would be drawn on something that is about to vanish.
    rerender(
      <PieceLayer
        session={clearCell(session, { row: 3, col: 3 })}
        selected={{ row: 3, col: 3 }}
      />,
    )

    expect(
      container.querySelectorAll(`[data-piece-id="${pieceAt(3, 3).id}"]`),
    ).toHaveLength(1)
    expect(container.querySelectorAll('[data-selected]')).toHaveLength(0)
  })

  // ---- FR-19: the idle nudge has to be on the piece, not under it ----

  describe('idle hint', () => {
    it('marks both cells of the suggested move', () => {
      const { container } = render(
        <PieceLayer
          session={session}
          selected={null}
          hint={{ from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }}
        />,
      )

      const hinted = container.querySelectorAll('[data-hint="true"]')
      expect(hinted).toHaveLength(2)
    })

    it('marks nothing when there is no hint', () => {
      const { container } = render(<PieceLayer session={session} selected={null} />)
      expect(container.querySelectorAll('[data-hint="true"]')).toHaveLength(0)
    })

    it('never puts the nudge on the element that carries the cell transform', () => {
      // The slot positions itself with `transform: translate(...)`. `hint-nudge`
      // also animates `transform`, so sharing one element would move the piece to
      // the wrong cell for the whole animation. The nudge gets its own box.
      const { container } = render(
        <PieceLayer
          session={session}
          selected={null}
          hint={{ from: { row: 2, col: 3 }, to: { row: 2, col: 4 } }}
        />,
      )

      for (const node of container.querySelectorAll('[data-hint="true"]')) {
        expect(node.getAttribute('data-testid')).not.toBe('tile-slot')
        expect((node as HTMLElement).style.transform).toBe('')
      }
    })
  })
})
