import { test } from '@playwright/test'

/**
 * feature-flow step 5: a UI change nobody looked at is not finished. These are
 * captured, not asserted — the point is that a human (or the model) opens them.
 *
 * 375 is the design width, 768 and 1024 are the two layout switches from
 * design.md §6, and 1440 is the widest artboard.
 */
const WIDTHS = [375, 768, 1024, 1440]

for (const width of WIDTHS) {
  test(`screenshot the map and the board at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })

    await page.goto('/')
    await page.getByRole('link').first().waitFor()
    await page.screenshot({ path: `test-results/map-${width}.png`, fullPage: true })

    await page.goto('/play/1/')
    await page.getByRole('grid').waitFor()
    await page.screenshot({ path: `test-results/board-${width}.png`, fullPage: true })
  })
}

test('screenshot the widest board at the narrowest width', async ({ page }) => {
  // Level 6 is 9x9, the one board that cannot keep 44px cells at 375 — the
  // deliberate NFR-A11Y-03 exception recorded in docs/04-state/backlog.md.
  await page.setViewportSize({ width: 375, height: 900 })
  await page.addInitScript(() => {
    window.localStorage.setItem(
      'match3.progress.v1',
      JSON.stringify({ version: 1, levels: {}, unlockedUpTo: 6 }),
    )
  })
  await page.goto('/play/6/')
  await page.getByRole('grid').waitFor()
  await page.screenshot({ path: 'test-results/board-9x9-375.png', fullPage: true })
})
