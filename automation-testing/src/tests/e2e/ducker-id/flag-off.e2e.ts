import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";

// ADR-0012: the deployed build ships with Ducker ID sign-in off — no button, no URL reading, no storage, no request
// to anything but the page's own origin. Runs on the "app" project, i.e. the normal (flag-off) export.
test(
  "cờ tắt thì không có nút đăng nhập, không đọc URL, không chạm storage, không request ra ngoài",
  { tag: ["@TC-DUCKERID-001", "@smoke"] },
  async ({ page, mapPage, baseURL }) => {
    const site = new URL(baseURL!).origin;
    const outside: string[] = [];
    page.on("request", (request) => {
      const url = request.url();
      if (!url.startsWith(site) && !url.startsWith("data:") && !url.startsWith("blob:")) outside.push(url);
    });

    await mapPage.goto("?code=x&state=y");

    await expect(mapPage.header()).toBeVisible();
    await expect(mapPage.signInButton()).toHaveCount(0);
    await expect(mapPage.accountButton()).toHaveCount(0);
    await expect(mapPage.header()).toContainText(copy.productReassurance);
    expect(await page.evaluate(() => window.location.search)).toContain("code=x");
    expect(await page.evaluate(() => sessionStorage.length)).toBe(0);
    expect(outside).toEqual([]);
  },
);
