import { test, expect } from "@/fixtures";
import { copy, formatScore } from "@/data/copy";
import { PROGRESS_KEY, level, type Progress } from "@/data/test-data";
import { legalMoves } from "@/utils/match3";
import { starsFor } from "@/utils/stars";

test.beforeEach(async ({ page }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
});

test("thắng màn 1 thì bản lưu ghi đúng sao, điểm và mở màn 2", { tag: ["@TC-PROGRESS-001", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);
  const score = await playPage.scoreNumber();
  const stars = starsFor(score, level(1).stars);

  // The save is written right after the dialog opens (an effect), so poll for it.
  await expect.poll(() => playPage.readProgress()).toEqual({
    version: 1,
    levels: { 1: { stars, bestScore: score } },
    unlockedUpTo: 2,
  });
});

test("tiến độ vừa thắng còn nguyên sau khi tải lại trang", { tag: ["@TC-PROGRESS-002", "@smoke"] }, async ({ page, playPage, mapPage }) => {
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  const score = await playPage.scoreNumber();
  await expect.poll(() => playPage.readProgress()).not.toBeNull();

  await playPage.result.backToMap().click();
  await expect(mapPage.heading()).toBeVisible();
  await page.reload();
  await mapPage.heading().waitFor();

  await expect(mapPage.stars(1)).toHaveAccessibleName(copy.starsEarned(starsFor(score, level(1).stars), 3));
  await expect(mapPage.card(1)).toContainText(`${copy.bestScore}: ${formatScore(score)}`);
  await expect(mapPage.levelLink(2)).toBeVisible();
  await expect(mapPage.lockedCards()).toHaveCount(4);
});

test("bản lưu có sẵn mở đúng số màn sau khi tải lại", { tag: ["@TC-PROGRESS-003"] }, async ({ mapPage }) => {
  await mapPage.seedProgress({ version: 1, levels: { 1: { stars: 3, bestScore: 4200 } }, unlockedUpTo: 3 });
  await mapPage.goto();
  await expect(mapPage.levelLinks()).toHaveCount(3);
  await expect(mapPage.card(1)).toContainText(formatScore(4200));
});

test("thua không ghi gì", { tag: ["@TC-PROGRESS-004"] }, async ({ page, playPage }) => {
  const seeded: Progress = { version: 1, levels: {}, unlockedUpTo: 5 };
  await playPage.seedProgress(seeded);
  await playPage.goto(5);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.lost);

  // Give a would-be save the same chance a win's save gets, then compare the raw string.
  await playPage.result.backToMap().click();
  const raw = await page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY);
  expect(raw).toBe(JSON.stringify(seeded));
});

test("đi dở vài nước rồi rời màn không ghi gì", { tag: ["@TC-PROGRESS-005"] }, async ({ playPage, mapPage }) => {
  await playPage.goto(1);
  for (let i = 0; i < 2; i++) await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);

  await playPage.backToMapLink().click();
  await expect(mapPage.heading()).toBeVisible();

  expect(await playPage.readProgress()).toBeNull();
  await expect(mapPage.levelLinks()).toHaveCount(1);
});

test("thắng lại kém hơn không làm mất kỷ lục, màn đã mở không bị khoá lại", { tag: ["@TC-PROGRESS-006"] }, async ({ page, playPage }) => {
  // Seeded with spaces: the game writes compact JSON, so a changed string proves the win's write has happened even
  // though the merged record is meant to equal the seeded one.
  const seeded = '{ "version": 1, "levels": { "1": { "stars": 3, "bestScore": 99999 } }, "unlockedUpTo": 4 }';
  await playPage.seedProgress(seeded);
  await playPage.goto(1);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);
  expect(await playPage.scoreNumber()).toBeLessThan(99999);

  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), PROGRESS_KEY)).not.toBe(seeded);
  expect(await playPage.readProgress()).toEqual({
    version: 1,
    levels: { 1: { stars: 3, bestScore: 99999 } },
    unlockedUpTo: 4,
  });
});

test("game không cất gì khác vào trình duyệt", { tag: ["@TC-PROGRESS-008"] }, async ({ playPage, mapPage }) => {
  await mapPage.goto();
  await mapPage.openLevel(1);
  expect(await playPage.storageKeys()).toEqual({ local: [], session: [] });

  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);
  await expect.poll(() => playPage.storageKeys()).toEqual({ local: [PROGRESS_KEY], session: [] });
});

test("thắng màn cuối giữ unlockedUpTo ở 6", { tag: ["@TC-PROGRESS-009"] }, async ({ playPage }) => {
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 6 });
  await playPage.goto(6);
  await playPage.playUntilResult("first");
  await expect(playPage.result.title()).toHaveText(copy.won);
  const score = await playPage.scoreNumber();

  await expect.poll(() => playPage.readProgress()).toEqual({
    version: 1,
    levels: { 6: { stars: starsFor(score, level(6).stars), bestScore: score } },
    unlockedUpTo: 6,
  });
});
