# Năng lực trình duyệt cần có, và thứ tự fallback

Skill khai **năng lực cần**, không gọi cứng tên tool. Trước mỗi lần chạy, dò xem tool nào
đang bật rồi chọn theo thứ tự dưới đây.

## Năng lực bắt buộc

điều hướng · click · nhập liệu · chụp màn hình · đọc console · đặt viewport · throttle mạng

Thiếu bất kỳ năng lực nào thì **dừng và báo**, không degrade âm thầm. Một phiên không đặt
được viewport sẽ âm thầm biến persona dùng điện thoại thành persona dùng desktop, và báo cáo
vẫn trông hợp lý — đó là kiểu hỏng tệ nhất.

## Thứ tự ưu tiên

| Hạng | Công cụ | Vì sao |
| --- | --- | --- |
| 1 | `playwright` | context riêng mỗi phiên → song song thật, sạch cookie, đúng nghĩa "người dùng mới tinh" |
| 2 | `chrome-devtools-mcp` | mạnh về số đo thật, nhưng thường một instance → phải tuần tự |
| 3 | `claude-in-chrome` | phương án chót: chạy trên Chrome cá nhân đã đăng nhập → persona không còn "mới tinh", và phải chạy tuần tự |

Rơi xuống hạng 2 hoặc 3 thì **ghi rõ trong báo cáo**, vì nó làm giảm giá trị của kết quả:
persona mang sẵn session của chủ máy không còn là người lạ nữa.
