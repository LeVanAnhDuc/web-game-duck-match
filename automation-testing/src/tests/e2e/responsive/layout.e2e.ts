import { test, expect } from "@/fixtures";
import type { PlayPage } from "@/pages/play.page";

async function boxes(playPage: PlayPage) {
  const box = async (locator: ReturnType<PlayPage["grid"]>) => (await locator.boundingBox())!;
  return {
    counters: await box(playPage.counters()),
    goals: await box(playPage.goalList()),
    grid: await box(playPage.grid()),
    replay: await box(playPage.replayButton()),
  };
}

test("dưới 1024px HUD ở trên bàn, \"Chơi lại\" ở dưới", { tag: ["@TC-RESPONSIVE-002"] }, async ({ page, playPage }) => {
  for (const width of [375, 768]) {
    await page.setViewportSize({ width, height: 900 });
    await playPage.goto(1);
    const { counters, goals, grid, replay } = await boxes(playPage);
    expect(counters.y + counters.height, `counters at ${width}`).toBeLessThanOrEqual(grid.y);
    expect(goals.y + goals.height, `goals at ${width}`).toBeLessThanOrEqual(grid.y);
    expect(replay.y, `replay at ${width}`).toBeGreaterThanOrEqual(grid.y + grid.height);
  }
});

test("từ 1024px HUD và \"Chơi lại\" thành cột bên trái bàn", { tag: ["@TC-RESPONSIVE-003"] }, async ({ page, playPage }) => {
  for (const [width, height] of [[1024, 800], [1440, 900]] as const) {
    await page.setViewportSize({ width, height });
    await playPage.goto(1);
    const { counters, goals, grid, replay } = await boxes(playPage);
    for (const [name, box] of Object.entries({ counters, goals, replay })) {
      expect(box.x + box.width, `${name} at ${width}`).toBeLessThanOrEqual(grid.x);
    }
  }
});

test("khung nhìn thấp 720×450: HUD một hàng, bàn bắt đầu trong khung nhìn", { tag: ["@TC-RESPONSIVE-004"] }, async ({ page, playPage }) => {
  await page.setViewportSize({ width: 720, height: 450 });
  await playPage.goto(1);
  const { counters, goals, grid } = await boxes(playPage);

  expect(goals.x).toBeGreaterThanOrEqual(counters.x + counters.width);
  // Same row: the two blocks overlap vertically.
  expect(goals.y).toBeLessThan(counters.y + counters.height);
  expect(counters.y).toBeLessThan(goals.y + goals.height);
  expect(grid.y).toBeLessThan(450);
});

test("bàn vuông và ô không quá 64px", { tag: ["@TC-RESPONSIVE-005"] }, async ({ page, playPage }) => {
  for (const width of [1440, 375]) {
    await page.setViewportSize({ width, height: 900 });
    await playPage.goto(1);
    const grid = (await playPage.grid().boundingBox())!;
    const cell = (await playPage.cell({ row: 0, col: 0 }).boundingBox())!;
    expect(Math.abs(grid.width - grid.height)).toBeLessThan(1);
    expect(cell.width).toBeLessThanOrEqual(64);
    if (width === 1440) expect(cell.width).toBeCloseTo(64, 0);
  }
});
