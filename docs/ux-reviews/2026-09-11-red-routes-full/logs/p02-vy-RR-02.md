# p02 · Vy — RR-02 · Thua một màn rồi chơi lại mà không mất gì

- **Thiết bị dựng lại:** viewport 375×720, mạng không throttle (wifi nhà)
- **Trạng thái ban đầu (do người vận hành gieo, persona không biết):** `unlockedUpTo: 5`,
  Màn 1 3★/4.120 · Màn 2 2★/3.380 · Màn 3 2★/5.240 · Màn 4 1★/6.010 — dựng lại đúng bối
  cảnh "đang dở Màn 5" trong hồ sơ persona
- **Công cụ:** Playwright
- **Kết quả:** ĐẠT `done_when` — thua Màn 5, bản đồ không khoá lại màn nào, sao và điểm cao
  giữ nguyên

---

**1. Ấn tượng 5 giây** (ghi nguyên si lúc vừa mở trang, chưa bấm gì)

- Đây là trang gì, làm được gì cho tôi: "À, đây là một trò chơi ghép hình kiểu xếp 3 con vật/viên bi giống nhau, có bản đồ các màn để chơi lần lượt."
- Trang này dành cho ai: "Chắc dành cho người thích chơi game giải trí nhẹ nhàng, kiểu mình hay chơi lúc rảnh, không có vẻ gì là app công việc nghiêm túc."
- Có tin để nhập email/số điện thoại không: "Không thấy chỗ nào đòi nhập gì cả, chỉ có mấy cái màn để bấm vào chơi thôi, nên cũng không phải lo nghĩ gì về việc đưa thông tin."
- Ba từ tả cảm giác lúc này: "quen thuộc — đơn giản — hơi tò mò."

**2. Chuyện đã xảy ra**

- Mở trang ra thấy ngay "Bản đồ màn" với 6 màn: Màn 1 (3/3 sao, 4.120 điểm), Màn 2 (2/3 sao), Màn 3 (2/3 sao), Màn 4 (1/3 sao), Màn 5 (đã mở, chưa có tiến độ), Màn 6 (chưa mở, khoá). Tôi nghĩ: "Đúng như mình nhớ, mọi thứ vẫn còn nguyên."
- Bấm vào Màn 5, vào bàn chơi 8x8, còn 16 lượt, mục tiêu 6.000 điểm. Tôi kéo các viên đổi chỗ để ăn điểm, cứ kéo lần lượt.
- Chơi được một lúc, còn 2 lượt thì bất ngờ điểm nhảy vọt lên 6.600 — game hiện dialog "Thắng màn!" ngoài dự tính (lúc đó tôi nghĩ: "Ơ, chưa hết lượt mà sao đã xong rồi?"). Vì mục đích là xem lúc THUA, tôi bấm "Chơi lại" ngay trong dialog đó để chơi lại từ đầu Màn 5.
- Lần chơi lại thứ hai: 16 lượt mới, 0 điểm. Lần này tôi kéo cẩn thận hơn, chọn các nước ăn nhỏ để không thắng sớm nữa. Điểm tăng dần đều: 180 → 360 → 540 → 1.080 → 1.260 → 1.440 → 1.800 → 1.980 → 3.060 → 3.240 → 3.420 → 3.960 → 4.140 → 4.680 → 4.860 → 5.040. Có một, hai lần kéo mà bàn không đổi gì cả (viên bị trả về chỗ cũ) — lúc đó tôi nghĩ: "Chắc mình kéo sai chỗ, không ăn được thì thôi."
- Đến lượt cuối cùng (lượt 16, hết lượt về 0), điểm dừng ở 5.040/6.000 — CHƯA đạt mục tiêu. Dialog "Hết lượt!" hiện ra.
- Tôi đọc kỹ dialog: tiêu đề "Hết lượt!", bên dưới có mục "Mục tiêu" ghi rõ "5.040/6.000", và hai nút "Chơi lại" / "Về bản đồ". Đáng chú ý: dialog thua này KHÔNG hiển thị số sao hay dòng "Điểm" riêng như lúc thắng — chỉ có mỗi dòng tiến độ mục tiêu. Tôi nghĩ trong đầu: "Ừ thì thua rồi, nhưng không thấy nó nói gì về việc mất sao hay mất điểm cả, vậy chắc không sao."
- Tôi KHÔNG bấm "Chơi lại" ngay. Tôi bấm "Về bản đồ" trước để kiểm tra xem có bị mất gì không.
- Nhìn lại bản đồ: Màn 1 vẫn 3/3 sao — 4.120đ, Màn 2 vẫn 2/3 sao — 3.380đ, Màn 3 vẫn 2/3 sao — 5.240đ, Màn 4 vẫn 1/3 sao — 6.010đ, đúng y như tôi nhớ, không màn nào bị tụt hay khoá lại. Màn 5 giờ hiện "Đạt 1/3 sao — Điểm cao nhất: 6.600" (giữ nguyên kết quả của lần THẮNG trước đó, dù lần chơi sau đó tôi bị thua với 5.040 điểm — điểm thấp hơn không hề ghi đè lên điểm cao nhất cũ). Và bất ngờ nhất: Màn 6 giờ đã MỞ KHOÁ (trước đó "Chưa mở"), vì tôi đã từng thắng Màn 5 một lần. Tôi nghĩ: "À hoá ra vậy — mình thắng một lần là mở khoá được màn sau luôn, có thua lại sau đó cũng không bị đóng lại. Yên tâm thật."

**3. Con số**

- Tổng số hành động (bấm + kéo): khoảng 28 hành động.
- Số lần kéo tạo được nước ăn thành công: khoảng 24 lần.
- Số lần kéo vào chỗ không ăn được, bị trả về chỗ cũ: 2 lần.
- Số lần quay lui (bấm "Về bản đồ" hoặc "Chơi lại"): 2 lần (1 lần sau khi thắng ngoài ý muốn, 1 lần sau khi thua thật).
- Kết quả: THUA ở lượt cuối cùng của lần chơi thứ hai (Màn 5), điểm dừng 5.040/6.000, không bỏ cuộc giữa chừng.

**4. Ba từ sau khi dùng**

- Ba từ: "an tâm — rõ ràng — dễ chịu."
- Có quay lại chơi tiếp không: Có, vì kiểm tra xong thấy tiến độ các màn trước không mất gì, Màn 5 vẫn giữ điểm cao 6.600/1 sao dù thua lần sau, và Màn 6 vẫn mở — đúng cái tôi lo nhất (sợ tụt màn, sợ mất sao) hoá ra không xảy ra.
- So với ấn tượng ban đầu: lúc đầu chỉ thấy "quen thuộc, đơn giản", giờ thêm cảm giác "an tâm" rõ rệt vì đã tự kiểm chứng được là thua không mất gì — đổi hướng từ trung tính sang tích cực hơn. Điều duy nhất hơi tiếc là dialog "Hết lượt!" không nói thẳng một câu kiểu "Điểm/sao của bạn được giữ nguyên" — phải tự mình quay về bản đồ để kiểm tra mới biết chắc.

**5. Đính kèm thô**

Ảnh chụp (đã lưu thật):
- p02-01-first-open.png — bản đồ màn lúc vừa mở trang
- p02-02-level5-start.png — bàn chơi Màn 5 lúc mới vào
- p02-03-accidental-win.png — dialog "Thắng màn!" ngoài ý muốn (6.600đ, 1/3 sao)
- p02-04-het-luot-dialog.png — dialog "Hết lượt!" khi thua thật (5.040/6.000)
- p02-05-map-after-loss.png — bản đồ màn sau khi thua, kiểm tra tiến độ các màn
- p02-06-final.png — ảnh cuối phiên

Log console (nguyên trạng, level info trở lên, toàn phiên):
```
Total messages: 1
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
```
