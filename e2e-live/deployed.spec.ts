import { expect, test } from '@playwright/test'
import { newSession } from '../src/engine'
import { findLegalMoves } from '../src/engine/moves'
import { LEVELS } from '../src/levels/levels'

/**
 * Runs against the LIVE deployment, after `deploy.yml` has published it.
 *
 * It exists because a successful deploy job does not mean a working site, and
 * because the obvious check is a liar: `curl -o /dev/null -w '%{http_code}'` on the
 * Pages URL returned **200 while the body was GitHub's own "Site not found" page**.
 * A pipeline that trusts a status code would have called that a good deploy.
 *
 * Absolute URLs on purpose. A `baseURL` without a trailing slash makes `goto('/')`
 * resolve to the domain root, which for a project Pages site is a different site
 * entirely — the mistake that produced the false failure this check was written
 * from.
 */
const SITE = process.env.LIVE_URL ?? 'https://levananhduc.github.io/web-game-duck-match/'

/**
 * Pages needs a moment after the deploy job reports success. Waiting on the real
 * signal — the app's own title — rather than on a fixed sleep, because "how long
 * propagation takes" is not a number anyone can commit to.
 */
async function waitForDeployment(page: import('@playwright/test').Page) {
  const deadline = Date.now() + 180_000
  for (let attempt = 1; ; attempt++) {
    await page.goto(SITE, { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    if (title === 'Duck Match') return
    if (Date.now() > deadline) {
      throw new Error(
        `${SITE} still does not serve the app after ${attempt} attempts. ` +
          `Last title: "${title}". GitHub's 404 page answers 200 here, so a status ` +
          `code is not evidence — check the Pages settings and the deploy artifact.`,
      )
    }
    await page.waitForTimeout(5_000)
  }
}

test('the deployed site serves the game, not a 404 page', async ({ page }) => {
  test.setTimeout(240_000)
  await waitForDeployment(page)

  await expect(page.getByRole('link')).toHaveCount(1)
  await expect(page.locator('[aria-disabled="true"]')).toHaveCount(5)
})

test('the deployed build is actually playable', async ({ page }) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await waitForDeployment(page)
  await page.getByRole('link').first().click()

  const grid = page.getByRole('grid')
  await expect(grid).toBeVisible()

  const level = LEVELS[0]
  if (!level) throw new Error('no level 1')
  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(String(level.moves))

  // The deployment is built from this commit, so level 1's board is this seed's
  // board — computing the legal move here rather than poking at neighbours is the
  // difference between testing the deployment and testing my luck. The seed
  // mirrors src/app/PlayScreen.tsx.
  const move = findLegalMoves(newSession(level, level.id * 1000).grid)[0]
  if (!move) throw new Error('level 1 starts deadlocked, which a unit test denies')

  await page.getByRole('gridcell').first().getByRole('button').focus()
  for (let i = 0; i < move.from.row; i++) await page.keyboard.press('ArrowDown')
  for (let i = 0; i < move.from.col; i++) await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await page.keyboard.press(move.to.row > move.from.row ? 'ArrowDown' : 'ArrowRight')
  await page.keyboard.press('Enter')
  await expect(grid).toHaveAttribute('aria-busy', 'false')

  await expect(moves).toHaveText(String(level.moves - 1))
  await expect(page.getByTestId('score')).not.toHaveText('0')
  expect(errors).toEqual([])
})
