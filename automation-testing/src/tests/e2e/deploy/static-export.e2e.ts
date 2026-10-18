import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { LEVELS } from "@/data/test-data";

test("mở thẳng trang của từng màn, màn không tồn tại thì 404", { tag: ["@TC-DEPLOY-003"] }, async ({ page, playPage }) => {
  for (const { id } of LEVELS) {
    const response = await page.goto(`./play/${id}/`);
    expect(response?.status(), `play/${id}/`).toBeLessThan(400);
    await expect(playPage.heading()).toHaveText(copy.levelLabel(id));
    await expect(playPage.grid()).toBeVisible();
  }

  const missing = await page.goto(`./play/${LEVELS.length + 1}/`);
  expect(missing?.status()).toBe(404);
});

test("mọi tài nguyên của site tải được dưới đúng đường dẫn gốc", { tag: ["@TC-DEPLOY-004"] }, async ({ page, baseURL, mapPage, playPage }) => {
  const site = new URL(baseURL!).origin;
  const failed: string[] = [];
  page.on("response", (response) => {
    if (response.url().startsWith(site) && response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });

  await mapPage.goto();
  await playPage.goto(1);
  await page.waitForLoadState("networkidle");

  expect(failed).toEqual([]);
});
