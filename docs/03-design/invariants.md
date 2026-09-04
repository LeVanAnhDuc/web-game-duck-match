# Bất biến chịu lực

> **Trả lời:** Sửa gì thì hệ thống sai **âm thầm** — test vẫn xanh mà kết quả vẫn sai?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** phát hiện một bất biến mới — thường là ngay sau khi ai đó vừa phá nó

<!-- CÁCH ĐIỀN
ĐỌC FILE NÀY TRƯỚC KHI SỬA BẤT KỲ DÒNG CODE NÀO.

Bất biến ở đây KHÁC quy ước code. Quy ước format/naming thì ESLint bắt được; bất
biến thì không có công cụ nào bắt, và vi phạm nó thì code vẫn chạy, test vẫn xanh,
chỉ có kết quả là sai.

GIỮ FILE NÀY < 40 DÒNG NỘI DUNG. Nó được đọc mỗi lần sửa code; dài ra là không ai
đọc nữa. Thứ gì không thuộc loại "sai âm thầm" thì bỏ ra khỏi đây.

KHÔNG chứa: quy ước format/naming (-> lint config), kiến trúc (-> architecture.md).

Các bất biến mặc định của bộ scaffold (UTC · kiểm quyền server · tầng service ·
float · soft-delete · idempotent · migration · middleware · quyền sở hữu theo
session) đã được rà và **không áp dụng** cho dự án này: không có server, không có
datastore, không có tài khoản, không có tiền. Chúng bị bỏ ở đây thay vì giữ làm
nhiễu — xem `02-requirements/nfr.md` cho phần NFR tương ứng bị đánh (bỏ).
-->

| # | Bất biến | Vi phạm thì sao |
| --- | --- | --- |
| 1 | Mọi ngẫu nhiên trong `src/engine/` đi qua `rng` của `Session`. Không `Math.random()`, không `Date.now()` | Bàn không tái tạo được từ seed. Bug người chơi báo không dựng lại được, mà test vẫn xanh vì test tự chọn seed |
| 2 | `ui/` và `game/` **không tính điểm, không tự tìm match** — chỉ phát lại `GameEvent[]` | Điểm trên màn hình lệch điểm engine. Chỉ lộ ra ở màn khó, sau nhiều cascade |
| 3 | Input bị khoá đến khi hàng đợi sự kiện phát xong | Người chơi swap tầng hai giữa cascade, engine nhận `Session` cũ → bàn hỏng âm thầm |
| 4 | `applySwap` là **hàm thuần**: không sửa `Session` đầu vào, trả về `Session` mới | React thấy cùng tham chiếu nên không render lại; hoặc "chơi lại" mang theo trạng thái cũ |
| 5 | Trong một vòng giải, một viên chỉ **kích hoạt một lần** (theo `Piece.id`) | Sọc và bom kích hoạt vòng tròn cho nhau → treo tab, hoặc điểm phồng lên vô lý |
| 6 | Lượt chỉ trừ khi swap **tạo được match**. Swap bị hoàn tác không trừ lượt | Người chơi hết lượt vì thao tác thăm dò; không ai báo bug, họ chỉ bỏ game |
| 7 | Thắng/thua chỉ được kiểm ở **cuối** `applySwap`, sau khi cascade dừng | Thua ở giữa cascade dù cascade đó vừa đủ điểm để thắng |
| 8 | Xáo bàn giữ **nguyên số lượng từng màu và từng quân đặc biệt** | Mục tiêu `collect` thành bất khả thi hoặc quá dễ tuỳ lần xáo, không tái tạo được |
| 9 | `Piece.id` là duy nhất trong một `Session` và **không tái dùng** sau khi viên bị xoá | React `key` trùng → animation nhảy sai ô, và `Set` id đã kích hoạt (bất biến 5) mất tác dụng |
| 10 | `ProgressRepository` chỉ được ghi khi **thắng**. Bản ghi mới giữ **điểm cao hơn** và **số sao cao hơn**, còn `unlockedUpTo` chỉ tăng, không giảm — kể cả khi lần thắng này điểm thấp hơn lần trước | Điểm cao hoặc sao bị lần thắng kém hơn ghi đè, hoặc màn đã mở bị khoá lại. Người chơi mất thành tích mà không có gì báo |
