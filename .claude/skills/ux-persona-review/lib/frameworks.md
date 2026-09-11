# Tám lăng kính, bảng điểm, và luật xếp hạng

## Luật chống bịa

Mỗi phát hiện bắt buộc kèm **dẫn chứng**: persona nào, bước thứ mấy, câu nói nguyên văn,
ảnh nào. Không dẫn chứng thì không được thành phát hiện. Không có ngoại lệ.

## Bắt buộc mở ảnh ra nhìn

Tool `Read` của bạn **xem được ảnh**, không chỉ đọc chữ. Hai lăng kính cuối bảng dưới đây
không thể chấm bằng cách đọc mô tả — bạn phải mở từng screenshot trong thư mục run ra và
nhìn. Chấm thị giác mà chưa mở ảnh nào là bịa, và rơi vào luật chống bịa ở trên.

Ảnh tối thiểu phải xem: ảnh lúc mới mở trang của **mọi** persona, và ảnh ở mỗi điểm kẹt.

## Tám lăng kính

| Lăng kính | Đi tìm gì trong log |
| --- | --- |
| ISO 9241-11 | xong việc không / tốn bao nhiêu / cảm giác ra sao, đặt trong bối cảnh dùng thật của persona |
| LATCH | thông tin đang xếp theo trục nào (Location, Alphabet, Time, Category, Hierarchy), persona đi tìm theo trục nào — lệch nhau ở đâu |
| Trigger words | chữ trên nút/nhãn có khớp từ persona tự nghĩ ra không; chỗ nào persona đọc mà không dám bấm |
| Interaction Design | phản hồi, trạng thái chờ, khả năng quay lui, hậu quả của thao tác sai |
| Visual hierarchy | thứ quan trọng nhất có được nhìn thấy trước không; persona nhìn nhầm thứ gì thành thứ gì |
| Form design | nhãn, thứ tự trường, báo lỗi, chỗ persona nhập sai rồi phải sửa |
| **Visual craft** | mở ảnh ra nhìn: chữ có dễ đọc không, khoảng cách có nhịp không, các thành phần có nhất quán không, trang trông chỉn chu hay tạm bợ. Đối chiếu với `.claude/uiux/` của project nếu có — token của project thắng cảm nhận chung của bạn |
| **Trust & desirability** | từ mục "Ấn tượng 5 giây" và "Ba từ sau khi dùng": persona đoán trang này là gì — đoán đúng không; có dám nhập email không và vì sao; ba từ trước so với ba từ sau đổi theo hướng nào |

Một phát hiện gắn được nhiều lăng kính cùng lúc. Đừng nhân bản nó ra thành nhiều phát hiện.

Sáu lăng kính đầu hỏi *dùng có trôi không*. Hai lăng kính cuối hỏi *nhìn có tin được, có
muốn quay lại không*. Một sản phẩm có thể đạt điểm tuyệt đối ở sáu cái đầu mà vẫn hỏng ở hai
cái cuối — người ta làm xong việc rồi không bao giờ quay lại.

## Bảng điểm từng Red Route

- **Hiệu quả** = số persona đạt `done_when` / số persona đã thử.
- **Hiệu suất** = trung vị số bước thực tế / `min_steps` của Red Route đó.
- **Hài lòng** = phân loại từ chính ngôn ngữ persona dùng, không tự cho điểm số.

## Bảng ấn tượng đầu

Tính trên **toàn bộ** persona, không chia theo Red Route — ấn tượng đầu chỉ xảy ra một lần.

- **Đoán đúng trang này là gì** = số persona đoán đúng / tổng số. Đây là thước gắt nhất
  của trang chủ: đoán sai nghĩa là thông điệp chính chưa tới.
- **Dám nhập email** = số persona trả lời có / tổng số, kèm lý do họ nói ra.
- **Ba từ trước → ba từ sau**: gom lại, chỉ ra từ nào lặp ở nhiều persona. Từ tiêu cực lặp
  từ 2 người trở lên là một phát hiện, không phải chuyện cảm tính.

Không quy bảng này thành điểm số. Liệt kê nguyên văn từ persona dùng.

## Luật mức nghiêm trọng

| Điều kiện | Mức |
| --- | --- |
| chặn hoàn thành `done_when` | Critical / High |
| chỉ tốn thêm bước | Medium |
| gây khó chịu, không cản trở | Low |

Rồi **nâng một bậc nếu từ 2 persona trở lên cùng vấp**. Số persona vấp là bằng chứng đây
không phải chuyện cá biệt của một người.

## Cái không được làm

- Không đề xuất giải pháp thiết kế chi tiết. Chỉ ra hướng, để người làm sản phẩm quyết.
- Không chấm điểm tổng thể kiểu "7/10". Bảng điểm ở trên đã đủ.
- Không nhận xét về code, kiến trúc, hay công nghệ. Bạn chưa từng thấy code.
