import { expect, test } from '@playwright/test'
import { applySwap, newSession } from '../src/engine'
import { findLegalMoves } from '../src/engine/moves'
import { LEVELS } from '../src/levels/levels'
import { formatScore, t } from '../src/i18n/vi'

/**
 * Plays a whole level on the built app and checks the app against the engine at
 * every step.
 *
 * This is the test that would catch the failure the unit tests structurally
 * cannot: the engine being right while the screen shows something else. Both
 * sides start from the same seed, so the move list can be computed here and the
 * app's counters compared move by move.
 */

const LEVEL_ID = 1
const SEED = LEVEL_ID * 1000 // mirrors src/app/PlayScreen.tsx

type Move = { from: { row: number; col: number }; to: { row: number; col: number } }

/** The move list, plus what the engine says the score and moves are after each. */
function scriptedPlaythrough() {
  const level = LEVELS.find((candidate) => candidate.id === LEVEL_ID)
  if (!level) throw new Error('level 1 is missing')

  let session = newSession(level, SEED)
  const steps: { move: Move; movesLeft: number; score: number; status: string }[] = []

  while (session.status === 'playing' && steps.length < level.moves) {
    const move = findLegalMoves(session.grid)[0]
    if (!move) break
    const result = applySwap(session, move.from, move.to)
    session = result.session
    steps.push({
      move,
      movesLeft: session.movesLeft,
      score: session.score,
      status: session.status,
    })
  }

  return { steps, final: session }
}

test('a whole level plays out on the built app exactly as the engine says', async ({
  page,
}) => {
  test.setTimeout(120_000)

  const { steps, final } = scriptedPlaythrough()
  expect(steps.length).toBeGreaterThan(3)

  await page.goto(`/play/${LEVEL_ID}/`)
  await expect(page.getByRole('grid')).toBeVisible()

  const moves = page.getByTestId('moves-left')
  const score = page.getByTestId('score')
  await expect(moves).toHaveText(String(final.level.moves))
  await expect(score).toHaveText('0')

  for (const step of steps) {
    await page.getByRole('gridcell').first().getByRole('button').focus()
    for (let i = 0; i < step.move.from.row; i++) await page.keyboard.press('ArrowDown')
    for (let i = 0; i < step.move.from.col; i++) await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await page.keyboard.press(
      step.move.to.row > step.move.from.row ? 'ArrowDown' : 'ArrowRight',
    )
    await page.keyboard.press('Enter')

    // The move counter drops on the FIRST timeline step, not the last — the board
    // is projected beat by beat — so it proves the move landed, not that the
    // cascade finished. `aria-busy` is the signal for that, and until it clears
    // the board ignores input (invariant 3).
    await expect(moves).toHaveText(String(step.movesLeft))
    await expect(page.getByRole('grid')).toHaveAttribute('aria-busy', 'false')
    await expect(score).toHaveText(formatScore(step.score))

    if (step.status === 'playing') continue

    // The level ended exactly where the engine said it would.
    await expect(page.getByRole('dialog')).toBeVisible()
    // feature-flow step 5: the result dialog has to be looked at, not inferred.
    await page.screenshot({ path: 'test-results/result-dialog.png' })
    break
  }

  expect(final.status).not.toBe('playing')

  if (final.status === 'won') {
    await expect(page.getByRole('dialog')).toContainText(t.won)
    await page.getByRole('button', { name: t.backToMap }).click()
    // US-01 step 5: the next level is unlocked on the map.
    await expect(page.getByRole('link')).toHaveCount(2)
  } else {
    await expect(page.getByRole('dialog')).toContainText(t.lost)
    // US-02: a loss keeps the progress it had, so nothing new is unlocked.
    await page.getByRole('button', { name: t.backToMap }).click()
    await expect(page.getByRole('link')).toHaveCount(1)
  }
})
