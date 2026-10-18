# CLAUDE.md

**Duck Match** — a match-3 puzzle game, Next.js 15 static export served from GitHub Pages
(https://levananhduc.github.io/web-game-duck-match/). No server, no database, no API:
everything runs in the browser, progress lives in localStorage. The methodology layer
(docs contract, feature flow, hooks) is `.claude/CLAUDE.md`; read it before working.

## Layout

| Folder | Holds |
| --- | --- |
| `client/` | the game app: `package.json`, `pnpm-lock.yaml`, `.env.example`, `src/`, `scripts/`, unit + component tests (vitest, next to the code and in `client/test/`) |
| `docs/` | product docs, requirements, ADRs, feature specs — map in `docs/README.md` |
| `.claude/`, `.githooks/`, `.github/`, `cliff.toml` | Claude config, git hooks, CI, release notes config — all at the root |

`.env.example` lives at `client/.env.example` (`.claude/CLAUDE.md` still draws it at the
root — same file, it moved with the app).

## Commands

```bash
cd client
pnpm install --frozen-lockfile
pnpm dev              # http://localhost:3000
pnpm test             # vitest: unit + component
pnpm typecheck
pnpm lint
pnpm build            # static export to client/out/
pnpm serve            # serve client/out/ on :4173, the way Pages will
pnpm check:bundle     # NFR-PERF-07 first-load JS budget (after build)
pnpm check:audit      # NFR-SEC-05
pnpm release:next     # next version, from the commits (git-cliff, repo root)
```

Git hooks: `git config core.hooksPath .githooks` (commit-msg + pre-commit ESLint on staged
`client/` files).
