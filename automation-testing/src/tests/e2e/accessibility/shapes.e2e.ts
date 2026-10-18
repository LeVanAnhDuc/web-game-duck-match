import { test, expect } from "@/fixtures";
import { shapeByColor } from "@/data/copy";

test("mỗi màu một hình khối riêng", { tag: ["@TC-ACCESSIBILITY-008"] }, async ({ playPage }) => {
  await playPage.seedProgress({ version: 1, levels: {}, unlockedUpTo: 5 });
  await playPage.goto(5);
  await playPage.settle();

  const pairs = await playPage.tiles().evaluateAll((els) =>
    els.map((el) => [el.getAttribute("data-color"), el.getAttribute("data-shape")] as const),
  );
  const byColor = new Map<string, Set<string>>();
  for (const [color, shape] of pairs) {
    if (!byColor.has(color!)) byColor.set(color!, new Set());
    byColor.get(color!)!.add(shape!);
  }

  expect([...byColor.keys()].sort()).toEqual(Object.keys(shapeByColor).sort());
  for (const [color, shapes] of byColor) {
    expect([...shapes], color).toEqual([shapeByColor[color as keyof typeof shapeByColor]]);
  }
  expect(new Set(Object.values(shapeByColor)).size).toBe(6);
});
