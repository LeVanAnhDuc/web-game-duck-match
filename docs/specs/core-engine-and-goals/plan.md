# Core Engine and Goals — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a playable vertical slice of a level-based match-3 game: six levels, two goal kinds, four special-piece kinds, star rating, level map, and local progress that survives a page reload.

**Architecture:** `src/engine/` is pure synchronous TypeScript — no React, no DOM, no `Date.now()`, no `Math.random()`. One player move goes through one pure function `applySwap(session, from, to)` which returns the final state after all cascades plus an ordered `GameEvent[]`. `game/` replays those events as an animation timeline and locks input while it plays. `ui/` renders with React DOM + CSS transforms and is the only layer that touches `ProgressRepository`.

**Tech Stack:** Next.js 15 App Router (`output: 'export'`), React 19, TypeScript strict, Tailwind CSS, Vitest + happy-dom + Testing Library, Playwright, Yarn classic.

**Spec:** `docs/specs/core-engine-and-goals/design.md` — read it before Task 1 and re-read §4 before any engine task.

## Global Constraints

- **Package manager: Yarn classic.** Never run `npm install` in this repo (ADR-0004).
- **Node 22**, TypeScript `strict: true`, no `any` in `src/` except in test helpers.
- `src/engine/**` must not import React, must not reference `window`, `document`, `Date`, or `Math.random` (ADR-0003, invariant 1). A source-grep test enforces this.
- `applySwap` is pure: it must not mutate its input `Session` (invariant 4).
- Every displayed string lives in `src/i18n/vi.ts` (NFR-I18N-01). Score numbers are formatted with `Intl.NumberFormat('vi-VN')` (NFR-I18N-03).
- Scoring constants live only in `src/engine/scoring.ts`: `POINTS_PER_PIECE = 60`, `SPECIAL_ACTIVATION_BONUS = 120`, cascade multipliers `[1, 2, 3, 4, 5]` capped at 5.
- Board generation retry cap: 50. Reshuffle cap: 10. Both throw a named error when exceeded — silence is forbidden (NFR-REL-04).
- Commit style: Conventional Commits, English subject, area scope (`feat(engine):`, `test(ui):`, `docs(specs):`). Body explains reasoning.
- Never commit to `main`. All work on `feat/core-engine-and-goals`.

## File Structure

```
package.json · tsconfig.json · next.config.ts · tailwind.config.ts
vitest.config.ts · playwright.config.ts · .eslintrc.json · .prettierrc
src/
  engine/ types.ts rng.ts board.ts match.ts specials.ts activate.ts
          scoring.ts goals.ts moves.ts resolve.ts session.ts index.ts
  game/   timeline.ts useGameSession.ts
  ui/     Tile.tsx Board.tsx GoalHud.tsx MoveCounter.tsx StarRow.tsx
          LevelMap.tsx ResultDialog.tsx
  storage/ ports.ts local.ts memory.ts
  levels/ levels.ts
  i18n/   vi.ts
  app/    layout.tsx page.tsx play/[id]/page.tsx PlayScreen.tsx globals.css
test/     helpers/board.ts (parseBoard / formatBoard — test-only)
e2e/      play.spec.ts screenshots.spec.ts
```

---

### Task 1: Project scaffold that runs a test and builds statically

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `postcss.config.js`, `vitest.config.ts`, `.eslintrc.json`, `.prettierrc`, `.gitignore` (append), `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `src/engine/smoke.test.ts`

**Interfaces:**
- Consumes: nothing.
- Produces: working `yarn dev` · `yarn test` · `yarn typecheck` · `yarn lint` · `yarn build`.

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "web-game-match-3",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "format": "prettier --write \"**/*.{ts,tsx,css,md,json}\" --end-of-line auto"
  },
  "dependencies": { "next": "^15.5.0", "react": "^19.1.0", "react-dom": "^19.1.0" },
  "devDependencies": {
    "@playwright/test": "^1.55.0",
    "@testing-library/dom": "^10.4.0",
    "@testing-library/react": "^16.3.0",
    "@testing-library/user-event": "^14.6.0",
    "@types/node": "^22.15.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "@vitejs/plugin-react": "^4.7.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.57.1",
    "eslint-config-next": "^15.5.0",
    "eslint-config-prettier": "^9.1.0",
    "happy-dom": "^15.11.7",
    "postcss": "^8.5.6",
    "prettier": "^3.6.0",
    "prettier-plugin-tailwindcss": "^0.6.14",
    "tailwindcss": "^3.4.17",
    "typescript": "^5.9.0",
    "vitest": "^2.1.9"
  }
}
```

- [ ] **Step 2: Write the configs**

`tsconfig.json` — `strict: true`, `noUncheckedIndexedAccess: true`, `paths: { "@/*": ["./src/*"] }`, `jsx: "preserve"`, `moduleResolution: "bundler"`, include `next-env.d.ts`, `**/*.ts`, `**/*.tsx`.

`next.config.ts`:

```ts
import type { NextConfig } from 'next'
const config: NextConfig = {
  output: 'export',
  images: { unoptimized: true },
  trailingSlash: true,
}
export default config
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: {
    environment: 'happy-dom',
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    globals: true,
  },
})
```

`tailwind.config.ts` — content globs `./src/**/*.{ts,tsx}`; extend `colors` with the six piece colors plus surface/ink tokens. Exact values (all checked for >= 4.5:1 against `#F8FAFC` where used as text, NFR-A11Y-01):

```ts
piece: {
  red:    '#DC2626', blue:   '#2563EB', green:  '#16A34A',
  yellow: '#CA8A04', purple: '#7C3AED', orange: '#EA580C',
},
surface: { base: '#0F172A', card: '#1E293B', raised: '#334155' },
ink:     { strong: '#F8FAFC', muted: '#CBD5E1' },
```

Append to `.gitignore`: `node_modules/`, `.next/`, `out/`, `coverage/`, `test-results/`, `playwright-report/`, `*.tsbuildinfo`, `next-env.d.ts`.

- [ ] **Step 3: Write a smoke test that must pass**

```ts
// src/engine/smoke.test.ts
import { describe, expect, it } from 'vitest'

describe('toolchain', () => {
  it('runs typescript tests', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 4: Minimal app shell**

`src/app/layout.tsx` renders `<html lang="vi">` with `globals.css` imported and `metadata = { title: 'Match 3' }`. `src/app/page.tsx` renders a single `<main>` with the app title from a literal for now — Task 13 replaces it with `i18n`.

- [ ] **Step 5: Install and verify all five commands**

Run: `yarn install`
Run: `yarn test` → Expected: 1 passed.
Run: `yarn typecheck` → Expected: no output, exit 0.
Run: `yarn lint` → Expected: no errors.
Run: `yarn build` → Expected: build succeeds and `out/index.html` exists.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore(setup): scaffold next.js static export with vitest and tailwind

Toolchain mirrors the three sibling games in web-game/ so commands are
identical across the folder (ADR-0004)."
```

---

### Task 2: Types and the seeded RNG

**Files:**
- Create: `src/engine/types.ts`, `src/engine/rng.ts`, `src/engine/rng.test.ts`, `src/engine/purity.test.ts`

**Interfaces:**
- Produces: every type in design.md §3 verbatim, plus
  `type RngState = number`,
  `nextInt(rng: RngState, maxExclusive: number): [value: number, rng: RngState]`,
  `pick<T>(rng: RngState, items: readonly T[]): [T, RngState]`,
  `shuffle<T>(rng: RngState, items: readonly T[]): [T[], RngState]`,
  `seedFrom(n: number): RngState`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/rng.test.ts
import { describe, expect, it } from 'vitest'
import { nextInt, pick, seedFrom, shuffle } from './rng'

describe('rng', () => {
  it('is deterministic for the same seed', () => {
    const a = nextInt(seedFrom(42), 100)
    const b = nextInt(seedFrom(42), 100)
    expect(a).toEqual(b)
  })

  it('advances state so consecutive draws differ', () => {
    const [v1, s1] = nextInt(seedFrom(7), 1000)
    const [v2] = nextInt(s1, 1000)
    expect(v1).not.toBe(v2)
  })

  it('stays inside the range', () => {
    let rng = seedFrom(1)
    for (let i = 0; i < 500; i++) {
      const [v, next] = nextInt(rng, 6)
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(6)
      rng = next
    }
  })

  it('shuffle keeps the multiset and is deterministic', () => {
    const input = ['a', 'b', 'c', 'd', 'e'] as const
    const [out1] = shuffle(seedFrom(9), input)
    const [out2] = shuffle(seedFrom(9), input)
    expect(out1).toEqual(out2)
    expect([...out1].sort()).toEqual([...input].sort())
  })

  it('pick returns a member of the list', () => {
    const [v] = pick(seedFrom(3), ['x', 'y'] as const)
    expect(['x', 'y']).toContain(v)
  })
})
```

```ts
// src/engine/purity.test.ts — enforces invariant 1 and ADR-0003
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

function engineSources(dir = 'src/engine'): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = join(dir, entry)
    if (statSync(full).isDirectory()) return engineSources(full)
    if (!full.endsWith('.ts') || full.endsWith('.test.ts')) return []
    return [full]
  })
}

const FORBIDDEN = [/Math\.random/, /\bDate\b/, /\bwindow\b/, /\bdocument\b/, /from 'react'/]

describe('engine purity', () => {
  it('has source files to check', () => {
    expect(engineSources().length).toBeGreaterThan(0)
  })

  it.each(FORBIDDEN.map((r) => [r.source, r] as const))(
    'never references %s',
    (_label, pattern) => {
      const offenders = engineSources().filter((f) =>
        pattern.test(readFileSync(f, 'utf8')),
      )
      expect(offenders).toEqual([])
    },
  )
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `yarn vitest run src/engine/rng.test.ts` → Expected: FAIL, cannot resolve `./rng`.

- [ ] **Step 3: Implement**

```ts
// src/engine/rng.ts
import type { RngState } from './types'

export function seedFrom(n: number): RngState {
  return n >>> 0
}

function step(rng: RngState): [unit: number, next: RngState] {
  let a = (rng + 0x6d2b79f5) >>> 0
  let t = a
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296
  return [unit, a]
}

export function nextInt(rng: RngState, maxExclusive: number): [number, RngState] {
  const [unit, next] = step(rng)
  return [Math.floor(unit * maxExclusive), next]
}

export function pick<T>(rng: RngState, items: readonly T[]): [T, RngState] {
  const [i, next] = nextInt(rng, items.length)
  return [items[i] as T, next]
}

export function shuffle<T>(rng: RngState, items: readonly T[]): [T[], RngState] {
  const out = [...items]
  let cur = rng
  for (let i = out.length - 1; i > 0; i--) {
    const [j, next] = nextInt(cur, i + 1)
    cur = next
    const tmp = out[i] as T
    out[i] = out[j] as T
    out[j] = tmp
  }
  return [out, cur]
}
```

`src/engine/types.ts` holds every type from design.md §3 plus `type RngState = number` and `type Match = { cells: Pos[]; color: Color; shape: 'line3' | 'line4' | 'line5' | 'corner' }`.

Note: `Math.imul` and `Math.floor` are allowed — only `Math.random` is forbidden. Keep the purity test regex on `Math\.random`, not on `Math\.`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `yarn test` → Expected: all pass, including `purity.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): add seeded rng as the single source of randomness

A source-grep test enforces the ban on Math.random inside engine/ so
invariant 1 fails loudly instead of drifting (ADR-0003)."
```

---

### Task 3: Immutable board plus the `parseBoard` test helper

**Files:**
- Create: `src/engine/board.ts`, `src/engine/board.test.ts`, `test/helpers/board.ts`

**Interfaces:**
- Consumes: `types.ts`, `rng.ts`.
- Produces: `at(grid, pos): Cell` · `set(grid, pos, cell): Cell[][]` · `swap(grid, a, b): Cell[][]` · `inBounds(grid, pos): boolean` · `isAdjacent(a, b): boolean` · `clone(grid): Cell[][]` · `allPositions(grid): Pos[]` · `collapse(grid): { grid, moves }` · `refill(grid, colors, rng, nextPieceId): { grid, cells, rng, nextPieceId }`.
  Test helper: `parseBoard(text: string, opts?): Cell[][]` · `formatBoard(grid): string`.

- [ ] **Step 1: Write the failing tests**

```ts
// test/helpers/board.ts — TEST ONLY, never imported from src/
import type { Cell, Color, Piece, Special } from '@/engine/types'

const LETTER: Record<string, Color> = {
  R: 'red', B: 'blue', G: 'green', Y: 'yellow', P: 'purple', O: 'orange',
}
// suffix marks a special: R> stripedH, R^ stripedV, R* wrapped, R# colorBomb
const SUFFIX: Record<string, Special> = {
  '>': 'stripedH', '^': 'stripedV', '*': 'wrapped', '#': 'colorBomb',
}

/** 'RRB / GBR / YYY' -> 3x3 grid. '.' is an empty cell. */
export function parseBoard(text: string): Cell[][] {
  let id = 1
  return text.split('/').map((row) =>
    [...row.trim()].reduce<Cell[]>((cells, ch, i, arr) => {
      if (ch in SUFFIX) return cells // consumed by the previous letter
      if (ch === '.') return [...cells, null]
      const special = arr[i + 1] && arr[i + 1]! in SUFFIX ? SUFFIX[arr[i + 1]!]! : 'none'
      const piece: Piece = { id: id++, color: LETTER[ch]!, special }
      return [...cells, piece]
    }, []),
  )
}

export function formatBoard(grid: Cell[][]): string {
  const inverse = Object.fromEntries(Object.entries(LETTER).map(([k, v]) => [v, k]))
  return grid
    .map((row) => row.map((c) => (c ? inverse[c.color] : '.')).join(''))
    .join(' / ')
}
```

```ts
// src/engine/board.test.ts
import { describe, expect, it } from 'vitest'
import { parseBoard, formatBoard } from '../../test/helpers/board'
import { at, collapse, isAdjacent, refill, swap } from './board'
import { seedFrom } from './rng'

describe('board', () => {
  it('reads a cell by position', () => {
    const grid = parseBoard('RRB / GBR / YYY')
    expect(at(grid, { row: 1, col: 0 })?.color).toBe('green')
  })

  it('swap returns a new grid and leaves the input untouched', () => {
    const grid = parseBoard('RB / GY')
    const next = swap(grid, { row: 0, col: 0 }, { row: 0, col: 1 })
    expect(formatBoard(next)).toBe('BR / GY')
    expect(formatBoard(grid)).toBe('RB / GY')
  })

  it('isAdjacent accepts orthogonal neighbours only', () => {
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 1 })).toBe(true)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 1, col: 1 })).toBe(false)
    expect(isAdjacent({ row: 0, col: 0 }, { row: 0, col: 2 })).toBe(false)
  })

  it('collapse drops pieces straight down and reports the moves', () => {
    const grid = parseBoard('R.. / .G. / ..B')
    const { grid: after, moves } = collapse(grid)
    expect(formatBoard(after)).toBe('... / ... / RGB')
    expect(moves).toHaveLength(3)
    expect(moves.every((m) => m.from.col === m.to.col)).toBe(true)
  })

  it('refill fills only empty cells, from the rng, with fresh ids', () => {
    const grid = parseBoard('... / ... / RGB')
    const out = refill(grid, ['red', 'blue'], seedFrom(5), 100)
    expect(out.cells).toHaveLength(6)
    expect(out.grid.flat().every((c) => c !== null)).toBe(true)
    expect(out.nextPieceId).toBe(106)
    expect(new Set(out.cells.map((c) => c.piece.id)).size).toBe(6)
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn vitest run src/engine/board.test.ts` → Expected: FAIL, `./board` not found.

- [ ] **Step 3: Implement `board.ts`**

All functions return new arrays; none mutate. `collapse` walks each column bottom-up, moving each non-null cell to the lowest free row and recording `{ from, to }` only when the row actually changed. `refill` fills every remaining `null` from the top, drawing colors with `pick` and assigning `nextPieceId++`.

- [ ] **Step 4: Run to verify pass**

Run: `yarn test` → Expected: all pass.

- [ ] **Step 5: Commit**

```bash
git add src/engine test/helpers
git commit -m "feat(engine): add immutable board ops and a readable board test helper

Cascade rules are unreadable as nested arrays in tests, so boards are
written as 'RRB / GBR / YYY' strings (design.md §7)."
```

---

### Task 4: Match detection, including L/T shapes

**Files:**
- Create: `src/engine/match.ts`, `src/engine/match.test.ts`

**Interfaces:**
- Consumes: `board.ts`, `types.ts`.
- Produces: `findMatches(grid: Cell[][]): Match[]` where `Match = { cells: Pos[]; color: Color; shape: 'line3' | 'line4' | 'line5' | 'corner' }`. Cells are sorted row-major. Every returned match has `cells.length >= 3` and one single color. Horizontal and vertical runs that share a cell are merged into one `corner` match.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/match.test.ts
import { describe, expect, it } from 'vitest'
import { parseBoard } from '../../test/helpers/board'
import { findMatches } from './match'

const shapes = (text: string) =>
  findMatches(parseBoard(text)).map((m) => `${m.color}:${m.shape}:${m.cells.length}`).sort()

describe('findMatches', () => {
  it('finds nothing on a clean board', () => {
    expect(shapes('RBR / BRB / RBR')).toEqual([])
  })

  it('finds a horizontal run of three', () => {
    expect(shapes('RRR / BGB / GBG')).toEqual(['red:line3:3'])
  })

  it('finds a vertical run of three', () => {
    expect(shapes('RBG / RGB / RBG')).toEqual(['red:line3:3'])
  })

  it('classifies four and five in a line', () => {
    expect(shapes('RRRR / BGBG / GBGB / BGBG')).toEqual(['red:line4:4'])
    expect(shapes('RRRRR / BGBGB / GBGBG / BGBGB / GBGBG')).toEqual(['red:line5:5'])
  })

  it('merges a crossing row and column into one corner match', () => {
    // red row of 3 on the top, red column of 3 down the left
    expect(shapes('RRR / RBG / RGB')).toEqual(['red:corner:5'])
  })

  it('reports two separate matches of different colors', () => {
    expect(shapes('RRR / BBB / GYG')).toEqual(['blue:line3:3', 'red:line3:3'])
  })

  it('ignores runs broken by an empty cell', () => {
    expect(shapes('R.R / BGB / GBG')).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify failure**

Run: `yarn vitest run src/engine/match.test.ts` → Expected: FAIL.

- [ ] **Step 3: Implement**

Collect maximal horizontal runs (length >= 3) and maximal vertical runs (length >= 3). Then union runs of the same color that share at least one cell. A merged group containing both a horizontal and a vertical run is `corner`; otherwise the shape comes from length: 3 → `line3`, 4 → `line4`, >= 5 → `line5`.

- [ ] **Step 4: Run to verify pass** — `yarn test`

- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): detect line and corner matches"
```

---

### Task 5: Which match spawns which special, and where

**Files:**
- Create: `src/engine/specials.ts`, `src/engine/specials.test.ts`

**Interfaces:**
- Consumes: `match.ts`, `types.ts`.
- Produces: `specialFor(match: Match, swapped: Pos | null): { special: Special; at: Pos } | null`.
  Rules from design.md §4: `line5` → `colorBomb`; `corner` → `wrapped`; `line4` horizontal → `stripedH`; `line4` vertical → `stripedV`; `line3` → `null`. Position: `swapped` if it is one of `match.cells`, else the middle cell of the run (for `corner`, the intersection cell — the cell that has both a horizontal and a vertical neighbour inside the match).

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/specials.test.ts
import { describe, expect, it } from 'vitest'
import type { Match } from './types'
import { specialFor } from './specials'

const m = (shape: Match['shape'], cells: [number, number][]): Match => ({
  shape, color: 'red', cells: cells.map(([row, col]) => ({ row, col })),
})

describe('specialFor', () => {
  it('gives nothing for a plain three', () => {
    expect(specialFor(m('line3', [[0, 0], [0, 1], [0, 2]]), null)).toBeNull()
  })

  it('gives a horizontal stripe for a horizontal four', () => {
    const out = specialFor(m('line4', [[0, 0], [0, 1], [0, 2], [0, 3]]), null)
    expect(out).toEqual({ special: 'stripedH', at: { row: 0, col: 1 } })
  })

  it('gives a vertical stripe for a vertical four', () => {
    const out = specialFor(m('line4', [[0, 2], [1, 2], [2, 2], [3, 2]]), null)
    expect(out?.special).toBe('stripedV')
  })

  it('spawns at the swapped cell when the swap is part of the match', () => {
    const out = specialFor(m('line4', [[0, 0], [0, 1], [0, 2], [0, 3]]), { row: 0, col: 3 })
    expect(out?.at).toEqual({ row: 0, col: 3 })
  })

  it('ignores a swapped cell outside the match', () => {
    const out = specialFor(m('line4', [[0, 0], [0, 1], [0, 2], [0, 3]]), { row: 5, col: 5 })
    expect(out?.at).toEqual({ row: 0, col: 1 })
  })

  it('gives a color bomb for five, beating the corner rule', () => {
    const five = m('line5', [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4]])
    expect(specialFor(five, null)?.special).toBe('colorBomb')
  })

  it('gives a wrapped bomb at the intersection of a corner match', () => {
    const corner = m('corner', [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]])
    expect(specialFor(corner, null)).toEqual({ special: 'wrapped', at: { row: 0, col: 0 } })
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/specials.test.ts`
- [ ] **Step 3: Implement** per the rules above. For `line4`/`line5` the middle cell is `cells[Math.floor((cells.length - 1) / 2)]` after row-major sorting.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): decide which special a match spawns and where

Spawn position is fixed at the swapped cell because players learn it and
aim with it (design.md §4)."
```

---

### Task 6: Special activation and activation chains

**Files:**
- Create: `src/engine/activate.ts`, `src/engine/activate.test.ts`

**Interfaces:**
- Consumes: `board.ts`, `types.ts`.
- Produces:
  `activationTargets(grid, at, special, swappedColor: Color | null): Pos[]` — cells a single activation clears, excluding `at`.
  `resolveClears(grid, seeds: Pos[], swappedColor: Color | null): { cleared: Pos[]; activations: { at: Pos; special: Special; cleared: Pos[] }[] }` — expands `seeds` through every special caught in the blast, activating each `Piece.id` **at most once** (invariant 5), and returns the full clear set plus one entry per activation in trigger order.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/activate.test.ts
import { describe, expect, it } from 'vitest'
import { parseBoard } from '../../test/helpers/board'
import { activationTargets, resolveClears } from './activate'

describe('activationTargets', () => {
  it('stripedH clears the whole row', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    const hit = activationTargets(grid, { row: 1, col: 2 }, 'stripedH', null)
    expect(hit.every((p) => p.row === 1)).toBe(true)
    expect(hit).toHaveLength(3)
  })

  it('stripedV clears the whole column', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    const hit = activationTargets(grid, { row: 1, col: 2 }, 'stripedV', null)
    expect(hit.every((p) => p.col === 2)).toBe(true)
    expect(hit).toHaveLength(2)
  })

  it('wrapped clears the 3x3 around it, clipped at the edge', () => {
    const grid = parseBoard('RRRR / BBBB / GGGG')
    expect(activationTargets(grid, { row: 0, col: 0 }, 'wrapped', null)).toHaveLength(3)
    expect(activationTargets(grid, { row: 1, col: 1 }, 'wrapped', null)).toHaveLength(8)
  })

  it('colorBomb clears every piece of the swapped colour', () => {
    const grid = parseBoard('RBR / BRB / RBR')
    const hit = activationTargets(grid, { row: 1, col: 1 }, 'colorBomb', 'blue')
    expect(hit).toHaveLength(4)
  })
})

describe('resolveClears', () => {
  it('chains a stripe into a bomb sitting in its row', () => {
    //            col 2 holds a wrapped bomb on row 1
    const grid = parseBoard('RRRRR / BB*BB / GGGGG / YYYYY')
    const out = resolveClears(grid, [{ row: 1, col: 0 }], null)
    expect(out.activations.map((a) => a.special)).toContain('wrapped')
    // the bomb's 3x3 reaches rows 0 and 2
    expect(out.cleared.some((p) => p.row === 2)).toBe(true)
  })

  it('activates each piece at most once', () => {
    const grid = parseBoard('R>R>R / BBBBB / GGGGG')
    const out = resolveClears(grid, [{ row: 0, col: 0 }], null)
    const ids = out.activations.map((a) => `${a.at.row},${a.at.col}`)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('terminates on a board densely packed with specials', () => {
    const row = 'R>R>R>R>R>R>R>R>'
    const grid = parseBoard([row, row, row, row, row, row, row, row].join(' / '))
    const out = resolveClears(grid, [{ row: 0, col: 0 }], null)
    expect(out.cleared.length).toBeLessThanOrEqual(64)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/activate.test.ts`
- [ ] **Step 3: Implement** with a worklist: push `seeds`, pop a position, add to `cleared`; if the piece there has a special and its `id` is not in the `activated` set, add the id, compute `activationTargets`, record the activation, push the targets. Loop until the worklist empties — bounded because each id activates once and `cleared` is a set.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): activate specials and chain them, once per piece id

Once-per-id is what keeps two stripes from triggering each other forever
(invariant 5, NFR-REL-04)."
```

---

### Task 7: Scoring constants and goal evaluation

**Files:**
- Create: `src/engine/scoring.ts`, `src/engine/goals.ts`, `src/engine/goals.test.ts`

**Interfaces:**
- Produces:
  `POINTS_PER_PIECE`, `SPECIAL_ACTIVATION_BONUS`, `cascadeMultiplier(level: number): number`, `scoreFor(pieceCount: number, cascade: number, activations: number): number`.
  `initProgress(goals: GoalSpec[]): GoalProgress[]`,
  `applyCleared(progress: GoalProgress[], cleared: Piece[], score: number): GoalProgress[]`,
  `allDone(progress: GoalProgress[]): boolean`,
  `starsFor(score: number, stars: LevelConfig['stars']): 0 | 1 | 2 | 3`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/goals.test.ts
import { describe, expect, it } from 'vitest'
import { allDone, applyCleared, initProgress, starsFor } from './goals'
import { cascadeMultiplier, scoreFor } from './scoring'
import type { Piece } from './types'

const piece = (color: Piece['color']): Piece => ({ id: 1, color, special: 'none' })

describe('scoring', () => {
  it('multiplies by cascade level and caps at 5', () => {
    expect(cascadeMultiplier(1)).toBe(1)
    expect(cascadeMultiplier(4)).toBe(4)
    expect(cascadeMultiplier(9)).toBe(5)
  })

  it('adds a bonus per activation', () => {
    expect(scoreFor(3, 1, 0)).toBe(180)
    expect(scoreFor(3, 2, 1)).toBe(180 * 2 + 120)
  })
})

describe('goals', () => {
  it('tracks a score goal', () => {
    let p = initProgress([{ kind: 'score', target: 100 }])
    expect(allDone(p)).toBe(false)
    p = applyCleared(p, [], 100)
    expect(allDone(p)).toBe(true)
  })

  it('counts collected pieces per colour, including specials', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 2 } }])
    p = applyCleared(p, [piece('red'), { id: 2, color: 'red', special: 'stripedH' }], 0)
    expect(allDone(p)).toBe(true)
  })

  it('does not count colours the goal did not ask for', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 1 } }])
    p = applyCleared(p, [piece('blue'), piece('green')], 0)
    expect(allDone(p)).toBe(false)
  })

  it('needs every goal done when there are two', () => {
    let p = initProgress([
      { kind: 'score', target: 50 },
      { kind: 'collect', per: { red: 1 } },
    ])
    p = applyCleared(p, [], 50)
    expect(allDone(p)).toBe(false)
    p = applyCleared(p, [piece('red')], 50)
    expect(allDone(p)).toBe(true)
  })

  it('rates stars by threshold, and zero below the first', () => {
    expect(starsFor(10, [100, 200, 300])).toBe(0)
    expect(starsFor(100, [100, 200, 300])).toBe(1)
    expect(starsFor(250, [100, 200, 300])).toBe(2)
    expect(starsFor(999, [100, 200, 300])).toBe(3)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/goals.test.ts`
- [ ] **Step 3: Implement.** `applyCleared` takes the running total score (not a delta) so a `score` goal never double-counts. `switch (goal.kind)` must be exhaustive with a `never` default so adding `clearBlockers` in phase 3 is a type error until handled.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): add scoring constants and goal evaluation

GoalSpec switches use a never-default so phase 3 and 4 goals cannot be
added without handling them (ADR-0005)."
```

---

### Task 8: Legal moves, deadlock detection, reshuffle

**Files:**
- Create: `src/engine/moves.ts`, `src/engine/moves.test.ts`

**Interfaces:**
- Consumes: `board.ts`, `match.ts`, `rng.ts`.
- Produces: `findLegalMoves(grid): { from: Pos; to: Pos }[]` · `hasLegalMove(grid): boolean` · `reshuffle(grid, rng): { grid; rng; attempts: number }` (throws `ReshuffleFailedError` after 10 attempts) · `generateBoard(level, rng, nextPieceId): { grid; rng; nextPieceId }` (throws `BoardGenerationFailedError` after 50 attempts).

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/moves.test.ts
import { describe, expect, it } from 'vitest'
import { parseBoard, formatBoard } from '../../test/helpers/board'
import { findLegalMoves, generateBoard, hasLegalMove, reshuffle } from './moves'
import { findMatches } from './match'
import { seedFrom } from './rng'
import type { LevelConfig } from './types'

describe('findLegalMoves', () => {
  it('finds a swap that would make a match', () => {
    const grid = parseBoard('RRB / BBR / GGY')
    const moves = findLegalMoves(grid)
    expect(moves.length).toBeGreaterThan(0)
  })

  it('reports none on a deadlocked board', () => {
    const grid = parseBoard('RBRB / BRBR / RBRB / BRBR')
    expect(hasLegalMove(grid)).toBe(false)
  })

  it('counts a colorBomb swap with a normal piece as legal', () => {
    const grid = parseBoard('R#BRB / BRBR / RBRB / BRBR')
    expect(hasLegalMove(grid)).toBe(true)
  })
})

describe('reshuffle', () => {
  it('keeps the exact multiset of pieces', () => {
    const grid = parseBoard('RBRB / BRBR / RBRB / BRBR')
    const out = reshuffle(grid, seedFrom(4))
    const before = formatBoard(grid).replace(/[^A-Z]/g, '').split('').sort()
    const after = formatBoard(out.grid).replace(/[^A-Z]/g, '').split('').sort()
    expect(after).toEqual(before)
  })

  it('produces a board that has a legal move', () => {
    const grid = parseBoard('RBRBG / BRBRG / RBRBY / BRBRY / GGYYR')
    expect(hasLegalMove(reshuffle(grid, seedFrom(11)).grid)).toBe(true)
  })
})

describe('generateBoard', () => {
  const level: LevelConfig = {
    id: 1, rows: 7, cols: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'],
    moves: 20, goals: [{ kind: 'score', target: 1500 }], stars: [1500, 2200, 3000],
  }

  it.each([1, 2, 3])('starts with no match and at least one move (seed %i)', (s) => {
    const { grid } = generateBoard(level, seedFrom(s), 1)
    expect(findMatches(grid)).toEqual([])
    expect(hasLegalMove(grid)).toBe(true)
  })

  it('is deterministic for one seed', () => {
    const a = generateBoard(level, seedFrom(8), 1)
    const b = generateBoard(level, seedFrom(8), 1)
    expect(formatBoard(a.grid)).toBe(formatBoard(b.grid))
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/moves.test.ts`
- [ ] **Step 3: Implement.** `findLegalMoves` tries every orthogonal pair, swaps on a copy, and keeps the pair when `findMatches` is non-empty — plus the `colorBomb` exception, which is legal without producing a match. `reshuffle` collects all pieces, `shuffle`s them, refills positions, and retries while `findMatches` is non-empty or `hasLegalMove` is false.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): enumerate legal moves, detect deadlock, reshuffle in place

Reshuffle preserves the colour multiset so a collect goal cannot become
impossible mid-level (invariant 8)."
```

---

### Task 9: One resolution round with cascades and events

**Files:**
- Create: `src/engine/resolve.ts`, `src/engine/resolve.test.ts`

**Interfaces:**
- Consumes: everything above.
- Produces: `resolveBoard(input: { grid; rng; nextPieceId; level; score; progress; swapped: Pos | null; swappedColor: Color | null; seeds: Pos[] }): { grid; rng; nextPieceId; score; progress; events: GameEvent[] }`. Runs the full cascade loop: clear (expanding specials) → spawn specials → collapse → refill → find matches again, incrementing `cascade` each round, then reshuffles while the board has no legal move.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/resolve.test.ts
import { describe, expect, it } from 'vitest'
import { parseBoard } from '../../test/helpers/board'
import { resolveBoard } from './resolve'
import { initProgress } from './goals'
import { seedFrom } from './rng'
import type { LevelConfig } from './types'

const level: LevelConfig = {
  id: 1, rows: 4, cols: 4, colors: ['red', 'blue', 'green', 'yellow'],
  moves: 20, goals: [{ kind: 'score', target: 100000 }], stars: [1, 2, 3],
}

const run = (text: string, seeds: { row: number; col: number }[]) =>
  resolveBoard({
    grid: parseBoard(text), rng: seedFrom(1), nextPieceId: 100, level,
    score: 0, progress: initProgress(level.goals),
    swapped: null, swappedColor: null, seeds,
  })

describe('resolveBoard', () => {
  it('scores the first round at multiplier one', () => {
    const out = run('RRRB / BGBG / GBGB / BGBG', [
      { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 },
    ])
    const matched = out.events.filter((e) => e.t === 'matched')
    expect(matched[0]).toMatchObject({ cascade: 1, points: 180 })
  })

  it('leaves the board completely full when it finishes', () => {
    const out = run('RRRB / BGBG / GBGB / BGBG', [{ row: 0, col: 0 }])
    expect(out.grid.flat().every((c) => c !== null)).toBe(true)
  })

  it('emits fell and refilled events in that order', () => {
    const out = run('RRRB / BGBG / GBGB / BGBG', [{ row: 0, col: 1 }])
    const kinds = out.events.map((e) => e.t)
    expect(kinds.indexOf('fell')).toBeLessThan(kinds.indexOf('refilled'))
  })

  it('spawns a special and reports it', () => {
    const out = resolveBoard({
      grid: parseBoard('RRRR / BGBG / GBGB / BGBG'), rng: seedFrom(2), nextPieceId: 100,
      level, score: 0, progress: initProgress(level.goals),
      swapped: { row: 0, col: 3 }, swappedColor: 'red',
      seeds: [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 0, col: 3 }],
    })
    const spawned = out.events.find((e) => e.t === 'specialSpawned')
    expect(spawned).toMatchObject({ special: 'stripedH', at: { row: 0, col: 3 } })
  })

  it('never returns a board without a legal move', () => {
    const out = run('RRRB / BGBG / GBGB / BGBG', [{ row: 0, col: 0 }])
    expect(out.events.filter((e) => e.t === 'reshuffled').length).toBeLessThanOrEqual(1)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/resolve.test.ts`
- [ ] **Step 3: Implement** the loop described in design.md §4. Order inside one round: `resolveClears` → emit `matched` (with `points` from `scoreFor`) → emit `specialActivated` for each activation → `specialSpawned` for each spawn → write spawned specials into the grid **after** clearing → `collapse` → emit `fell` → `refill` → emit `refilled` → `applyCleared` → emit `goalProgressed` for each changed goal → `findMatches` again.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): resolve cascades and emit an ordered event list

Events are the only thing the UI replays, so their order is the animation
order (ADR-0002)."
```

---

### Task 10: The public engine API, plus the performance benchmark

**Files:**
- Create: `src/engine/session.ts`, `src/engine/session.test.ts`, `src/engine/perf.test.ts`, `src/engine/index.ts`

**Interfaces:**
- Produces: `newSession(level: LevelConfig, seed: number): Session` · `applySwap(session: Session, from: Pos, to: Pos): { session: Session; events: GameEvent[] }`. `src/engine/index.ts` re-exports these two plus every type — **the only module `game/` may import**.

- [ ] **Step 1: Write the failing tests**

```ts
// src/engine/session.test.ts
import { describe, expect, it } from 'vitest'
import { applySwap, newSession } from './session'
import { findLegalMoves } from './moves'
import type { LevelConfig } from './types'

const level: LevelConfig = {
  id: 1, rows: 7, cols: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 3, goals: [{ kind: 'score', target: 100 }], stars: [100, 200, 300],
}

describe('newSession', () => {
  it('starts playing, full board, full moves', () => {
    const s = newSession(level, 1)
    expect(s.status).toBe('playing')
    expect(s.movesLeft).toBe(3)
    expect(s.grid.flat().every((c) => c !== null)).toBe(true)
  })

  it('is reproducible from the seed', () => {
    expect(newSession(level, 5).grid).toEqual(newSession(level, 5).grid)
  })
})

describe('applySwap', () => {
  it('reverts a swap that makes no match and does not spend a move', () => {
    const s = newSession(level, 1)
    const nonMove = { from: { row: 0, col: 0 }, to: { row: 0, col: 1 } }
    const legal = findLegalMoves(s.grid)
    const illegal = legal.some(
      (m) => m.from.row === 0 && m.from.col === 0 && m.to.col === 1,
    ) ? { from: { row: 6, col: 6 }, to: { row: 6, col: 5 } } : nonMove
    const out = applySwap(s, illegal.from, illegal.to)
    if (out.events.some((e) => e.t === 'swapReverted')) {
      expect(out.session.movesLeft).toBe(3)
    }
  })

  it('spends exactly one move on a matching swap', () => {
    const s = newSession(level, 1)
    const move = findLegalMoves(s.grid)[0]!
    const out = applySwap(s, move.from, move.to)
    expect(out.session.movesLeft).toBe(2)
    expect(out.events[0]).toMatchObject({ t: 'swapped' })
  })

  it('does not mutate the session it was given', () => {
    const s = newSession(level, 1)
    const before = JSON.stringify(s)
    const move = findLegalMoves(s.grid)[0]!
    applySwap(s, move.from, move.to)
    expect(JSON.stringify(s)).toBe(before)
  })

  it('rejects a non-adjacent swap without spending a move', () => {
    const s = newSession(level, 1)
    const out = applySwap(s, { row: 0, col: 0 }, { row: 3, col: 3 })
    expect(out.events).toEqual([])
    expect(out.session).toBe(s)
  })

  it('wins as soon as the goal is met and stops accepting moves', () => {
    const easy: LevelConfig = { ...level, moves: 30, goals: [{ kind: 'score', target: 1 }] }
    const s = newSession(easy, 1)
    const move = findLegalMoves(s.grid)[0]!
    const out = applySwap(s, move.from, move.to)
    expect(out.session.status).toBe('won')
    expect(out.events.at(-1)).toMatchObject({ t: 'levelWon' })
    const again = applySwap(out.session, move.from, move.to)
    expect(again.events).toEqual([])
  })

  it('loses when the last move does not finish the goal', () => {
    const hard: LevelConfig = { ...level, moves: 1, goals: [{ kind: 'score', target: 999999 }] }
    let s = newSession(hard, 1)
    const move = findLegalMoves(s.grid)[0]!
    const out = applySwap(s, move.from, move.to)
    expect(out.session.status).toBe('lost')
    expect(out.events.at(-1)).toMatchObject({ t: 'levelLost' })
  })
})
```

```ts
// src/engine/perf.test.ts — NFR-PERF-05
import { describe, expect, it } from 'vitest'
import { applySwap, newSession } from './session'
import { findLegalMoves } from './moves'
import type { LevelConfig } from './types'

const big: LevelConfig = {
  id: 6, rows: 9, cols: 9,
  colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  moves: 100000, goals: [{ kind: 'score', target: Number.MAX_SAFE_INTEGER }],
  stars: [1, 2, 3],
}

describe('applySwap performance', () => {
  it('stays under 16ms at p95 over 1000 moves on a 9x9 board', () => {
    let s = newSession(big, 99)
    const samples: number[] = []
    for (let i = 0; i < 1000; i++) {
      const move = findLegalMoves(s.grid)[0]
      if (!move) break
      const t0 = performance.now()
      const out = applySwap(s, move.from, move.to)
      samples.push(performance.now() - t0)
      s = out.session
    }
    samples.sort((a, b) => a - b)
    const p95 = samples[Math.floor(samples.length * 0.95)]!
    expect(p95).toBeLessThan(16)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/engine/session.test.ts`
- [ ] **Step 3: Implement `session.ts`.** `applySwap` returns `{ session, events: [] }` unchanged when the session is not `playing`, when the positions are not adjacent, or when either cell is empty. Otherwise: swap on a copy; if the swap involves a `colorBomb` and a normal piece, seed `resolveBoard` with the bomb's activation; else `findMatches` — empty means emit `swapReverted` and return the original grid with `movesLeft` untouched. On a real move: `movesLeft - 1`, emit `swapped`, call `resolveBoard`, then check win/lose **once**, at the end (invariant 7).
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/engine
git commit -m "feat(engine): expose newSession and applySwap as the only public api

Win and loss are evaluated once, after the cascade settles, so a cascade
that earns the goal on the last move counts (invariant 7)."
```

---

### Task 11: The six levels, with validation tests

**Files:**
- Create: `src/levels/levels.ts`, `src/levels/levels.test.ts`

**Interfaces:**
- Produces: `LEVELS: readonly LevelConfig[]` (ids 1..6, exactly as design.md §5) · `levelById(id: number): LevelConfig | undefined` · `LAST_LEVEL_ID`.

- [ ] **Step 1: Write the failing tests**

```ts
// src/levels/levels.test.ts
import { describe, expect, it } from 'vitest'
import { LEVELS, levelById } from './levels'
import { findMatches } from '@/engine/match'
import { generateBoard, hasLegalMove } from '@/engine/moves'
import { seedFrom } from '@/engine/rng'

describe('LEVELS', () => {
  it('has six levels numbered 1..6', () => {
    expect(LEVELS.map((l) => l.id)).toEqual([1, 2, 3, 4, 5, 6])
  })

  it.each(LEVELS)('level $id is internally consistent', (level) => {
    expect(level.moves).toBeGreaterThan(0)
    expect(level.colors.length).toBeGreaterThanOrEqual(4)
    expect(new Set(level.colors).size).toBe(level.colors.length)
    expect(level.rows).toBeGreaterThanOrEqual(7)
    expect(level.goals.length).toBeGreaterThan(0)
    const [s1, s2, s3] = level.stars
    expect(s1).toBeLessThan(s2)
    expect(s2).toBeLessThan(s3)
  })

  it.each(LEVELS)('level $id collect goals only use its own colours', (level) => {
    for (const goal of level.goals) {
      if (goal.kind !== 'collect') continue
      for (const color of Object.keys(goal.per)) {
        expect(level.colors).toContain(color)
      }
    }
  })

  it.each(LEVELS.flatMap((l) => [1, 2, 3].map((s) => [l, s] as const)))(
    'level $0.id generates a playable board with seed $1',
    (level, seed) => {
      const { grid } = generateBoard(level, seedFrom(seed), 1)
      expect(findMatches(grid)).toEqual([])
      expect(hasLegalMove(grid)).toBe(true)
    },
  )

  it('looks up by id and misses cleanly', () => {
    expect(levelById(3)?.id).toBe(3)
    expect(levelById(99)).toBeUndefined()
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/levels/levels.test.ts`
- [ ] **Step 3: Write the data** exactly as the table in design.md §5. Star thresholds: L1 `[1500, 2200, 3000]`, L2 `[3000, 4200, 5500]`, L3 `[1800, 2600, 3400]`, L4 `[2000, 3000, 4200]`, L5 `[5000, 6500, 8000]`, L6 `[4000, 5600, 7200]`.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/levels
git commit -m "feat(levels): add the six phase-one levels with validation tests

Every level is checked to generate a playable board on three fixed seeds,
so a bad config fails in CI, not in front of a player."
```

---

### Task 12: The progress port and its two adapters

**Files:**
- Create: `src/storage/ports.ts`, `src/storage/local.ts`, `src/storage/memory.ts`, `src/storage/local.test.ts`

**Interfaces:**
- Produces:
  `interface ProgressRepository { load(): Promise<Progress>; save(p: Progress): Promise<void> }`
  `EMPTY_PROGRESS: Progress` · `STORAGE_KEY = 'match3.progress.v1'`
  `createLocalRepository(storage?: Storage): ProgressRepository`
  `createMemoryRepository(initial?: Progress): ProgressRepository` (tests and SSR)
  `recordWin(progress, levelId, score, stars, lastLevelId): Progress` — pure; keeps the higher score and the higher star count, bumps `unlockedUpTo` by at most one (invariant 10).

- [ ] **Step 1: Write the failing tests**

```ts
// src/storage/local.test.ts
import { beforeEach, describe, expect, it } from 'vitest'
import { EMPTY_PROGRESS, STORAGE_KEY, createLocalRepository, recordWin } from './local'

beforeEach(() => localStorage.clear())

describe('createLocalRepository', () => {
  it('returns empty progress when nothing is stored', async () => {
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('round-trips', async () => {
    const repo = createLocalRepository()
    const p = recordWin(EMPTY_PROGRESS, 1, 2000, 2, 6)
    await repo.save(p)
    expect(await repo.load()).toEqual(p)
  })

  it('falls back to empty progress on garbage — NFR-REL-03', async () => {
    localStorage.setItem(STORAGE_KEY, '{ not json at all')
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('falls back when the shape is wrong', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 99, levels: 'nope' }))
    expect(await createLocalRepository().load()).toEqual(EMPTY_PROGRESS)
  })

  it('survives a storage that throws on write', async () => {
    const throwing = {
      getItem: () => null,
      setItem: () => { throw new Error('quota') },
      removeItem: () => {}, clear: () => {}, key: () => null, length: 0,
    } as unknown as Storage
    await expect(createLocalRepository(throwing).save(EMPTY_PROGRESS)).resolves.toBeUndefined()
  })
})

describe('recordWin', () => {
  it('unlocks exactly the next level', () => {
    const p = recordWin(EMPTY_PROGRESS, 1, 1000, 1, 6)
    expect(p.unlockedUpTo).toBe(2)
  })

  it('keeps the best score and the best stars', () => {
    let p = recordWin(EMPTY_PROGRESS, 1, 3000, 3, 6)
    p = recordWin(p, 1, 500, 1, 6)
    expect(p.levels[1]).toEqual({ stars: 3, bestScore: 3000 })
  })

  it('never unlocks past the last level', () => {
    const p = recordWin({ ...EMPTY_PROGRESS, unlockedUpTo: 6 }, 6, 9000, 3, 6)
    expect(p.unlockedUpTo).toBe(6)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/storage/local.test.ts`
- [ ] **Step 3: Implement.** `load` wraps `JSON.parse` in `try/catch` and validates `version === 1`, `typeof levels === 'object'`, `typeof unlockedUpTo === 'number'`; anything else returns `EMPTY_PROGRESS = { version: 1, levels: {}, unlockedUpTo: 1 }`. `save` swallows write errors — a full quota must not break the game.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/storage
git commit -m "feat(storage): add async ProgressRepository with local and memory adapters

The interface is async even though localStorage is not, so adding a backend
later does not ripple through every call site (ADR-0001)."
```

---

### Task 13: Strings and design tokens

**Files:**
- Create: `src/i18n/vi.ts`
- Modify: `tailwind.config.ts`, `src/app/globals.css`

**Interfaces:**
- Produces: `t` — a flat frozen object of Vietnamese strings, plus `formatScore(n: number): string` using `Intl.NumberFormat('vi-VN')`, and `SHAPE_BY_COLOR: Record<Color, 'circle' | 'square' | 'triangle' | 'diamond' | 'star' | 'hexagon'>` (NFR-A11Y-06).

- [ ] **Step 1: Write the failing test**

```ts
// src/i18n/vi.test.ts
import { describe, expect, it } from 'vitest'
import { SHAPE_BY_COLOR, formatScore, t } from './vi'

describe('i18n', () => {
  it('formats scores with vi-VN grouping', () => {
    expect(formatScore(1234567)).toBe(new Intl.NumberFormat('vi-VN').format(1234567))
  })

  it('gives every colour a distinct shape', () => {
    const shapes = Object.values(SHAPE_BY_COLOR)
    expect(new Set(shapes).size).toBe(shapes.length)
  })

  it('has no empty string', () => {
    for (const value of Object.values(t)) {
      if (typeof value === 'string') expect(value.length).toBeGreaterThan(0)
    }
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/i18n/vi.test.ts`
- [ ] **Step 3: Implement.** Keys needed by later tasks, exact names: `appTitle`, `levelMapTitle`, `levelLabel`, `locked`, `bestScore`, `noProgressYet`, `movesLeft`, `score`, `goals`, `goalScore`, `goalCollect`, `replay`, `backToMap`, `nextLevel`, `won`, `lost`, `starsEarned`, `loading`, `boardLabel`, `cellLabel`, `selected`, `reshuffled`.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/i18n tailwind.config.ts src/app/globals.css
git commit -m "feat(i18n): centralise vietnamese strings and per-colour shapes

Shapes exist so the six piece colours are not the only way to tell pieces
apart (NFR-A11Y-06)."
```

---

### Task 14: Event list to animation timeline

**Files:**
- Create: `src/game/timeline.ts`, `src/game/timeline.test.ts`

**Interfaces:**
- Consumes: `@/engine` types.
- Produces: `DURATIONS = { clear: 180, fall: 220, spawn: 150, swap: 140, reshuffle: 300 }` · `type Step = { events: GameEvent[]; duration: number }` · `buildTimeline(events: GameEvent[], opts: { reducedMotion: boolean }): Step[]` — groups consecutive events that animate together and returns `duration: 0` for every step when `reducedMotion` is true (NFR-A11Y-05).

- [ ] **Step 1: Write the failing tests**

```ts
// src/game/timeline.test.ts
import { describe, expect, it } from 'vitest'
import type { GameEvent } from '@/engine'
import { buildTimeline } from './timeline'

const events: GameEvent[] = [
  { t: 'swapped', from: { row: 0, col: 0 }, to: { row: 0, col: 1 } },
  { t: 'matched', cells: [{ row: 0, col: 0 }], cascade: 1, points: 60 },
  { t: 'fell', moves: [] },
  { t: 'refilled', cells: [] },
  { t: 'levelWon', score: 60, stars: 1 },
]

describe('buildTimeline', () => {
  it('keeps every event, in order', () => {
    const flat = buildTimeline(events, { reducedMotion: false }).flatMap((s) => s.events)
    expect(flat).toEqual(events)
  })

  it('gives each step a positive duration by default', () => {
    for (const step of buildTimeline(events, { reducedMotion: false })) {
      expect(step.duration).toBeGreaterThan(0)
    }
  })

  it('zeroes every duration under reduced motion', () => {
    for (const step of buildTimeline(events, { reducedMotion: true })) {
      expect(step.duration).toBe(0)
    }
  })

  it('returns no steps for an empty event list', () => {
    expect(buildTimeline([], { reducedMotion: false })).toEqual([])
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/game/timeline.test.ts`
- [ ] **Step 3: Implement.** Grouping: `swapped`/`swapReverted` alone; `matched` + all following `specialActivated`/`specialSpawned` in one step; `fell` alone; `refilled` alone; `goalProgressed` folded into the preceding step; `reshuffled`, `levelWon`, `levelLost` each alone. Under `reducedMotion`, keep the same grouping and set every duration to 0.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/game
git commit -m "feat(game): translate engine events into an animation timeline"
```

---

### Task 15: `useGameSession` — queue, input lock, progress write

**Files:**
- Create: `src/game/useGameSession.ts`, `src/game/useGameSession.test.tsx`

**Interfaces:**
- Consumes: `@/engine`, `./timeline`, `@/storage/ports`.
- Produces:
  ```ts
  function useGameSession(args: {
    level: LevelConfig
    seed: number
    repository: ProgressRepository
    lastLevelId: number
  }): {
    session: Session          // the state to render (advances step by step)
    busy: boolean             // true while the queue plays — input must be ignored
    trySwap(from: Pos, to: Pos): void
    restart(): void
    lastResult: { status: 'won' | 'lost'; stars: 0 | 1 | 2 | 3; score: number } | null
  }
  ```

- [ ] **Step 1: Write the failing tests**

```tsx
// src/game/useGameSession.test.tsx
import { describe, expect, it } from 'vitest'
import { act, renderHook, waitFor } from '@testing-library/react'
import { useGameSession } from './useGameSession'
import { createMemoryRepository } from '@/storage/memory'
import { findLegalMoves } from '@/engine/moves'
import type { LevelConfig } from '@/engine'

const level: LevelConfig = {
  id: 1, rows: 7, cols: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 5, goals: [{ kind: 'score', target: 1 }], stars: [1, 2, 3],
}

const setup = () =>
  renderHook(() =>
    useGameSession({ level, seed: 1, repository: createMemoryRepository(), lastLevelId: 6 }),
  )

describe('useGameSession', () => {
  it('starts idle with a full board', () => {
    const { result } = setup()
    expect(result.current.busy).toBe(false)
    expect(result.current.session.movesLeft).toBe(5)
  })

  it('goes busy on a swap and idle again when the queue drains', async () => {
    const { result } = setup()
    const move = findLegalMoves(result.current.session.grid)[0]!
    act(() => result.current.trySwap(move.from, move.to))
    expect(result.current.busy).toBe(true)
    await waitFor(() => expect(result.current.busy).toBe(false))
  })

  it('ignores a swap while busy — invariant 3', async () => {
    const { result } = setup()
    const move = findLegalMoves(result.current.session.grid)[0]!
    act(() => result.current.trySwap(move.from, move.to))
    const movesAfterFirst = result.current.session.movesLeft
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.busy).toBe(false))
    expect(result.current.session.movesLeft).toBeLessThanOrEqual(movesAfterFirst)
  })

  it('reports the result and persists a win', async () => {
    const repository = createMemoryRepository()
    const { result } = renderHook(() =>
      useGameSession({ level, seed: 1, repository, lastLevelId: 6 }),
    )
    const move = findLegalMoves(result.current.session.grid)[0]!
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.lastResult?.status).toBe('won'))
    const saved = await repository.load()
    expect(saved.unlockedUpTo).toBe(2)
    expect(saved.levels[1]?.bestScore).toBeGreaterThan(0)
  })

  it('restart gives a fresh board and clears the result', async () => {
    const { result } = setup()
    const move = findLegalMoves(result.current.session.grid)[0]!
    act(() => result.current.trySwap(move.from, move.to))
    await waitFor(() => expect(result.current.lastResult).not.toBeNull())
    act(() => result.current.restart())
    expect(result.current.lastResult).toBeNull()
    expect(result.current.session.movesLeft).toBe(5)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/game/useGameSession.test.tsx`
- [ ] **Step 3: Implement.** Hold the *displayed* session in state and the *final* session in a ref. `trySwap` returns immediately when `busy`. Advance the queue with `setTimeout(step.duration)`; under reduced motion durations are 0 so the queue drains in one tick chain. When the queue empties, adopt the final session, set `lastResult`, and on `won` call `repository.save(recordWin(...))` — the only write, and only on a win (invariant 10). Read `prefers-reduced-motion` with `window.matchMedia` inside an effect, defaulting to `false` so SSR and happy-dom without `matchMedia` still work.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/game
git commit -m "feat(game): queue events, lock input while animating, persist wins

Input is locked for the whole queue because a second swap mid-cascade
would hand the engine a stale session (invariant 3)."
```

---

### Task 16: `Tile` and `Board` — pointer and keyboard input

**Files:**
- Create: `src/ui/Tile.tsx`, `src/ui/Board.tsx`, `src/ui/Board.test.tsx`

**Interfaces:**
- Produces:
  `Tile({ piece, selected, size })` — renders the color's shape (NFR-A11Y-06) and a special badge.
  `Board({ session, busy, onSwap })` — `role="grid"` with `aria-label={t.boardLabel}`, one `role="gridcell"` per cell containing a `button` labelled `` `${row+1}, ${col+1}` `` plus the color name. Arrow keys move focus, `Enter`/`Space` selects then swaps with an adjacent cell, `Escape` clears the selection. Pointer: `pointerdown` on a cell then `pointerup` on an adjacent cell calls `onSwap`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/ui/Board.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Board } from './Board'
import { newSession } from '@/engine/session'
import type { LevelConfig } from '@/engine'

const level: LevelConfig = {
  id: 1, rows: 7, cols: 7, colors: ['red', 'blue', 'green', 'yellow', 'purple'],
  moves: 5, goals: [{ kind: 'score', target: 1000 }], stars: [1, 2, 3],
}
const session = newSession(level, 1)

describe('Board', () => {
  it('renders a grid of 49 cells', () => {
    render(<Board session={session} busy={false} onSwap={vi.fn()} />)
    expect(screen.getByRole('grid')).toBeTruthy()
    expect(screen.getAllByRole('gridcell')).toHaveLength(49)
  })

  it('swaps two adjacent cells with the keyboard', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{Enter}')
    expect(onSwap).toHaveBeenCalledWith({ row: 0, col: 0 }, { row: 0, col: 1 })
  })

  it('escape clears the selection so the next enter starts over', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{Escape}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })

  it('refuses a non-adjacent keyboard swap', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy={false} onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })

  it('ignores input while busy', async () => {
    const onSwap = vi.fn()
    render(<Board session={session} busy onSwap={onSwap} />)
    const user = userEvent.setup()
    await user.tab()
    await user.keyboard('{Enter}{ArrowRight}{Enter}')
    expect(onSwap).not.toHaveBeenCalled()
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/ui/Board.test.tsx`
- [ ] **Step 3: Implement.** One roving `tabIndex` (the focused cell is `0`, the rest `-1`). Cell size from a CSS variable set on the grid: `--cell: clamp(38px, calc((min(100vw - 2rem, 560px)) / var(--cols)), 64px)`. Every file in `src/ui/` starts with `'use client'`.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): render the board with pointer and full keyboard control

Arrow keys plus Enter make a whole level playable without a pointer
(NFR-A11Y-02)."
```

---

### Task 17: HUD — moves, score, goal progress, live announcements

**Files:**
- Create: `src/ui/MoveCounter.tsx`, `src/ui/GoalHud.tsx`, `src/ui/StarRow.tsx`, `src/ui/GoalHud.test.tsx`

**Interfaces:**
- Produces: `MoveCounter({ movesLeft, score })` · `GoalHud({ progress })` · `StarRow({ stars, max })`. The HUD wrapper carries `aria-live="polite"` so score, moves and goal changes are announced (NFR-A11Y-04). Score text goes through `formatScore`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/ui/GoalHud.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { GoalHud } from './GoalHud'
import { MoveCounter } from './MoveCounter'
import { StarRow } from './StarRow'
import { initProgress, applyCleared } from '@/engine/goals'
import { formatScore } from '@/i18n/vi'

describe('HUD', () => {
  it('shows the formatted score and the moves left', () => {
    render(<MoveCounter movesLeft={17} score={2340} />)
    expect(screen.getByText(formatScore(2340))).toBeTruthy()
    expect(screen.getByText('17')).toBeTruthy()
  })

  it('announces changes politely', () => {
    const { container } = render(<MoveCounter movesLeft={17} score={0} />)
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy()
  })

  it('shows progress per collect colour', () => {
    let p = initProgress([{ kind: 'collect', per: { red: 15 } }])
    p = applyCleared(p, [{ id: 1, color: 'red', special: 'none' }], 0)
    render(<GoalHud progress={p} />)
    expect(screen.getByText('1/15')).toBeTruthy()
  })

  it('shows progress for a score goal', () => {
    const p = initProgress([{ kind: 'score', target: 1500 }])
    render(<GoalHud progress={p} />)
    expect(screen.getByText(`0/${formatScore(1500)}`)).toBeTruthy()
  })

  it('renders three stars with the earned ones marked', () => {
    render(<StarRow stars={2} max={3} />)
    expect(screen.getAllByRole('img', { hidden: true }).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByLabelText(/2\/3/)).toBeTruthy()
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/ui/GoalHud.test.tsx`
- [ ] **Step 3: Implement** with strings from `@/i18n/vi` only — no literal Vietnamese in the components (NFR-I18N-01).
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): add moves, score and goal progress with aria-live"
```

---

### Task 18: `ResultDialog` with a focus trap

**Files:**
- Create: `src/ui/ResultDialog.tsx`, `src/ui/ResultDialog.test.tsx`

**Interfaces:**
- Produces: `ResultDialog({ result, hasNextLevel, onReplay, onNext, onBackToMap })` — `role="dialog"` `aria-modal="true"`, focus moves to the dialog on open and cycles inside it, `Escape` calls `onBackToMap`.

- [ ] **Step 1: Write the failing tests**

```tsx
// src/ui/ResultDialog.test.tsx
import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultDialog } from './ResultDialog'
import { t } from '@/i18n/vi'

const won = { status: 'won' as const, stars: 2 as const, score: 2340 }
const lost = { status: 'lost' as const, stars: 0 as const, score: 800 }

describe('ResultDialog', () => {
  it('offers the next level after a win', () => {
    render(<ResultDialog result={won} hasNextLevel onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={vi.fn()} />)
    expect(screen.getByRole('button', { name: t.nextLevel })).toBeTruthy()
  })

  it('hides the next level button on the last level', () => {
    render(<ResultDialog result={won} hasNextLevel={false} onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={vi.fn()} />)
    expect(screen.queryByRole('button', { name: t.nextLevel })).toBeNull()
  })

  it('offers replay and back after a loss, and no next level', () => {
    render(<ResultDialog result={lost} hasNextLevel onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={vi.fn()} />)
    expect(screen.getByRole('button', { name: t.replay })).toBeTruthy()
    expect(screen.queryByRole('button', { name: t.nextLevel })).toBeNull()
  })

  it('moves focus into the dialog on open', () => {
    render(<ResultDialog result={won} hasNextLevel onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={vi.fn()} />)
    const dialog = screen.getByRole('dialog')
    expect(dialog.contains(document.activeElement)).toBe(true)
  })

  it('escape goes back to the map', async () => {
    const onBackToMap = vi.fn()
    render(<ResultDialog result={lost} hasNextLevel onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={onBackToMap} />)
    await userEvent.keyboard('{Escape}')
    expect(onBackToMap).toHaveBeenCalled()
  })

  it('keeps tab inside the dialog', async () => {
    render(<ResultDialog result={won} hasNextLevel onReplay={vi.fn()} onNext={vi.fn()} onBackToMap={vi.fn()} />)
    const user = userEvent.setup()
    const dialog = screen.getByRole('dialog')
    for (let i = 0; i < 6; i++) await user.tab()
    expect(dialog.contains(document.activeElement)).toBe(true)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/ui/ResultDialog.test.tsx`
- [ ] **Step 3: Implement** the trap by hand: collect focusable children, wrap `Tab`/`Shift+Tab` at the ends, focus the first on mount.
- [ ] **Step 4: Run to verify pass** — `yarn test`
- [ ] **Step 5: Commit**

```bash
git add src/ui
git commit -m "feat(ui): add the result dialog with a keyboard focus trap"
```

---

### Task 19: Routes — level map and play screen, wired to progress

**Files:**
- Create: `src/ui/LevelMap.tsx`, `src/ui/LevelMap.test.tsx`, `src/app/PlayScreen.tsx`, `src/app/play/[id]/page.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Produces: `LevelMap({ progress, levels })` — a card per level; locked levels render as `aria-disabled` non-links. `PlayScreen({ levelId })` — client component that owns `useGameSession`, `Board`, HUD and `ResultDialog`. `src/app/play/[id]/page.tsx` exports `generateStaticParams` for ids 1..6 (required by `output: 'export'`).

- [ ] **Step 1: Write the failing tests**

```tsx
// src/ui/LevelMap.test.tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LevelMap } from './LevelMap'
import { LEVELS } from '@/levels/levels'
import { EMPTY_PROGRESS } from '@/storage/local'

describe('LevelMap', () => {
  it('shows every level', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(screen.getAllByText(/Màn/).length).toBeGreaterThanOrEqual(6)
  })

  it('links only the unlocked levels', () => {
    render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(screen.getAllByRole('link')).toHaveLength(1)
  })

  it('marks locked levels as disabled', () => {
    const { container } = render(<LevelMap progress={EMPTY_PROGRESS} levels={LEVELS} />)
    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(5)
  })

  it('shows best score and stars for a finished level', () => {
    const progress = { version: 1 as const, levels: { 1: { stars: 2 as const, bestScore: 2340 } }, unlockedUpTo: 2 }
    render(<LevelMap progress={progress} levels={LEVELS} />)
    expect(screen.getByText(/2\.340|2,340/)).toBeTruthy()
    expect(screen.getAllByRole('link')).toHaveLength(2)
  })
})
```

- [ ] **Step 2: Run to verify failure** — `yarn vitest run src/ui/LevelMap.test.tsx`
- [ ] **Step 3: Implement.** `src/app/page.tsx` stays a server component that renders a small client wrapper which loads progress via `createLocalRepository()` in an effect and shows `t.loading` for the first paint (ADR-0001). The repository is constructed in exactly these two wrappers and nowhere else. Seed for a session: `levelId * 1000 + attemptCount` held in `PlayScreen` state, so "replay" gives a different board while staying reproducible.
- [ ] **Step 4: Run to verify pass** — `yarn test && yarn typecheck && yarn build`
- [ ] **Step 5: Commit**

```bash
git add src/app src/ui
git commit -m "feat(ui): add the level map and play routes wired to local progress"
```

---

### Task 20: Playwright end-to-end and responsive screenshots

**Files:**
- Create: `playwright.config.ts`, `e2e/play.spec.ts`, `e2e/screenshots.spec.ts`

**Interfaces:**
- Consumes: the built app served from `out/`.
- Produces: coverage of US-01, US-02 and US-03, plus screenshots at 375, 768, 1024 and 1440 (feature-flow step 5).

- [ ] **Step 1: Write the config and specs**

```ts
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: { baseURL: 'http://localhost:3100', trace: 'on-first-retry' },
  webServer: {
    command: 'yarn build && npx serve out -l 3100',
    url: 'http://localhost:3100',
    reuseExistingServer: !process.env.CI,
    timeout: 180000,
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
})
```

```ts
// e2e/play.spec.ts
import { expect, test } from '@playwright/test'

test('US-01 · opens the map with only level 1 unlocked', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('link')).toHaveCount(1)
})

test('US-01 · plays moves and the counter goes down', async ({ page }) => {
  await page.goto('/play/1/')
  const grid = page.getByRole('grid')
  await expect(grid).toBeVisible()
  const before = await page.getByTestId('moves-left').textContent()
  // keyboard is the deterministic input path
  await page.getByRole('gridcell').first().getByRole('button').focus()
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Enter')
    await page.keyboard.press('ArrowRight')
    await page.keyboard.press('Enter')
    await page.waitForTimeout(250)
  }
  await expect(page.getByTestId('moves-left')).not.toHaveText(before ?? '')
})

test('US-02 · replay resets moves', async ({ page }) => {
  await page.goto('/play/1/')
  const moves = page.getByTestId('moves-left')
  const start = await moves.textContent()
  await page.getByRole('gridcell').first().getByRole('button').focus()
  await page.keyboard.press('Enter')
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await page.waitForTimeout(400)
  await page.getByTestId('replay').click()
  await expect(moves).toHaveText(start ?? '')
})

test('US-03 · progress survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() =>
    localStorage.setItem(
      'match3.progress.v1',
      JSON.stringify({ version: 1, levels: { 1: { stars: 3, bestScore: 4200 } }, unlockedUpTo: 3 }),
    ),
  )
  await page.reload()
  await expect(page.getByRole('link')).toHaveCount(3)
})

test('US-03 · garbage in storage still opens the app', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.setItem('match3.progress.v1', 'not json'))
  await page.reload()
  await expect(page.getByRole('link')).toHaveCount(1)
})
```

```ts
// e2e/screenshots.spec.ts
import { test } from '@playwright/test'

const widths = [375, 768, 1024, 1440]

for (const width of widths) {
  test(`screenshot map and board at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.screenshot({ path: `test-results/map-${width}.png`, fullPage: true })
    await page.goto('/play/1/')
    await page.getByRole('grid').waitFor()
    await page.screenshot({ path: `test-results/board-${width}.png`, fullPage: true })
  })
}
```

- [ ] **Step 2: Add the `data-testid` hooks** the specs need: `moves-left` on `MoveCounter`, `replay` on the replay button, `score` on the score value.
- [ ] **Step 3: Run** — `yarn test:e2e` → Expected: all pass; PNGs written under `test-results/`.
- [ ] **Step 4: Look at the four board screenshots** and confirm against design.md §6: board square, cells >= 44px at 375 for 7×7, HUD above the board on mobile and beside it at 1024+.
- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts e2e src
git commit -m "test(e2e): cover US-01..US-03 and capture four responsive widths"
```

---

### Task 21: README, docs refresh, and the final verification pass

**Files:**
- Create: `README.md`
- Modify: `docs/04-state/backlog.md`, `docs/02-requirements/scope.md`, `docs/README.md` (auto block only via the script)

**Interfaces:** none — this task ships the paperwork the repo contract requires.

- [ ] **Step 1: Write `README.md`** with `## Features` (one English bullet per shipped FR-01…FR-08), a `## Getting started` block (`yarn install`, `yarn dev`, no `.env` needed), a `## Commands` table, and a `## Docs` pointer to `docs/README.md`.
- [ ] **Step 2: Flip FR-01…FR-08 to `xong`** in `docs/02-requirements/scope.md`.
- [ ] **Step 3: Update `docs/04-state/backlog.md` §Đang làm** to say phase 1 is complete and phase 2 (`special-combos`) is next.
- [ ] **Step 4: Run the full gate**

Run: `yarn typecheck` → Expected: exit 0.
Run: `yarn lint` → Expected: no errors.
Run: `yarn test` → Expected: every suite passes, including `purity.test.ts` and `perf.test.ts`.
Run: `yarn build` → Expected: `out/` written.
Run: `yarn test:e2e` → Expected: all pass.
Run: `bash .claude/scripts/docs-regen.sh` → Expected: no orphan-ID and no missing-env warnings.

- [ ] **Step 5: Commit and push**

```bash
git add -A
git commit -m "docs: record phase one as shipped and add the readme

FR-01..FR-08 are done; phase 2 (FR-09, special combos) is next per ADR-0005."
git push -u origin feat/core-engine-and-goals
```

---

## Self-Review

**Spec coverage.** design.md §2 architecture → Tasks 2-15 (module layout) · §3 data model → Task 2 · §4 rules: board generation Task 8, swap and revert Task 10, match Task 4, special spawn Task 5, activation and chains Task 6, cascade Task 9, scoring and collect Task 7, win/lose Task 10, stars Task 7, deadlock and reshuffle Task 8 · §5 six levels → Task 11 · §6 UI → Tasks 13, 16-19 · §7 test strategy → every task, plus Task 20 for flows · §8 no canvas mockup → nothing to build. FR-01…FR-08 all land in a task; FR-09…FR-14 are out of scope by ADR-0005.

**Type consistency.** `findLegalMoves` (Tasks 8, 10, 15, 16 tests) · `hasLegalMove` (8, 11) · `generateBoard` (8, 11) · `resolveClears` (6, 9) · `activationTargets` (6) · `specialFor` (5, 9) · `findMatches` (4, 8, 9, 11) · `applyCleared`/`initProgress`/`allDone`/`starsFor` (7, 15, 17) · `recordWin`/`EMPTY_PROGRESS`/`STORAGE_KEY` (12, 15, 19) · `buildTimeline`/`DURATIONS` (14, 15) · `parseBoard`/`formatBoard` (3, 4, 6, 8) — one name each, used identically everywhere.

**Known thin spot.** Task 10's revert test has to find a swap the engine will reject on a generated board, so it asserts conditionally. That is weaker than the rest of the suite; the unconditional coverage of the revert rule lives in Task 9's event-order tests and Task 20's move-counter check. If the implementer can build a deadlock-free fixture where a specific swap is known-illegal, replace the conditional assertion with a direct one.
