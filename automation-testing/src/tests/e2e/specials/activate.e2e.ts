import { test, expect } from "@/fixtures";
import { SPECIAL_SWAPS } from "@/data/test-data";
import { isLegal, type Pos } from "@/utils/match3";

test("đổi bom màu với viên kề là nước hợp lệ và kích hoạt nó", { tag: ["@TC-SPECIALS-006"] }, async ({ playPage }) => {
  const { level, move } = SPECIAL_SWAPS.colorBomb;
  await playPage.goto(level);
  await playPage.playMove(move);

  const board = await playPage.readBoard();
  let bomb: Pos | undefined;
  board.forEach((line, row) => line.forEach((cell, col) => cell?.special === "colorBomb" && (bomb = { row, col })));
  expect(bomb, "no colour bomb to swap").toBeDefined();
  const neighbour = bomb!.col + 1 < board[0]!.length ? { row: bomb!.row, col: bomb!.col + 1 } : { row: bomb!.row, col: bomb!.col - 1 };
  const swap = { from: bomb!, to: neighbour };
  expect(isLegal(board, swap)).toBe(true);
  const moves = await playPage.movesLeftNumber();
  const score = await playPage.scoreNumber();

  await playPage.playMove(swap);

  await expect(playPage.movesLeft()).toHaveText(String(moves - 1));
  const after = await playPage.readBoard();
  expect(after.flat().some((cell) => cell?.special === "colorBomb")).toBe(false);
  expect(await playPage.scoreNumber()).toBeGreaterThan(score);
});
