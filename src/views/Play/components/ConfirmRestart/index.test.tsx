import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ConfirmRestart, isLevelInProgress } from './index'
import { newSession } from '@/engine'
import type { LevelConfig, Session } from '@/engine'
import { formatScore, t } from '@/i18n/vi'

const level: LevelConfig = {
  id: 1,
  rows: 7,
  cols: 7,
  colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 15,
  goals: [{ kind: 'score', target: 1000 }],
  stars: [1000, 2000, 3000],
}

const fresh = newSession(level, 1)
const started = (over: Partial<Session>): Session => ({ ...fresh, ...over })

describe('isLevelInProgress', () => {
  it('says no on a board nobody has touched', () => {
    // The whole point of the rule: a restart here destroys nothing, so asking
    // would be a toll booth in front of a free road.
    expect(isLevelInProgress(fresh, level)).toBe(false)
  })

  it('says yes once a move has been spent', () => {
    expect(isLevelInProgress(started({ movesLeft: level.moves - 1 }), level)).toBe(true)
  })

  it('says yes once points are on the board, even with every move still left', () => {
    // Cascades score before the player feels they have "used" anything, and a
    // swap that matched nothing costs no move at all (invariant 6) — so moves
    // alone is not a sufficient signal.
    expect(isLevelInProgress(started({ score: 180 }), level)).toBe(true)
  })
})

describe('ConfirmRestart', () => {
  it('says what is lost and what is kept, in that order', () => {
    render(
      <ConfirmRestart
        session={started({ score: 1560 })}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const dialog = screen.getByTestId('confirm-restart')
    // Persona p02's stated fear was losing earned stars; the dialog answers it
    // instead of leaving her to go and check the map herself.
    expect(dialog.textContent).toContain(formatScore(1560))
    expect(dialog.textContent).toContain(t.confirmRestartKeeps)
  })

  it('announces itself as a decision, not as a result', () => {
    render(
      <ConfirmRestart
        session={started({ score: 10 })}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )
    expect(screen.getByRole('alertdialog')).toBeTruthy()
  })

  it('opens with the harmless button focused', async () => {
    render(
      <ConfirmRestart
        session={started({ score: 10 })}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // The player most likely to meet this dialog arrived by pressing Enter on a
    // button they did not mean to reach (F-07). Enter again must change nothing.
    expect(document.activeElement).toBe(screen.getByTestId('confirm-restart-no'))
  })

  it('restarts only when the destructive button is chosen', async () => {
    const onConfirm = vi.fn()
    const onCancel = vi.fn()
    render(
      <ConfirmRestart
        session={started({ score: 10 })}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    )

    await userEvent.click(screen.getByTestId('confirm-restart-no'))
    expect(onConfirm).not.toHaveBeenCalled()
    expect(onCancel).toHaveBeenCalledTimes(1)

    await userEvent.click(screen.getByTestId('confirm-restart-yes'))
    expect(onConfirm).toHaveBeenCalledTimes(1)
  })

  it('backs out on Escape', async () => {
    const onCancel = vi.fn()
    render(
      <ConfirmRestart
        session={started({ score: 10 })}
        onConfirm={vi.fn()}
        onCancel={onCancel}
      />,
    )

    await userEvent.keyboard('{Escape}')
    expect(onCancel).toHaveBeenCalledTimes(1)
  })

  it('keeps Tab inside itself', async () => {
    render(
      <ConfirmRestart
        session={started({ score: 10 })}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // A confirm focus can walk out of is a confirm the player can walk around.
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByTestId('confirm-restart-yes'))
    await userEvent.tab()
    expect(document.activeElement).toBe(screen.getByTestId('confirm-restart-no'))
  })
})
