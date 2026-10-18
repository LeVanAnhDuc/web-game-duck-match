import { test, expect } from "@/fixtures";
import { POINTS_PER_PIECE } from "@/data/test-data";
import { freezeClock } from "@/utils/clock";
import { legalMoves } from "@/utils/match3";

test("điểm của một match bay lên trên bàn rồi biến mất", { tag: ["@TC-EFFECTS-001"] }, async ({ page, playPage }) => {
  await freezeClock(page);
  await playPage.goto(1);
  await playPage.swapWithKeyboard(legalMoves(await playPage.readBoard())[0]!);

  let seen: string[] = [];
  for (let step = 0; step < 40 && seen.length === 0; step++) {
    await page.clock.runFor(50);
    seen = await playPage.scoreEffects().allTextContents();
  }
  expect(seen.length, "no floating score appeared").toBeGreaterThan(0);
  const points = Number(seen[0]!.match(/^\+([\d.]+)/)?.[1]?.replace(/\./g, ""));
  expect(points).toBeGreaterThanOrEqual(3 * POINTS_PER_PIECE);

  await page.clock.runFor(5_000);
  await expect(playPage.scoreEffects()).toHaveCount(0);
});

test("giảm chuyển động thì lớp hiệu ứng không vẽ gì, kể cả nước đầu tiên", { tag: ["@TC-EFFECTS-002"] }, async ({ page, playPage }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await freezeClock(page);
  await playPage.goto(1);
  await playPage.swapWithKeyboard(legalMoves(await playPage.readBoard())[0]!);

  for (let step = 0; step < 20; step++) {
    await page.clock.runFor(50);
    expect(await playPage.effects().count(), `effects at ${step * 50}ms`).toBe(0);
  }
});

test("viên đã chọn vẫn được đánh dấu khi focus dời sang ô khác", { tag: ["@TC-EFFECTS-003"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  await playPage.focusCell({ row: 3, col: 3 });
  await page.keyboard.press("Enter");
  await page.keyboard.press("ArrowDown");
  await expect(playPage.cell({ row: 4, col: 3 })).toBeFocused();

  await expect(playPage.tile({ row: 3, col: 3 })).toHaveAttribute("data-selected", "true");
  await expect(playPage.tile({ row: 3, col: 3 })).toHaveAttribute("data-lifted", "true");
  await expect(playPage.tile({ row: 4, col: 3 })).not.toHaveAttribute("data-selected", /.*/);
  await expect(playPage.tile({ row: 4, col: 3 })).not.toHaveAttribute("data-lifted", /.*/);
});
