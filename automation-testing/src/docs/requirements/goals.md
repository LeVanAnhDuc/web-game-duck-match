# GOALS — Mục tiêu của màn trên HUD

Truy vết phía app: FR-03 · FR-04 · FR-21 · US-01 bước 2, 4 · US-02 bước 2 · NFR-A11Y-06 · NFR-I18N-03.

- **REQ-GOALS-01** Màn có mục tiêu điểm (màn 1, 2, 5; và màn 4, 6 bên cạnh mục tiêu thu viên) hiện một dòng mục tiêu có chữ "Điểm" và "hiện tại/mục tiêu" nhóm theo `vi-VN` ("0/2.000"); tên đọc được của dòng là "Mục tiêu điểm 0/2.000".
- **REQ-GOALS-02** Màn có mục tiêu thu viên hiện một dòng cho **mỗi** màu cần thu, có hình khối riêng của màu đó, tên màu bằng chữ và "hiện tại/mục tiêu" ("đỏ 0/12"); tên đọc được là "Mục tiêu viên đỏ 0/12". Màn 3: đỏ 12; màn 4: xanh dương 12, vàng 12 rồi điểm 4.000; màn 6: tím 12 rồi điểm 4.000.
- **REQ-GOALS-03** Mục tiêu điểm chạy theo điểm: sau mỗi nước, phần "hiện tại" bằng đúng điểm đang hiện ở HUD.
- **REQ-GOALS-04** Mục tiêu thu viên đếm viên đúng màu bị phá: một nước tạo hàng ba màu đỏ ở màn 3 làm "đỏ" tăng ít nhất 3.
- **REQ-GOALS-05** Mục tiêu đã đạt được đánh dấu xong (gạch ngang + dấu tích); mục tiêu chưa đạt thì không.
