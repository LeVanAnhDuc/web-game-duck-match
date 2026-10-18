# ACCESSIBILITY — Bug log

## Đang mở

| Bug | Mức | TC | Tóm tắt |
|---|---|---|---|
| [BUG-ACCESSIBILITY-01](#bug-accessibility-01) | Trung bình | TC-ACCESSIBILITY-009 | Ở 375px ô của bàn 8×8 chỉ rộng 42,9px, dưới ngưỡng 44px |

### BUG-ACCESSIBILITY-01

- **TC:** TC-ACCESSIBILITY-009 · **Requirement:** REQ-ACCESSIBILITY-03
- **Bước tái hiện:** viewport 375×800, mở `play/4/` (hoặc `play/5/`, cũng 8×8).
- **Mong đợi:** (`docs/02-requirements/nfr.md` NFR-A11Y-03) ô bấm được ≥ 44×44px; ngoại lệ duy nhất là bàn 9×9 dưới 400px.
  `docs/specs/core-engine-and-goals/design.md` §6 nói rõ "ô >= 44px ở 375 với grid 7×7 và 8×8".
- **Thực tế:** mọi ô 42,875 × 42,875px. `--cell` trong `client/src/views/Play/mains/Board/index.tsx` là
  `clamp(38px, calc(min(100vw - 2rem, 560px) / var(--cols)), 64px)` → (375 − 32) / 8 = 42,875px; ngoại lệ 9×9 đang vô tình
  áp cho cả 8×8.
- **Ghi chú:** ghi ngày 2026-10-18; không sửa code game trong PR thêm bộ test.

## Đã sửa

_(chưa có)_
