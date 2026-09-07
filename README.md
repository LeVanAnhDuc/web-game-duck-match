# web-game-match-3

[![CI](https://github.com/LeVanAnhDuc/web-game-match-3/actions/workflows/ci.yml/badge.svg)](https://github.com/LeVanAnhDuc/web-game-match-3/actions/workflows/ci.yml)
[![Deploy](https://github.com/LeVanAnhDuc/web-game-match-3/actions/workflows/deploy.yml/badge.svg)](https://github.com/LeVanAnhDuc/web-game-match-3/actions/workflows/deploy.yml)
[![Release](https://img.shields.io/github/v/release/LeVanAnhDuc/web-game-match-3?sort=semver)](https://github.com/LeVanAnhDuc/web-game-match-3/releases)

A level-based match-3 game that runs entirely in the browser. No account, no server,
no install — open the link and play. Progress lives in `localStorage`.

**Play it: <https://levananhduc.github.io/web-game-match-3/>**

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

There is **no `.env` step**: nothing the game needs comes from the environment. The
two variables in [`.env.example`](.env.example) are set by CI and must not be set by
hand — `GITHUB_PAGES` in particular would break every asset path locally.

## Commands

| Command | What it does |
| --- | --- |
| `yarn dev` | dev server on `:3000` |
| `yarn build` | static export into `out/` |
| `yarn serve` | serve `out/` on `:4173`, the way Pages will |
| `yarn test` | unit and component tests (Vitest) |
| `yarn test:watch` | the same, in watch mode |
| `yarn test:e2e` | build, then the Playwright flows and responsive screenshots |
| `yarn test:e2e:only` | the same without rebuilding, for when `out/` is current |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn lint` | ESLint via `next lint` |
| `yarn check:bundle` | first-load JS budget, NFR-PERF-07 |
| `yarn check:audit` | dependency advisories at high or above, NFR-SEC-05 |
| `yarn verify:live` | open the published site and play a move on it |
| `yarn release:next` | print the version the next release would carry, and why |
| `yarn release:notes v1.2.0` | print the release notes for a tag |
| `yarn format` | Prettier over the repo |

## Commit convention — releases depend on it

Every push to `main` creates a GitHub Release automatically, and **the version bump
is read from the commit subject**. This is not a style preference any more; a wrong
prefix is a wrong version number.

| Subject | Bump |
| --- | --- |
| `feat: …` / `feat(engine): …` | minor |
| `fix:` · `perf:` · `refactor:` · `docs:` · `test:` · `chore:` · `ci:` | patch |
| `feat!: …`, or `BREAKING CHANGE` in the body | major |
| anything containing `[skip release]` | no release at all |

`yarn release:next` says what the current `HEAD` would produce and why, so the
scheme can be checked before pushing rather than after. `yarn release:notes <tag>`
prints the notes; they are grouped by commit type, because GitHub's own generated
notes group by pull-request label and this repository does not label its PRs
(ADR-0006).

## CI, deploy and release

Three workflows, one job each, and none of them trusts the others' results:

| Workflow | Runs on | Gates |
| --- | --- | --- |
| [`ci.yml`](.github/workflows/ci.yml) | pull requests | lint · typecheck · unit tests · dependency audit · build · bundle budget · end-to-end |
| [`deploy.yml`](.github/workflows/deploy.yml) | push to `main` | typecheck · unit tests · bundle budget, publishes `out/` to Pages, then **opens the live URL and plays a move on it** |
| [`release.yml`](.github/workflows/release.yml) | push to `main` | typecheck · unit tests, then tags and writes the release |

`ci.yml` deliberately does **not** run on pushes to `main`: the other two already
gate that path, and a third run would be the same suite a third time.

Pages has to be switched on **once per repository**, with a token that has admin
rights — the workflow's own `GITHUB_TOKEN` can deploy to an existing Pages site but
cannot create one:

```bash
gh api -X POST repos/LeVanAnhDuc/web-game-match-3/pages -f build_type=workflow
```

If `configure-pages` ever fails with "Get Pages site failed", that command is the
fix, not a change to the workflow.

**A green deploy job is not a working site.** `curl` reported `200` for the Pages URL
while the body was GitHub's own "Site not found" page, so the last job of the deploy
opens the real URL in a browser, waits for the app's own title, and plays one move
(ADR-0007). If that job is red, the site is serving something other than the game —
whatever the other badges say.

## How it is put together

`src/engine/` is pure synchronous TypeScript: no React, no DOM, no `Date`, no
`Math.random`. One player move goes through one pure function that returns the
settled board plus an ordered list of events. `src/game/` replays those events onto
the board being shown and locks input while they play; `src/ui/` only draws. That
boundary is what makes every game rule testable without rendering anything — and it
is enforced by a test that greps the engine source, not just by a convention.

`test/engine-ui-agreement.test.ts` is the one that keeps the two halves honest: it
plays 4320 pseudo-random moves and asserts, after each, that replaying the events
reproduces the engine's own session exactly.

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
