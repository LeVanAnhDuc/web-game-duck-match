import { test, expect } from "@/fixtures";

test("Tab tới được bàn, bàn là một điểm dừng", { tag: ["@TC-ACCESSIBILITY-001", "@smoke"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  await expect(playPage.grid().locator('button[tabindex="0"]')).toHaveCount(1);

  // The header link comes first in DOM order, so the exact number of presses is not asserted.
  let reached = false;
  for (let i = 0; i < 6 && !reached; i++) {
    await page.keyboard.press("Tab");
    reached = (await playPage.focusedTestId())?.startsWith("cell-") ?? false;
  }
  expect(reached, "no board cell could be reached with Tab").toBe(true);

  await page.keyboard.press("Tab");
  expect((await playPage.focusedTestId())?.startsWith("cell-") ?? false).toBe(false);
});

test("mũi tên dừng ở mép bàn", { tag: ["@TC-ACCESSIBILITY-002"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  await playPage.focusCell({ row: 1, col: 1 });
  for (const key of ["ArrowUp", "ArrowUp", "ArrowLeft", "ArrowLeft"]) await page.keyboard.press(key);
  await expect(playPage.cell({ row: 0, col: 0 })).toBeFocused();

  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowDown");
  for (let i = 0; i < 10; i++) await page.keyboard.press("ArrowRight");
  await expect(playPage.cell({ row: 6, col: 6 })).toBeFocused();
});

test("ô đang có focus có vòng focus nhìn thấy được", { tag: ["@TC-ACCESSIBILITY-003"] }, async ({ page, playPage }) => {
  await playPage.goto(1);
  await playPage.focusCell({ row: 1, col: 1 });
  await page.keyboard.press("ArrowRight");
  await expect(playPage.cell({ row: 1, col: 2 })).toBeFocused();

  const ring = (testId: string) =>
    page.getByTestId(testId).evaluate((el) => getComputedStyle(el).boxShadow);
  expect(await ring("cell-1-2")).toMatch(/0px 0px 0px 2px/);
  expect(await ring("cell-3-3")).not.toMatch(/0px 0px 0px 2px/);
});
