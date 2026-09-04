# ADR-0002 · Engine thuần phát ra danh sách sự kiện; renderer là React DOM + CSS

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-01 · FR-02 · NFR-PERF-05 · NFR-PERF-06 · NFR-A11Y-02 · NFR-A11Y-05

## 1. Bối cảnh

Phần đắt và dễ sai của match-3 là **luật**: cascade nhiều tầng, quân đặc biệt kích
hoạt theo chuỗi, phát hiện bế tắc, chấm mục tiêu. Phần đó phải test được rẻ và
nhanh. Đồng thời game phải chơi được bằng bàn phím (NFR-A11Y-02) và luồng chính phải
kiểm được bằng Playwright. Ba hướng render đã cân: React DOM + CSS · Canvas 2D toàn
bộ · DOM cho quân + canvas overlay cho hiệu ứng.

## 2. Quyết định

`src/engine/` là TypeScript thuần đồng bộ, không import React và không chạm DOM.
Một nước đi đi qua đúng một hàm thuần `applySwap(session, from, to)` trả về
`{ session, events }`, trong đó `events` là danh sách **có thứ tự** mọi việc đã xảy
ra, và `session` đã là trạng thái **cuối cùng** sau toàn bộ cascade. Tầng
`game/timeline.ts` dịch `events` thành animation; `ui/` vẽ bằng React DOM với
`transform`/`opacity`. Renderer là một module riêng tiêu thụ `events`, nên thêm một
renderer khác về sau không cần sửa engine.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Canvas 2D toàn bộ | Không có DOM thì bàn phím, focus thấy được và `aria-live` (NFR-A11Y-02, -04) phải tự dựng từ đầu, còn Playwright không assert được trạng thái bàn mà phải mở cửa hậu test vào JS. Trả giá đó cho hiệu ứng hạt là sai thứ tự ưu tiên |
| DOM + canvas overlay cho hiệu ứng | Được cả hai, nhưng phải giữ hai hệ toạ độ khớp nhau ngay từ giai đoạn 1, khi còn chưa biết hiệu ứng cần gì. Vẫn mở: renderer đã là module riêng |
| Engine trả trạng thái theo từng bước (generator), UI kéo từng bước | UI sẽ giữ vai trò điều phối luật. Test luật phải chạy qua vòng lặp bước, và một UI viết sai có thể dừng giữa cascade — đúng thứ bất biến 7 trong `invariants.md` tồn tại để chặn |
| Dùng thư viện game (Phaser, PixiJS) | Kéo cả một runtime cho một bàn 81 ô, và ràng luật chơi vào vòng đời của thư viện. Bàn 9×9 là 81 phần tử DOM — DOM chịu thừa sức |

## 4. Hệ quả

**Được:**
- Test toàn bộ luật bằng Vitest, không render, không chờ animation — nên NFR-PERF-05
  đo được bằng benchmark thuần.
- UI không thể tính điểm khác engine, vì nó không tính gì cả (bất biến 2).
- Bàn tái tạo được từ `(LevelConfig, seed, danh sách nước đi)`.
- `prefers-reduced-motion` chỉ đổi `timeline`, engine không biết gì.

**Mất / phải chấp nhận:**
- Hiệu ứng hạt và nổ bị giới hạn trong những gì CSS làm được.
- `events` là một API thứ hai phải giữ ổn định bên cạnh `Session`; thêm một loại sự
  kiện là sửa cả engine và timeline.
- Engine trả về trạng thái cuối ngay, nên phải cẩn thận: hàng đợi animation là thứ
  duy nhất giữ cho người chơi không thấy kết quả trước khi nhìn thấy nguyên nhân, và
  input phải bị khoá suốt lúc đó (bất biến 3).

**Điều kiện xem lại quyết định này:** nếu đo được frame > 32ms trên bàn 9×9
(NFR-PERF-06 hỏng) mà nguyên nhân là số phần tử DOM, thì viết ADR mới chuyển sang
canvas overlay — renderer đã tách sẵn cho việc đó.
