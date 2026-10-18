import { test, expect } from "@/fixtures";
import { copy } from "@/data/copy";
import { level } from "@/data/test-data";
import { legalMoves } from "@/utils/match3";
import type { Page } from "@playwright/test";

// Runs against the deployment: with ENV=prd it is the post-deploy check deploy.yml runs after deploy-pages
// (ADR-0007); on dev it is the same check on the local export.
//
// It exists because a successful deploy job does not mean a working site, and because the obvious check is a liar:
// curl on the Pages URL returned 200 while the body was GitHub's own "Site not found" page.

/**
 * Pages needs a moment after the deploy job reports success. Polls the real signal — the app's own title, reloading
 * every 5 seconds for up to 3 minutes — rather than a fixed sleep: "how long propagation takes" is not a number anyone
 * can commit to. GitHub's 404 page answers 200, so a status code is not evidence.
 */
async function waitForDeployment(page: Page) {
  await expect
    .poll(
      async () => {
        await page.goto("./", { waitUntil: "domcontentloaded" });
        return page.title();
      },
      { timeout: 180_000, intervals: [5_000], message: "the site still does not serve the app — check Pages and the artifact" },
    )
    .toBe(copy.appTitle);
}

test("site trả về chính game, không phải trang 404", { tag: ["@TC-DEPLOY-001", "@smoke"] }, async ({ page, mapPage }) => {
  test.setTimeout(240_000);
  await waitForDeployment(page);
  await mapPage.heading().waitFor();

  await expect(page).toHaveTitle(copy.appTitle);
  await expect(mapPage.levelLinks()).toHaveCount(1);
  await expect(mapPage.lockedCards()).toHaveCount(5);
});

test("bản đã deploy chơi được", { tag: ["@TC-DEPLOY-002", "@smoke"] }, async ({ page, mapPage, playPage }) => {
  test.setTimeout(240_000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await waitForDeployment(page);
  await mapPage.heading().waitFor();
  await mapPage.openLevel(1);
  await expect(playPage.movesLeft()).toHaveText(String(level(1).moves));

  await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);

  await expect(playPage.movesLeft()).toHaveText(String(level(1).moves - 1));
  await expect(playPage.score()).not.toHaveText("0");
  expect(errors).toEqual([]);
});
