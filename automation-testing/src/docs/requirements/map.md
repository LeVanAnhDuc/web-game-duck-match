# MAP — Bản đồ màn

Truy vết phía app: FR-06 · FR-20 · US-01 bước 1 · US-03 bước 1 · ADR-0004.

- **REQ-MAP-01** Mở app (`./`) là thấy bản đồ màn: tiêu đề "Bản đồ màn" và đúng 6 thẻ "Màn 1"…"Màn 6" theo thứ tự.
- **REQ-MAP-02** Người chơi mới chỉ mở được màn 1: màn 1 là liên kết tới `play/1/`; màn 2–6 khoá — **không** phải liên kết, đánh dấu `aria-disabled="true"`, ghi "Chưa mở" và điều kiện mở "Thắng màn N−1 để mở".
- **REQ-MAP-03** Bấm vào một thẻ khoá không làm gì: vẫn ở bản đồ.
- **REQ-MAP-04** Thẻ màn đã mở nhưng chưa có thành tích ghi "Chưa có tiến độ" và hàng sao đọc được là "Đạt 0/3 sao".
- **REQ-MAP-05** Thẻ màn có thành tích hiện số sao ("Đạt n/3 sao"), "Điểm cao nhất: X" với X nhóm theo `vi-VN` (4.200), và khi chưa đủ 3 sao thì "Còn Y điểm nữa là thêm một sao" (Y = ngưỡng sao kế tiếp − điểm cao nhất); đủ 3 sao thì không có dòng đó.
- **REQ-MAP-06** Đầu bản đồ có khối nhận diện sản phẩm: "Duck Match", câu "Xếp 3 viên cùng hình để đạt mục tiêu của từng màn" và câu trấn an "6 màn · chơi ngay trên trình duyệt · không đăng nhập, không mất phí" (bản build cờ đăng nhập tắt).
- **REQ-MAP-07** Bấm một màn đã mở thì vào màn đó (`play/<id>/`, tiêu đề "Màn <id>", có bàn); liên kết "Về bản đồ" trên màn chơi đưa về bản đồ.
