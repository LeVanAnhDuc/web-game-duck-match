# RESULT — Quyết định

Đi cặp với `docs/requirements/result.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-05 chấm sao, FR-20 dialog kết quả nói đủ),
  `docs/01-product/journeys.md` (US-01 bước 4–5, US-02), `docs/03-design/invariants.md` (#7 thắng/thua kiểm ở cuối
  nước), `docs/specs/ux-remediation/design.md` (F-04 ngưỡng sao, F-10 dialog thua cân bằng), `README.md` §Features.
- **Code:** `client/src/views/Play/components/ResultDialog/index.tsx` (focus, bẫy Tab, Esc → bản đồ),
  `client/src/views/Play/index.tsx` (`onNext`, `onBackToMap`, `restart` không hỏi lại từ dialog),
  `client/src/game/useGameSession.ts`, `client/src/levels/levels.ts` (ngưỡng sao).
- **Test đã gom (gợi ý):** `client/e2e/full-level.spec.ts` (chơi trọn màn 1, so với engine).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Ván thắng / ván thua dựng bằng gì? → Chơi thật, mỗi lượt chọn nước hợp lệ đầu tiên (thứ tự đọc) trên bàn đang
  vẽ (`PlayPage.playUntilResult("first")`). Seed của màn cố định nên ván lặp lại y hệt. Quan sát 2026-10-18: màn 1 thắng
  (9.180), màn 2 thắng (4.140), màn 5 **thua** (5.580/6.000), màn 6 thắng (6.480). Engine đổi (FR-12 chỉnh màn) thì cập
  nhật bảng này; kỳ vọng về sao và điểm thiếu được **tính** từ điểm hiện ra và ngưỡng trong `test-data.ts`, không viết cứng.
- **Q2** US-02 bước 2 nói dialog thua hiện "chưa đạt"; code dùng "Hết lượt!" (`lost` trong `vi.ts`) cùng danh sách mục
  tiêu còn thiếu. Glossary khoá chữ trên UI theo `vi.ts` → lấy "Hết lượt!", không coi là bug.
- **Q3** Chơi lại **từ dialog** không qua hộp hỏi "Chơi lại từ đầu?" (ván đã xong, không còn gì để mất); hộp hỏi chỉ
  thuộc nút "Chơi lại" trên màn đang chơi → module `restart`.
- **Q4** Bản `full-level.spec.ts` cũ so điểm từng nước với engine; bản mới chỉ kiểm lượt −1, điểm không giảm và có dialog
  (không import engine). Điểm từng nước do `client/test/engine-ui-agreement.test.ts` lo.
- **Q5** Ván dài chạy với `prefers-reduced-motion: reduce`: chỉ rút ngắn hiệu ứng (NFR-A11Y-05), ván đi y như cũ.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Ghi tiến độ khi thắng / không ghi khi thua → module `progress`.
- Hiệu ứng sao rơi lần lượt, thời lượng animation dialog: trang trí, không có ngưỡng.
