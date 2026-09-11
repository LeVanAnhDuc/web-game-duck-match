import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from './index'
import { Tile } from '../../components/Tile'
import { newSession } from '@/engine'
import type { LevelConfig, Piece, Special } from '@/engine'
import { COLOR_NAME, SHAPE_BY_COLOR, t } from '@/i18n/vi'

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

const wide: LevelConfig = { ...level, id: 6, rows: 9, cols: 9 }
const wideSession = newSession(wide, 7)

/** Cells carry a testid so a test never has to know the generated colours. */
function cell(row: number, col: number): HTMLElement {
  return screen.getByTestId(`cell-${row}-${col}`)
}

/**
 * The tile drawing for a cell.
 *
 * Pieces no longer live inside the cell button: they are positioned by id in
 * `PieceLayer` so they can travel between cells (ADR-0010). Only this locator
 * changed — every assertion that uses it is unchanged.
 */
function tileIn(row: number, col: number): Element | null {
  return document.querySelector(
    `[data-testid="tile-slot"][data-row="${row}"][data-col="${col}"] [data-testid="tile"]`,
  )
}

function tabbable(): HTMLElement[] {
  return screen
    .getAllByRole('button')
    .filter((button) => button.getAttribute('tabindex') === '0')
}

function pieceAt(row: number, col: number): Piece {
  const piece = session.grid[row]?.[col]
  if (!piece) throw new Error(`fixture has no piece at ${row},${col}`)
  return piece
}

describe('Board', () => {
  it('renders a grid of 49 cells', () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    expect(screen.getByRole('grid')).toBeTruthy()
    expect(screen.getAllByRole('gridcell')).toHaveLength(49)
  })

  it('swaps two adjacent cells with the keyboard', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{Enter}')
    expect(onSwap).toHaveBeenCalledWith({ row: 0, col: 0 }, { row: 0, col: 1 })
  })

  it('escape clears the selection so the next enter starts over', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{Escape}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })

  it('refuses a non-adjacent keyboard swap', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })

  it('ignores input while busy', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })

  // ---- names and roles (NFR-A11Y-02, NFR-I18N-01) ----

  it('names the grid and every cell button from the string table', () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    expect(screen.getByRole('grid', { name: t.boardLabel })).toBeTruthy()

    const first = pieceAt(0, 0)
    expect(cell(0, 0).getAttribute('aria-label')).toBe(
      t.cellLabel(0, 0, COLOR_NAME[first.color]),
    )

    const last = pieceAt(6, 6)
    expect(cell(6, 6).getAttribute('aria-label')).toBe(
      t.cellLabel(6, 6, COLOR_NAME[last.color]),
    )
  })

  it('gives every cell a row so gridcells are owned as ARIA requires', () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    expect(screen.getAllByRole('row')).toHaveLength(7)
  })

  // ---- roving tabindex ----

  it('keeps exactly one cell tabbable and starts at (0,0)', async () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    expect(tabbable()).toEqual([cell(0, 0)])

    const user = userEvent.setup()
    await user.tab()
    expect(document.activeElement).toBe(cell(0, 0))
  })

  it('moves DOM focus and the tabbable cell together with the arrow keys', async () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowDown}')

    expect(document.activeElement).toBe(cell(1, 1))
    expect(tabbable()).toEqual([cell(1, 1)])
  })

  it('clamps arrow movement at the edges instead of wrapping', async () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{ArrowLeft}{ArrowUp}')
    expect(document.activeElement).toBe(cell(0, 0))
  })

  it('does not move focus while busy', async () => {
    render(<Board session={session} busy onSwap={vi.fn()} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{ArrowRight}{ArrowDown}')
    expect(document.activeElement).toBe(cell(0, 0))
  })

  // ---- selection ----

  it('marks the selected cell and clears it on escape', async () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    const user = userEvent.setup()
    await user.tab()

    await user.keyboard('{Enter}')
    expect(cell(0, 0).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe(
      'true',
    )
    expect(tileIn(0, 0)?.getAttribute('data-selected')).toBe('true')

    await user.keyboard('{Escape}')
    expect(cell(0, 0).closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe(
      'false',
    )
  })

  it('changes no selection while busy', async () => {
    render(<Board session={session} busy onSwap={vi.fn()} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}')
    expect(tileIn(0, 0)?.getAttribute('data-selected')).toBe(null)
  })

  it('accepts Space as well as Enter', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{ArrowDown} {ArrowRight} ')
    expect(onSwap).toHaveBeenCalledWith({ row: 1, col: 0 }, { row: 1, col: 1 })
  })

  it('a second press on the selected cell deselects it', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
    expect(tileIn(0, 0)?.getAttribute('data-selected')).toBe(null)
  })

  it('re-selects after a non-adjacent press so the next press can swap', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}{ArrowRight}{Enter}')
    expect(onSwap).toHaveBeenCalledTimes(1)
    expect(onSwap).toHaveBeenCalledWith({ row: 0, col: 2 }, { row: 0, col: 3 })
  })

  // ---- pointer ----

  it('swaps on a drag from a cell to its neighbour', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.pointer([
      { keys: '[MouseLeft>]', target: cell(2, 3) },
      { target: cell(3, 3) },
      { keys: '[/MouseLeft]', target: cell(3, 3) },
    ])
    expect(onSwap).toHaveBeenCalledWith({ row: 2, col: 3 }, { row: 3, col: 3 })
  })

  it('ignores a drag that ends far from where it started', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.pointer([
      { keys: '[MouseLeft>]', target: cell(2, 3) },
      { target: cell(5, 5) },
      { keys: '[/MouseLeft]', target: cell(5, 5) },
    ])
    expect(onSwap).not.toHaveBeenCalled()
  })

  it('swaps on tap-then-tap so touch users need not drag', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.click(cell(4, 1))
    await user.click(cell(4, 2))
    expect(onSwap).toHaveBeenCalledWith({ row: 4, col: 1 }, { row: 4, col: 2 })
  })

  it('ignores pointer input while busy', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.pointer([
      { keys: '[MouseLeft>]', target: cell(2, 3) },
      { target: cell(3, 3) },
      { keys: '[/MouseLeft]', target: cell(3, 3) },
    ])
    await user.click(cell(4, 1))
    await user.click(cell(4, 2))
    expect(onSwap).not.toHaveBeenCalled()
  })

  // ---- sizing ----

  it('sizes cells from --cols so the board stays square', () => {
    const { unmount } = render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    // The vars sit on the slab, not the grid: custom properties inherit downwards,
    // and all three layers are children of the slab (ADR-0010).
    const grid = screen.getByTestId('board-slab')
    expect(grid.style.getPropertyValue('--cols')).toBe('7')
    expect(grid.style.getPropertyValue('--cell')).toContain('clamp(')
    unmount()

    render(<Board session={wideSession} busy={false} onSwap={vi.fn()} />)
    expect(screen.getByTestId('board-slab').style.getPropertyValue('--cols')).toBe('9')
  })
})

describe('Tile', () => {
  it('carries the shape that belongs to its colour, never colour alone', () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    const tiles = screen.getAllByTestId('tile')
    expect(tiles).toHaveLength(49)

    for (const tile of tiles) {
      const color = tile.getAttribute('data-color') as keyof typeof SHAPE_BY_COLOR
      expect(tile.getAttribute('data-shape')).toBe(SHAPE_BY_COLOR[color])
    }
  })

  it('draws a different badge for each special, and none for a plain piece', () => {
    const specials: Exclude<Special, 'none'>[] = [
      'stripedH',
      'stripedV',
      'wrapped',
      'colorBomb',
    ]

    const drawings = specials.map((special) => {
      const view = render(
        <Tile piece={{ id: 1, color: 'red', special }} selected={false} />,
      )
      const badge = view.container.querySelector('[data-testid="special-badge"]')
      expect(badge?.getAttribute('data-special')).toBe(special)
      const drawing = badge?.innerHTML ?? ''
      view.unmount()
      return drawing
    })

    expect(drawings.every((drawing) => drawing.length > 0)).toBe(true)
    expect(new Set(drawings).size).toBe(4)

    const plain = render(
      <Tile piece={{ id: 2, color: 'red', special: 'none' }} selected={false} />,
    )
    expect(plain.container.querySelector('[data-testid="special-badge"]')).toBe(null)
  })

  it('shows a ring when selected, not just a different colour', () => {
    const piece: Piece = { id: 3, color: 'blue', special: 'none' }
    const off = render(<Tile piece={piece} selected={false} />)
    const offClass = off.container.firstElementChild?.className ?? ''
    off.unmount()

    const on = render(<Tile piece={piece} selected />)
    const onClass = on.container.firstElementChild?.className ?? ''

    expect(offClass).not.toContain('ring-')
    expect(onClass).toContain('ring-')
  })

  it('hides its drawing from assistive tech, which reads the cell label instead', () => {
    const view = render(
      <Tile piece={{ id: 4, color: 'green', special: 'none' }} selected={false} />,
    )
    expect(view.container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })
})
