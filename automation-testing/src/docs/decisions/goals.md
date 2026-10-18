# GOALS — Quyết định

Đi cặp với `docs/requirements/goals.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-03 mục tiêu điểm, FR-04 mục tiêu thu viên, FR-21 mục tiêu có nhãn
  chữ), `docs/01-product/journeys.md` (US-01 bước 2 "thấy … mục tiêu ngay trên bàn", US-02 bước 2 mục tiêu còn thiếu),
  `docs/02-requirements/nfr.md` (NFR-A11Y-06 hình khối riêng, NFR-I18N-03 nhóm số), `docs/specs/ux-remediation/design.md`
  (F-06 HUD).
- **Code:** `client/src/views/Play/components/GoalHud/index.tsx`, `client/src/i18n/vi.ts` (`goalScore`, `goalCollect`,
  `goalScoreLabel`, `goalCollectLabel`, `SHAPE_BY_COLOR`), `client/src/levels/levels.ts`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Thứ tự dòng ở màn 4 và 6 (thu viên trước, điểm sau) theo đúng thứ tự `goals` trong `levels.ts`; coi là hành vi
  đã ship, test khẳng định thứ tự.
- **Q2** "Phá viên đỏ" kiểm bằng biên dưới: một hàng ba đỏ là ≥ 3; cascade có thể phá thêm.
- **Q3** Mục tiêu "đã đạt" quan sát ở HUD phía sau dialog thắng (màn 1, chơi nước hợp lệ đầu tiên mỗi lượt); "chưa đạt"
  ở màn 5 cùng cách chơi — ván đó thua (quan sát 2026-10-18, seed cố định của màn).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Thắng chỉ khi **mọi** mục tiêu đạt (màn 4, 6): không dựng được ván đạt một nửa một cách chắc chắn; engine có unit test
  (`goals.test.ts`).
- Dialog thua liệt kê mục tiêu còn thiếu → module `result`.
