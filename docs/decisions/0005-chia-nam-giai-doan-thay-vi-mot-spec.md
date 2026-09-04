# ADR-0005 · Chia sản phẩm thành năm giai đoạn, mỗi giai đoạn một spec riêng

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-01…FR-13 · `docs/specs/core-engine-and-goals/design.md`

## 1. Bối cảnh

Brainstorm 04.09.2026 chốt phạm vi sản phẩm: level-based, **bốn** loại mục tiêu
(điểm trong N lượt · thu đủ màu · phá hết ô chặn · đưa vật thể xuống đáy), **đầy đủ**
quân đặc biệt kể cả combo giữa hai quân, và 15-20 màn viết tay. Gộp tất cả vào một
spec thì tài liệu thiết kế sẽ dài hơn mức đọc được, và kế hoạch sẽ có hàng chục task
mà task cuối phụ thuộc task đầu.

## 2. Quyết định

Năm giai đoạn tuần tự, mỗi giai đoạn một thư mục `docs/specs/<feature>/` với
`design.md` + `plan.md` riêng, và mỗi giai đoạn phải **chơi được** khi kết thúc:

| # | Feature | Nội dung | FR |
| --- | --- | --- | --- |
| 1 | `core-engine-and-goals` | engine + quân đặc biệt kích hoạt đơn lẻ + mục tiêu `score`/`collect` + 6 màn + bản đồ + lưu tiến độ | FR-01…FR-08 |
| 2 | `special-combos` | combo khi swap hai quân đặc biệt với nhau | FR-09 |
| 3 | `blocker-goals` | ô chặn + mục tiêu phá hết | FR-10 |
| 4 | `ingredient-drop` | vật thể rơi + mục tiêu đưa xuống đáy | FR-11 |
| 5 | `level-set-and-polish` | đủ 15-20 màn, cân độ khó, âm thanh, a11y pass | FR-12 · FR-13 |

Giai đoạn 1 là một vertical slice chơi được thật — **không** phải "engine trước, UI
sau".

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Một spec cho toàn bộ sản phẩm | Kế hoạch sẽ dài đến mức không dùng được làm phòng tuyến khi ngữ cảnh bị nén, và mọi quyết định thiết kế phải chốt trước khi có một dòng code chạy |
| Gộp combo (FR-09) vào giai đoạn 1 | Combo matrix là phần dễ sai nhất, cần một bảng test riêng cho từng cặp. Gộp vào thì spec 1 phình ra và cascade cơ bản chưa kịp ổn định đã phải đỡ thêm luật |
| Giai đoạn 1 chỉ làm engine, UI ở giai đoạn 2 | Engine không ai nhìn thấy thì không ai biết luật có vui hay không. Một giai đoạn kết thúc mà không chơi được là một giai đoạn không nghiệm thu được |
| Chia theo màn hình (bản đồ, bàn chơi, kết quả) | Cắt ngang qua luật chơi: mỗi màn hình lại cần một phần engine, nên không giai đoạn nào tự đứng được |

## 4. Hệ quả

**Được:**
- Mỗi giai đoạn nghiệm thu được bằng cách chơi thử, không phải bằng cách đọc test.
- Giai đoạn 3 trở thành **phép thử thật cho ranh giới module**: thêm một loại mục
  tiêu mà phải sửa ngoài `goals.ts`/`types.ts` nghĩa là thiết kế đã sai
  (`overview.md` §6.3).
- `scope.md` có chỗ đứng cho cả 14 FR ngay từ đầu, nên không FR nào bị mất giữa các
  giai đoạn.

**Mất / phải chấp nhận:**
- Bốn lần lặp lại vòng spec → plan → build → review, mỗi lần có chi phí cố định.
- `GoalSpec` phải là union mở rộng được từ giai đoạn 1, tức là trả một ít giá thiết
  kế cho hai loại mục tiêu còn chưa tồn tại.
- Người chơi ở giai đoạn 1 chỉ có 6 màn với 2 loại mục tiêu — chưa phải sản phẩm
  hoàn chỉnh, và điều đó phải được nói rõ chứ không giấu.

**Điều kiện xem lại quyết định này:** nếu giai đoạn 3 cho thấy ô chặn và vật thể rơi
chia sẻ gần hết cơ chế, thì gộp giai đoạn 3 với 4 và viết ADR mới.
