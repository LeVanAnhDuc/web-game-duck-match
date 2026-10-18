import type { Page } from '@playwright/test'
import { expect, test } from '@/fixtures'
import { level } from '@/data/test-data'
import { illegalMoves, legalMoves } from '@/utils/match3'
import type { PlayPage } from '@/pages/play.page'

/**
 * Flow coverage for US-01 to US-03, against the static export.
 *
 * The keyboard is the input path throughout: it is the only deterministic way to
 * drive the board from a test, and exercising it here keeps NFR-A11Y-02 honest on
 * the built app rather than only under happy-dom.
 *
 * Which swap to make is computed with the engine itself, from the same seed
 * `PlayScreen` uses. Poking at arbitrary neighbours would mostly find illegal
 * swaps, and an illegal swap is *supposed* to change nothing (invariant 6) — the
 * test would be asserting the opposite of the rule.
 *
 * Playwright gives every test a fresh browser context, so localStorage starts
 * empty without any clearing step. Clearing it in an init script would be worse
 * than useless: init scripts run on every navigation, so a `reload()` would wipe
 * whatever the test had just written.
 */

const PROGRESS_KEY = 'match3.progress.v1'

/** Read from the level data, never hardcoded: these numbers get retuned (FR-12). */
const LEVEL_1 = level(1)
const START_MOVES = String(LEVEL_1.moves)
const AFTER_ONE_MOVE = String(LEVEL_1.moves - 1)

/** The first legal swap on the bàn as drawn (black-box: read from the tiles, not the engine). */
async function firstLegalMove(playPage: PlayPage) {
  const move = legalMoves(await playPage.readBoard())[0]
  if (!move) throw new Error('the bàn starts deadlocked, which a unit test denies')
  return move
}

/** Walks the roving focus to a cell, then swaps it with its right/down neighbour. */
async function playMove(
  page: Page,
  move: { from: { row: number; col: number }; to: { row: number; col: number } },
) {
  await page.getByRole('gridcell').first().getByRole('button').focus()
  for (let i = 0; i < move.from.row; i++) await page.keyboard.press('ArrowDown')
  for (let i = 0; i < move.from.col; i++) await page.keyboard.press('ArrowRight')

  await page.keyboard.press('Enter')
  await page.keyboard.press(move.to.row > move.from.row ? 'ArrowDown' : 'ArrowRight')
  await page.keyboard.press('Enter')
}

test('US-01 · the map opens with only the first level unlocked', async ({ page }) => {
  await page.goto('./')
  await expect(page.getByRole('link')).toHaveCount(1)
  await expect(page.getByRole('link').first()).toHaveAttribute('href', /play\/1/)
})

test('US-01 · the first level is reachable from the map and shows a board', async ({
  page,
}) => {
  await page.goto('./')
  await page.getByRole('link').first().click()
  await expect(page.getByRole('grid')).toBeVisible()
  await expect(page.getByTestId('moves-left')).toBeVisible()
  await expect(page.getByTestId('score')).toBeVisible()
})

test('US-01 · playing spends a move and scores points', async ({ page, playPage }) => {
  await page.goto('./play/1/')
  await expect(page.getByRole('grid')).toBeVisible()

  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  await playMove(page, await firstLegalMove(playPage))

  await expect(moves).toHaveText(AFTER_ONE_MOVE)
  await expect(page.getByTestId('score')).not.toHaveText('0')
})

test('US-01 · the board is reachable and driveable by keyboard alone', async ({
  page,
}) => {
  await page.goto('./play/1/')
  await expect(page.getByRole('grid')).toBeVisible()

  // Tab until focus lands inside the grid; the header link comes first in DOM
  // order, so the exact number of presses is not worth asserting.
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press('Tab')
    const insideGrid = await page.evaluate(() => {
      const active = document.activeElement
      return active?.tagName === 'BUTTON' && !!active.closest('[role="grid"]')
    })
    if (insideGrid) return
  }
  throw new Error('no board cell could be reached with Tab')
})

test('US-01 · an illegal swap costs nothing', async ({ page, playPage }) => {
  await page.goto('./play/1/')
  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  // Find a pair the engine rejects, and confirm the counter does not move —
  // probing the board has to be free (invariant 6).
  const illegal = illegalMoves(await playPage.readBoard())[0] ?? null
  expect(illegal).not.toBeNull()

  await playMove(page, illegal!)
  await expect(moves).toHaveText(START_MOVES)
})

test('US-02 · replay resets the move counter and the score', async ({ page, playPage }) => {
  await page.goto('./play/1/')
  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  await playMove(page, await firstLegalMove(playPage))
  await expect(moves).toHaveText(AFTER_ONE_MOVE)

  // FR-22: a move has been spent, so the level is in progress and replay asks
  // before throwing that away. Nothing resets until the player confirms.
  await page.getByTestId('replay').click()
  const confirm = page.getByTestId('confirm-restart')
  await expect(confirm).toBeVisible()
  await expect(moves).toHaveText(AFTER_ONE_MOVE)
  await page.getByTestId('confirm-restart-yes').click()
  await expect(confirm).toBeHidden()
  await expect(moves).toHaveText(START_MOVES)
  await expect(page.getByTestId('score')).toHaveText('0')
})

test('US-03 · saved progress unlocks levels after a reload', async ({ page }) => {
  await page.goto('./')
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
  await expect(page.getByText(/4\.200|4,200/)).toBeVisible()
})

test('US-03 · garbage in storage still opens the app', async ({ page }) => {
  await page.goto('./')
  await page.evaluate((key) => window.localStorage.setItem(key, 'not json'), PROGRESS_KEY)
  await page.reload()

  // NFR-REL-03: no error screen, no blank page — a fresh player state instead.
  await expect(page.getByRole('link')).toHaveCount(1)
})

test('US-03 · a locked level is not a link', async ({ page }) => {
  await page.goto('./')
  await expect(page.locator('[aria-disabled="true"]')).toHaveCount(5)
})

test('the board renders pieces as a separate layer that travels', async ({ page, playPage }) => {
  await page.goto('./play/1/')
  await expect(page.getByRole('grid')).toBeVisible()

  // Three layers, one --cell (ADR-0010). The semantic grid still owns the buttons;
  // the pieces live beside it, keyed by id so a node can move between cells.
  await expect(page.getByTestId('board-slab')).toBeVisible()
  await expect(page.locator('[data-piece-id]')).toHaveCount(49)
  await expect(page.locator('[data-testid="well"]')).toHaveCount(49)

  const slot = page.locator('[data-piece-id][data-row="0"][data-col="0"]')
  const id = await slot.getAttribute('data-piece-id')
  expect(id).toBeTruthy()

  // A piece is bigger than a token: the p-[6%] bug rendered every one at a sixth
  // of its cell, and only a measurement catches that.
  const box = await slot.boundingBox()
  const cellBox = await page.getByTestId('cell-0-0').boundingBox()
  expect(box!.width).toBeGreaterThan(cellBox!.width * 0.7)
})

test('a special piece is marked so the player knows it is a weapon', async ({ page, playPage }) => {
  await page.goto('./play/1/')
  await expect(page.getByRole('grid')).toBeVisible()
  // A fresh board has no specials, so the absence is the assertion here; the
  // presence is covered by the unit tests, which can build a board that has one.
  await expect(page.locator('[data-shimmer="true"]')).toHaveCount(0)
})
