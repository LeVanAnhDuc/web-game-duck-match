# PLAY — Quyết định

Đi cặp với `docs/requirements/play.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-01, FR-16, FR-17, FR-19), `docs/01-product/journeys.md` (US-01
  bước 2–3), `docs/03-design/invariants.md` (#3 khoá input, #6 lượt chỉ trừ khi match), `docs/01-product/glossary.md`,
  `docs/specs/tactile-board/design.md`, `docs/specs/ux-remediation/design.md` (F-03 nước bị từ chối, gợi ý nhàn rỗi),
  `docs/decisions/0010-ba-lop-ban-choi-va-lead-tach-khoi-thoi-luong-css.md`, `README.md` §Controls.
- **Code:** `client/src/views/Play/mains/Board/index.tsx` (chọn, phím, kéo, `aria-busy`, vùng thông báo từ chối),
  `client/src/views/Play/components/PieceLayer/index.tsx` (`data-hint`, `data-rejected`),
  `client/src/game/useGameSession.ts` (`HINT_AFTER_MS = 5000`, khoá khi `busy`), `client/src/engine/scoring.ts`
  (60 điểm/viên), `client/src/levels/levels.ts`.
- **Test đã gom (gợi ý):** `client/e2e/play.spec.ts` (đi một nước, nước không hợp lệ, lớp viên).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Nước nào là hợp lệ, test biết bằng gì? → Đọc màu viên đang vẽ (`data-color`) rồi tính bằng
  `src/utils/match3.ts`, viết theo luật trong glossary + invariant #6 — không import engine của game.
- **Q2** "Cộng điểm" kiểm thế nào khi cascade làm điểm khó đoán? → Biên dưới: một hàng ba đơn là 3 × 60 = 180
  (`scoring.ts`), cascade chỉ làm tăng thêm. Điểm đúng đến từng nước do test vitest đối chiếu engine/UI lo.
- **Q3** Thời gian (5 giây gợi ý, khoá khi bàn chạy) đo thế nào? → `page.clock`: cài trước khi mở trang; bàn chỉ chạy tiếp
  khi test cho đồng hồ trôi, nên "đang chạy" là trạng thái đứng yên được.
- **Q4** README Controls nói "Esc" bỏ chọn — áp cho bàn phím. Chạm-rồi-chạm và kéo dùng chuột trên Desktop Chrome
  (pointer events giống nhau); cử chỉ chạm thật trên điện thoại không có yêu cầu riêng ngoài README.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Điểm chính xác của từng nước và từng bậc cascade: `client/test/engine-ui-agreement.test.ts` (vitest, 4320 nước).
- NFR-PERF-06 (60fps trên bàn 9×9): đo bằng DevTools Performance, không tự động hoá ở đây.
- FR-08 xáo bàn khi bế tắc: không dựng được bàn bế tắc từ bên ngoài (seed cố định cho ra bàn có nước đi); để unit test
  của engine (`moves.test.ts`) lo.
