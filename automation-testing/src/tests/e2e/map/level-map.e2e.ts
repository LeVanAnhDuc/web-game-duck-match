import { test, expect } from "@/fixtures";
import { copy, formatScore } from "@/data/copy";

test("người chơi mới thấy bản đồ sáu màn, chỉ màn 1 mở", { tag: ["@TC-MAP-001", "@smoke"] }, async ({ mapPage }) => {
  await mapPage.goto();
  await expect(mapPage.heading()).toBeVisible();
  await expect(mapPage.cards()).toHaveCount(6);
  for (let id = 1; id <= 6; id++) await expect(mapPage.card(id)).toContainText(copy.levelLabel(id));
  await expect(mapPage.levelLinks()).toHaveCount(1);
  await expect(mapPage.levelLink(1)).toHaveAttribute("href", /play\/1\/?$/);
  await expect(mapPage.lockedCards()).toHaveCount(5);
});

test("thẻ khoá nói điều kiện mở và không phải liên kết", { tag: ["@TC-MAP-002"] }, async ({ mapPage }) => {
  await mapPage.goto();
  for (let id = 2; id <= 6; id++) {
    await expect(mapPage.card(id)).toContainText(copy.locked);
    await expect(mapPage.card(id)).toContainText(copy.unlockHint(id - 1));
    await expect(mapPage.card(id).getByRole("link")).toHaveCount(0);
  }
});

test("bấm thẻ khoá thì vẫn ở bản đồ", { tag: ["@TC-MAP-003"] }, async ({ page, mapPage }) => {
  await mapPage.goto();
  const url = page.url();
  await mapPage.card(2).click();
  await expect(mapPage.heading()).toBeVisible();
  expect(page.url()).toBe(url);
  await expect(page.getByRole("grid")).toHaveCount(0);
});

test("màn mở chưa có thành tích ghi \"Chưa có tiến độ\" và 0 sao", { tag: ["@TC-MAP-004"] }, async ({ mapPage }) => {
  await mapPage.goto();
  await expect(mapPage.card(1)).toContainText(copy.noProgressYet);
  await expect(mapPage.stars(1)).toHaveAccessibleName(copy.starsEarned(0, 3));
});

test("thẻ có thành tích hiện sao, điểm cao nhất và điểm còn thiếu cho sao kế", { tag: ["@TC-MAP-005"] }, async ({ mapPage }) => {
  await mapPage.seedProgress({ version: 1, levels: { 1: { stars: 2, bestScore: 4200 } }, unlockedUpTo: 2 });
  await mapPage.goto();
  await expect(mapPage.stars(1)).toHaveAccessibleName(copy.starsEarned(2, 3));
  await expect(mapPage.card(1)).toContainText(`${copy.bestScore}: ${formatScore(4200)}`);
  await expect(mapPage.card(1)).toContainText(copy.starGap(formatScore(2800)));
  await expect(mapPage.levelLink(2)).toBeVisible();
  await expect(mapPage.card(2)).toContainText(copy.noProgressYet);
  await expect(mapPage.lockedCards()).toHaveCount(4);
});

test("đủ ba sao thì không còn dòng điểm thiếu", { tag: ["@TC-MAP-006"] }, async ({ mapPage }) => {
  await mapPage.seedProgress({ version: 1, levels: { 1: { stars: 3, bestScore: 7000 } }, unlockedUpTo: 2 });
  await mapPage.goto();
  await expect(mapPage.stars(1)).toHaveAccessibleName(copy.starsEarned(3, 3));
  await expect(mapPage.card(1)).toContainText(`${copy.bestScore}: ${formatScore(7000)}`);
  await expect(mapPage.card(1)).not.toContainText("điểm nữa");
});

test("đầu bản đồ nói đây là sản phẩm gì", { tag: ["@TC-MAP-007"] }, async ({ mapPage }) => {
  await mapPage.goto();
  await expect(mapPage.header()).toContainText(copy.productName);
  await expect(mapPage.header()).toContainText(copy.productTagline);
  await expect(mapPage.header()).toContainText(copy.productReassurance);
});

test("vào màn 1 từ bản đồ rồi quay lại", { tag: ["@TC-MAP-008", "@smoke"] }, async ({ page, mapPage, playPage }) => {
  await mapPage.goto();
  await mapPage.openLevel(1);
  await expect(page).toHaveURL(/play\/1\/$/);
  await expect(playPage.heading()).toHaveText(copy.levelLabel(1));
  await expect(playPage.grid()).toBeVisible();
  await expect(playPage.movesLeft()).toBeVisible();
  await expect(playPage.score()).toBeVisible();
  await playPage.backToMapLink().click();
  await expect(mapPage.heading()).toBeVisible();
});
