import { test, expect } from "@/fixtures";
import { level } from "@/data/test-data";
import type { PlayPage } from "@/pages/play.page";

const MIN = 44;

async function cellBoxes(playPage: PlayPage, id: number) {
  await playPage.goto(id);
  const boxes = await playPage.cells().evaluateAll((els) => els.map((el) => el.getBoundingClientRect().toJSON()));
  expect(boxes).toHaveLength(level(id).rows * level(id).cols);
  return boxes as { width: number; height: number }[];
}

test("ở 375px các ô 7×7 và các nút đủ 44px", { tag: ["@TC-ACCESSIBILITY-004"] }, async ({ page, playPage, mapPage }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  for (const box of await cellBoxes(playPage, 1)) {
    expect(box.width, "cell width").toBeGreaterThanOrEqual(MIN);
    expect(box.height, "cell height").toBeGreaterThanOrEqual(MIN);
  }
  expect((await playPage.replayButton().boundingBox())!.height).toBeGreaterThanOrEqual(MIN);
  expect((await playPage.backToMapLink().boundingBox())!.height).toBeGreaterThanOrEqual(MIN);

  await mapPage.goto();
  for (let id = 1; id <= 6; id++) {
    expect((await mapPage.card(id).boundingBox())!.height).toBeGreaterThanOrEqual(MIN);
  }
});

// BUG: defects/accessibility.md#bug-accessibility-01
test.fail("ở 375px các ô của bàn 8×8 đủ 44px", { tag: ["@TC-ACCESSIBILITY-009"] }, async ({ page, playPage }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 4 });
  for (const box of await cellBoxes(playPage, 4)) {
    expect(box.width, "cell width").toBeGreaterThanOrEqual(MIN);
    expect(box.height, "cell height").toBeGreaterThanOrEqual(MIN);
  }
});

test("bàn 9×9 ở 375px là ngoại lệ có giới hạn: không cuộn ngang trang", { tag: ["@TC-ACCESSIBILITY-005"] }, async ({ page, playPage }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 6 });
  await playPage.goto(6);

  const cell = (await playPage.cell({ row: 0, col: 8 }).boundingBox())!;
  expect(cell.width).toBeGreaterThanOrEqual(38);
  expect(cell.x + cell.width).toBeLessThanOrEqual(375);
  const widths = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
  expect(widths[0]).toBeLessThanOrEqual(widths[1]!);
});
