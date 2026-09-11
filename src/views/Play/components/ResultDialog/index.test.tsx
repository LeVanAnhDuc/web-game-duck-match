import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultDialog } from './index'
import { formatScore, t } from '@/i18n/vi'

const won = { status: 'won' as const, stars: 2 as const, score: 2340 }
const lost = { status: 'lost' as const, stars: 0 as const, score: 800 }

describe('ResultDialog', () => {
  it('offers the next level after a win', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: t.nextLevel })).toBeTruthy()
  })

  it('hides the next level button on the last level', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel={false}
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.queryByRole('button', { name: t.nextLevel })).toBeNull()
  })

  it('offers replay and back after a loss, and no next level', () => {
    render(
      <ResultDialog
        result={lost}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByRole('button', { name: t.replay })).toBeTruthy()
    expect(screen.getByRole('button', { name: t.backToMap })).toBeTruthy()
    expect(screen.queryByRole('button', { name: t.nextLevel })).toBeNull()
  })

  it('moves focus into the dialog on open', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('escape goes back to the map', async () => {
    const onBackToMap = vi.fn()
    render(
      <ResultDialog
        result={lost}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={onBackToMap}
      />,
    )
    await userEvent.keyboard('{Escape}')
    expect(onBackToMap).toHaveBeenCalled()
  })

  it('keeps tab inside the dialog', async () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i++) await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('keeps shift+tab inside the dialog', async () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 5; i++) await user.tab({ shift: true })
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('wraps backwards from the first focusable to the last', async () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const user = userEvent.setup()
    // Mount focuses the first action, so one Shift+Tab must land on the last one.
    await user.tab({ shift: true })
    expect(document.activeElement).toBe(screen.getByRole('button', { name: t.backToMap }))
  })

  it('names the dialog after the outcome', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: t.won })).toBeTruthy()
  })

  it('names the dialog after a loss', () => {
    render(
      <ResultDialog
        result={lost}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog', { name: t.lost })).toBeTruthy()
    // Attribute, not the `ariaModal` IDL property — happy-dom does not reflect it.
    expect(screen.getByRole('dialog').getAttribute('aria-modal')).toBe('true')
  })

  it('announces the outcome in a live region', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const live = screen.getByRole('status')
    expect(live.textContent).toContain(t.won)
    expect(live.getAttribute('aria-live')).toBe('polite')
  })

  it('shows the stars and the formatted score after a win', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByLabelText(t.starsEarned(2, 3))).toBeTruthy()
    expect(screen.getByText(formatScore(won.score))).toBeTruthy()
  })

  it('shows zero stars after a loss and no score line', () => {
    render(
      <ResultDialog
        result={lost}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.queryByLabelText(t.starsEarned(0, 3))).toBeNull()
    expect(screen.queryByText(formatScore(lost.score))).toBeNull()
  })

  it('describes the dialog with the win summary', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const dialog = screen.getByRole('dialog')
    const describedBy = dialog.getAttribute('aria-describedby')
    expect(describedBy).toBeTruthy()
    const summary = document.getElementById(describedBy as string)
    expect(summary?.textContent).toContain(formatScore(won.score))
  })

  it('calls the handler behind each button', async () => {
    const onReplay = vi.fn()
    const onNext = vi.fn()
    const onBackToMap = vi.fn()
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={onReplay}
        onNext={onNext}
        onBackToMap={onBackToMap}
      />,
    )
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: t.nextLevel }))
    await user.click(screen.getByRole('button', { name: t.replay }))
    await user.click(screen.getByRole('button', { name: t.backToMap }))
    expect(onNext).toHaveBeenCalledTimes(1)
    expect(onReplay).toHaveBeenCalledTimes(1)
    expect(onBackToMap).toHaveBeenCalledTimes(1)
  })

  it('restores focus to the previously focused element on unmount', () => {
    const trigger = document.createElement('button')
    document.body.appendChild(trigger)
    trigger.focus()
    const { unmount } = render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(document.activeElement).not.toBe(trigger)
    unmount()
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })
})

describe('ResultDialog detail', () => {
  it('shows the detail on a loss, where US-02 needs it', () => {
    render(
      <ResultDialog
        result={{ status: 'lost', stars: 0, score: 800 }}
        hasNextLevel
        detail={<p>còn thiếu 4 viên đỏ</p>}
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByText('còn thiếu 4 viên đỏ')).toBeTruthy()
  })

  it('does not show it on a win, where the stars are the summary', () => {
    render(
      <ResultDialog
        result={{ status: 'won', stars: 2, score: 2340 }}
        hasNextLevel
        detail={<p>còn thiếu 4 viên đỏ</p>}
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.queryByText('còn thiếu 4 viên đỏ')).toBeNull()
  })
})

describe('ResultDialog reward moment', () => {
  it('animates itself in', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    expect(screen.getByRole('dialog').style.animationName).toBe('dialog-in')
  })

  it('lands the stars one at a time', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    const glyphs = Array.from(
      screen.getByLabelText(t.starsEarned(2, 3)).querySelectorAll('[data-star]'),
    ) as HTMLElement[]
    expect(glyphs).toHaveLength(3)
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

  it('focuses the first action synchronously, before any star has landed', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    // design.md §C.6: waiting for the animation would delay exactly the keyboard
    // user the focus trap exists for, so the two are independent.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: t.nextLevel }))
    const lastStar = screen
      .getByLabelText(t.starsEarned(2, 3))
      .querySelectorAll<HTMLElement>('[data-star]')[2]
    expect(Number(lastStar?.style.animationDelay.replace('ms', ''))).toBeGreaterThan(0)
  })

  it('keeps one grouped label over hidden glyphs', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    // One label for the row, not three named images (NFR-A11Y-04) — and exactly
    // one, so reusing StarRow must not leave the dialog's own label behind.
    expect(screen.getAllByLabelText(t.starsEarned(2, 3))).toHaveLength(1)
    const glyphs = screen
      .getByLabelText(t.starsEarned(2, 3))
      .querySelectorAll('[data-star]')
    for (const glyph of Array.from(glyphs)) {
      expect(glyph.getAttribute('aria-hidden')).toBe('true')
    }
  })

  it('holds still under reduced motion', () => {
    render(
      <ResultDialog
        result={won}
        hasNextLevel
        reducedMotion
        onReplay={vi.fn()}
        onNext={vi.fn()}
        onBackToMap={vi.fn()}
      />,
    )
    // A staggered delay under reduced motion is worse than no animation: the CSS
    // reset only collapses the duration, so a delayed star would sit invisible.
    expect(screen.getByRole('dialog').style.animationName).toBe('')
    const glyphs = screen
      .getByLabelText(t.starsEarned(2, 3))
      .querySelectorAll<HTMLElement>('[data-star]')
    for (const glyph of Array.from(glyphs)) {
      expect(glyph.style.animationName).toBe('')
      expect(glyph.style.animationDelay).toBe('')
    }
    expect(document.activeElement).toBe(screen.getByRole('button', { name: t.nextLevel }))
  })
})
