import { expect, test } from '@/fixtures'
import { copy } from '@/data/copy'
import { level } from '@/data/test-data'
import { legalMoves } from '@/utils/match3'

/**
 * Plays a whole level on the built app, one legal move at a time, until the level
 * ends.
 *
 * The move is chosen from the bàn as drawn (black-box), so this no longer compares
 * the screen with the engine's own score — the vitest engine/UI agreement fuzz in
 * client/test/ does that. What it proves here: every legal move spends exactly one
 * lượt, the score never goes down, and the level ends in a result dialog.
 */

const LEVEL_ID = 1

test('a whole level plays out on the built app', async ({ page, playPage }) => {
  test.setTimeout(180_000)

  await page.goto(`./play/${LEVEL_ID}/`)
  await expect(page.getByRole('grid')).toBeVisible()

  const moves = page.getByTestId('moves-left')
  const score = page.getByTestId('score')
  await expect(moves).toHaveText(String(level(LEVEL_ID).moves))
  await expect(score).toHaveText('0')

  let lastScore = 0
  for (let left = level(LEVEL_ID).moves; left > 0; left--) {
    const move = legalMoves(await playPage.readBoard())[0]
    if (!move) throw new Error('no legal move on a settled bàn')
    await playPage.playMove(move)
    await expect(moves).toHaveText(String(left - 1))
    const now = await playPage.scoreNumber()
    expect(now).toBeGreaterThanOrEqual(lastScore)
    lastScore = now
    if (await page.getByRole('dialog').isVisible()) break
  }

  await expect(page.getByRole('dialog')).toBeVisible()
  const won = (await page.getByRole('dialog').getByRole('heading').textContent()) === copy.won
  await page.getByRole('dialog').getByRole('button', { name: copy.backToMap, exact: true }).click()
  // US-01 step 5: a win opens the next level; US-02: a loss unlocks nothing.
  await expect(page.getByRole('list').getByRole('link')).toHaveCount(won ? 2 : 1)
})
