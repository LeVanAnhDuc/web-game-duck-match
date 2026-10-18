import { expect, test } from "@playwright/test";
import { allSwaps, hasRun, illegalMoves, isLegal, legalMoves, longestRunAfter, type Board } from "./match3";

const parse = (rows: string[]): Board =>
  rows.map((line) =>
    [...line].map((ch) => {
      if (ch === ".") return null;
      const special = ch === ch.toUpperCase() ? (ch === "B" ? "colorBomb" : "stripedH") : "none";
      return { color: ch.toLowerCase(), special };
    }),
  );

test("a swap that lines up three is legal, one that does not is not", () => {
  const board = parse(["rrgr", "bgbb", "gbgg"]);
  expect(isLegal(board, { from: { row: 0, col: 2 }, to: { row: 0, col: 3 } })).toBe(true);
  expect(isLegal(board, { from: { row: 2, col: 0 }, to: { row: 2, col: 1 } })).toBe(true);
  expect(isLegal(board, { from: { row: 0, col: 0 }, to: { row: 1, col: 0 } })).toBe(false);
});

test("non-adjacent cells never swap", () => {
  const board = parse(["rrgr"]);
  expect(isLegal(board, { from: { row: 0, col: 0 }, to: { row: 0, col: 2 } })).toBe(false);
});

test("a colour bomb or two specials swap without a match", () => {
  expect(isLegal(parse(["bg", "gr"]).map((l, i) => (i === 0 ? [{ color: "b", special: "colorBomb" }, l[1]!] : l)), {
    from: { row: 0, col: 0 },
    to: { row: 0, col: 1 },
  })).toBe(true);
  expect(isLegal(parse(["RG"]), { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } })).toBe(true);
});

test("longestRunAfter measures the run the swap leaves", () => {
  const board = parse(["rrgrr"]);
  expect(longestRunAfter(board, { from: { row: 0, col: 2 }, to: { row: 0, col: 3 } })).toBe(3);
  const four = parse(["rrgr", "bbrb"]);
  expect(longestRunAfter(four, { from: { row: 0, col: 2 }, to: { row: 1, col: 2 } })).toBe(4);
});

test("legal and illegal moves partition every swap", () => {
  const board = parse(["rgb", "gbr", "brg"]);
  expect(legalMoves(board).length + illegalMoves(board).length).toBe(allSwaps(board).length);
  expect(allSwaps(board)).toHaveLength(12);
});

test("hasRun finds a standing run of three", () => {
  expect(hasRun(parse(["rrr"]))).toBe(true);
  expect(hasRun(parse(["rrg", "ggr"]))).toBe(false);
});
