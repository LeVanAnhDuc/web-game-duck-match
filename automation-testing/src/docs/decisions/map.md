# MAP — Quyết định

Đi cặp với `docs/requirements/map.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-06 bản đồ + mở màn tuyến tính, FR-20 bản đồ nói đủ),
  `docs/01-product/journeys.md` (US-01 bước 1, US-03 bước 1), `docs/specs/ux-remediation/design.md` (F-04 ngưỡng sao,
  F-05 khối nhận diện, F-09 điều kiện mở khoá), `README.md` §Features.
- **Code:** `client/src/views/Map/index.tsx`, `client/src/views/Map/mains/LevelMap/index.tsx`,
  `client/src/views/Map/components/ProductHeader/index.tsx`, `client/src/components/StarRow/index.tsx`,
  `client/src/i18n/vi.ts`.
- **Test đã gom (gợi ý):** "US-01 · the map opens with only the first level unlocked", "US-01 · the first level is
  reachable from the map…", "US-03 · a locked level is not a link" trong `client/e2e/play.spec.ts`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Thành tích trên thẻ được dựng thế nào? → Ghi `match3.progress.v1` vào localStorage trước khi trang chạy — đúng
  định dạng lưu của app (ADR-0001), không phải API riêng cho test. Thắng thật để ghi tiến độ thuộc module `progress`.
- **Q2** "Còn Y điểm" tính theo ngưỡng nào? → Ngưỡng sao kế tiếp trong `levels.ts` (sao 1 → ngưỡng 2…), khớp
  `pointsToNextStar`. Màn 1 [2000, 4000, 7000]: điểm cao 4200 → 2 sao → còn 2.800.
- **Q3** Gõ thẳng URL của màn đang khoá (`play/6/`) mở được màn đó. Không tài liệu nào cấm (ADR-0004 chỉ nói id không tồn
  tại thì không có route); không coi là bug, không test ở đây.

## Tài khoản test

Không có: game không có tài khoản. Mỗi test chạy trong context trình duyệt mới, localStorage trống.

## Ngoài phạm vi

- Thứ tự Tab và tiêu điểm thấy được trên bản đồ → module `accessibility`.
- Bố cục theo bề rộng → module `responsive`.
- Nút "Đăng nhập" (cờ bật) → module `ducker-id`.
