# Tactile Board Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the board look and move like clay: measured palette, chunky pieces in pressed wells, sliding swaps, a revert that slides over and back, falling with weight, a sweep when a special fires, and a feedback layer that finally shows the cascade multiplier.

**Architecture:** Three layers over one `--cell` variable (ADR-0010). The semantic `role="grid"` of buttons stands still and keeps every existing keyboard/a11y test green. Pieces are absolutely positioned by `Piece.id`, so movement is a consequence of state and CSS interpolation, not animation code. Ephemeral effects (sweeps, floating numbers) read `GameEvent[]` in their own `aria-hidden` layer. `Step.duration` becomes `Step.lead` — when the next beat starts — so beats overlap.

**Tech Stack:** Next.js 15 static export, React 19, TypeScript strict, Tailwind, `next/font/google`, Vitest + happy-dom + Testing Library, Playwright.

**Spec:** `docs/specs/tactile-board/design.md` — read §A before tasks 1-3, §B before 4-10, §C before 11-14.

## Global Constraints

- **Yarn classic.** Never `npm install`.
- Task order is A → B → C. Stopping after any task must leave `yarn test`, `yarn build` and `yarn test:e2e` green.
- **These tests must not be rewritten to pass:** 25 `Board`, 19 HUD, 18 `ResultDialog`, 8 `LevelMap`, 15 Playwright, and `test/engine-ui-agreement.test.ts`. If one goes red, the change is wrong until proven otherwise.
- Token values come from `docs/design-system/match-3/MASTER.md`. Do not invent a colour, radius or shadow that is not in it.
- `src/engine/**` stays pure: no React, no DOM, no `Date`, no `Math.random` (`purity.test.ts` greps for it).
- Every visible string from `src/i18n/vi.ts` (NFR-I18N-01).
- Every animation has a reduced-motion path (NFR-A11Y-05): `lead` 0, transitions off, `EffectLayer` renders nothing.
- Conventional Commits, English subject, area scope. Never commit to `main`.

## File Structure

```
tailwind.config.ts              tokens mirrored from MASTER.md + keyframes
src/app/layout.tsx              next/font: Baloo_2 + Nunito, subsets latin+vietnamese
src/app/globals.css             surface vars, well/clay shadow recipes, reduced-motion
src/ui/shapes.tsx              NEW  one shape set, shared by Tile and GoalHud
src/ui/Tile.tsx                      clay piece: well, lift, shimmer
src/ui/Board.tsx                     relative container + semantic grid + hosts layers
src/ui/PieceLayer.tsx          NEW  positioned pieces keyed by Piece.id
src/ui/useExitingPieces.ts     NEW  keeps a removed piece for one beat
src/ui/EffectLayer.tsx         NEW  sweeps, floating score, collect flights
src/ui/ScoreFloat.tsx          NEW  +360 ×2 rising label
src/ui/GoalTargets.tsx         NEW  context where GoalHud registers per-colour refs
src/game/timeline.ts                 lead + Step.visual + synthetic revert beats
src/game/project.ts                  applies Step.visual and reshuffled.grid
src/game/useGameSession.ts           lead-driven queue, idle hint
src/engine/types.ts                  reshuffled carries grid
src/engine/resolve.ts                attaches the grid
src/engine/hint.ts             NEW  findHint
src/engine/index.ts                  exports findHint
```

---

## Part A — tokens and the look (FR-15)

### Task 1: Tokens and fonts

**Files:** modify `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`; create `src/ui/tokens.test.ts`

**Interfaces produced:** Tailwind colours `surface.base|board|well|card|raised`, `ink.strong|muted`, `piece.<six>`, `accent.pink|amber`; CSS vars `--cell`, `--clay-*`; font variables `--font-heading`, `--font-body`.

- [ ] **Step 1: Write the contrast test first**

```ts
// src/ui/tokens.test.ts
import { describe, expect, it } from 'vitest'
import { PIECE_COLORS, SURFACE } from './tokens'

const lin = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => lin(parseInt(hex.slice(i, i + 2), 16) / 255))
  return 0.2126 * (r as number) + 0.7152 * (g as number) + 0.0722 * (b as number)
}
const contrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)]
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

describe('design tokens', () => {
  // The whole reason the palette was re-picked: the old set had purple at 2.57.
  it.each(Object.entries(PIECE_COLORS))(
    '%s clears 3:1 against the board (graphical object floor)',
    (_name, hex) => {
      expect(contrast(hex, SURFACE.board)).toBeGreaterThanOrEqual(3)
    },
  )

  it('keeps body text well above 4.5:1', () => {
    expect(contrast(SURFACE.inkStrong, SURFACE.board)).toBeGreaterThanOrEqual(4.5)
    expect(contrast(SURFACE.inkMuted, SURFACE.board)).toBeGreaterThanOrEqual(4.5)
  })

  it('has six distinct piece colours', () => {
    expect(new Set(Object.values(PIECE_COLORS)).size).toBe(6)
  })
})
```

- [ ] **Step 2: Run it red** — `yarn vitest run src/ui/tokens.test.ts` → cannot resolve `./tokens`.

- [ ] **Step 3: Create `src/ui/tokens.ts`** exporting `SURFACE` and `PIECE_COLORS` with the exact hexes from `MASTER.md`, and have `tailwind.config.ts` import from it so there is one source in code.

- [ ] **Step 4: Wire the fonts** in `src/app/layout.tsx`:

```tsx
import { Baloo_2, Nunito } from 'next/font/google'

// subsets include 'vietnamese': without it U+1EA0–1EF9 falls back per glyph and
// "Lượt" renders in two faces (ADR-0008).
const heading = Baloo_2({ subsets: ['latin', 'vietnamese'], weight: ['600', '700'], variable: '--font-heading' })
const body = Nunito({ subsets: ['latin', 'vietnamese'], weight: ['400', '600'], variable: '--font-body' })
```

- [ ] **Step 5: Clay recipes in `globals.css`** — `--clay-well` (inset shadow pair), `--clay-piece` (outer shadow + top inner highlight), `--clay-lift`. Under `prefers-reduced-motion: reduce` **and** `[data-reduced-motion='true']`, disable transitions and animations.

- [ ] **Step 6: Verify** — `yarn test`, `yarn typecheck`, `yarn lint`, `yarn build`, then `yarn check:bundle` twice (root and `play/1/index.html`) and record the new numbers: fonts add bytes and NFR-PERF-07 is a 200KB ceiling.

- [ ] **Step 7: Commit** — `feat(ui): adopt the measured palette and self-hosted vietnamese fonts`

### Task 2: One shared shape set

**Files:** create `src/ui/shapes.tsx`, `src/ui/shapes.test.tsx`; modify `src/ui/Tile.tsx`, `src/ui/GoalHud.tsx`

Pays the recorded debt: `Tile` and `GoalHud` each drew their own SVG shape set.

- [ ] **Step 1: Test first** — `PieceShape` renders one `<svg>` per `Shape`, all six distinct, each carrying `data-shape`, and `aria-hidden` (the accessible name comes from the cell label, never from the glyph).
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** `PieceShape({ shape, className })` on a 0–100 viewBox, then delete both local copies and import it in `Tile` and `GoalHud`.
- [ ] **Step 4: Verify** — 25 `Board` and 19 HUD tests still green.
- [ ] **Step 5: Commit** — `refactor(ui): share one shape set between the board and the hud`

### Task 3: Clay pieces

**Files:** modify `src/ui/Tile.tsx`, `src/ui/Tile.test.tsx` (create if absent)

- [ ] **Step 1: Test** — a piece renders with `data-color`, `data-special`, `data-selected`; a selected piece carries `data-lifted="true"`; a special piece carries `data-shimmer="true"` and a plain one does not.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** the clay look from design.md §A.4: radius 20px, 3px top highlight, outer shadow, and on `selected` a `translateY(-3px)` lift with a larger shadow. Keep the pink focus ring — depth is not an accessible signal on its own.
- [ ] **Step 4: Verify** — `yarn test`.
- [ ] **Step 5: Commit** — `feat(ui): render pieces as clay in pressed wells`

---

## Part B — motion (FR-16)

### Task 4: `lead` and `Step.visual`

**Files:** modify `src/game/timeline.ts`, `src/game/timeline.test.ts`

**Interfaces produced:**

```ts
export type Step = {
  events: GameEvent[]
  visual?: { kind: 'swapOut' | 'swapBack'; from: Pos; to: Pos }
  lead: number
}
export const LEAD: Record<string, number>   // per design.md §B.4
export function buildTimeline(events: GameEvent[], opts: { reducedMotion: boolean }): Step[]
```

- [ ] **Step 1: Tests first** — every existing timeline test must still describe correct behaviour after `duration` → `lead`; plus: a lone `swapReverted` produces **two** steps whose `visual.kind` are `swapOut` then `swapBack`; the second carries the `swapReverted` event; reduced motion sets every `lead` to 0 but keeps the same step count and grouping; leads match the table in design.md §B.4.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement.** Keep the existing grouping rules (a `matched` absorbs the activations and spawns that follow it; `goalProgressed` folds into the step before). Add the revert expansion.
- [ ] **Step 4: Verify** — `yarn vitest run src/game`.
- [ ] **Step 5: Commit** — `feat(game): give steps a lead so beats can overlap`

### Task 5: Engine — `reshuffled` carries its grid

**Files:** modify `src/engine/types.ts`, `src/engine/resolve.ts`, `src/engine/resolve.test.ts`

- [ ] **Step 1: Test** — after a resolve that reshuffles, the `reshuffled` event's `grid` is deep-equal to the returned `grid`; every piece id on it also existed before the shuffle (the multiset and its ids are preserved, invariant 8).
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** — attach `grid` at both exits: the settled shuffle and the freshly generated board.
- [ ] **Step 4: Verify** — `yarn vitest run src/engine`.
- [ ] **Step 5: Commit** — `feat(engine): let reshuffled carry the board it produced`

### Task 6: Projection applies `visual` and the reshuffled grid

**Files:** modify `src/game/project.ts`, `src/game/project.test.ts`, `test/engine-ui-agreement.test.ts`

- [ ] **Step 1: Tests** — `swapOut` exchanges the two pieces and **does not** change `movesLeft` (invariant 6); `swapBack` returns them; `reshuffled` with a grid replaces the shown grid; and — the important one — **`engine-ui-agreement` no longer skips moves containing a reshuffle**, because there is nothing left that cannot be projected.
- [ ] **Step 2: Run red** — the agreement test's skip branch is what fails first.
- [ ] **Step 3: Implement** — `projectEvents(session, events, visual?)`, and delete the skip in the agreement test.
- [ ] **Step 4: Verify** — `yarn test`. The agreement test plays 4320 moves; it is the contract that the animation never shows something untrue.
- [ ] **Step 5: Commit** — `feat(game): project the revert beat and the reshuffled board`

### Task 7: Lead-driven queue

**Files:** modify `src/game/useGameSession.ts`, `src/game/useGameSession.test.tsx`

- [ ] **Step 1: Tests** — the queue advances on `lead`, not on a CSS duration; input stays locked for the whole queue (invariant 3) and `busy` clears only when it drains; a `swapReverted` locks for its two beats and spends no move; reduced motion drains in one chain.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** — pass `step.visual` into `projectEvents`; keep the authoritative session in the ref exactly as now.
- [ ] **Step 4: Verify** — `yarn vitest run src/game`.
- [ ] **Step 5: Commit** — `feat(game): drive the queue by lead time`

### Task 8: `useExitingPieces`

**Files:** create `src/ui/useExitingPieces.ts`, `src/ui/useExitingPieces.test.tsx`

**Interface:** `useExitingPieces(placed: Placed[], ms: number): Placed[]` where `Placed = { piece: Piece; row: number; col: number; exiting?: boolean }`.

- [ ] **Step 1: Tests** — a piece present then absent is still returned once, marked `exiting`; it is gone after `ms`; a piece that only moves is never marked; unmount leaves no pending timer.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** with a ref of the previous frame plus a timer per exiting id. `Session.grid` is engine data and must not gain a UI flag — that is why this exists here (ADR-0010).
- [ ] **Step 4: Verify.**
- [ ] **Step 5: Commit** — `feat(ui): keep a cleared piece alive for one beat so it can animate out`

### Task 9: `PieceLayer` and the Board split

**Files:** create `src/ui/PieceLayer.tsx`, `src/ui/PieceLayer.test.tsx`; modify `src/ui/Board.tsx`

- [ ] **Step 1: Tests** — 49 tiles for a 7×7 session, each with `data-piece-id`; a tile's inline `transform` follows its row/col; a tile keeps its `data-piece-id` across a re-render at a new position (this is the whole mechanism — if the key changes, nothing animates); an exiting tile carries `data-clearing`; the layer is `aria-hidden`.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement.** `Board` becomes a `position: relative` container that declares `--cell` and `--cols` and renders: the existing semantic grid **unchanged**, then `PieceLayer`, then `EffectLayer` (task 10). The semantic buttons keep their `aria-label` from the projected grid and lose their visual tile.
- [ ] **Step 4: Verify** — all 25 `Board` tests green **without editing them**, and `yarn test:e2e`.
- [ ] **Step 5: Commit** — `feat(ui): position pieces by id so movement animates itself`

### Task 10: `EffectLayer` and the sweeps

**Files:** create `src/ui/EffectLayer.tsx`, `src/ui/EffectLayer.test.tsx`

- [ ] **Step 1: Tests** — each `specialActivated` special produces its own effect kind (`sweep-h`, `sweep-v`, `burst`, `color-flash`) with `data-effect`; effects are keyed per move so two do not collide; the layer renders **nothing** under reduced motion; the whole layer is `aria-hidden`.
- [ ] **Step 2: Run red.**
- [ ] **Step 3: Implement** per design.md §B.5, positioned from `at`/`cleared` and `--cell`. Effects remove themselves on `animationend` with a timer fallback.
- [ ] **Step 4: Verify.**
- [ ] **Step 5: Commit** — `feat(ui): sweep along the row a special just ate`

---

## Part C — feedback (FR-17)

### Task 11: Floating score and the cascade multiplier

**Files:** create `src/ui/ScoreFloat.tsx`; modify `src/ui/EffectLayer.tsx`, `src/ui/MoveCounter.tsx` and their tests

- [ ] **Step 1: Tests** — a `matched` event with `points: 360, cascade: 2` renders a float containing the formatted `360` and `×2`; `cascade: 1` renders no multiplier; the HUD score counts toward `session.score` and **lands exactly on it** (never past it); reduced motion shows the final number immediately.
- [ ] **Step 2: Run red.** — [ ] **Step 3: Implement.** The float uses the event's `points` verbatim; the count-up interpolates display only, between two engine values (invariant 2).
- [ ] **Step 4: Verify.** — [ ] **Step 5: Commit** — `feat(ui): show the points and the cascade multiplier that earned them`

### Task 12: `findHint` and the idle nudge

**Files:** create `src/engine/hint.ts`, `src/engine/hint.test.ts`; modify `src/engine/index.ts`, `src/game/useGameSession.ts`, `src/ui/Board.tsx`

**Interface:** `findHint(session: Session): { from: Pos; to: Pos } | null`

- [ ] **Step 1: Tests** — returns a legal move on a playable board; `null` when the session is not `playing`; prefers a move that would make a match of four or more when one exists; is deterministic for one session.
- [ ] **Step 2: Run red.** — [ ] **Step 3: Implement** in `engine/` (finding a move is a game rule, so `ui/` must not compute it), export from the barrel; the hook asks for a hint after 5s idle while `!busy`, and `Board` marks those two cells with `data-hint`.
- [ ] **Step 4: Verify** — `purity.test.ts` still green.
- [ ] **Step 5: Commit** — `feat(engine): offer a hint after the player has been idle`

### Task 13: Reshuffle beat, moves pulse, reward moment

**Files:** modify `src/ui/MoveCounter.tsx`, `src/ui/ResultDialog.tsx`, `src/ui/StarRow.tsx` and their tests

- [ ] **Step 1: Tests** — `MoveCounter` carries `data-low="true"` at `movesLeft <= 3` and not at 4; `t.reshuffled` is announced in the live region when a reshuffle plays; `ResultDialog` stars land with staggered `animation-delay` **and focus still lands on the first action synchronously** (all 18 dialog tests stay green); `StarRow` gains a `labelMode` prop so the dialog can reuse it with one grouped label — paying the recorded duplication debt.
- [ ] **Step 2: Run red.** — [ ] **Step 3: Implement.** — [ ] **Step 4: Verify** — 18 + 19 tests green.
- [ ] **Step 5: Commit** — `feat(ui): animate the reward moment and warn on the last moves`

### Task 14: Collect flight — cut this first if the plan runs long

**Files:** create `src/ui/GoalTargets.tsx`, `src/ui/CollectFlight.tsx` + tests; modify `src/ui/GoalHud.tsx`, `src/ui/EffectLayer.tsx`

- [ ] **Step 1: Tests** — with a registered target, a cleared piece of a goal colour produces a flight whose end point is the target's rect; **with no target registered it degrades to a local pop** and never throws; nothing renders under reduced motion.
- [ ] **Step 2: Run red.** — [ ] **Step 3: Implement** per design.md §C.7.
- [ ] **Step 4: Verify.** — [ ] **Step 5: Commit** — `feat(ui): fly a collected piece to its goal counter`

---

## Finish

### Task 15: Look at it, on the running app

- [ ] **Step 1:** `yarn test:e2e` — 15 existing flows must pass untouched.
- [ ] **Step 2:** Capture 375 / 768 / 1024 / 1440 plus the 9×9-at-375 case, and **open every screenshot**. A UI change nobody looked at is not finished.
- [ ] **Step 3:** Play several moves in a real browser and confirm: the swap slides, an illegal swap slides over and back without spending a move, pieces fall with weight, a special sweeps its row, the multiplier appears from cascade 2.
- [ ] **Step 4:** Re-measure `yarn check:bundle` for both routes and NFR-PERF-06 (no frame over 32ms during a cascade) — the DOM node count went up, so this is measured, not assumed.
- [ ] **Step 5: Commit** any fixes the screenshots forced, saying what the screenshot showed.

### Task 16: Close the paperwork

- [ ] **Step 1:** FR-15…FR-17 → `xong` in `scope.md`.
- [ ] **Step 2:** `backlog.md` — §Đang làm reflects reality; the four debts this feature pays are already removed; add anything newly owed.
- [ ] **Step 3:** README `## Features` gains one English bullet for the new feel.
- [ ] **Step 4:** `bash .claude/scripts/docs-regen.sh` clean; then `yarn typecheck && yarn lint && yarn test && yarn build && yarn test:e2e`.
- [ ] **Step 5:** Commit, push, PR, wait for CI, merge, and confirm `verify:live` passes on the deployed site.

## Self-Review

**Spec coverage.** design.md §A → tasks 1-3 · §B.1-B.2 → 8, 9 · §B.3-B.4 → 4, 6, 7 · §B.5-B.6 → 10 · §C.1 → 11 · §C.2 → 3 (shimmer) · §C.3 → 12 · §C.4 → 5, 6, 13 (announcement) · §C.5-C.6 → 13 · §C.7 → 14 · §3 testing → every task plus 15 · §4 mockup gate → 15.

**Type consistency.** `Step`/`LEAD`/`buildTimeline` (4, 7) · `projectEvents(session, events, visual?)` (6, 7) · `Placed`/`useExitingPieces` (8, 9) · `PieceShape` (2, 3) · `findHint` (12) · `reshuffled.grid` (5, 6) · `SURFACE`/`PIECE_COLORS` (1, 2, 3) — one name each.

**Known risk.** Task 9 is the one that can break the most: it moves the visual out of the semantic grid while 25 `Board` tests and 15 e2e tests read that grid. Those tests are the acceptance criterion for the task, not an afterthought — if they need editing to pass, the split is wrong.
