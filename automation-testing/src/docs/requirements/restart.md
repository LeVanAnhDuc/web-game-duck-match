# RESTART — Chơi lại màn đang chơi

Truy vết phía app: FR-22 · US-02 bước 3 · NFR-A11Y-04 · ux-remediation F-07, F-10.

- **REQ-RESTART-01** Bấm "Chơi lại" khi chưa đi nước nào (không có gì để mất) thì xếp lại bàn ngay, không hỏi: bàn mới khác bàn cũ, lượt và điểm như lúc đầu.
- **REQ-RESTART-02** Bấm "Chơi lại" sau khi đã đi ít nhất một nước thì hiện hộp hỏi "Chơi lại từ đầu?" nói rõ "Điểm <điểm> của lượt chơi này sẽ mất và bàn được xếp lại từ đầu." và "Sao và điểm cao nhất bạn đã đạt ở màn này vẫn được giữ nguyên."; focus vào "Thôi, chơi tiếp"; trong lúc hộp mở không có gì bị đặt lại.
- **REQ-RESTART-03** Chọn "Chơi lại" trong hộp hỏi thì hộp đóng, lượt về đủ, điểm về 0 và bàn được xếp mới.
- **REQ-RESTART-04** "Thôi, chơi tiếp" hoặc Esc đóng hộp hỏi và để nguyên lượt, điểm, bàn.
- **REQ-RESTART-05** Tab chỉ vòng giữa hai nút của hộp hỏi.
- **REQ-RESTART-06** Mỗi lần bàn được xếp lại (có hỏi hay không), vùng thông báo nói "Đã xếp lại bàn từ đầu" — kể cả lần thứ hai liên tiếp (nội dung vùng thông báo phải đổi để trình đọc màn hình đọc lại).
