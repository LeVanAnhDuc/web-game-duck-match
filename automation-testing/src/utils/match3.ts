// Black-box match-3 arithmetic over a board read from the screen. Written from the rules in the game's docs
// (docs/01-product/glossary.md, invariant 6), NOT imported from ../client/src/engine: a test that borrows the engine
// to decide what is legal agrees with the engine by construction and can never catch it being wrong.

export interface Pos {
  row: number;
  col: number;
}

export interface Move {
  from: Pos;
  to: Pos;
}

export interface Cell {
  color: string;
  special: string; // "none" | "stripedH" | "stripedV" | "wrapped" | "colorBomb"
}

export type Board = (Cell | null)[][];

function swapped(board: Board, a: Pos, b: Pos): Board {
  const next = board.map((line) => [...line]);
  const cellA = next[a.row]![a.col]!;
  next[a.row]![a.col] = next[b.row]![b.col]!;
  next[b.row]![b.col] = cellA;
  return next;
}

/** Length of the same-colour run through `pos` along one axis. */
export function runThrough(board: Board, pos: Pos, axis: "row" | "col"): number {
  const color = board[pos.row]?.[pos.col]?.color;
  if (!color) return 0;
  const [dr, dc] = axis === "row" ? [0, 1] : [1, 0];
  let length = 1;
  for (const sign of [-1, 1]) {
    let r = pos.row + dr * sign;
    let c = pos.col + dc * sign;
    while (board[r]?.[c]?.color === color) {
      length++;
      r += dr * sign;
      c += dc * sign;
    }
  }
  return length;
}

/** The longest straight run a swap leaves at either swapped cell (0 when it matches nothing). */
export function longestRunAfter(board: Board, move: Move): number {
  const next = swapped(board, move.from, move.to);
  let best = 0;
  for (const pos of [move.from, move.to]) {
    for (const axis of ["row", "col"] as const) {
      const run = runThrough(next, pos, axis);
      if (run >= 3) best = Math.max(best, run);
    }
  }
  return best;
}

/** Colours of the runs (3+) a swap makes at the swapped cells. */
export function matchedColors(board: Board, move: Move): string[] {
  const next = swapped(board, move.from, move.to);
  const out = new Set<string>();
  for (const pos of [move.from, move.to]) {
    for (const axis of ["row", "col"] as const) {
      if (runThrough(next, pos, axis) >= 3) out.add(next[pos.row]![pos.col]!.color);
    }
  }
  return [...out];
}

/** Where and which way the longest run of a swap lies: the swapped cell it runs through and its axis. */
export function runAt(board: Board, move: Move): { at: Pos; axis: "row" | "col"; length: number } | null {
  const next = swapped(board, move.from, move.to);
  let best: { at: Pos; axis: "row" | "col"; length: number } | null = null;
  for (const at of [move.to, move.from]) {
    for (const axis of ["row", "col"] as const) {
      const length = runThrough(next, at, axis);
      if (length >= 3 && (!best || length > best.length)) best = { at, axis, length };
    }
  }
  return best;
}

const isSpecial = (cell: Cell | null | undefined) => !!cell && cell.special !== "none";

/** A swap is legal when it makes a run of three, or activates specials (a colour bomb, or two specials). */
export function isLegal(board: Board, move: Move): boolean {
  const a = board[move.from.row]?.[move.from.col];
  const b = board[move.to.row]?.[move.to.col];
  if (!a || !b) return false;
  if (Math.abs(move.from.row - move.to.row) + Math.abs(move.from.col - move.to.col) !== 1) return false;
  if (a.special === "colorBomb" || b.special === "colorBomb") return true;
  if (isSpecial(a) && isSpecial(b)) return true;
  return longestRunAfter(board, move) >= 3;
}

/** Every right/down swap, in reading order. */
export function allSwaps(board: Board): Move[] {
  const out: Move[] = [];
  for (let row = 0; row < board.length; row++) {
    const width = board[row]?.length ?? 0;
    for (let col = 0; col < width; col++) {
      if (col + 1 < width) out.push({ from: { row, col }, to: { row, col: col + 1 } });
      if (row + 1 < board.length) out.push({ from: { row, col }, to: { row: row + 1, col } });
    }
  }
  return out;
}

export function legalMoves(board: Board): Move[] {
  return allSwaps(board).filter((move) => isLegal(board, move));
}

export function illegalMoves(board: Board): Move[] {
  return allSwaps(board).filter((move) => !isLegal(board, move));
}

/** True when the settled board shows a run of three anywhere (a settled board never should). */
export function hasRun(board: Board): boolean {
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < (board[row]?.length ?? 0); col++) {
      if (runThrough(board, { row, col }, "row") >= 3 || runThrough(board, { row, col }, "col") >= 3) return true;
    }
  }
  return false;
}

export function countColor(board: Board, color: string): number {
  return board.flat().filter((cell) => cell?.color === color).length;
}
