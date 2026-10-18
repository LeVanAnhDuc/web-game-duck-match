import { test, expect } from "@/fixtures";
import { colorName, copy } from "@/data/copy";
import { LEVELS, level } from "@/data/test-data";
import { hasRun, legalMoves } from "@/utils/match3";

test("mỗi màn mở ra đúng kích thước, đủ lượt, điểm 0", { tag: ["@TC-PLAY-001", "@smoke"] }, async ({ playPage }) => {
  for (const { id, rows, cols, moves } of LEVELS) {
    await playPage.goto(id);
    await expect(playPage.heading()).toHaveText(copy.levelLabel(id));
    await expect(playPage.movesLeft()).toHaveText(String(moves));
    await expect(playPage.score()).toHaveText("0");
    await expect(playPage.cells()).toHaveCount(rows * cols);
    await expect(playPage.grid().getByRole("row")).toHaveCount(rows);
  }
});

test("tên mỗi ô nói đúng hàng, cột và màu viên đang vẽ", { tag: ["@TC-PLAY-002"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const board = await playPage.readBoard();
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row]!.length; col++) {
      const color = board[row]![col]!.color as keyof typeof colorName;
      await expect(playPage.cell({ row, col })).toHaveAccessibleName(copy.cellLabelPlain(row, col, colorName[color]));
    }
  }
});

test("bàn mở ra không có hàng ba đứng sẵn và có nước đi", { tag: ["@TC-PLAY-003"] }, async ({ playPage }) => {
  for (const { id } of LEVELS) {
    await playPage.goto(id);
    const board = await playPage.readBoard();
    expect(board.flat().every((cell) => cell !== null), `level ${id} has an empty cell`).toBe(true);
    expect(hasRun(board), `level ${id} starts with a standing run`).toBe(false);
    expect(legalMoves(board).length, `level ${id} starts deadlocked`).toBeGreaterThan(0);
  }
});

test("mỗi ô một viên, viên chiếm phần lớn ô", { tag: ["@TC-PLAY-013"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const cells = level(1).rows * level(1).cols;
  await expect(playPage.slab()).toBeVisible();
  await expect(playPage.tiles()).toHaveCount(cells);
  await expect(playPage.wells()).toHaveCount(cells);

  // A piece is bigger than a token: the p-[6%] bug rendered every one at a sixth of its cell, and only a measurement
  // catches that.
  const piece = await playPage.slot({ row: 0, col: 0 }).boundingBox();
  const cell = await playPage.cell({ row: 0, col: 0 }).boundingBox();
  expect(piece!.width).toBeGreaterThan(cell!.width * 0.7);
});
