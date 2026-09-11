# Danh mục chức năng

> **Trả lời:** Hệ thống có những chức năng nào, mỗi cái đang ở trạng thái gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** brainstorm ra chức năng mới (cấp FR mới) · một FR chuyển trạng thái

<!-- CÁCH ĐIỀN
Chỉ LIỆT KÊ. Một dòng một chức năng, tên ngắn. Cách làm thuộc tài liệu thiết kế
của feature, không thuộc đây.

ID cấp tăng dần, không tái dùng, không xoá. Bỏ một chức năng thì đổi trạng thái
thành (bỏ) và giữ số — vì commit và test cũ vẫn tham chiếu ID đó.

Trạng thái: chưa · đang · xong · (bỏ)

KHÔNG chứa: cách hiện thực, ngưỡng phi chức năng (-> nfr.md), lý do chọn giải pháp
(-> decisions/).
-->

Cột **Giai đoạn** theo ADR-0005 (track luật chơi). `T1` là track **trình bày** —
vuông góc với 5 giai đoạn kia, chen vào trước giai đoạn 2; feature `tactile-board`.

| ID | Chức năng | Thuộc luồng | Giai đoạn | Trạng thái |
| --- | --- | --- | --- | --- |
| FR-01 | Chơi một bàn match-3: swap kề nhau, tìm match, cascade, trọng lực, refill | US-01 | 1 | xong |
| FR-02 | Quân đặc biệt: sinh từ match 4 / L-T / 5, và kích hoạt đơn lẻ | US-04 | 1 | xong |
| FR-03 | Mục tiêu `score` — đạt số điểm trong N lượt | US-01 | 1 | xong |
| FR-04 | Mục tiêu `collect` — thu đủ X viên của từng màu | US-01 | 1 | xong |
| FR-05 | Chấm sao và ghi điểm cao từng màn | US-01 | 1 | xong |
| FR-06 | Bản đồ màn + mở màn tuyến tính | US-01 | 1 | xong |
| FR-07 | Lưu và đọc tiến độ cục bộ qua `ProgressRepository` | US-03 | 1 | xong |
| FR-08 | Phát hiện bế tắc và xáo bàn, không mất lượt | US-01 | 1 | xong |
| FR-09 | Combo khi swap trực tiếp hai quân đặc biệt với nhau | US-04 | 2 | chưa |
| FR-10 | Ô chặn (jelly/đá) + mục tiêu phá hết ô chặn | US-01 | 3 | chưa |
| FR-11 | Vật thể rơi theo trọng lực + mục tiêu đưa xuống đáy | US-01 | 4 | chưa |
| FR-12 | Bộ 15-20 màn hoàn chỉnh + cân độ khó | US-01 | 5 | chưa |
| FR-13 | Âm thanh và tuỳ chọn tắt âm | US-01 | 5 | chưa |
| FR-14 | Đồng bộ tiến độ qua backend (adapter thứ hai của `ProgressRepository`) | US-03 | — | chưa |
| FR-15 | Token và ngôn ngữ hình ảnh: palette đo được, type pairing, viên kiểu clay | US-01 | T1 | xong |
| FR-16 | Bàn chơi có chuyển động: trượt khi đổi chỗ, trượt-qua-rồi-về, rơi, sweep khi quân đặc biệt nổ | US-01 · US-04 | T1 | xong |
| FR-17 | Lớp phản hồi: điểm bay + bậc cascade, gợi ý khi bế tắc, animation xáo bàn, khoảnh khắc thưởng | US-01 · US-02 · US-04 | T1 | xong |
| FR-18 | Viên thu được bay từ ô về bộ đếm mục tiêu ở HUD | US-01 | T1 | chưa |
| FR-19 | Bàn cờ tự giải thích: quân đặc biệt nhận ra được, ô đang chọn mạnh hơn ô đang focus, nước đi bị từ chối để lại dấu, gợi ý nhàn rỗi nhìn thấy được | US-01 · US-04 | T1 | xong |
| FR-20 | Bản đồ màn và hộp thoại kết quả nói đủ: khối nhận diện sản phẩm, ngưỡng sao còn thiếu, điều kiện mở khoá, hộp thoại thua cân bằng với hộp thoại thắng | US-01 · US-02 | T1 | xong |
| FR-21 | HUD gói vào một hàng khi khung nhìn thấp, mục tiêu có nhãn chữ chứ không chỉ icon | US-01 | T1 | xong |
| FR-22 | Hành động phá huỷ tiến độ đang dở phải hỏi lại trước khi thực hiện | US-02 | T1 | xong |
