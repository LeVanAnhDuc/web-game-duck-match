# p01 · Thuỷ — RR-01 · Qua màn 1 và mở được màn 2

- **Thiết bị dựng lại:** viewport 375×720, throttle Slow 4G (CDP: 1.6 Mbps down / 750 kbps up / 562.5 ms RTT)
- **Trạng thái ban đầu:** localStorage + cookie đã xoá sạch — người chơi hoàn toàn mới
- **Công cụ:** Playwright
- **Kết quả:** ĐẠT `done_when` — đang ở Màn 2, và bản đồ hiện Màn 2 đã mở khoá

---

**1. Ấn tượng 5 giây**

Vừa mở link, chưa bấm gì, nhìn màn hình thấy chữ "Bản đồ màn" và một danh sách Màn 1 tới Màn 6, chỉ Màn 1 sáng, mấy màn sau ghi "Chưa mở". Trông y như game xếp hình chia màn kiểu Candy Crush nên mình đoán: đây là game giải đố theo màn, chơi được ngay không cần đăng nhập gì. Trang này rõ ràng làm cho người thích chơi giải trí nhẹ như mình, không phải cho dân kỹ thuật gì cả. Chưa thấy chỗ nào đòi nhập email/số điện thoại nên chưa phải lo khoản đó — nhưng giao diện hơi trống, không có hình con vịt hay màu mè gì nổi bật như tên game "Duck Match" làm mình tưởng, nên cũng hơi ngờ ngợ không biết đây có phải bản đầy đủ hay chỉ là bản thử nghiệm. Ba từ lúc đó: "đơn giản", "trống trải", "tò mò".

**2. Chuyện đã xảy ra**

- Thấy "Bản đồ màn" với 6 màn, chỉ Màn 1 bấm được → tưởng đây là danh sách level game match-3 → bấm vào Màn 1.
- Vào màn chơi thấy lưới 7x7 toàn viên kẹo màu (đỏ, vàng, tím, xanh lá, xanh dương), phía trên có "Lượt: 15", "Điểm: 0" và "Mục tiêu: 0/2.000" → đúng là game kiểu Candy Crush rồi → theo phản xạ, mình kéo thử một viên sang viên bên cạnh xem có ăn không.
- Lần kéo đầu tiên (đỏ kéo qua vàng) không có gì xảy ra — bàn im re, lượt vẫn 15, điểm vẫn 0. Lúc đó mình nghĩ trong đầu: "Ủa kéo không ăn à, hay mình kéo sai chỗ?" Không có rung hay báo gì để biết là kéo bị từ chối, hơi bối rối một chút.
- Kéo lần 2 (đổi hai viên khác) thì ăn được, điểm nhảy lên 180, ăn được một dây dài luôn (mấy viên rớt xuống liên tục). Từ đó mình cứ kéo tiếp, kéo lần nào cũng ăn: điểm lên 360, rồi 900, rồi 1.560 — cứ mỗi lần kéo là bàn đổ ập xuống ăn theo dây dài, sướng tay.
- Có lúc thấy một viên khác hẳn — "viên sọc ngang đỏ" — chắc là kiểu kẹo đặc biệt. Mình tò mò kéo nó qua viên đỏ thường bên cạnh xem có nổ to không, nhưng kéo xong chẳng có gì xảy ra, điểm và lượt đứng yên y nguyên. Hơi tiếc vì tưởng sẽ có hiệu ứng đẹp.
- Kéo tiếp một nước bình thường khác thì điểm nhảy vọt lên 2.640, vượt mục tiêu 2.000 luôn, và màn hình hiện ngay bảng "Thắng màn!" với hình sao — nhưng chỉ được 1/3 sao dù điểm gần gấp rưỡi mục tiêu, mình hơi ngạc nhiên: "Ơ điểm cao vậy sao chỉ được 1 sao?"
- Bấm "Màn tiếp" thì sang thẳng Màn 2, bàn xếp hình mới hiện ra ngay, không phải chờ đợi hay bị chặn lại gì cả.
- Quay lại "Về bản đồ" xem lại thì thấy Màn 1 đã ghi "Đạt 1/3 sao — Điểm cao nhất: 2.640" và Màn 2 đã sáng lên cho chơi, đúng như mình mong.

**3. Con số**

- Tổng cộng khoảng 7 lần thao tác kéo viên trong lúc chơi (1 lần kéo đầu không ăn, 1 lần kéo con đặc biệt không ăn, 5 lần kéo còn lại ăn điểm).
- 2 lần bấm vào chỗ không có phản hồi rõ ràng (kéo lần đầu, và kéo con "sọc ngang đỏ").
- Không phải quay lui bước nào, không gặp bế tắc kéo dài (mọi lần "không ăn" đều thử lại ngay và qua được).
- Kết quả: chơi xong, thắng Màn 1 (2.640 điểm, đạt 1/3 sao), mở được Màn 2 — hoàn thành đúng việc "thử xem chơi được không".

**4. Ba từ sau khi dùng**

"Dễ chơi", "hơi tiếc rẻ (vì sao thấp)", "muốn chơi thêm". So với lúc đầu ("đơn giản, trống trải, tò mò"), cảm giác đổi theo hướng tích cực hơn hẳn — ban đầu thấy hơi trống và nghi ngờ, chơi xong lại thấy game dễ vào tay, kéo phát ăn liền nên khá cuốn. Có quay lại không? Có, chắc là có — vì cách chơi quen tay giống Candy Crush, kéo cái là ăn ngay, hợp để chơi vài phút trước khi ngủ. Chỉ hơi tiếc là không hiểu vì sao điểm cao mà sao lại thấp, với lại con kẹo đặc biệt kéo không thấy hiệu ứng gì nên hơi cụt hứng.

**5. Đính kèm thô**

Ảnh chụp màn hình (theo thứ tự thời gian):
- `p01-01-mo-trang.png` — lúc mới mở trang, đứng yên chưa bấm gì, thấy bản đồ màn.
- `p01-02-man-choi.png` — vừa vào Màn 1, thấy bàn 7x7 và lượt/điểm/mục tiêu.
- `p01-03-sau-keo-lan-1.png` — sau lần kéo đầu tiên, không có gì đổi.
- `p01-04-sau-keo-lan-2-an-diem.png` — sau lần kéo thứ 2, ăn điểm 180.
- `p01-05-sau-keo-lan-3.png` — sau lần kéo thứ 3, điểm 360.
- `p01-06-sau-keo-lan-4.png` — sau lần kéo thứ 4, điểm 900.
- `p01-07-sau-keo-lan-5.png` — sau lần kéo thứ 5, điểm 1.560, xuất hiện viên "sọc ngang đỏ".
- `p01-08-sau-keo-lan-6-dac-biet.png` — sau khi kéo thử viên đặc biệt, không có gì đổi.
- `p01-09-sau-keo-lan-7.png` — sau lần kéo cuối, thắng màn (2.640 điểm, bảng "Thắng màn!" hiện ra).
- `p01-10-thang-man-1-sao.png` — cận cảnh bảng thắng màn, 1/3 sao.
- `p01-11-man-2.png` — màn hình Màn 2 sau khi bấm "Màn tiếp".
- `p01-12-ban-do-sau-khi-thang.png` — quay về bản đồ, thấy Màn 1 đã có sao và Màn 2 đã mở.

Log console (dán nguyên trạng, không bình luận):
```
Total messages: 0 (Errors: 0, Warnings: 0)
Returning 1 messages for level "info"

[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
```
