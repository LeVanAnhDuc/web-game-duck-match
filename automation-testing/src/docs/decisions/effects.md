# EFFECTS — Quyết định

Đi cặp với `docs/requirements/effects.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-17 lớp phản hồi, FR-19 bàn tự giải thích), `docs/02-requirements/nfr.md`
  (NFR-A11Y-05), `docs/specs/tactile-board/design.md`, `docs/specs/ux-remediation/design.md` (ô chọn mạnh hơn ô focus),
  `README.md` §Features.
- **Code:** `client/src/views/Play/components/EffectLayer/index.tsx` (`data-effect`, `+formatScore`, `return null` khi giảm
  chuyển động), `client/src/views/Play/components/Tile/index.tsx` (`data-selected`, `data-lifted`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Nhãn điểm tồn tại vài trăm ms → quan sát dưới đồng hồ giả đứng yên (`freezeClock`), cho trôi từng nhịp ngắn.
  Không khẳng định vị trí pixel của nhãn (trang trí), chỉ khẳng định có nhãn "+N" khi cascade chạy và hết khi bàn lắng.
- **Q2** "Đánh dấu mạnh hơn" kiểm bằng thuộc tính mà CSS dùng để vẽ (`data-selected`, `data-lifted`), không so độ đậm.
- **Q3** Quét hàng của viên sọc, chớp bom màu, khoảnh khắc thưởng: không dựng được thời điểm chắc chắn ngoài nước tạo/kích hoạt
  quân đặc biệt; phần sinh và kích hoạt quân đặc biệt đã ở module `specials` → không khẳng định từng hiệu ứng ở đây.

## Tài khoản test

Không có.

## Ngoài phạm vi

- FR-18 (viên bay về HUD): trạng thái "chưa".
- FR-08 xáo bàn khi bế tắc và câu "Đã xáo bàn": không dựng được bàn bế tắc từ bên ngoài (xem `decisions/play.md`).
