import { describe, expect, it } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
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

/** The HUD prints a grouped score, so a test that wants the number reads the digits back. */
function shownScore(): number {
  return Number((screen.getByTestId('score').textContent ?? '').replace(/\D/g, ''))
}

describe('MoveCounter score count-up', () => {
  it('starts at the score it is mounted with, never at zero', () => {
    // Mounting mid-level (a remount after a route change) must not replay the
    // whole level's points, so the first frame is the engine value itself.
    render(<MoveCounter movesLeft={12} score={2340} />)
    expect(shownScore()).toBe(2340)
  })

  it('travels toward a new score instead of jumping to it', async () => {
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} />)
    rerender(<MoveCounter movesLeft={11} score={2340} />)
    // Synchronously after the new score arrives nothing has moved yet: that is
    // what distinguishes a count-up from the jump this task replaces.
    expect(shownScore()).toBe(0)
    await waitFor(() => expect(shownScore()).toBe(2340))
  })

  it('lands exactly on the engine value and never passes it', async () => {
    const target = 5000
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} />)
    rerender(<MoveCounter movesLeft={11} score={target} />)

    // Sampling the whole travel: a springy easing would show points the engine
    // never awarded, which is invariant 2 leaking through the display layer.
    const seen: number[] = []
    await waitFor(
      () => {
        seen.push(shownScore())
        expect(seen[seen.length - 1]).toBe(target)
      },
      { interval: 16 },
    )
    expect(Math.max(...seen)).toBe(target)
    expect(seen.every((value) => value <= target)).toBe(true)
    expect([...seen].sort((a, b) => a - b)).toEqual(seen)
  })

  it('settles within the motion budget', async () => {
    const started = Date.now()
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} />)
    rerender(<MoveCounter movesLeft={11} score={9999} />)
    await waitFor(() => expect(shownScore()).toBe(9999), { interval: 16 })
    // design.md §C.1 wants the number to have arrived before the next move can be
    // made; a count-up still running under the following swap reads as lag.
    expect(Date.now() - started).toBeLessThan(900)
  })

  it('shows the final score immediately under reduced motion', () => {
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} reducedMotion />)
    rerender(<MoveCounter movesLeft={11} score={2340} reducedMotion />)
    expect(screen.getByTestId('score').textContent).toBe(formatScore(2340))
  })

  it('snaps down on a restart rather than counting backwards', () => {
    const { rerender } = render(<MoveCounter movesLeft={1} score={2340} />)
    rerender(<MoveCounter movesLeft={20} score={0} />)
    // A reset is not an award being taken away, so there is nothing to animate.
    expect(shownScore()).toBe(0)
  })
})

describe('MoveCounter low moves', () => {
  it('marks the counter low at three moves left', () => {
    const { container } = render(<MoveCounter movesLeft={3} score={0} />)
    expect(container.querySelector('[data-low="true"]')).toBeTruthy()
    const moves = screen.getByTestId('moves-left')
    expect(moves.className).toContain('text-accent-amber')
    expect(moves.style.animation).toContain('low-moves')
  })

  it('leaves the counter unmarked at four moves left', () => {
    const { container } = render(<MoveCounter movesLeft={4} score={0} />)
    expect(container.querySelector('[data-low]')).toBeNull()
    const moves = screen.getByTestId('moves-left')
    expect(moves.className).not.toContain('text-accent-amber')
    expect(moves.style.animation).toBe('')
  })

  it('keeps the amber but drops the pulse under reduced motion', () => {
    render(<MoveCounter movesLeft={2} score={0} reducedMotion />)
    const moves = screen.getByTestId('moves-left')
    // NFR-A11Y-05: the warning survives, only the movement goes.
    expect(moves.className).toContain('text-accent-amber')
    expect(moves.style.animation).toBe('')
  })

  it('keeps the moves testid holding the bare number while low', () => {
    render(<MoveCounter movesLeft={1} score={0} />)
    expect(screen.getByTestId('moves-left').textContent).toBe('1')
  })
})

describe('StarRow label modes', () => {
  it('labels the group by default, as the level map expects', () => {
    render(<StarRow stars={2} max={3} />)
    expect(screen.getByLabelText(t.starsEarned(2, 3))).toBeTruthy()
  })

  it('renders no label of its own when the caller owns the labelling', () => {
    render(<StarRow stars={2} max={3} labelMode="none" />)
    expect(screen.queryByLabelText(t.starsEarned(2, 3))).toBeNull()
    expect(screen.queryByRole('img', { hidden: true })).toBeNull()
  })

  it('still draws every glyph in an unlabelled row', () => {
    const { container } = render(<StarRow stars={1} max={3} labelMode="none" />)
    const glyphs = container.querySelectorAll('[data-star]')
    expect(Array.from(glyphs).map((g) => g.getAttribute('data-star'))).toEqual([
      'filled',
      'empty',
      'empty',
    ])
    for (const glyph of Array.from(glyphs)) {
      expect(glyph.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('stands still unless asked to land', () => {
    render(<StarRow stars={3} max={3} />)
    const glyphs = screen
      .getByRole('img', { hidden: true })
      .querySelectorAll('[data-star]')
    for (const glyph of Array.from(glyphs)) {
      expect((glyph as HTMLElement).style.animationName).toBe('')
    }
  })

  it('lands one star at a time when asked', () => {
    render(<StarRow stars={3} max={3} land />)
    const glyphs = Array.from(
      screen.getByRole('img', { hidden: true }).querySelectorAll('[data-star]'),
    ) as HTMLElement[]
    expect(glyphs.map((g) => g.style.animationName)).toEqual([
      'star-land',
      'star-land',
      'star-land',
    ])
    const delays = glyphs.map((g) => Number(g.style.animationDelay.replace('ms', '')))
    expect(delays[0]).toBe(0)
    expect(delays[1]).toBeGreaterThan(delays[0] as number)
    expect(delays[2]).toBeGreaterThan(delays[1] as number)
  })
})

describe('MoveCounter live region', () => {
  it('keeps the travelling number out of the live region until it lands', async () => {
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} />)
    const score = screen.getByTestId('score')
    expect(score.getAttribute('aria-hidden')).toBeNull()

    rerender(<MoveCounter movesLeft={11} score={2340} />)
    // Twenty intermediate values inside one polite region would be twenty
    // announcements for one move (NFR-A11Y-04), so they are hidden while moving.
    expect(score.getAttribute('aria-hidden')).toBe('true')

    await waitFor(() => expect(shownScore()).toBe(2340))
    expect(screen.getByTestId('score').getAttribute('aria-hidden')).toBeNull()
  })

  it('never hides the score under reduced motion, where nothing travels', () => {
    const { rerender } = render(<MoveCounter movesLeft={12} score={0} reducedMotion />)
    rerender(<MoveCounter movesLeft={11} score={2340} reducedMotion />)
    expect(screen.getByTestId('score').getAttribute('aria-hidden')).toBeNull()
  })
})
