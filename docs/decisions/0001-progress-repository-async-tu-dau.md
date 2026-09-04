# ADR-0001 · `ProgressRepository` trả `Promise` ngay từ đầu, dù adapter đầu tiên là localStorage

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** FR-07 · FR-14 · NFR-REL-03 · NFR-DATA-04

## 1. Bối cảnh

Tiến độ người chơi (sao, điểm cao, màn đã mở) giai đoạn này lưu ở localStorage —
người dùng chốt "tạm thời local nhưng chừa đường cho việc tích hợp backend trong
tương lai" (FR-14). localStorage là API **đồng bộ**; mọi backend sau này sẽ là
**bất đồng bộ**. Interface `ProgressRepository` phải chọn một trong hai, và chọn
sai thì phải sửa lại toàn bộ nơi gọi.

## 2. Quyết định

`ProgressRepository` khai báo `load(): Promise<Progress>` và
`save(p: Progress): Promise<void>`. Adapter localStorage đọc/ghi đồng bộ rồi bọc
kết quả trong `Promise.resolve()`. Mọi nơi gọi — chỉ có `ui/` — dùng `await` và có
sẵn trạng thái đang tải cùng nhánh lỗi ngay từ giai đoạn 1.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Interface đồng bộ, đổi sang async khi có backend | Đổi đồng bộ → async lan ra mọi call site và mọi test, kéo theo trạng thái loading và nhánh lỗi mà UI chưa từng có. Rẻ hơn nhiều nếu trả giá ngay bây giờ, khi chỉ có hai màn hình |
| Hai interface song song (sync cho local, async cho remote) | Hai interface cho một khái niệm là hai nguồn đúng. Nơi gọi sẽ phải biết mình đang dùng cái nào — đúng thứ mà cổng lưu trữ tồn tại để che |
| Bỏ interface, gọi localStorage trực tiếp | Không có chỗ cắm backend. Và mọi test UI sẽ phải dựng localStorage thật |

## 4. Hệ quả

**Được:**
- Thêm `storage/http.ts` là đủ để có FR-14; không sửa `engine/`, không sửa `ui/`.
- UI có nhánh loading và nhánh lỗi từ đầu, nên NFR-REL-03 được kiểm ngay giai đoạn 1
  thay vì phát hiện lúc gắn backend.
- Test dùng adapter trong bộ nhớ, không cần localStorage thật.

**Mất / phải chấp nhận:**
- `async`/`await` cho một phép đọc thực chất tức thời — thêm một lần render cho một
  việc không cần nó.
- Bản đồ màn hiển thị trạng thái đang tải trong một khoảnh khắc gần như bằng 0, phải
  làm sao cho nó không nháy.

**Điều kiện xem lại quyết định này:** nếu đến giai đoạn 5 mà FR-14 đã bị chuyển thành
Non-Goal dứt khoát, thì cổng này là chi phí không có người mua — lúc đó viết ADR mới
để gỡ bỏ nó.
