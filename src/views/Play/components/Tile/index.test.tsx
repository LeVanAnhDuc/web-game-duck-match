import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { Tile } from './index'
import type { Color, Piece, Special } from '@/engine'
import { SHAPE_BY_COLOR } from '@/i18n/vi'

const COLORS: Color[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange']
const SPECIALS: Exclude<Special, 'none'>[] = [
  'stripedH',
  'stripedV',
  'wrapped',
  'colorBomb',
]

function piece(over: Partial<Piece> = {}): Piece {
  return { id: 1, color: 'red', special: 'none', ...over }
}

/** The element the board (and, later, `PieceLayer`) hands its data attributes to. */
function outerOf(container: HTMLElement): HTMLElement {
  const outer = container.firstElementChild
  if (!(outer instanceof HTMLElement)) throw new Error('Tile rendered no element')
  return outer
}

/**
 * The clay body. Its class name is load-bearing: the shimmer keyframe in
 * `globals.css` hangs off `[data-shimmer='true'] .tile-body::after`, so renaming it
 * silently kills the special-piece animation.
 */
function bodyOf(container: HTMLElement): HTMLElement {
  const body = container.querySelector('.tile-body')
  if (!(body instanceof HTMLElement)) throw new Error('Tile rendered no .tile-body')
  return body
}

describe('Tile', () => {
  // ---- what the board and the tests read off it ----

  it.each(COLORS)('states the colour and %s own shape on one element', (color) => {
    const { container } = render(<Tile piece={piece({ color })} selected={false} />)
    const outer = outerOf(container)

    expect(outer.dataset.testid).toBe('tile')
    expect(outer.dataset.color).toBe(color)
    // Colour is never the only channel: the shape comes from the table, never from
    // the call site (NFR-A11Y-06).
    expect(outer.dataset.shape).toBe(SHAPE_BY_COLOR[color])
  })

  it('paints the body in the piece colour rather than tinting a glyph', () => {
    const { container } = render(
      <Tile piece={piece({ color: 'purple' })} selected={false} />,
    )
    expect(bodyOf(container).className).toContain('bg-piece-purple')
    // Radius 20px on both boxes, so the selection ring hugs the clay it marks.
    expect(bodyOf(container).className).toContain('rounded-clay')
    expect(outerOf(container).className).toContain('rounded-clay')
  })

  it('draws exactly one shape glyph, from the shared set', () => {
    const { container } = render(
      <Tile piece={piece({ color: 'green' })} selected={false} />,
    )
    const glyphs = container.querySelectorAll('[data-shape]:not([data-testid])')
    expect(glyphs).toHaveLength(1)
    expect(glyphs[0]?.getAttribute('data-shape')).toBe(SHAPE_BY_COLOR.green)
  })

  it('hides its drawing from assistive tech, which reads the cell label instead', () => {
    const { container } = render(
      <Tile piece={piece({ color: 'green' })} selected={false} />,
    )
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
  })

  // ---- the lift (design.md §A.4) ----

  it('reports selection twice: once as state, once as depth', () => {
    const { container } = render(<Tile piece={piece()} selected />)
    const outer = outerOf(container)

    expect(outer.dataset.selected).toBe('true')
    expect(outer.dataset.lifted).toBe('true')
    // -3px and the bigger shadow are the whole "picked up out of the well" read.
    expect(outer.className).toContain('-translate-y-[3px]')
    expect(bodyOf(container).className).toContain('shadow-clay-lift')
  })

  it('sits back in its well when not selected', () => {
    const { container } = render(<Tile piece={piece()} selected={false} />)
    const outer = outerOf(container)

    // Absent, not `false`: `Board.test.tsx` asserts `null` here.
    expect(outer.getAttribute('data-selected')).toBe(null)
    expect(outer.getAttribute('data-lifted')).toBe(null)
    expect(outer.className).not.toContain('-translate-y-')
    expect(bodyOf(container).className).toContain('shadow-clay')
    expect(bodyOf(container).className).not.toContain('shadow-clay-lift')
  })

  it('keeps a ring on the selected piece, because depth is not an a11y signal', () => {
    const off = render(<Tile piece={piece({ color: 'blue' })} selected={false} />)
    expect(outerOf(off.container).className).not.toContain('ring-')
    off.unmount()

    // NFR-A11Y-02: a player who cannot perceive the 3px lift still sees the ring.
    const on = render(<Tile piece={piece({ color: 'blue' })} selected />)
    expect(outerOf(on.container).className).toContain('ring-')
  })

  // ---- the shimmer (design.md §C.2) ----

  it.each(SPECIALS)(
    'flags %s as shimmering, and gives the keyframe its hook',
    (special) => {
      const { container } = render(<Tile piece={piece({ special })} selected={false} />)

      expect(outerOf(container).dataset.shimmer).toBe('true')
      expect(outerOf(container).dataset.special).toBe(special)
      // The ::after is absolutely positioned against this box.
      expect(bodyOf(container).className).toContain('relative')
    },
  )

  it('leaves a plain piece still', () => {
    const { container } = render(<Tile piece={piece()} selected={false} />)
    expect(outerOf(container).getAttribute('data-shimmer')).toBe(null)
    expect(outerOf(container).dataset.special).toBe('none')
  })

  // ---- the special badge ----

  it.each(SPECIALS)('badges %s with its own silhouette', (special) => {
    const { container } = render(<Tile piece={piece({ special })} selected={false} />)
    const badge = container.querySelector('[data-testid="special-badge"]')

    expect(badge?.getAttribute('data-special')).toBe(special)
    expect(badge?.getAttribute('aria-hidden')).toBe('true')
    expect((badge?.innerHTML ?? '').length).toBeGreaterThan(0)
  })

  it('badges a plain piece with nothing', () => {
    const { container } = render(<Tile piece={piece()} selected={false} />)
    expect(container.querySelector('[data-testid="special-badge"]')).toBe(null)
  })
})
