import { test, expect } from "@/fixtures";
import { colorName, copy } from "@/data/copy";
import { legalMoves, matchedColors } from "@/utils/match3";

test("mục tiêu điểm chạy theo điểm sau mỗi nước", { tag: ["@TC-GOALS-004"] }, async ({ playPage }) => {
  await playPage.goto(1);
  for (let i = 0; i < 2; i++) {
    await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);
    const score = await playPage.scoreNumber();
    await expect(playPage.goalRows().first()).toHaveAccessibleName(copy.goalScoreLabel(score, 2000));
  }
});

test("một hàng ba đỏ làm mục tiêu đỏ tăng ít nhất 3", { tag: ["@TC-GOALS-005"] }, async ({ playPage }) => {
  await playPage.goto(3);
  const board = await playPage.readBoard();
  const red = legalMoves(board).find((move) => matchedColors(board, move).includes("red"));
  if (!red) throw new Error("level 3 opens with no red match to make");

  await playPage.playMove(red);

  const name = (await playPage.goalRows().first().getAttribute("aria-label")) ?? "";
  const collected = Number(name.match(/(\d+)\/12$/)?.[1] ?? -1);
  expect(name.startsWith(`Mục tiêu viên ${colorName.red} `)).toBe(true);
  expect(collected).toBeGreaterThanOrEqual(3);
});

test("mục tiêu đạt thì được đánh dấu xong, chưa đạt thì không", { tag: ["@TC-GOALS-006"] }, async ({ page, playPage }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });

  await playPage.goto(1);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);
  const met = playPage.goalRows().first();
  await expect(met).toHaveAttribute("data-done", "true");
  await expect(playPage.goalDoneMarker(met)).toHaveCount(1);

  await playPage.goto(5);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.lost);
  const unmet = playPage.goalRows().first();
  await expect(unmet).toHaveAttribute("data-done", "false");
  await expect(playPage.goalDoneMarker(unmet)).toHaveCount(0);
});
