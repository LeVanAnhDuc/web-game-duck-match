# EFFECTS — Lớp phản hồi trên bàn

Truy vết phía app: FR-17 · FR-19 · NFR-A11Y-05 · README §Features ("Feedback that teaches the rules", "The board answers every press").

- **REQ-EFFECTS-01** Một match làm điểm bay lên ngay tại chỗ nó xảy ra: một nhãn "+<điểm>" (nhóm `vi-VN`) xuất hiện trên bàn trong lúc cascade chạy rồi biến mất khi bàn lắng.
- **REQ-EFFECTS-02** Khi bật giảm chuyển động, lớp hiệu ứng không vẽ gì cả (không nhãn điểm, không chớp, không quét) — kể cả ở nước đi đầu tiên.
- **REQ-EFFECTS-03** Viên đang được chọn được đánh dấu mạnh hơn ô chỉ đang có focus: khi chọn một viên rồi dời focus sang ô khác bằng phím mũi tên, viên được chọn vẫn mang dấu "đã chọn / nhấc lên", ô đang focus thì không.
