# ACCESSIBILITY — Bàn phím, vùng chạm, thông báo, chuyển động, hình khối

Truy vết phía app: NFR-A11Y-02 · NFR-A11Y-03 · NFR-A11Y-04 · NFR-A11Y-05 · NFR-A11Y-06 · FR-19.

- **REQ-ACCESSIBILITY-01** Bàn là **một** điểm dừng Tab (đúng một ô có `tabindex="0"`), tới được bằng Tab từ đầu trang; trong bàn, mũi tên di chuyển focus từng ô và dừng ở mép bàn (không vòng, không ra khỏi bàn).
- **REQ-ACCESSIBILITY-02** Ô đang có focus từ bàn phím có vòng focus nhìn thấy được.
- **REQ-ACCESSIBILITY-03** Ở bề rộng 375px, mọi ô của bàn 7×7 và 8×8 rộng và cao ≥ 44px; nút "Chơi lại", liên kết "Về bản đồ" và thẻ màn cao ≥ 44px. Ngoại lệ duy nhất: bàn 9×9 dưới 400px (ô nhỏ hơn 44px nhưng trang không cuộn ngang).
- **REQ-ACCESSIBILITY-04** Lượt và điểm nằm trong một vùng `aria-live="polite"`; tiêu đề thắng/thua của dialog nằm trong một vùng `status` để được đọc ra.
- **REQ-ACCESSIBILITY-05** Khi hệ điều hành bật giảm chuyển động (`prefers-reduced-motion: reduce`), mọi thời lượng chuyển động/animation của viên về gần 0, và bàn được đánh dấu giảm chuyển động sau nước đi đầu tiên.
- **REQ-ACCESSIBILITY-06** Sáu màu viên không phân biệt chỉ bằng màu: mỗi màu luôn vẽ cùng một hình khối riêng (đỏ tròn, xanh dương vuông, xanh lá tam giác, vàng thoi, tím sao, cam lục giác) và không màu nào dùng chung hình.
