import { expect, test, type Page } from '@playwright/test'
import { newSession } from '../src/engine'
import { findLegalMoves } from '../src/engine/moves'
import { LEVELS } from '../src/levels/levels'

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
const LEVEL_1 = LEVELS.find((candidate) => candidate.id === 1)!
const START_MOVES = String(LEVEL_1.moves)
const AFTER_ONE_MOVE = String(LEVEL_1.moves - 1)

/** Mirrors the seed in `src/app/PlayScreen.tsx`. */
const seedFor = (levelId: number) => levelId * 1000

function firstLegalMove(levelId: number) {
  const level = LEVELS.find((candidate) => candidate.id === levelId)
  if (!level) throw new Error(`no level ${levelId}`)
  const move = findLegalMoves(newSession(level, seedFor(levelId)).grid)[0]
  if (!move) throw new Error(`level ${levelId} starts deadlocked, which a unit test denies`)
  return move
}

/** Walks the roving focus to a cell, then swaps it with its right/down neighbour. */
async function playMove(page: Page, move: { from: { row: number; col: number }; to: { row: number; col: number } }) {
  await page.getByRole('gridcell').first().getByRole('button').focus()
  for (let i = 0; i < move.from.row; i++) await page.keyboard.press('ArrowDown')
  for (let i = 0; i < move.from.col; i++) await page.keyboard.press('ArrowRight')

  await page.keyboard.press('Enter')
  await page.keyboard.press(move.to.row > move.from.row ? 'ArrowDown' : 'ArrowRight')
  await page.keyboard.press('Enter')
}

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

test('US-01 · playing spends a move and scores points', async ({ page }) => {
  await page.goto('/play/1/')
  await expect(page.getByRole('grid')).toBeVisible()

  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  await playMove(page, firstLegalMove(1))

  await expect(moves).toHaveText(AFTER_ONE_MOVE)
  await expect(page.getByTestId('score')).not.toHaveText('0')
})

test('US-01 · the board is reachable and driveable by keyboard alone', async ({ page }) => {
  await page.goto('/play/1/')
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

test('US-01 · an illegal swap costs nothing', async ({ page }) => {
  await page.goto('/play/1/')
  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  // Find a pair the engine rejects, and confirm the counter does not move —
  // probing the board has to be free (invariant 6).
  const level = LEVEL_1
  const grid = newSession(level, seedFor(1)).grid
  const legal = new Set(
    findLegalMoves(grid).map((m) => `${m.from.row},${m.from.col}-${m.to.row},${m.to.col}`),
  )
  let illegal: { from: { row: number; col: number }; to: { row: number; col: number } } | null =
    null
  for (let row = 0; row < level.rows && !illegal; row++) {
    for (let col = 0; col < level.cols - 1 && !illegal; col++) {
      const candidate = { from: { row, col }, to: { row, col: col + 1 } }
      const key = `${row},${col}-${row},${col + 1}`
      if (!legal.has(key)) illegal = candidate
    }
  }
  expect(illegal).not.toBeNull()

  await playMove(page, illegal!)
  await expect(moves).toHaveText(START_MOVES)
})

test('US-02 · replay resets the move counter and the score', async ({ page }) => {
  await page.goto('/play/1/')
  const moves = page.getByTestId('moves-left')
  await expect(moves).toHaveText(START_MOVES)

  await playMove(page, firstLegalMove(1))
  await expect(moves).toHaveText(AFTER_ONE_MOVE)

  await page.getByTestId('replay').click()
  await expect(moves).toHaveText(START_MOVES)
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
  await expect(page.getByText(/4\.200|4,200/)).toBeVisible()
})

test('US-03 · garbage in storage still opens the app', async ({ page }) => {
  await page.goto('/')
  await page.evaluate((key) => window.localStorage.setItem(key, 'not json'), PROGRESS_KEY)
  await page.reload()

  // NFR-REL-03: no error screen, no blank page — a fresh player state instead.
  await expect(page.getByRole('link')).toHaveCount(1)
})

test('US-03 · a locked level is not a link', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[aria-disabled="true"]')).toHaveCount(5)
})
