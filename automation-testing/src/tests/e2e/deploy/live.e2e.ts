import type { Page } from '@playwright/test'
import { expect, test } from '@/fixtures'
import { copy } from '@/data/copy'
import { level } from '@/data/test-data'
import { legalMoves } from '@/utils/match3'
import type { PlayPage } from '@/pages/play.page'

/**
 * Runs against the deployment: on prd (`ENV=prd`) this is the post-deploy check
 * `deploy.yml` runs after `deploy-pages`; on dev it is the same check on the local
 * export.
 *
 * It exists because a successful deploy job does not mean a working site, and
 * because the obvious check is a liar: `curl -o /dev/null -w '%{http_code}'` on the
 * Pages URL returned **200 while the body was GitHub's own "Site not found" page**.
 * A pipeline that trusts a status code would have called that a good deploy.
 *
 * Navigation is to "./" against a baseURL ending in "/": a leading "/" resolves to
 * the domain root, which for a project Pages site is a different site entirely.
 */

/**
 * Pages needs a moment after the deploy job reports success. Waiting on the real
 * signal — the app's own title — rather than on a fixed sleep, because "how long
 * propagation takes" is not a number anyone can commit to.
 */
async function waitForDeployment(page: Page) {
  const deadline = Date.now() + 180_000
  for (let attempt = 1; ; attempt++) {
    await page.goto('./', { waitUntil: 'domcontentloaded' })
    const title = await page.title()
    if (title === copy.appTitle) return
    if (Date.now() > deadline) {
      throw new Error(
        `${page.url()} still does not serve the app after ${attempt} attempts. ` +
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

  await expect(page.getByRole('list').getByRole('link')).toHaveCount(1)
  await expect(page.locator('[aria-disabled="true"]')).toHaveCount(5)
})

test('the deployed build is actually playable', async ({ page, playPage }) => {
  test.setTimeout(240_000)
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))

  await waitForDeployment(page)
  await page.getByRole('list').getByRole('link').first().click()

  const grid = page.getByRole('grid')
  await expect(grid).toBeVisible()

  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(String(level(1).moves))

  const move = legalMoves(await (playPage as PlayPage).readBoard())[0]
  if (!move) throw new Error('level 1 starts deadlocked, which a unit test denies')
  await playPage.playMove(move)

  await expect(moves).toHaveText(String(level(1).moves - 1))
  await expect(page.getByTestId('score')).not.toHaveText('0')
  expect(errors).toEqual([])
})
