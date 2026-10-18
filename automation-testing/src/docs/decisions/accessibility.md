# ACCESSIBILITY — Quyết định

Đi cặp với `docs/requirements/accessibility.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/nfr.md` (NFR-A11Y-02…06), `docs/04-state/backlog.md` §Nợ kỹ thuật (ngoại lệ 9×9 dưới
  400px mà NFR-A11Y-03 trỏ tới), `docs/design-system/match-3/MASTER.md` (vùng bấm 44px), `README.md` §Controls.
- **Code:** `client/src/views/Play/mains/Board/index.tsx` (roving tabindex, mũi tên kẹp ở mép, `--cell` clamp 38–64px),
  `client/src/views/Play/components/MoveCounter/index.tsx` (`aria-live`), `client/src/views/Play/components/ResultDialog`
  (`role="status"`), `client/src/app/globals.css` (NFR-A11Y-05: media query + `[data-reduced-motion]`),
  `client/src/i18n/vi.ts` (`SHAPE_BY_COLOR`).
- **Test đã gom (gợi ý):** "US-01 · the board is reachable and driveable by keyboard alone" trong `client/e2e/play.spec.ts`;
  `client/e2e/screenshots.spec.ts` (ảnh 9×9 ở 375).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** NFR-A11Y-02 "chơi trọn một màn chỉ bằng bàn phím": mọi ván trong module `result` đã đi hoàn toàn bằng bàn phím
  (`PlayPage.playMove` = Enter / mũi tên / Enter) → không lặp lại ở đây; module này kiểm điều hướng và focus.
- **Q2** NFR-A11Y-05 "về 0": CSS đặt 0,01ms (Chrome báo `1e-05s`) → kỳ vọng ≤ 1ms. Thuộc tính `data-reduced-motion` trên bàn
  chỉ có sau lần render kế tiếp (giá trị đọc trong effect); trước đó media query đã phủ cùng quy tắc → không coi là bug,
  REQ ghi "sau nước đi đầu tiên".
- **Q3** NFR-A11Y-01 (tương phản) đo bằng devtools theo nfr.md, không tự động hoá.
- **Q4** NFR-A11Y-03 đo ở 375px theo nfr.md ("đo trên ảnh chụp 375"); 9×9 dùng ngoại lệ trong backlog: ô ≥ 38px (giá trị
  sàn của `--cell`) và trang không cuộn ngang.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Trình đọc màn hình thật (NVDA/VoiceOver): chỉ kiểm vai trò/thuộc tính ARIA, không kiểm giọng đọc.
- Focus trong hai dialog → module `result` và `restart`.
