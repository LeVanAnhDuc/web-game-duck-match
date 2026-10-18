import { test, expect } from "@/fixtures";
import { level } from "@/data/test-data";
import { legalMoves } from "@/utils/match3";

// Plays a whole level on the built app, one legal move at a time, until the level ends. The move is chosen from the
// bàn as drawn, so this does not compare the screen with the engine's own score — client/test/engine-ui-agreement
// does that (decisions Q4). What it proves: every legal move spends exactly one lượt, the score never goes down, and
// the level ends in a result dialog.
test(
  "chơi trọn màn 1: mỗi nước trừ một lượt, điểm không giảm, kết thúc bằng dialog",
  { tag: ["@TC-RESULT-001", "@smoke"] },
  async ({ page, playPage }) => {
    test.setTimeout(120_000);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await playPage.goto(1);
    await expect(playPage.movesLeft()).toHaveText(String(level(1).moves));
    await expect(playPage.score()).toHaveText("0");

    let lastScore = 0;
    for (let left = level(1).moves; left > 0; left--) {
      const move = legalMoves(await playPage.readBoard())[0];
      if (!move) throw new Error("no legal move on a settled bàn");
      await playPage.playMove(move);
      await expect(playPage.movesLeft()).toHaveText(String(left - 1));
      const score = await playPage.scoreNumber();
      expect(score).toBeGreaterThanOrEqual(lastScore);
      lastScore = score;
      if (await playPage.result.root().isVisible()) break;
    }

    await expect(playPage.result.root()).toBeVisible();
  },
);
