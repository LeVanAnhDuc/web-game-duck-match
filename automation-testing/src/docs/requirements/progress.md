# PROGRESS — Lưu tiến độ trên máy người chơi

Truy vết phía app: FR-07 · US-03 · invariant #10 · NFR-REL-03 · NFR-DATA-04 · ADR-0001.

- **REQ-PROGRESS-01** Thắng một màn thì tiến độ được lưu trong localStorage dưới **một** khoá `match3.progress.v1`, dạng `{version: 1, levels: {<id>: {stars, bestScore}}, unlockedUpTo}`: số sao và điểm bằng đúng số sao và điểm của ván vừa thắng, màn kế được mở.
- **REQ-PROGRESS-02** Đóng tab hay tải lại trang không mất tiến độ: bản đồ mở lại đúng số màn đã mở, đúng sao và điểm cao từng màn (US-03).
- **REQ-PROGRESS-03** Chỉ thắng mới ghi: thua, hay đi vài nước rồi rời màn, không đổi gì trong bản lưu.
- **REQ-PROGRESS-04** Thắng lại một màn với kết quả kém hơn không làm mất kỷ lục: điểm cao nhất và số sao giữ giá trị lớn hơn, `unlockedUpTo` không bao giờ giảm.
- **REQ-PROGRESS-05** Bản lưu hỏng, sai version hoặc sai hình dạng thì app vẫn mở và về trạng thái người chơi mới (chỉ màn 1 mở) — không màn hình trắng, không màn hình lỗi (NFR-REL-03).
- **REQ-PROGRESS-06** Khi đăng nhập Ducker ID tắt, game không cất gì khác vào trình duyệt: localStorage chỉ có `match3.progress.v1` (sau khi thắng), sessionStorage trống (NFR-DATA-04).
- **REQ-PROGRESS-07** Thắng màn cuối lưu kết quả màn 6 và giữ `unlockedUpTo` ở 6 (không có màn 7).
