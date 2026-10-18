import { test, expect } from "@/fixtures";

// Saves the game must refuse (decisions Q2): each one alone must still open the app as a new player (NFR-REL-03).
const CORRUPT: Record<string, string> = {
  "not JSON": "not json",
  "wrong version": JSON.stringify({ version: 2, levels: {}, unlockedUpTo: 3 }),
  "an array": "[]",
  "levels as an array": JSON.stringify({ version: 1, levels: [], unlockedUpTo: 3 }),
  "unlockedUpTo as a string": JSON.stringify({ version: 1, levels: {}, unlockedUpTo: "3" }),
};

test("bản lưu hỏng thì app vẫn mở như người chơi mới", { tag: ["@TC-PROGRESS-007", "@smoke"] }, async ({ page, mapPage }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  for (const [label, raw] of Object.entries(CORRUPT)) {
    await mapPage.seedProgress(raw);
    await mapPage.goto();
    await expect(mapPage.heading(), label).toBeVisible();
    await expect(mapPage.levelLinks(), label).toHaveCount(1);
    await expect(mapPage.lockedCards(), label).toHaveCount(5);
  }
  expect(errors).toEqual([]);
});
