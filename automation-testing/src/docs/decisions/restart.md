# RESTART — Quyết định

Đi cặp với `docs/requirements/restart.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-22 hành động phá tiến độ phải hỏi lại), `docs/01-product/journeys.md`
  (US-02 bước 3), `docs/specs/ux-remediation/design.md` §2.1 (F-07 thông báo sau khi xếp lại, F-10 câu trấn an).
- **Code:** `client/src/views/Play/index.tsx` (`requestRestart`, `doRestart`, vùng thông báo `levelRestarted` với khoảng
  trắng xen kẽ), `client/src/views/Play/components/ConfirmRestart/index.tsx` (`isLevelInProgress`, focus nút cuối, bẫy
  Tab, Esc), `client/src/game/useGameSession.ts` (`restart`: seed + số lần chơi lại).
- **Test đã gom (gợi ý):** "US-02 · replay resets the move counter and the score" trong `client/e2e/play.spec.ts`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** "Đang dở" là gì? → Theo `isLevelInProgress`: đã tiêu ít nhất một lượt **hoặc** điểm > 0. Một nước bị từ chối
  không tiêu lượt, không cộng điểm → vẫn chưa dở, không hỏi (biên của REQ-RESTART-01).
- **Q2** "Bàn mới" kiểm bằng gì? → So màu từng ô trước và sau: lần chơi lại thứ n dùng seed + n, nên bàn khác.
- **Q3** "Đọc lại lần hai" kiểm bằng gì? → Nội dung chữ của vùng thông báo khác nhau giữa hai lần (app chèn một khoảng
  trắng không ngắt xen kẽ); cùng câu chữ.

## Tài khoản test

Không có.

## Ngoài phạm vi

- "Chơi lại" trên dialog kết quả (không hỏi) → module `result`.
