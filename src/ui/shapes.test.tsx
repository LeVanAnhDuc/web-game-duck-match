import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { PieceShape } from './shapes'
import { SHAPE_BY_COLOR, type Shape } from '@/i18n/vi'

/**
 * The six shapes the board actually uses. Read from `SHAPE_BY_COLOR` rather than
 * retyped, so a colour that stops owning a distinct shape fails here too
 * (NFR-A11Y-06).
 */
const SHAPES = Object.values(SHAPE_BY_COLOR)

function drawingOf(shape: Shape): string {
  const view = render(<PieceShape shape={shape} />)
  const svg = view.container.querySelector('svg')
  const html = svg?.innerHTML ?? ''
  view.unmount()
  return html
}

describe('PieceShape', () => {
  it('covers all six shapes with nothing repeated', () => {
    expect(new Set(SHAPES).size).toBe(6)
  })

  it.each(SHAPES)('renders one svg for %s, tagged with its own name', (shape) => {
    const { container } = render(<PieceShape shape={shape} />)
    const svgs = container.querySelectorAll('svg')

    expect(svgs).toHaveLength(1)
    expect(svgs[0]?.getAttribute('data-shape')).toBe(shape)
    // 0-100 is the contract both call sites size against: the board scales it to a
    // cell, the HUD to a 20px glyph, and neither may need to know the geometry.
    expect(svgs[0]?.getAttribute('viewBox')).toBe('0 0 100 100')
  })

  it.each(SHAPES)('hides %s from assistive tech', (shape) => {
    const { container } = render(<PieceShape shape={shape} />)
    // The accessible name of a cell comes from the button's `aria-label`. A glyph
    // that named itself would make a screen reader read every cell twice.
    expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')
    expect(container.querySelector('svg')?.getAttribute('focusable')).toBe('false')
  })

  it('draws six visibly different glyphs', () => {
    const drawings = SHAPES.map(drawingOf)
    expect(drawings.every((drawing) => drawing.length > 0)).toBe(true)
    expect(new Set(drawings).size).toBe(6)
  })

  it('takes its colour and size from the caller, painting with currentColor', () => {
    const { container } = render(
      <PieceShape shape="circle" className="h-5 w-5 text-piece-red" />,
    )
    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('class')).toBe('h-5 w-5 text-piece-red')
    // `currentColor` is what lets one component serve a red board piece and a red
    // HUD row without either passing a hex.
    expect(svg?.getAttribute('fill')).toBe('currentColor')
  })
})
