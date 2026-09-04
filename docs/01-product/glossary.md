# Thuật ngữ

> **Trả lời:** Khái niệm này gọi là gì trong code, và hiện ra sao trên UI?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** xuất hiện một khái niệm nghiệp vụ mới trong code hoặc UI

<!-- CÁCH ĐIỀN
File này KHOÁ TÊN GỌI. Mục đích: mọi phiên làm việc đặt tên biến / bảng / route
giống nhau, thay vì mỗi lần tự nghĩ ra một tên mới cho cùng một khái niệm.

Chỉ thêm dòng khi khái niệm ĐÃ xuất hiện trong code hoặc UI. Bảng đầy khái niệm
tưởng tượng thì vô dụng.

Đổi trạng thái sang 🟡 ngay khi có dòng thật đầu tiên.
KHÔNG chứa: giải thích nghiệp vụ dài (-> overview.md).
-->

| Thuật ngữ | Định nghĩa một câu | Tên trong code | Tên trên UI (VI) | Tên trên UI (EN) |
| --- | --- | --- | --- | --- |
| Piece | Một viên trên bàn, có màu và có thể có hiệu ứng đặc biệt | `Piece` | viên | piece |
| Cell | Một ô của bàn; rỗng (`null`) trong lúc đang giải | `Cell` | ô | cell |
| Board | Lưới ô của một màn | `grid` (trong `Session`) | bàn | board |
| Special | Loại hiệu ứng đặc biệt của một viên | `Special` | quân đặc biệt | special |
| Striped | Viên sọc, xoá cả hàng hoặc cả cột | `stripedH` / `stripedV` | viên sọc | striped |
| Wrapped | Viên bom, xoá vùng 3×3 quanh nó | `wrapped` | viên bom | wrapped |
| Color bomb | Viên xoá toàn bộ một màu | `colorBomb` | bom màu | color bomb |
| Match | Một nhóm >= 3 viên cùng màu thẳng hàng hoặc hình L/T | `Match` | match | match |
| Cascade | Vòng giải kế tiếp sinh ra do viên rơi xuống tạo match mới | `cascade` | chuỗi | cascade |
| Move | Một lần swap của người chơi mà tạo được match (mới bị trừ lượt) | `movesLeft` | lượt | move |
| Goal | Điều kiện phải đạt để thắng màn | `GoalSpec` / `GoalProgress` | mục tiêu | goal |
| Level | Một màn: kích thước bàn, số màu, số lượt, mục tiêu, mốc sao | `LevelConfig` | màn | level |
| Star | Mức thành tích 0-3 của một màn, chấm theo mốc điểm | `stars` | sao | star |
| Session | Trạng thái một lượt chơi đang diễn ra của một màn | `Session` | — (không hiện) | — |
| Progress | Tiến độ lưu lại: sao, điểm cao, màn đã mở | `Progress` | tiến độ | progress |
| Reshuffle | Xáo lại bàn khi không còn nước đi hợp lệ | `reshuffle` | xáo bàn | reshuffle |
| Game event | Một việc đã xảy ra trong một nước đi, do engine phát ra | `GameEvent` | — (không hiện) | — |

**Tên bị cấm:** dùng `Piece`, **không** dùng `Candy`/`Gem`/`Tile` cho mô hình dữ
liệu (`Tile` chỉ là tên **component UI** vẽ một `Piece`, không phải khái niệm nghiệp
vụ). Dùng `Special`, không dùng `PowerUp`/`Booster` — `booster` sẽ là khái niệm khác
nếu giai đoạn sau làm vật phẩm người chơi chủ động dùng. Dùng `Goal`, không dùng
`Objective`/`Mission`. Dùng `movesLeft`, không dùng `turns`/`lives`.
