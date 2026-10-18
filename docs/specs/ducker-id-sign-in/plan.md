# Kế hoạch — Đăng nhập Ducker ID (duck-match)

Thiết kế: `design.md`. Kế hoạch chung: `web-game/docs/superpowers/plans/2026-10-04-ducker-id-sign-in.md`.

## Task 0 — Worktree và nền
- [x] Worktree `.worktrees/ducker-id-sign-in` từ `origin/main`, cài pnpm, chạy nền

## Task 1 — Env, base path, config
- [x] Test `readDuckerConfig` đỏ rồi xanh
- [x] `next.config.ts` đọc `NEXT_PUBLIC_BASE_PATH`; `.env.example`; `deploy.yml` không truyền cờ
- [x] Đối chiếu base path: asset ở `/web-game-duck-match/` trên `/` và `/play/1/`
- [x] `LIVE_URL` bắt buộc ở `e2e-live`

## Task 2 — Lõi auth
- [x] pkce (vector RFC 7636), callback, bfcache, double-click, request, session, initials
- [x] Bổ sung 1–4: returnTo khi lỗi, timeout, focus, validate userinfo, backslash

## Task 3 — UI
- [x] `AccountButton`, hooks, chuỗi vi, gắn vào `ProductHeader`
- [x] Xem bằng mắt ở 375 / 768 / 1440

## Task 4 — e2e
- [x] Export riêng có cờ bật + issuer giả; vòng đi-về, từ chối, state giả, tải lại, 375px
- [x] Cờ tắt: không nút, không request ra ngoài

## Task 5 — Tài liệu
- [x] overview, ADR-0012, NFR, scope, journeys, glossary, architecture, backlog, README

## Task 6 — Gate, PR
- [x] Toàn bộ gate xanh; PR mở, không merge
