import { test, expect } from "@/fixtures";
import { freezeClock } from "@/utils/clock";
import { copy } from "@/data/copy";
import { POINTS_PER_PIECE, level } from "@/data/test-data";
import { illegalMoves, legalMoves } from "@/utils/match3";

const START = level(1).moves;

test("đổi chỗ hợp lệ bằng bàn phím trừ một lượt và cộng điểm", { tag: ["@TC-PLAY-004", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const before = await playPage.readBoard();
  const move = legalMoves(before)[0]!;

  await playPage.playMove(move);

  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
  expect(await playPage.scoreNumber()).toBeGreaterThanOrEqual(3 * POINTS_PER_PIECE);
  expect(await playPage.readBoard()).not.toEqual(before);
});

test("đổi chỗ không hợp lệ không tốn lượt, bàn trở về như cũ", { tag: ["@TC-PLAY-005", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const before = await playPage.readBoard();
  const move = illegalMoves(before)[0]!;

  await playPage.swapWithKeyboard(move);
  // The refusal is played out (slide over and back) before the bàn accepts input again.
  await expect(playPage.rejectionNotice()).toHaveCount(1);
  await playPage.settle();

  await expect(playPage.movesLeft()).toHaveText(String(START));
  await expect(playPage.score()).toHaveText("0");
  expect(await playPage.readBoard()).toEqual(before);
});

test("nước bị từ chối được đánh dấu và được nói ra", { tag: ["@TC-PLAY-006"] }, async ({ page, playPage }) => {
  await freezeClock(page);
  await playPage.goto(1);
  const move = illegalMoves(await playPage.readBoard())[0]!;

  await playPage.swapWithKeyboard(move);
  // The refusal is marked on the beat that slides the pair back, a couple of hundred ms in.
  await page.clock.runFor(300);

  await expect(playPage.rejected()).toHaveCount(2);
  expect(await playPage.positions(playPage.rejected())).toEqual(expect.arrayContaining([move.from, move.to]));
  await expect(playPage.rejectionNotice()).toHaveCount(1);

  await page.clock.runFor(1_500);
  await expect(playPage.rejected()).toHaveCount(0);
  await expect(playPage.rejectionNotice()).toHaveCount(0);
});

test("chạm viên rồi chạm viên kề cũng đổi chỗ", { tag: ["@TC-PLAY-007", "@smoke"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const move = legalMoves(await playPage.readBoard())[0]!;

  await playPage.swapByTapping(move);

  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
});

test("kéo một viên thả lên viên kề cũng đổi chỗ", { tag: ["@TC-PLAY-008"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const move = legalMoves(await playPage.readBoard())[0]!;

  await playPage.swapByDragging(move);

  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
});

test("chọn, bỏ chọn, chuyển lựa chọn và Esc", { tag: ["@TC-PLAY-009"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const a = { row: 0, col: 0 };
  const far = { row: 2, col: 2 };

  await playPage.cell(a).click();
  await expect(playPage.gridcell(a)).toHaveAttribute("aria-selected", "true");
  await playPage.cell(a).click();
  await expect(playPage.gridcell(a)).toHaveAttribute("aria-selected", "false");

  await playPage.cell(a).click();
  await playPage.cell(far).click();
  await expect(playPage.gridcell(a)).toHaveAttribute("aria-selected", "false");
  await expect(playPage.gridcell(far)).toHaveAttribute("aria-selected", "true");
  await expect(playPage.movesLeft()).toHaveText(String(START));

  await playPage.page.keyboard.press("Escape");
  await expect(playPage.grid().locator('[aria-selected="true"]')).toHaveCount(0);

  await playPage.focusCell({ row: 4, col: 4 });
  await playPage.page.keyboard.press("Enter");
  await expect(playPage.gridcell({ row: 4, col: 4 })).toHaveAttribute("aria-selected", "true");
  await playPage.page.keyboard.press("Escape");
  await expect(playPage.grid().locator('[aria-selected="true"]')).toHaveCount(0);
});

test("thao tác trong lúc bàn đang chạy bị bỏ qua", { tag: ["@TC-PLAY-010"] }, async ({ page, playPage }) => {
  await freezeClock(page);
  await playPage.goto(1);
  const board = await playPage.readBoard();
  const [first, ...rest] = legalMoves(board);
  // A second swap that is legal on the same bàn and touches none of the first one's cells.
  const touches = (m: typeof first) =>
    [m!.from, m!.to].some((p) => [first!.from, first!.to].some((q) => q.row === p.row && q.col === p.col));
  const second = rest.find((m) => !touches(m)) ?? illegalMoves(board)[0]!;

  await playPage.swapWithKeyboard(first!);
  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
  await expect(playPage.grid()).toHaveAttribute("aria-busy", "true");

  await playPage.swapByTapping(second);
  await page.clock.runFor(10_000);

  await expect(playPage.grid()).toHaveAttribute("aria-busy", "false");
  await expect(playPage.movesLeft()).toHaveText(String(START - 1));
});
