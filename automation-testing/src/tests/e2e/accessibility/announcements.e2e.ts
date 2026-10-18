import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

test("lượt, điểm và kết quả nằm trong vùng được đọc ra", { tag: ["@TC-ACCESSIBILITY-006"] }, async ({ page, playPage }) => {
  test.setTimeout(120_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await playPage.goto(1);

  await expect(playPage.counters()).toHaveCount(1);
  await expect(playPage.counters()).toContainText(copy.movesLeft);
  await expect(playPage.counters()).toContainText(copy.score);

  await playPage.playUntilResult("first");
  await expect(playPage.result.root().getByRole("status").getByRole("heading", { name: copy.won })).toBeVisible();
});
