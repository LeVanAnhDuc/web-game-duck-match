import type { Locator, Page } from "@playwright/test";
import { copy } from "@/data/copy";
import { legalMoves, type Board, type Move, type Pos } from "@/utils/match3";
import { BasePage } from "./base.page";

// The result dialog that closes a level (won or lost). Only the play screen has it.
export class ResultDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByRole("dialog");
  }

  /** "Thắng màn!" / "Hết lượt!" — the first heading; a loss also carries the goal list's own heading. */
  title(): Locator {
    return this.root().getByRole("heading").first();
  }

  /** The goal list a loss repeats inside the dialog (US-02 bước 2). */
  goalRows(): Locator {
    return this.root().getByRole("list", { name: copy.goals }).getByRole("listitem");
  }

  stars(): Locator {
    return this.root().getByRole("img");
  }

  nextLevel(): Locator {
    return this.root().getByRole("button", { name: copy.nextLevel, exact: true });
  }

  replay(): Locator {
    return this.root().getByRole("button", { name: copy.replay, exact: true });
  }

  backToMap(): Locator {
    return this.root().getByRole("button", { name: copy.backToMap, exact: true });
  }
}

// The "Chơi lại từ đầu?" confirmation (FR-22).
export class ConfirmRestartDialog {
  constructor(private readonly page: Page) {}

  root(): Locator {
    return this.page.getByRole("alertdialog", { name: copy.confirmRestartTitle });
  }

  confirm(): Locator {
    return this.root().getByRole("button", { name: copy.replay, exact: true });
  }

  cancel(): Locator {
    return this.root().getByRole("button", { name: copy.confirmRestartCancel, exact: true });
  }
}

const SETTLED = () => {
  const grid = document.querySelector('[role="grid"]');
  return (
    grid?.getAttribute("aria-busy") === "false" &&
    document.querySelectorAll('[data-testid="tile-slot"][data-clearing]').length === 0
  );
};

// The play screen (`/play/<id>/`): HUD (moves, score, goals), the bàn, the replay button and two dialogs.
// The bàn is driven the way a player drives it: keyboard, tap-then-tap, or a drag. What is on it is read from the
// tiles the screen draws (data-color / data-special), never from the game's engine.
export class PlayPage extends BasePage {
  readonly result = new ResultDialog(this.page);
  readonly confirmRestart = new ConfirmRestartDialog(this.page);

  async goto(levelId: number): Promise<void> {
    await this.page.goto(`./play/${levelId}/`);
    await this.grid().waitFor();
  }

  heading(): Locator {
    return this.page.getByRole("heading", { level: 1 });
  }

  backToMapLink(): Locator {
    return this.page.getByRole("link", { name: copy.backToMap });
  }

  grid(): Locator {
    return this.page.getByRole("grid", { name: copy.boardLabel });
  }

  /** The focusable button of a cell; its accessible name is "Ô hàng R cột C, viên <màu>". */
  cell(pos: Pos): Locator {
    return this.page.getByTestId(`cell-${pos.row}-${pos.col}`);
  }

  cells(): Locator {
    return this.grid().getByRole("button");
  }

  gridcell(pos: Pos): Locator {
    return this.grid().getByRole("row").nth(pos.row).getByRole("gridcell").nth(pos.col);
  }

  /** The drawn piece sitting on a cell (aria-hidden layer). */
  tile(pos: Pos): Locator {
    return this.page
      .locator(`[data-testid="tile-slot"][data-row="${pos.row}"][data-col="${pos.col}"]:not([data-clearing])`)
      .getByTestId("tile");
  }

  /** The positioned slot a piece travels in (one per piece). */
  slot(pos: Pos): Locator {
    return this.page.locator(
      `[data-testid="tile-slot"][data-row="${pos.row}"][data-col="${pos.col}"]:not([data-clearing])`,
    );
  }

  /** The pressed hollows of the slab, one per cell. */
  wells(): Locator {
    return this.page.getByTestId("well");
  }

  tiles(): Locator {
    return this.page.locator('[data-testid="tile-slot"]:not([data-clearing]) [data-testid="tile"]');
  }

  slab(): Locator {
    return this.page.getByTestId("board-slab");
  }

  movesLeft(): Locator {
    return this.page.getByTestId("moves-left");
  }

  score(): Locator {
    return this.page.getByTestId("score");
  }

  /** The HUD goal list (FR-03/04/21). Each row's accessible name is the full goal sentence. */
  goalList(): Locator {
    return this.page.getByRole("list", { name: copy.goals }).first();
  }

  goalRows(): Locator {
    return this.goalList().getByRole("listitem");
  }

  /** The HUD goal row whose accessible name starts with `name` (e.g. "Mục tiêu viên đỏ"). */
  goalRow(name: string | RegExp): Locator {
    return this.goalList().getByRole("listitem", { name });
  }

  /** The colour silhouette drawn on a collect goal row (NFR-A11Y-06). */
  goalShape(row: Locator): Locator {
    return row.locator("svg[data-shape]");
  }

  /** The tick a met goal carries. */
  goalDoneMarker(row: Locator): Locator {
    return row.locator("[data-goal-done-marker]");
  }

  replayButton(): Locator {
    return this.page.getByTestId("replay");
  }

  /** Polite live regions (moves/score card, the bàn's refusal, the restart notice). */
  statuses(): Locator {
    return this.page.getByRole("status");
  }

  /** Pieces the idle hint is nudging (FR-19): the two cells of one legal swap. */
  hinted(): Locator {
    return this.page.locator('[data-testid="tile-slot"]:has(> [data-hint="true"])');
  }

  /** Pieces drawn as the refused pair after an illegal swap (FR-19). */
  rejected(): Locator {
    return this.page.locator('[data-testid="tile-slot"]:has(> [data-rejected="true"])');
  }

  /** Row/column of each located tile slot. */
  async positions(slots: Locator): Promise<Pos[]> {
    return slots.evaluateAll((els) =>
      els.map((el) => ({ row: Number(el.getAttribute("data-row")), col: Number(el.getAttribute("data-col")) })),
    );
  }

  /** Waits until the bàn has stopped animating and accepts input again. */
  async settle(): Promise<void> {
    await this.page.waitForFunction(SETTLED);
  }

  /** The bàn as drawn: colour + special of every piece, by row and column. */
  async readBoard(): Promise<Board> {
    await this.settle();
    return this.page.evaluate(() => {
      const board: ({ color: string; special: string } | null)[][] = [];
      document.querySelectorAll('[role="grid"] [role="row"]').forEach((row, r) => {
        board[r] = Array.from({ length: row.querySelectorAll('[role="gridcell"]').length }, () => null);
      });
      document.querySelectorAll('[data-testid="tile-slot"]:not([data-clearing])').forEach((slot) => {
        const r = Number(slot.getAttribute("data-row"));
        const c = Number(slot.getAttribute("data-col"));
        const tile = slot.querySelector('[data-testid="tile"]');
        const line = board[r];
        if (!tile || !line) return;
        line[c] = { color: tile.getAttribute("data-color") ?? "", special: tile.getAttribute("data-special") ?? "none" };
      });
      return board;
    });
  }

  async movesLeftNumber(): Promise<number> {
    return Number(await this.movesLeft().textContent());
  }

  /** The score as a number ("4.200" → 4200), once the count-up animation has finished. */
  async scoreNumber(): Promise<number> {
    // While the score counts up it is aria-hidden; the number is final once that attribute is gone.
    await this.page.locator('[data-testid="score"]:not([aria-hidden])').waitFor();
    return Number((await this.score().textContent())?.replace(/\D/g, "") ?? "0");
  }

  /** Walks the roving focus from the first cell to `pos` with the arrow keys. */
  async focusCell(pos: Pos): Promise<void> {
    await this.cell({ row: 0, col: 0 }).focus();
    for (let i = 0; i < pos.row; i++) await this.page.keyboard.press("ArrowDown");
    for (let i = 0; i < pos.col; i++) await this.page.keyboard.press("ArrowRight");
  }

  /** Keyboard swap: Enter on `from`, one arrow towards `to`, Enter. Does not wait for the result. */
  async swapWithKeyboard(move: Move): Promise<void> {
    await this.focusCell(move.from);
    await this.page.keyboard.press("Enter");
    const dr = move.to.row - move.from.row;
    const dc = move.to.col - move.from.col;
    await this.page.keyboard.press(dr > 0 ? "ArrowDown" : dr < 0 ? "ArrowUp" : dc > 0 ? "ArrowRight" : "ArrowLeft");
    await this.page.keyboard.press("Enter");
  }

  /** Tap-then-tap with the mouse. */
  async swapByTapping(move: Move): Promise<void> {
    await this.cell(move.from).click();
    await this.cell(move.to).click();
  }

  /** Press on `from`, drag onto `to`, release. */
  async swapByDragging(move: Move): Promise<void> {
    const from = await this.cell(move.from).boundingBox();
    const to = await this.cell(move.to).boundingBox();
    if (!from || !to) throw new Error("cell not on screen");
    await this.page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
    await this.page.mouse.down();
    await this.page.mouse.move(to.x + to.width / 2, to.y + to.height / 2, { steps: 5 });
    await this.page.mouse.up();
  }

  /** Waits for the moves counter to read `expected` (it drops on the first beat of a legal move). */
  async waitForMovesLeft(expected: number): Promise<void> {
    await this.page.waitForFunction(
      (value) => document.querySelector('[data-testid="moves-left"]')?.textContent === String(value),
      expected,
    );
  }

  /** A legal keyboard move, waited out: the counter drops first, the bàn settles after the cascade. */
  async playMove(move: Move): Promise<void> {
    const before = await this.movesLeftNumber();
    await this.swapWithKeyboard(move);
    await this.waitForMovesLeft(before - 1);
    await this.settle();
  }

  /**
   * Plays legal moves until the level ends, choosing the first (reading order) or last legal swap on the bàn as
   * drawn. Each level has a fixed seed, so the same choice rule replays the same game. Returns the moves played.
   */
  async playUntilResult(pick: "first" | "last"): Promise<number> {
    let played = 0;
    while (!(await this.result.root().isVisible())) {
      if ((await this.movesLeftNumber()) === 0) break;
      const moves = legalMoves(await this.readBoard());
      const move = pick === "first" ? moves[0] : moves[moves.length - 1];
      if (!move) throw new Error("no legal move on a settled bàn");
      await this.playMove(move);
      played++;
    }
    await this.result.root().waitFor();
    return played;
  }
}
