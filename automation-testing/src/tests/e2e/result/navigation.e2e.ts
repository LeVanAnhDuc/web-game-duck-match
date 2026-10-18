import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { level } from "@/data/test-data";

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("\"Màn tiếp\" mở màn 2 từ đầu", { tag: ["@TC-RESULT-007", "@smoke"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);

  await playPage.result.nextLevel().click();

  await expect(page).toHaveURL(/play\/2\/$/);
  await expect(playPage.heading()).toHaveText(copy.levelLabel(2));
  await expect(playPage.movesLeft()).toHaveText(String(level(2).moves));
  await expect(playPage.score()).toHaveText("0");
  await expect(playPage.result.root()).toHaveCount(0);
});

test("\"Về bản đồ\" sau khi thắng thấy màn kế đã mở", { tag: ["@TC-RESULT-008", "@smoke"] }, async ({ playPage, mapPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);

  await playPage.result.backToMap().click();

  await expect(mapPage.heading()).toBeVisible();
  await expect(mapPage.levelLinks()).toHaveCount(2);
  await expect(mapPage.lockedCards()).toHaveCount(4);
});

test("thua không mở thêm và không khoá lại màn nào", { tag: ["@TC-RESULT-009"] }, async ({ playPage, mapPage }) => {
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 5 });
  await playPage.goto(5);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.lost);

  await playPage.result.backToMap().click();

  await expect(mapPage.heading()).toBeVisible();
  await expect(mapPage.levelLinks()).toHaveCount(5);
  await expect(mapPage.lockedCards()).toHaveCount(1);
  await expect(mapPage.card(6)).toContainText(copy.locked);
});

test("\"Chơi lại\" trên dialog thua cho bàn mới của cùng màn, không hỏi lại", { tag: ["@TC-RESULT-010"] }, async ({ page, playPage }) => {
  await playPage.goto(5);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.lost);
  const lostBoard = await playPage.readBoard();

  await playPage.result.replay().click();

  await expect(page).toHaveURL(/play\/5\/$/);
  await expect(playPage.result.root()).toHaveCount(0);
  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.movesLeft()).toHaveText(String(level(5).moves));
  await expect(playPage.score()).toHaveText("0");
  expect(await playPage.readBoard()).not.toEqual(lostBoard);
});

test("thắng màn cuối không có \"Màn tiếp\"", { tag: ["@TC-RESULT-011"] }, async ({ playPage }) => {
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 6 });
  await playPage.goto(6);
  await playPage.playUntilResult("first");

  await expect(playPage.result.title()).toHaveText(copy.won);
  await expect(playPage.result.replay()).toBeVisible();
  await expect(playPage.result.backToMap()).toBeVisible();
  await expect(playPage.result.nextLevel()).toHaveCount(0);
});
