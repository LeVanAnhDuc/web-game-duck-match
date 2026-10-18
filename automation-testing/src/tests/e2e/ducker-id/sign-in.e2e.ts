import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { DUCKER, level } from "@/data/test-data";
import { legalMoves } from "@/utils/match3";
import type { Page } from "@playwright/test";

// FR-23 · US-05 · ADR-0012. Runs on the "app-auth" project: the flag-on export built by `pnpm build:e2e-auth` against
// the fake issuer http://ducker.test, served on :4291. The issuer fixture answers every request to it.

const search = (page: Page) => page.evaluate(() => window.location.search);

test("cờ bật: có nút đăng nhập, câu trấn an đổi, chưa bấm thì không gọi Ducker ID", { tag: ["@TC-DUCKERID-002"] }, async ({ page, mapPage }) => {
  const toIssuer: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(DUCKER.issuer)) toIssuer.push(request.url());
  });
  await mapPage.goto();
  await expect(mapPage.signInButton()).toBeVisible();
  await expect(mapPage.header()).toContainText(copy.productReassuranceSignIn);
  expect(toIssuer).toEqual([]);
});

test("đăng nhập: thấy tài khoản, URL sạch, tham số trang còn nguyên", { tag: ["@TC-DUCKERID-003", "@smoke"] }, async ({ page, mapPage, fakeIssuer }) => {
  const errors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await fakeIssuer();
  await mapPage.goto("?keep=1");

  await mapPage.signInButton().click();

  await expect(mapPage.accountButton()).toBeVisible();
  await expect.poll(() => search(page)).toBe("?keep=1");
  expect(errors.filter((text) => /hydrat/i.test(text))).toEqual([]);
});

test("menu tài khoản: tên, email, hồ sơ; đăng xuất trả lại nút và focus", { tag: ["@TC-DUCKERID-004", "@smoke"] }, async ({ mapPage, fakeIssuer }) => {
  await fakeIssuer();
  await mapPage.goto();
  await mapPage.signInButton().click();

  await mapPage.accountButton().click();
  await expect(mapPage.accountPanel()).toContainText(DUCKER.user.name);
  await expect(mapPage.accountPanel()).toContainText(DUCKER.user.email);
  await expect(mapPage.profileLink()).toHaveAttribute("href", `${DUCKER.issuer}${DUCKER.profilePath}`);

  await mapPage.signOut().click();
  await expect(mapPage.signInButton()).toBeVisible();
  await expect(mapPage.signInButton()).toBeFocused();
  await expect(mapPage.accountButton()).toHaveCount(0);
});

test("Esc đóng menu tài khoản và trả focus về nút tài khoản", { tag: ["@TC-DUCKERID-005"] }, async ({ page, mapPage, fakeIssuer }) => {
  await fakeIssuer();
  await mapPage.goto();
  await mapPage.signInButton().click();
  await mapPage.accountButton().click();
  await expect(mapPage.accountMenu()).toBeVisible();

  await page.keyboard.press("Escape");

  await expect(mapPage.accountMenu()).toHaveCount(0);
  await expect(mapPage.accountButton()).toBeFocused();
});

test("đã đăng nhập vẫn chơi được như thường", { tag: ["@TC-DUCKERID-006"] }, async ({ mapPage, playPage, fakeIssuer }) => {
  await fakeIssuer();
  await mapPage.goto();
  await mapPage.signInButton().click();
  await expect(mapPage.accountButton()).toBeVisible();

  await mapPage.openLevel(1);
  await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);

  await expect(playPage.movesLeft()).toHaveText(String(level(1).moves - 1));
  expect(await playPage.scoreNumber()).toBeGreaterThan(0);
});

test("hồ sơ chỉ nằm trong bộ nhớ: tải lại là chưa đăng nhập, storage không giữ gì", { tag: ["@TC-DUCKERID-007", "@smoke"] }, async ({ page, mapPage, fakeIssuer }) => {
  await fakeIssuer();
  await mapPage.goto();
  await mapPage.signInButton().click();
  await expect(mapPage.accountButton()).toBeVisible();

  const stored = await page.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  expect(stored).not.toContain(DUCKER.user.email);
  expect(await page.evaluate((key) => sessionStorage.getItem(key), DUCKER.pkceKey)).toBeNull();

  await page.reload();
  await expect(mapPage.signInButton()).toBeVisible();
  await expect(mapPage.accountButton()).toHaveCount(0);
});

test("từ chối ở Ducker ID thì về chưa đăng nhập, URL sạch", { tag: ["@TC-DUCKERID-008"] }, async ({ page, mapPage, fakeIssuer }) => {
  await fakeIssuer("deny");
  await mapPage.goto("?keep=1");

  await mapPage.signInButton().click();

  await expect(mapPage.signInButton()).toBeVisible();
  await expect.poll(() => search(page)).toBe("?keep=1");
  await expect(mapPage.accountButton()).toHaveCount(0);
});

test("state bị sửa thì không bao giờ gọi tới token", { tag: ["@TC-DUCKERID-009", "@smoke"] }, async ({ page, mapPage, fakeIssuer }) => {
  const issuer = await fakeIssuer("tamper");
  await mapPage.goto();

  await mapPage.signInButton().click();

  await expect(mapPage.signInButton()).toBeVisible();
  await expect.poll(() => search(page)).toBe("");
  expect(issuer.tokenCalls()).toBe(0);
});

test("issuer treo thì sau tối đa 15 giây về lại chưa đăng nhập", { tag: ["@TC-DUCKERID-010"] }, async ({ page, mapPage, fakeIssuer }) => {
  // AbortSignal.timeout(15s) is a native timer that page.clock cannot fast-forward: this one waits for real.
  test.setTimeout(60_000);
  const issuer = await fakeIssuer("hang");
  await mapPage.goto();

  await mapPage.signInButton().click();

  await expect.poll(() => issuer.tokenCalls()).toBe(1);
  await expect(mapPage.signInButton()).toBeVisible({ timeout: 20_000 });
  await expect.poll(() => search(page)).not.toMatch(/code=|state=/);
});

test("sessionStorage bị chặn thì bấm đăng nhập không đưa đi đâu cả", { tag: ["@TC-DUCKERID-011"] }, async ({ page, mapPage, fakeIssuer }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      get() {
        throw new DOMException("The operation is insecure.", "SecurityError");
      },
    });
  });
  await fakeIssuer();
  const toIssuer: string[] = [];
  page.on("request", (request) => {
    if (request.url().startsWith(DUCKER.issuer)) toIssuer.push(request.url());
  });
  await mapPage.goto();

  await mapPage.signInButton().click();

  await expect(mapPage.heading()).toBeVisible();
  await expect(mapPage.signInButton()).toBeEnabled();
  expect(toIssuer).toEqual([]);
});

test("nút đăng nhập đủ 44px và không đè chữ header ở 375px", { tag: ["@TC-DUCKERID-012"] }, async ({ page, mapPage }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await mapPage.goto();
  const button = (await mapPage.signInButton().boundingBox())!;
  const text = (await mapPage.headerText().boundingBox())!;
  expect(button.width).toBeGreaterThanOrEqual(44);
  expect(button.height).toBeGreaterThanOrEqual(44);
  expect(button.x).toBeGreaterThanOrEqual(text.x + text.width);
  expect(button.x + button.width).toBeLessThanOrEqual(375);
});

for (const width of [320, 375]) {
  test(`menu tài khoản nằm trọn trong màn hình và không làm header nhảy (${width}px)`, { tag: ["@TC-DUCKERID-013"] }, async ({ page, mapPage, fakeIssuer }) => {
    await fakeIssuer();
    await page.setViewportSize({ width, height: 800 });
    await mapPage.goto();
    await mapPage.signInButton().click();
    await expect(mapPage.accountButton()).toBeVisible();
    const before = await mapPage.header().boundingBox();

    await mapPage.accountButton().click();

    await expect(mapPage.accountMenu()).toBeVisible();
    const menu = (await mapPage.accountMenu().boundingBox())!;
    expect(menu.x).toBeGreaterThanOrEqual(0);
    expect(menu.x + menu.width).toBeLessThanOrEqual(width);
    expect(menu.y + menu.height).toBeLessThanOrEqual(800);
    expect(await mapPage.header().boundingBox()).toEqual(before);
    expect(await mapPage.accountMenu().evaluate((el) => getComputedStyle(el.parentElement!).position)).toBe("absolute");
  });
}
