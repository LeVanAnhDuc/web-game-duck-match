import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalHud } from './GoalHud'
import { MoveCounter } from './MoveCounter'
import { StarRow } from './StarRow'
import { initProgress, applyCleared } from '@/engine/goals'
import { COLOR_NAME, formatScore, t } from '@/i18n/vi'
import type { Piece } from '@/engine'

/** Pieces only ever reach the HUD through `applyCleared`, so a colour is all a fixture needs. */
function cleared(color: Piece['color'], count: number): Piece[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    color,
    special: 'none' as const,
  }))
}

describe('HUD', () => {
  it('shows the formatted score and the moves left', () => {
    render(<MoveCounter movesLeft={17} score={2340} />)
    expect(screen.getByText(formatScore(2340))).toBeTruthy()
    expect(screen.getByText('17')).toBeTruthy()
  })

  it('announces changes politely', () => {
    const { container } = render(<MoveCounter movesLeft={17} score={0} />)
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy()
  })

  it('exposes the testids the e2e specs address', () => {
    render(<MoveCounter movesLeft={17} score={2340} />)
    // Task 20 selects on these exact ids, and each must hold the bare value.
    expect(screen.getByTestId('moves-left').textContent).toBe('17')
    expect(screen.getByTestId('score').textContent).toBe(formatScore(2340))
  })

  it('labels the moves and the score from the string table', () => {
    render(<MoveCounter movesLeft={5} score={0} />)
    expect(screen.getByText(t.movesLeft)).toBeTruthy()
    expect(screen.getByText(t.score)).toBeTruthy()
  })

  it('shows progress per collect colour', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 15 } }])
    p = applyCleared(p, [{ id: 1, color: 'red', special: 'none' }], 0)
    render(<GoalHud progress={p} />)
    expect(screen.getByText('1/15')).toBeTruthy()
  })

  it('shows progress for a score goal', () => {
    const p = initProgress([{ kind: 'score', target: 1500 }])
    render(<GoalHud progress={p} />)
    expect(screen.getByText(`0/${formatScore(1500)}`)).toBeTruthy()
  })

  it('renders three stars with the earned ones marked', () => {
    render(<StarRow stars={2} max={3} />)
    expect(screen.getAllByRole('img', { hidden: true }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText(/2\/3/)).toBeTruthy()
  })

  it('names the goals region from the string table', () => {
    const p = initProgress([{ kind: 'score', target: 1500 }])
    render(<GoalHud progress={p} />)
    expect(screen.getByText(t.goals)).toBeTruthy()
    expect(screen.getByRole('list', { name: t.goals })).toBeTruthy()
  })

  it('gives a score row an accessible name that spells out the numbers', () => {
    const p = applyCleared(initProgress([{ kind: 'score', target: 1500 }]), [], 400)
    render(<GoalHud progress={p} />)
    expect(screen.getByLabelText(t.goalScoreLabel(400, 1500))).toBeTruthy()
  })

  it('gives a collect row an accessible name that words the colour', () => {
    let p = initProgress([{ kind: 'collect', per: { purple: 8 } }])
    p = applyCleared(p, cleared('purple', 3), 0)
    render(<GoalHud progress={p} />)
    expect(
      screen.getByLabelText(t.goalCollectLabel(COLOR_NAME.purple, 3, 8)),
    ).toBeTruthy()
  })

  it('renders one row per requested colour of a multi-colour collect goal', () => {
    const p = initProgress([{ kind: 'collect', per: { red: 10, blue: 6 } }])
    render(<GoalHud progress={p} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByLabelText(t.goalCollectLabel(COLOR_NAME.red, 0, 10))).toBeTruthy()
    expect(screen.getByLabelText(t.goalCollectLabel(COLOR_NAME.blue, 0, 6))).toBeTruthy()
  })

  it('carries a shape per collect colour so colour is not the only channel', () => {
    const p = initProgress([{ kind: 'collect', per: { green: 4 } }])
    render(<GoalHud progress={p} />)
    const row = screen.getByLabelText(t.goalCollectLabel(COLOR_NAME.green, 0, 4))
    // NFR-A11Y-06: triangle is green's shape in SHAPE_BY_COLOR.
    expect(row.querySelector('[data-shape="triangle"]')).toBeTruthy()
  })

  it('marks a finished goal as done, not merely full', () => {
    const reached = applyCleared(
      initProgress([{ kind: 'score', target: 1000 }]),
      [],
      1000,
    )
    render(<GoalHud progress={reached} />)
    const row = screen.getByRole('listitem')
    expect(row.dataset.done).toBe('true')
    expect(row.querySelector('[data-goal-done-marker]')).toBeTruthy()
  })

  it('leaves an unfinished goal unmarked', () => {
    const p = applyCleared(initProgress([{ kind: 'score', target: 1000 }]), [], 999)
    render(<GoalHud progress={p} />)
    const row = screen.getByRole('listitem')
    expect(row.dataset.done).toBe('false')
    expect(row.querySelector('[data-goal-done-marker]')).toBeNull()
  })

  it('marks only the finished colour of a partly finished collect goal', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 2, blue: 5 } }])
    p = applyCleared(p, cleared('red', 2), 0)
    render(<GoalHud progress={p} />)
    const rows = screen.getAllByRole('listitem')
    expect(rows.map((row) => row.dataset.done)).toEqual(['true', 'false'])
  })

  it('renders nothing for a level without goals', () => {
    const { container } = render(<GoalHud progress={[]} />)
    expect(container.querySelector('ul')).toBeNull()
  })

  it('draws max glyphs and fills the first stars of them', () => {
    render(<StarRow stars={2} max={3} />)
    const glyphs = screen
      .getByRole('img', { hidden: true })
      .querySelectorAll('[data-star]')
    expect(Array.from(glyphs).map((g) => g.getAttribute('data-star'))).toEqual([
      'filled',
      'filled',
      'empty',
    ])
  })

  it('hides the individual star glyphs from assistive tech', () => {
    render(<StarRow stars={1} max={3} />)
    const glyphs = screen
      .getByRole('img', { hidden: true })
      .querySelectorAll('[data-star]')
    expect(glyphs.length).toBe(3)
    for (const glyph of Array.from(glyphs)) {
      expect(glyph.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('labels an empty star row too, so silence is never the message', () => {
    render(<StarRow stars={0} max={3} />)
    expect(screen.getByLabelText(t.starsEarned(0, 3))).toBeTruthy()
  })
})
