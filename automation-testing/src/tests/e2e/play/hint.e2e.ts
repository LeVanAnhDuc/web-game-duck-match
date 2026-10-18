import { test, expect } from "@/fixtures";
import { freezeClock } from "@/utils/clock";
import { HINT_AFTER_MS, level } from "@/data/test-data";
import { isLegal } from "@/utils/match3";

test("đứng yên 5 giây thì có gợi ý, trước đó thì không", { tag: ["@TC-PLAY-011"] }, async ({ page, playPage }) => {
  await freezeClock(page);
  await playPage.goto(1);

  await page.clock.runFor(HINT_AFTER_MS - 100);
  await expect(playPage.hinted()).toHaveCount(0);

  await page.clock.runFor(200);
  await expect(playPage.hinted()).toHaveCount(2);
  const [from, to] = await playPage.positions(playPage.hinted());
  expect(Math.abs(from!.row - to!.row) + Math.abs(from!.col - to!.col)).toBe(1);
  expect(isLegal(await playPage.readBoard(), { from: from!, to: to! })).toBe(true);
});

test("gợi ý biến mất khi người chơi đi một nước", { tag: ["@TC-PLAY-012"] }, async ({ page, playPage }) => {
  await freezeClock(page);
  await playPage.goto(1);
  await page.clock.runFor(HINT_AFTER_MS + 100);
  await expect(playPage.hinted()).toHaveCount(2);
  const [from, to] = await playPage.positions(playPage.hinted());

  await playPage.swapWithKeyboard({ from: from!, to: to! });
  await expect(playPage.movesLeft()).toHaveText(String(level(1).moves - 1));
  await expect(playPage.hinted()).toHaveCount(0);
  await page.clock.runFor(3_000);
  await expect(playPage.grid()).toHaveAttribute("aria-busy", "false");
  await expect(playPage.hinted()).toHaveCount(0);
});
