# RESULT — Kết thúc màn: thắng, thua, dialog kết quả

Truy vết phía app: FR-05 · FR-20 · US-01 bước 4–5 · US-02 · invariant #7 · NFR-A11Y-04.

- **REQ-RESULT-01** Mỗi nước hợp lệ trừ đúng 1 lượt, điểm không bao giờ giảm, và màn kết thúc bằng dialog kết quả khi đạt mọi mục tiêu hoặc khi hết lượt.
- **REQ-RESULT-02** Đạt mục tiêu thì dialog "Thắng màn!" hiện số sao "Đạt n/3 sao" (n = số ngưỡng sao của màn mà điểm đạt tới), điểm nhóm theo `vi-VN`, và khi n < 3 thì "Còn X điểm nữa là thêm một sao" (X = ngưỡng kế tiếp − điểm); đủ 3 sao thì không có dòng đó.
- **REQ-RESULT-03** Hết lượt mà chưa đạt mục tiêu thì dialog "Hết lượt!" có cùng bố cục (sao, điểm, điểm còn thiếu cho sao kế), thêm danh sách mục tiêu với phần còn thiếu ("5.580/6.000") và câu "Sao và điểm cao nhất của bạn được giữ nguyên."; không có "Màn tiếp".
- **REQ-RESULT-04** Dialog nhận focus ngay khi mở (nút đầu tiên: "Màn tiếp" khi thắng, "Chơi lại" khi thua), Tab chỉ vòng trong dialog, Esc đưa về bản đồ.
- **REQ-RESULT-05** "Màn tiếp" mở màn kế (`play/N+1/`) từ đầu: đủ lượt, điểm 0, không dialog.
- **REQ-RESULT-06** "Về bản đồ" sau khi thắng thấy màn kế đã mở; sau khi thua thì không mở thêm màn nào và không khoá lại màn nào.
- **REQ-RESULT-07** "Chơi lại" trên dialog cho bàn mới của **cùng màn**: đủ lượt, điểm 0, bàn khác bàn vừa chơi, không hỏi lại.
- **REQ-RESULT-08** Thắng màn cuối (màn 6) không có "Màn tiếp".
