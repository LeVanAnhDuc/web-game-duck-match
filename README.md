# web-game-match-3

A level-based match-3 game that runs entirely in the browser. No account, no server,
no install — open the link and play. Progress lives in `localStorage`.

Part of the `web-game/` folder in the `web-app-ecosystem` workspace.

## Features

- Play a match-3 board: swap adjacent pieces, clear matches of three or more, watch
  gravity refill the board and chain into cascades.
- Special pieces: a match of four spawns a striped piece that clears its row or
  column, an L/T match spawns a wrapped bomb that clears a 3×3 area, and a match of
  five spawns a colour bomb that clears every piece of one colour.
- Two goal kinds per level: reach a score within a move limit, and collect a number
  of pieces of specific colours.
- Six levels that teach the rules in order, from a 7×7 board with five colours to a
  9×9 board with six colours and a move budget that forces special pieces.
- Star rating per level with three score thresholds, and a best score per level.
- A level map with linear unlocking: finishing a level unlocks the next one.
- Progress is saved locally and survives a reload; corrupt saved data resets to a
  fresh start instead of breaking the app.
- Deadlock detection: when no legal move is left, the board reshuffles without
  costing a move.
- Fully keyboard playable — arrow keys to move, Enter to select and swap — and every
  piece colour also carries a distinct shape, so colour is never the only signal.

## Getting started

```bash
yarn install
yarn dev          # http://localhost:3000
```

There is **no `.env` step**: the project reads no environment variables at all. See
[`.env.example`](.env.example) for why.

## Commands

| Command | What it does |
| --- | --- |
| `yarn dev` | dev server on `:3000` |
| `yarn build` | static export into `out/` |
| `yarn test` | unit and component tests (Vitest) |
| `yarn test:watch` | the same, in watch mode |
| `yarn test:e2e` | end-to-end flows and responsive screenshots (Playwright) |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | ESLint via `next lint` |
| `yarn format` | Prettier over the repo |

## How it is put together

`src/engine/` is pure synchronous TypeScript: no React, no DOM, no `Date`, no
`Math.random`. One player move goes through one pure function that returns the
settled board plus an ordered list of events. `src/game/` replays those events as an
animation timeline and locks input while it plays; `src/ui/` only draws. That
boundary is what makes every game rule testable without rendering anything — and it
is enforced by a test that greps the engine source, not just by a convention.

## Docs

Start at [`docs/README.md`](docs/README.md) — it maps every document to the question
it answers, and carries the `FR` / `US` / `NFR` / `ADR` id conventions used in commit
messages and tests.

- What this is and what it deliberately does not do:
  [`docs/01-product/overview.md`](docs/01-product/overview.md)
- Feature inventory and status: [`docs/02-requirements/scope.md`](docs/02-requirements/scope.md)
- What breaks silently if you change it:
  [`docs/03-design/invariants.md`](docs/03-design/invariants.md) — read before editing code
- Why things are the way they are: [`docs/decisions/`](docs/decisions/README.md)
