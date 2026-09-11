# Kế hoạch — Đợt sửa theo UX persona review 2026-09-11

Thiết kế: `design.md`. Mỗi task TDD: test đỏ trước, code sau.

## Task 1 — Viên đặc biệt tách khỏi viên thường (FR-19 · F-01)

- [x] Test: viên đặc biệt VẪN render `PieceShape` của màu (NFR-A11Y-06) — sọc đỏ và
      sọc lục không được chỉ khác nhau bằng màu
- [x] Test: huy hiệu đặc biệt dùng mực sáng, không dùng `ink-strong` tối trên clay
- [x] Test: hình khối màu chìm sâu hơn trên viên đặc biệt so với viên thường
- [x] `src/views/Play/components/Tile/index.tsx` — hai tầng sáng + viền sáng
- [x] Giữ `data-special` và `data-testid="special-badge"` — e2e và test cũ bám vào

## Task 2 — Đảo lại thứ bậc focus / đã-chọn (FR-19 · F-02)

- [x] Test: ring "đã chọn" không còn là `ring-ink-strong`
- [x] Test: ô vừa focus vừa chọn mang cả hai dấu, phân biệt được
- [x] `Tile/index.tsx` — ring `accent` dày hơn cho `selected`
- [x] `MASTER.md` không đổi: `#F59E0B` đã là accent, không đẻ token mới

## Task 3 — Nước đi bị từ chối để lại dấu (FR-19 · F-03)

- [x] Test: `swapReverted` đặt `data-rejected` lên đúng hai ô
- [x] Test: dấu tự tắt sau thời hạn, và tắt ngay dưới `prefers-reduced-motion`
- [x] Test: `aria-live` phát một dòng khi nước đi bị từ chối (NFR-A11Y-04)
- [x] ~~Test: lượt không bị trừ, khẳng định lại ở tầng UI~~ — **bỏ**: `Board` không
      render số lượt, nên không có gì để khẳng định ở đây. Bất biến 6 đã có test ở
      `src/engine/session.test.ts`, và phép đo trên bản deploy xác nhận `Lượt` đứng
      yên ở 15 qua một nước đi bị từ chối (design.md §2.2)
- [x] `Board/index.tsx` + `globals.css` + `i18n/vi.ts`

## Task 4 — Gợi ý nhàn rỗi nhìn thấy được (FR-19 · mục 2.3)

- [x] Test: `data-hint` nằm trên viên ở `PieceLayer`, không nằm trên `well`
- [x] `PieceLayer/index.tsx` nhận `hint`, `Board` thôi gắn `data-hint` lên well
- [x] Kiểm bằng ảnh thật ở bước 5 — hai khung hình cách nửa chu kỳ **đã khác nhau**
      (trước khi sửa thì giống hệt: `data-hint` nằm trên cái hốc bị viên đục cùng
      kích thước che kín)

## Task 5 — HUD một hàng ở khung nhìn thấp + nhãn chữ (FR-21 · F-06)

- [x] Test: `GoalHud` render nhãn chữ cho từng mục tiêu, không chỉ icon
- [x] `GoalHud`, `MoveCounter`, `Play/index.tsx` — gói một hàng khi chiều cao thấp
      (quy tắc nằm ở `globals.css` `@media (max-height: 560px)`, không rải biến thể
      lên từng con — chiều cao thấp không phải chiều rộng hẹp nên không breakpoint
      nào của Tailwind nhìn thấy nó)
- [x] Kiểm ở 720×450: Lượt/Điểm/Mục tiêu và bàn cờ cùng trong tầm nhìn — đo trên bản
      build: HUD từ 230px xuống **64px** (top 56 → bottom 120), bàn bắt đầu ở 128 thay
      vì ~205, số hàng nhìn thấy **3,5 → 5**. Lần sửa đầu dùng `contents` ngược chiều
      và không nén gì cả; phát hiện bằng ảnh chụp, không bằng suy luận

## Task 6 — Ngưỡng sao còn thiếu (FR-20 · F-04)

- [x] Test: còn thiếu N điểm để lên sao kế; đủ 3 sao thì không hiện gì
- [x] Hàm thuần trong `levels.ts` hoặc `engine` + dùng ở `ResultDialog` và `LevelMap`

## Task 7 — Hộp thoại thua cân với hộp thoại thắng (FR-20 · F-10)

- [x] Test: nhánh thua có hàng sao, có điểm/mục tiêu, có câu "giữ nguyên"
- [x] Test: `Chơi lại` là nút chính ở nhánh thua
- [x] `ResultDialog/index.tsx` + `i18n/vi.ts`

## Task 8 — Bản đồ: khối nhận diện + điều kiện mở khoá (FR-20 · F-05 · F-09)

- [x] Test: bản đồ render tên sản phẩm và dòng mô tả
- [x] Test: thẻ màn khoá nói điều kiện mở, không chỉ "Chưa mở"
- [x] `Map/index.tsx`, `LevelMap/index.tsx`, `i18n/vi.ts`, dấu nhận diện SVG
- [x] `favicon` — hết 404 mà 7/7 phiên đều ghi

## Task 9 — Chặn hành động phá huỷ (FR-22 · F-07 · F-08)

- [x] Test: màn chưa đụng tới → `Chơi lại` chạy ngay, không hỏi
- [x] Test: màn đang dở → hỏi lại, `Thôi` thì không đổi gì
- [x] Test: hộp hỏi lại nói rõ mất gì và giữ gì
- [x] `Play/index.tsx` + component xác nhận + `i18n/vi.ts`
- [x] **Phát sinh khi kiểm trên app thật:** màn chưa đụng tới thì `Chơi lại` chạy ngay
      — đúng thiết kế — nhưng vẫn đổi cả 49 viên **trong im lặng**, tức nửa còn lại của
      F-07 chưa bịt. Thêm `aria-live` báo mọi lần chơi lại, kể cả lần không qua cổng hỏi

## Task 10 — Nghiệm thu

- [x] `yarn test` (561/562 — `engine/perf.test.ts` đỏ **sẵn trên `origin/main`**,
      đã cô lập bằng stash và đã có trong `backlog.md` §Nợ kỹ thuật từ trước)
      · `yarn lint` sạch · `yarn typecheck` sạch · `yarn build` exit 0
      · `yarn check:bundle` 111,6 KB / 200 KB (NFR-PERF-07)
- [x] Ảnh thật ở 375 · 768 · 1024 · 1440 · và 720×450 cho F-06
- [x] Dựng lại đúng kịch bản p03: màn đang dở → hộp hỏi lại, nêu `Điểm 180`, focus ở
      nút **Thôi**, Enter lần nữa không đổi bàn; màn chưa đụng tới → chơi lại ngay
      nhưng có `aria-live` báo
- [x] Dấu từ chối: sống ~750ms (trước bản sửa timer chỉ ~250ms), hai ô tối và nhạt
      hẳn so với 47 ô còn lại, lượt không bị trừ
- [x] README §Features
- [x] `backlog.md` §Nợ kỹ thuật: ghi hạn chế "persona agent không thấy animation ngắn"
