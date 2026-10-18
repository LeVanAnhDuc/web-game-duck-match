import { test, expect } from "@/fixtures";
import { colorName, copy, shapeByColor } from "@/data/copy";

test("màn chỉ có mục tiêu điểm hiện một dòng \"Điểm 0/…\"", { tag: ["@TC-GOALS-001", "@smoke"] }, async ({ playPage }) => {
  for (const [id, target] of [[1, 2000], [2, 4000], [5, 6000]] as const) {
    await playPage.goto(id);
    await expect(playPage.goalRows()).toHaveCount(1);
    const row = playPage.goalRows().first();
    await expect(row).toHaveAccessibleName(copy.goalScoreLabel(0, target));
    await expect(row).toContainText(copy.goalScoreShort);
    await expect(row).toContainText(copy.goalScore(0, target));
    await expect(row).toHaveAttribute("data-done", "false");
  }
});

test("màn thu viên hiện dòng có hình và tên màu", { tag: ["@TC-GOALS-002"] }, async ({ playPage }) => {
  await playPage.goto(3);
  await expect(playPage.goalRows()).toHaveCount(1);
  const row = playPage.goalRows().first();
  await expect(row).toHaveAccessibleName(copy.goalCollectLabel(colorName.red, 0, 12));
  await expect(row).toContainText(colorName.red);
  await expect(row).toContainText(copy.goalCollect(0, 12));
  await expect(playPage.goalShape(row)).toHaveAttribute("data-shape", shapeByColor.red);
});

test("màn hai mục tiêu hiện đủ các dòng theo thứ tự", { tag: ["@TC-GOALS-003"] }, async ({ playPage }) => {
  await playPage.goto(4);
  await expect(playPage.goalRows()).toHaveCount(3);
  await expect(playPage.goalRows().nth(0)).toHaveAccessibleName(copy.goalCollectLabel(colorName.blue, 0, 12));
  await expect(playPage.goalRows().nth(1)).toHaveAccessibleName(copy.goalCollectLabel(colorName.yellow, 0, 12));
  await expect(playPage.goalRows().nth(2)).toHaveAccessibleName(copy.goalScoreLabel(0, 4000));

  await playPage.goto(6);
  await expect(playPage.goalRows()).toHaveCount(2);
  await expect(playPage.goalRows().nth(0)).toHaveAccessibleName(copy.goalCollectLabel(colorName.purple, 0, 12));
  await expect(playPage.goalRows().nth(1)).toHaveAccessibleName(copy.goalScoreLabel(0, 4000));
});
