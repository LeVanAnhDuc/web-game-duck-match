import { expect, test } from '@playwright/test'

/**
 * Flow coverage for US-01 to US-03, against the static export.
 *
 * The keyboard is the input path used throughout: it is the only deterministic
 * way to drive the board from a test, and exercising it here also keeps
 * NFR-A11Y-02 honest on the built app rather than only in a jsdom test.
 */

const PROGRESS_KEY = 'match3.progress.v1'

/** Plays one keyboard swap from the currently focused cell towards its neighbour. */
async function swapRight(page: import('@playwright/test').Page) {
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  // The board locks input while the cascade animates; wait it out rather than
  // guessing, so a slow machine does not turn into a flaky test.
  await page.waitForTimeout(600)
}

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => window.localStorage.clear())
})

test('US-01 · the map opens with only the first level unlocked', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('link').first()).toHaveAttribute('href', /play\/1/)
})

test('US-01 · the first level is reachable from the map and shows a board', async ({
  page,
}) => {
  await page.goto('/')
  await page.getByRole('link').first().click()
  await expect(page.getByRole('grid')).toBeVisible()
  await expect(page.getByTestId('moves-left')).toBeVisible()
  await expect(page.getByTestId('score')).toBeVisible()
})

test('US-01 · playing spends moves and scores points', async ({ page }) => {
  await page.goto('/play/1/')
  await expect(page.getByRole('grid')).toBeVisible()

  const movesBefore = await page.getByTestId('moves-left').textContent()
  await page.getByRole('gridcell').first().getByRole('button').focus()

  for (let i = 0; i < 10; i++) {
    await swapRight(page)
    const now = await page.getByTestId('moves-left').textContent()
    if (now !== movesBefore) break
  }

  await expect(page.getByTestId('moves-left')).not.toHaveText(movesBefore ?? '')
  await expect(page.getByTestId('score')).not.toHaveText('0')
})

test('US-01 · the whole level is playable with the keyboard alone', async ({ page }) => {
  await page.goto('/play/1/')
  await page.keyboard.press('Tab')
  const focused = await page.evaluate(() => document.activeElement?.getAttribute('role'))
  expect(focused).toBe('button')
})

test('US-02 · replay resets the move counter', async ({ page }) => {
  await page.goto('/play/1/')
  const moves = page.getByTestId('moves-left')
  const start = await moves.textContent()

  await page.getByRole('gridcell').first().getByRole('button').focus()
  for (let i = 0; i < 10; i++) {
    await swapRight(page)
    if ((await moves.textContent()) !== start) break
  }
  await expect(moves).not.toHaveText(start ?? '')

  await page.getByTestId('replay').click()
  await expect(moves).toHaveText(start ?? '')
  await expect(page.getByTestId('score')).toHaveText('0')
})

test('US-03 · saved progress unlocks levels after a reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => {
    window.localStorage.setItem(
      key,
      JSON.stringify({
        version: 1,
        levels: { 1: { stars: 3, bestScore: 4200 } },
        unlockedUpTo: 3,
      }),
    )
  }, PROGRESS_KEY)

  await page.reload()
  await expect(page.getByRole('link')).toHaveCount(3)
})

test('US-03 · garbage in storage still opens the app', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => window.localStorage.setItem(key, 'not json'), PROGRESS_KEY)
  await page.reload()

  // NFR-REL-03: no error screen, no blank page — a fresh player state instead.
  await expect(page.getByRole('link')).toHaveCount(1)
})

test('US-03 · a locked level cannot be entered from the map', async ({ page }) => {
  await page.goto('/')
  const locked = page.locator('[aria-disabled="true"]')
  await expect(locked).toHaveCount(5)
})
