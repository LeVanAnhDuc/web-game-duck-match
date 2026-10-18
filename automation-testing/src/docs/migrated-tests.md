# Test đã gom về lúc scaffold

Bộ e2e Playwright cũ của app (`client/e2e/`, chạy bằng `client/playwright.config.ts` → `pnpm test:e2e`) và bộ kiểm bản
deploy (`client/e2e-live/`, chạy bằng `client/playwright.live.config.ts` → `pnpm verify:live`) được `git mv` về đây khi
dựng `automation-testing/`. Hai config cũ gộp vào `playwright.config.ts` (webServer build + phục vụ bản xuất tĩnh ở :4173,
bản bật cờ Ducker ID ở :4291; project `app-auth` = bản bật cờ). Bộ kiểm deploy giờ là module `deploy`, chạy với
`ENV=prd` (baseURL = trang GitHub Pages) thay cho biến `LIVE_URL`.

Spec cũ import engine của game (`../src/engine`, `../src/levels/levels`) để tính nước đi. Lúc gom, phần đó được đổi sang
đọc bàn từ màn hình (`PlayPage.readBoard()`) + `src/utils/match3.ts`, vì suite chỉ được `import type` từ app.

| Từ | Về | Trạng thái |
|---|---|---|
| `client/e2e/play.spec.ts` | `src/tests/e2e/play/board.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/e2e/full-level.spec.ts` | `src/tests/e2e/result/full-level.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/e2e/screenshots.spec.ts` | `src/tests/e2e/responsive/screenshots.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/e2e/ducker-id-flag-off.spec.ts` | `src/tests/e2e/ducker-id/flag-off.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/e2e/ducker-id-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts` (git mv); issuer giả → `src/fixtures/issuer.fixture.ts` | chưa chuẩn hóa |
| `client/e2e-live/deployed.spec.ts` | `src/tests/e2e/deploy/live.e2e.ts` (git mv) | chưa chuẩn hóa |
| `client/playwright.config.ts`, `client/playwright.live.config.ts` | `playwright.config.ts` | gộp |

Unit + component test (vitest, `client/src/**/*.test.ts(x)` và `client/test/`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — "17 test luồng Playwright" là ảnh chụp trạng thái lúc ghi, không phải luật.
- `docs/ux-reviews/` — nhật ký phiên persona cũ.
