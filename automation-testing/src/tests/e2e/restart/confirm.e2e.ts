import { test, expect } from "@/fixtures";
import { copy, formatScore } from "@/data/copy";
import { level } from "@/data/test-data";
import { illegalMoves, legalMoves } from "@/utils/match3";
import type { PlayPage } from "@/pages/play.page";

const START = level(1).moves;

async function playOneMove(playPage: PlayPage) {
  await playPage.goto(1);
  await playPage.playMove(legalMoves(await playPage.readBoard())[0]!);
  return { board: await playPage.readBoard(), score: await playPage.scoreNumber() };
}

test("chưa đi nước nào thì \"Chơi lại\" xếp lại bàn ngay, không hỏi", { tag: ["@TC-RESTART-001"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const before = await playPage.readBoard();

  await playPage.replayButton().click();

  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.restartNotice()).toHaveCount(1);
  expect(await playPage.readBoard()).not.toEqual(before);
  await expect(playPage.movesLeft()).toHaveText(String(START));
  await expect(playPage.score()).toHaveText("0");
});

test("nước bị từ chối không làm màn thành \"đang dở\"", { tag: ["@TC-RESTART-002"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const before = await playPage.readBoard();
  await playPage.swapWithKeyboard(illegalMoves(before)[0]!);
  await expect(playPage.rejectionNotice()).toHaveCount(1);
  await playPage.settle();

  await playPage.replayButton().click();

  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.restartNotice()).toHaveCount(1);
  expect(await playPage.readBoard()).not.toEqual(before);
});

test(
  "đã đi một nước thì \"Chơi lại\" hỏi trước, nói điểm sẽ mất và điều được giữ",
  { tag: ["@TC-RESTART-003", "@smoke"] },
  async ({ playPage }) => {
    const { score } = await playOneMove(playPage);

    await playPage.replayButton().click();

    await expect(playPage.confirmRestart.root()).toBeVisible();
    await expect(playPage.confirmRestart.root()).toContainText(copy.confirmRestartLoses(formatScore(score)));
    await expect(playPage.confirmRestart.root()).toContainText(copy.confirmRestartKeeps);
    await expect(playPage.confirmRestart.cancel()).toBeFocused();
    await expect(playPage.movesLeft()).toHaveText(String(START - 1));
    await expect(playPage.score()).toHaveText(formatScore(score));
  },
);

test("xác nhận \"Chơi lại\" đặt lại lượt, điểm và bàn", { tag: ["@TC-RESTART-004", "@smoke"] }, async ({ playPage }) => {
  const { board } = await playOneMove(playPage);

  await playPage.replayButton().click();
  await playPage.confirmRestart.confirm().click();

  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.movesLeft()).toHaveText(String(START));
  await expect(playPage.score()).toHaveText("0");
  expect(await playPage.readBoard()).not.toEqual(board);
  await expect(playPage.restartNotice()).toHaveCount(1);
});

test("\"Thôi, chơi tiếp\" và Esc giữ nguyên ván", { tag: ["@TC-RESTART-005"] }, async ({ page, playPage }) => {
  const { board, score } = await playOneMove(playPage);

  await playPage.replayButton().click();
  await playPage.confirmRestart.cancel().click();
  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
  await expect(playPage.score()).toHaveText(formatScore(score));
  expect(await playPage.readBoard()).toEqual(board);

  await playPage.replayButton().click();
  await expect(playPage.confirmRestart.root()).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(playPage.confirmRestart.root()).toHaveCount(0);
  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
  expect(await playPage.readBoard()).toEqual(board);
  await expect(playPage.restartNotice()).toHaveCount(0);
});

test("Tab chỉ vòng trong hộp hỏi", { tag: ["@TC-RESTART-006"] }, async ({ page, playPage }) => {
  await playOneMove(playPage);
  await playPage.replayButton().click();
  await expect(playPage.confirmRestart.cancel()).toBeFocused();

  await page.keyboard.press("Tab");
  await expect(playPage.confirmRestart.confirm()).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(playPage.confirmRestart.cancel()).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(playPage.confirmRestart.confirm()).toBeFocused();
});

test("hai lần xếp lại liên tiếp đều được thông báo", { tag: ["@TC-RESTART-007"] }, async ({ playPage }) => {
  await playPage.goto(1);

  await playPage.replayButton().click();
  await expect(playPage.restartNotice()).toHaveCount(1);
  const first = await playPage.restartNotice().textContent();

  await playPage.replayButton().click();
  await expect(playPage.restartNotice()).toHaveCount(1);
  await expect.poll(() => playPage.restartNotice().textContent()).not.toBe(first);
});
