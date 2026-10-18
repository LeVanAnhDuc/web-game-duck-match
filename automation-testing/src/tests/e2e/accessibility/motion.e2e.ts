import { test, expect } from "@/fixtures";
import { legalMoves } from "@/utils/match3";

/** Longest transition/animation duration on the first piece and its tile, in ms. */
const pieceDurationsMs = () => {
  const slot = document.querySelector('[data-testid="tile-slot"]')!;
  const tile = slot.querySelector('[data-testid="tile"]')!;
  const ms = (value: string) => Math.max(...value.split(",").map((part) => parseFloat(part) * (part.trim().endsWith("ms") ? 1 : 1000)));
  return [slot, tile].flatMap((el) => {
    const style = getComputedStyle(el);
    return [ms(style.transitionDuration), ms(style.animationDuration)];
  });
};

test("giảm chuyển động: thời lượng về gần 0", { tag: ["@TC-ACCESSIBILITY-007"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  expect(Math.max(...(await page.evaluate(pieceDurationsMs)))).toBeGreaterThan(1);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await playPage.goto(1);
  for (const duration of await page.evaluate(pieceDurationsMs)) expect(duration).toBeLessThanOrEqual(1);

  await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);
  await expect(playPage.slab()).toHaveAttribute("data-reduced-motion", "true");
});
