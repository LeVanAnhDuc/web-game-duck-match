import { test, expect } from "@/fixtures";
import { colorName, specialName } from "@/data/copy";
import { SPECIAL_SWAPS } from "@/data/test-data";
import { runAt, runThrough, type Board, type Pos } from "@/utils/match3";

type Kind = keyof typeof SPECIAL_SWAPS;

function specialsOf(board: Board, kind: Kind): (Pos & { color: string })[] {
  const out: (Pos & { color: string })[] = [];
  board.forEach((line, row) =>
    line.forEach((cell, col) => {
      if (cell?.special === kind) out.push({ row, col, color: cell.color });
    }),
  );
  return out;
}

test("bàn mới không có quân đặc biệt", { tag: ["@TC-SPECIALS-001"] }, async ({ playPage }) => {
  await playPage.goto(1);
  const board = await playPage.readBoard();
  expect(board.flat().every((cell) => cell?.special === "none")).toBe(true);
  await expect(playPage.page.locator('[data-shimmer="true"]')).toHaveCount(0);
  await expect(playPage.page.getByTestId("special-badge")).toHaveCount(0);
  for (const name of Object.values(specialName)) {
    await expect(playPage.grid().getByRole("button", { name: new RegExp(name) })).toHaveCount(0);
  }
});

test("hàng ngang 4 viên sinh viên sọc ngang tại ô vừa đổi", { tag: ["@TC-SPECIALS-002", "@smoke"] }, async ({ playPage }) => {
  const { level, move } = SPECIAL_SWAPS.stripedH;
  await playPage.goto(level);
  const run = runAt(await playPage.readBoard(), move);
  expect(run, "the opening bàn no longer makes a horizontal four here").toMatchObject({ axis: "row", length: 4 });
  const before = await playPage.readBoard();
  const atFrom = run!.at.row === move.from.row && run!.at.col === move.from.col;
  const color = (atFrom ? before[move.to.row]![move.to.col] : before[move.from.row]![move.from.col])!.color as keyof typeof colorName;

  await playPage.playMove(move);

  const at = run!.at;
  await expect(playPage.tile(at)).toHaveAttribute("data-special", "stripedH");
  await expect(playPage.tile(at)).toHaveAttribute("data-color", color);
  await expect(playPage.cell(at)).toHaveAccessibleName(
    `Ô hàng ${at.row + 1} cột ${at.col + 1}, ${specialName.stripedH} ${colorName[color]}`,
  );
  await expect(playPage.tile(at)).toHaveAttribute("data-shimmer", "true");
  await expect(playPage.slot(at).getByTestId("special-badge")).toHaveCount(1);
});

test("hàng dọc 4 viên sinh viên sọc dọc trong cột đó", { tag: ["@TC-SPECIALS-003"] }, async ({ playPage }) => {
  const { level, move } = SPECIAL_SWAPS.stripedV;
  await playPage.goto(level);
  const before = await playPage.readBoard();
  const run = runAt(before, move);
  expect(run, "the opening bàn no longer makes a vertical four here").toMatchObject({ axis: "col", length: 4 });
  // The piece that lands on the run's swapped cell came from the other cell of the swap.
  const atFrom = run!.at.row === move.from.row && run!.at.col === move.from.col;
  const color = (atFrom ? before[move.to.row]![move.to.col] : before[move.from.row]![move.from.col])!.color;

  await playPage.playMove(move);

  const found = specialsOf(await playPage.readBoard(), "stripedV").filter((s) => s.col === run!.at.col && s.color === color);
  expect(found).toHaveLength(1);
  await expect(playPage.cell(found[0]!)).toHaveAccessibleName(new RegExp(`${specialName.stripedV} ${colorName[color as keyof typeof colorName]}$`));
});

test("hàng chữ L sinh viên bom", { tag: ["@TC-SPECIALS-004"] }, async ({ playPage }) => {
  const { level, move } = SPECIAL_SWAPS.wrapped;
  await playPage.goto(level);
  const before = await playPage.readBoard();
  const swapped = before.map((line) => [...line]);
  swapped[move.from.row]![move.from.col] = before[move.to.row]![move.to.col]!;
  swapped[move.to.row]![move.to.col] = before[move.from.row]![move.from.col]!;
  const corner = [move.from, move.to].find((p) => runThrough(swapped, p, "row") >= 3 && runThrough(swapped, p, "col") >= 3);
  expect(corner, "the opening bàn no longer makes an L here").toBeDefined();
  const color = swapped[corner!.row]![corner!.col]!.color;

  await playPage.playMove(move);

  const found = specialsOf(await playPage.readBoard(), "wrapped").filter((s) => s.color === color);
  expect(found.length).toBeGreaterThanOrEqual(1);
  await expect(playPage.cell(found[0]!)).toHaveAccessibleName(new RegExp(`${specialName.wrapped} ${colorName[color as keyof typeof colorName]}$`));
});

test("hàng 5 viên sinh bom màu", { tag: ["@TC-SPECIALS-005"] }, async ({ playPage }) => {
  const { level, move } = SPECIAL_SWAPS.colorBomb;
  await playPage.goto(level);
  expect(runAt(await playPage.readBoard(), move), "the opening bàn no longer makes a five here").toMatchObject({ length: 5 });

  await playPage.playMove(move);

  const found = specialsOf(await playPage.readBoard(), "colorBomb");
  expect(found).toHaveLength(1);
  await expect(playPage.cell(found[0]!)).toHaveAccessibleName(new RegExp(specialName.colorBomb));
  await expect(playPage.slot(found[0]!).getByTestId("special-badge")).toHaveCount(1);
});
