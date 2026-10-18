import { test, expect } from "@/fixtures";
import { copy, formatScore } from "@/data/copy";
import { level } from "@/data/test-data";
import { gapToNextStar, starsFor } from "@/utils/stars";

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("thắng đủ ba sao: tiêu đề, sao, điểm, không còn dòng điểm thiếu", { tag: ["@TC-RESULT-002", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  const score = await playPage.scoreNumber();

  await expect(playPage.result.root()).toHaveAccessibleName(copy.won);
  expect(starsFor(score, level(1).stars)).toBe(3);
  await expect(playPage.result.stars()).toHaveAccessibleName(copy.starsEarned(3, 3));
  await expect(playPage.result.root()).toContainText(formatScore(score));
  await expect(playPage.result.root()).not.toContainText("điểm nữa");
});

test("thắng chưa đủ sao thì nói còn bao nhiêu điểm cho sao kế", { tag: ["@TC-RESULT-003"] }, async ({ playPage }) => {
  await playPage.seedProgress({ version: 1, levels: { 1: { stars: 1, bestScore: 2000 } }, unlockedUpTo: 2 });
  await playPage.goto(2);
  await playPage.playUntilResult("first");
  const score = await playPage.scoreNumber();
  const stars = starsFor(score, level(2).stars);
  const gap = gapToNextStar(score, level(2).stars);

  await expect(playPage.result.title()).toHaveText(copy.won);
  expect(stars).toBeLessThan(3);
  await expect(playPage.result.stars()).toHaveAccessibleName(copy.starsEarned(stars, 3));
  await expect(playPage.result.root()).toContainText(copy.starGap(formatScore(gap!)));
});

test("hết lượt: dialog thua nói mục tiêu còn thiếu và trấn an tiến độ", { tag: ["@TC-RESULT-004", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(5);
  await playPage.playUntilResult("first");
  const score = await playPage.scoreNumber();
  const target = level(5).scoreTarget!;

  await expect(playPage.result.title()).toHaveText(copy.lost);
  await expect(playPage.movesLeft()).toHaveText("0");
  expect(score).toBeLessThan(target);
  await expect(playPage.result.stars()).toHaveAccessibleName(copy.starsEarned(0, 3));
  await expect(playPage.result.root()).toContainText(copy.starGap(formatScore(target - score)));
  await expect(playPage.result.goalRows()).toHaveCount(1);
  await expect(playPage.result.goalRows().first()).toHaveAccessibleName(copy.goalScoreLabel(score, target));
  await expect(playPage.result.root()).toContainText(copy.lostKeepsProgress);
  await expect(playPage.result.replay()).toBeVisible();
  await expect(playPage.result.backToMap()).toBeVisible();
  await expect(playPage.result.nextLevel()).toHaveCount(0);
});

test("dialog nhận focus, giữ Tab bên trong, Esc về bản đồ", { tag: ["@TC-RESULT-005"] }, async ({ page, playPage, mapPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");

  await expect(playPage.result.nextLevel()).toBeFocused();
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  await expect(playPage.result.nextLevel()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(playPage.result.backToMap()).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(mapPage.heading()).toBeVisible();
});

test("thua thì focus ở \"Chơi lại\"", { tag: ["@TC-RESULT-006"] }, async ({ playPage }) => {
  await playPage.goto(5);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.lost);
  await expect(playPage.result.replay()).toBeFocused();
});
