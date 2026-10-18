# PLAY — Bàn chơi và đổi chỗ

Truy vết phía app: FR-01 · FR-16 · FR-17 · FR-19 · US-01 bước 2–3 · invariant #3, #6 · ADR-0010.

- **REQ-PLAY-01** Vào màn N (`play/N/`): tiêu đề "Màn N", số lượt = số lượt của màn, điểm `0`, bàn đúng kích thước của màn (7×7, 8×8 hoặc 9×9). Mỗi ô là một nút có tên "Ô hàng r cột c, viên <màu>" đúng màu viên đang vẽ ở đó.
- **REQ-PLAY-02** Bàn mở ra đã "lắng": không có hàng ba nào đứng sẵn, và có ít nhất một nước đổi chỗ hợp lệ.
- **REQ-PLAY-03** Đổi chỗ hai viên kề nhau tạo được hàng ba (hợp lệ) thì trừ đúng 1 lượt và cộng điểm (ít nhất 180 = 3 viên × 60 cho một hàng ba đơn), bàn đổi.
- **REQ-PLAY-04** Đổi chỗ không tạo hàng ba (không hợp lệ) không tốn gì: lượt và điểm giữ nguyên, bàn trở về y như cũ; cặp viên bị từ chối được đánh dấu và vùng thông báo nói "Nước đi không hợp lệ — hai viên không tạo được hàng ba, lượt chưa bị trừ" (invariant #6, FR-19).
- **REQ-PLAY-05** Ba cách đổi chỗ đều chơi được: bàn phím (Enter trên viên, mũi tên sang viên kề, Enter), chạm-rồi-chạm (bấm viên rồi bấm viên kề), và kéo một viên thả lên viên kề.
- **REQ-PLAY-06** Chọn viên: lần bấm đầu chọn (ô được đánh dấu `aria-selected`), bấm lại chính viên đó bỏ chọn, bấm một viên không kề thì chuyển lựa chọn sang viên đó (không đổi chỗ), Esc bỏ chọn.
- **REQ-PLAY-07** Trong lúc bàn đang chạy hiệu ứng (`aria-busy="true"`) mọi thao tác trên bàn bị bỏ qua — không có nước thứ hai chen vào giữa cascade (invariant #3).
- **REQ-PLAY-08** Người chơi đứng yên 5 giây thì hai viên của một nước hợp lệ được nhấp nháy gợi ý; trước 5 giây không có gợi ý, và gợi ý biến mất khi người chơi đi một nước (FR-17, FR-19).
- **REQ-PLAY-09** Viên được vẽ ở một lớp riêng trên các ô: mỗi ô có đúng một viên, và viên chiếm phần lớn ô (rộng hơn 70% ô) (FR-16, ADR-0010).
