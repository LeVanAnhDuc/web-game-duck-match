import { test, expect } from "@/fixtures";

// 375 is the design width, 768 and 1024 the two layout switches in design.md §6, 1440 the widest artboard. The
// screenshots are still captured for a human to look at (attached to the report), but the case now asserts what
// can be measured: nothing scrolls sideways and the whole bàn is on screen.
const WIDTHS = [375, 768, 1024, 1440];

test("bản đồ và màn chơi không cuộn ngang ở bốn bề rộng", { tag: ["@TC-RESPONSIVE-001"] }, async ({ page, mapPage, playPage }, testInfo) => {
  const pageWidth = () => page.evaluate(() => document.documentElement.scrollWidth);

  for (const width of WIDTHS) {
    await page.setViewportSize({ width, height: 900 });

    await mapPage.goto();
    expect(await pageWidth(), `map at ${width}`).toBeLessThanOrEqual(width);
    await testInfo.attach(`map-${width}.png`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });

    await playPage.goto(1);
    expect(await pageWidth(), `board at ${width}`).toBeLessThanOrEqual(width);
    const grid = (await playPage.grid().boundingBox())!;
    expect(grid.x).toBeGreaterThanOrEqual(0);
    expect(grid.x + grid.width).toBeLessThanOrEqual(width);
    await testInfo.attach(`board-${width}.png`, { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  }
});
