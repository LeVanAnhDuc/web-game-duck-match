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
| `client/e2e/play.spec.ts` | `src/tests/e2e/play/board.e2e.ts` (git mv); các case tách theo module: map (bản đồ chỉ mở màn 1, vào màn 1, thẻ khoá không phải liên kết → TC-MAP-001/008), play (đi một nước, nước không hợp lệ, lớp viên → TC-PLAY-004/005/013), restart (chơi lại sau một nước → TC-RESTART-003/004), progress (tiến độ sau khi tải lại, bản lưu rác → TC-PROGRESS-003/007), accessibility (Tab tới bàn → TC-ACCESSIBILITY-001), specials (bàn mới không có quân đặc biệt → TC-SPECIALS-001) | đã chuẩn hóa |
| `client/e2e/full-level.spec.ts` | `src/tests/e2e/result/full-level.e2e.ts` (git mv) → TC-RESULT-001; phần thắng/thua → TC-RESULT-002/004/008 | đã chuẩn hóa |
| `client/e2e/screenshots.spec.ts` | `src/tests/e2e/responsive/screenshots.e2e.ts` (git mv) → TC-RESPONSIVE-001 (ảnh đính kèm report); ảnh 9×9 ở 375 → TC-ACCESSIBILITY-005 | đã chuẩn hóa |
| `client/e2e/ducker-id-flag-off.spec.ts` | `src/tests/e2e/ducker-id/flag-off.e2e.ts` (git mv) → TC-DUCKERID-001 | đã chuẩn hóa |
| `client/e2e/ducker-id-sign-in.spec.ts` | `src/tests/e2e/ducker-id/sign-in.e2e.ts` (git mv) → TC-DUCKERID-002…013; issuer giả → `src/fixtures/issuer.fixture.ts` | đã chuẩn hóa |
| `client/e2e-live/deployed.spec.ts` | `src/tests/e2e/deploy/live.e2e.ts` (git mv) → TC-DEPLOY-001/002 | đã chuẩn hóa |
| `client/playwright.config.ts`, `client/playwright.live.config.ts` | `playwright.config.ts` | gộp |

Case cũ bị bỏ khi chuẩn hóa: "a special piece is marked so the player knows it is a weapon" chỉ khẳng định bàn mới **không**
có quân đặc biệt — giữ ý đó ở TC-SPECIALS-001, còn "được đánh dấu" giờ được chứng minh thật ở TC-SPECIALS-002…005. So điểm
từng nước với engine (`full-level.spec.ts`) bỏ khỏi e2e vì suite không import engine; vitest `client/test/` đã lo. Không
case nào khác bị bỏ.

Unit + component test (vitest, `client/src/**/*.test.ts(x)` và `client/test/`) ở lại `client/`: chúng thuộc về code.

## Còn trỏ về nơi cũ

- `docs/specs/*/plan.md`, `docs/specs/*/design.md`, `docs/decisions/00*.md` — tài liệu lịch sử (đã ship), giữ nguyên văn.
- `docs/04-state/backlog.md` — "17 test luồng Playwright" là ảnh chụp trạng thái lúc ghi, không phải luật.
- `docs/ux-reviews/` — nhật ký phiên persona cũ.
