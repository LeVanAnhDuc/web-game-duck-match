# p04 · Nam — RR-03 · Đóng tab rồi mở lại, tiến độ còn nguyên

- **Thiết bị dựng lại:** viewport 1440×900, mạng không throttle
- **Trạng thái ban đầu:** localStorage + cookie sạch — tiến độ trong phiên là do **chính
  persona tạo ra** (thắng Màn 1 và Màn 2), không gieo sẵn, vì thứ cần đo là tiến độ tự tay
  người chơi làm ra có sống qua lần tải lại không
- **Công cụ:** Playwright
- **Kết quả:** ĐẠT `done_when` — sau khi tải lại, bản đồ hiện đúng số màn đã mở, đúng sao
  và điểm cao của từng màn; không màn hình trắng, không màn hình lỗi

---

## 1. Ấn tượng 5 giây

Mở link ra, chưa bấm gì, chỉ thấy một cái tiêu đề "Bản đồ màn" với 6 ô, ô đầu ghi "Màn 1" kèm hình sao và chữ "Chưa có tiến độ", 5 ô sau khóa "Chưa mở".

- Đây là trang gì, làm được gì cho tôi? Chắc là một game giải đố kiểu nối 3 viên, đây là màn hình chọn màn chơi.
- Trang này dành cho người như tôi hay ai khác? Không rõ, không thấy tên game to, không thấy hình ảnh gì bắt mắt, trông như một cái danh sách trần trụi hơn là một trò chơi.
- Tin đủ để nhập email/số điện thoại không? Trang không hỏi gì cả nên không phải nghĩ, nhưng nếu có hỏi chắc tôi ngần ngại vì trang nhìn "để không", không có gì chứng minh đây là chỗ đáng tin.
- Ba từ: "trống trải", "không rõ đây là gì", "đơn giản quá mức".

## 2. Chuyện đã xảy ra

Tôi bấm vào Màn 1 (ô duy nhất mở khóa). Ra một bàn ghép hình 7x7, có "Lượt: 15", "Điểm: 0", mục tiêu "0/2.000". Tôi nghĩ: "À giống kiểu Candy Crush, kéo 2 viên đổi chỗ cho thẳng hàng 3 viên cùng màu." Tôi kéo vài nước, điểm tăng dần, đến nước thứ 3 đã vượt mục tiêu (2.040/2.000), hiện bảng "Thắng màn!" nhưng chỉ được 1/3 sao. Tôi nghĩ: "Ơ chỉ 1 sao thôi à, chắc phải chơi khéo hơn mới đủ sao, nhưng thắng là được." Bấm "Màn tiếp" sang Màn 2.

Ở Màn 2 mục tiêu 4.000 điểm, khó hơn. Giữa chừng tôi ăn ra một viên đặc biệt có sọc ngang màu đỏ. Tôi thử kéo nó qua ô bên cạnh để "kích nổ" — không có gì xảy ra, bàn không đổi, lượt không giảm. Tôi thử kéo qua hướng khác — vẫn vậy. Tôi thử bấm chọn nó rồi bấm ô kế bên (kiểu tap-tap) — cũng không ăn thua. Trong đầu tôi nghĩ: "Ủa sao viên này kéo hoài không chịu nổ vậy ta, hay tại mình bấm sai chỗ?" Tôi bỏ qua, quay lại ăn các nước thường khác cho tới khi đạt 4.440/4.000, thắng Màn 2, cũng chỉ 1/3 sao. Bấm "Về bản đồ".

Về bản đồ, tôi đọc kỹ từng dòng như thói quen kiểm tra: Màn 1 — 1/3 sao, Điểm cao nhất: 2.040. Màn 2 — 1/3 sao, Điểm cao nhất: 4.440. Màn 3 — 0/3 sao, "Chưa có tiến độ" nhưng đã mở khóa (bấm được). Màn 4, 5, 6 — vẫn khóa "Chưa mở". Tôi ghi nhớ chính xác mấy con số này.

Rồi tôi tải lại trang, giả bộ như hôm sau mở lại. Lúc đang chờ trang load tôi nghĩ: "Thôi chắc về 0 hết cho coi, có tài khoản gì đâu mà lưu, chắc lại thấy Màn 1 'chưa có tiến độ' y như lúc nãy." Nhưng trang load xong, tôi so từng dòng: Màn 1 vẫn 1/3 sao — 2.040. Màn 2 vẫn 1/3 sao — 4.440. Màn 3 vẫn 0/3 sao — chưa có tiến độ nhưng vẫn mở. Màn 4, 5, 6 vẫn khóa. Không có màn hình trắng, không có lỗi gì, y hệt như trước khi tải lại.

Kết luận thẳng: tiến độ KHÔNG mất. Trái với những gì tôi mặc định lúc đầu (nghĩ chắc chắn mất vì không đăng nhập), trang này tự lưu lại được, không cần tài khoản.

## 3. Con số

- Số hành động chính: 2 lần mở/tải trang, 2 lần bấm nút chuyển màn ("Màn tiếp", "Về bản đồ"), khoảng 13 lần kéo viên ăn điểm thành công.
- Số lần bấm/kéo vào chỗ không phản hồi: 4 lần, tất cả đều liên quan tới việc cố kích hoạt viên đặc biệt "sọc ngang đỏ" ở Màn 2 (2 lần kéo hai hướng khác nhau + 1 lần bấm chọn + 1 lần bấm ô kế bên).
- Số lần quay lui: 0.
- Kết quả cuối: xong việc, không bỏ cuộc — thắng cả 2 màn, kiểm tra lại sau khi tải lại thấy đúng y như trước.

## 4. Ba từ sau khi dùng

"Nhẹ nhõm", "bất ngờ theo hướng tốt", "vẫn hơi mù mờ". Có quay lại không? Có — vì đúng cái tôi cần: mở lại không mất tiến độ, không phải chơi lại từ đầu. So với ấn tượng ban đầu (thấy trang trống trải, không chắc có tin được không), giờ tôi tin hơn hẳn nhờ vào hành vi thực tế của nó (tự lưu được), dù cảm giác ban đầu về "trang này rốt cuộc là gì" thì vẫn chưa thay đổi mấy.

## 5. Đính kèm thô

Ảnh:
- p04-01-first-open.png — lúc mới mở trang, bản đồ màn với Màn 1 "Chưa có tiến độ".
- p04-02-win-level1.png — bảng "Thắng màn!" của Màn 1, 2.040 điểm, 1/3 sao.
- p04-03-map-before-reload.png — bản đồ màn ngay trước khi tải lại (Màn 1: 1/3 sao – 2.040; Màn 2: 1/3 sao – 4.440; Màn 3: 0/3 sao – chưa có tiến độ, mở; Màn 4-6: khóa).
- p04-04-map-after-reload.png — bản đồ màn ngay sau khi tải lại (giống hệt p04-03).

Log console (nguyên trạng, không bình luận):
```
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
[WARNING] The resource .../a65324f02aa278dc-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../6a9c36ea9dc9b36b-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../ee40bb094c99a29a-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../86fbc9d8e118e1a5-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
(bốn dòng woff2 trên lặp lại hai lần — một lần cho mỗi lần tải trang)
```
