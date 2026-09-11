# p05 · Cô Liên — RR-04 · Tự hiểu quân đặc biệt sinh ra ở đâu

- **Thiết bị dựng lại:** viewport 720×450 (laptop 1440×900 ở zoom 200%), mạng không throttle
- **Trạng thái ban đầu (do người vận hành gieo, persona không biết):** `unlockedUpTo: 4`,
  Màn 1 2★/3.100 · Màn 2 2★/3.450 · Màn 3 1★/4.200
- **Công cụ:** Playwright
- **Kết quả:** KHÔNG đạt `done_when` — không nói được viên sọc sinh ra ở ô vừa chạm, và
  không dùng được nó có chủ đích. Dừng ở lượt 17/20.
- **Ghi chú vận hành:** lần chạy đầu của phiên này bị cắt giữa chừng do chạm giới hạn phiên
  API (không liên quan sản phẩm); đã xoá ảnh dở, dựng lại trạng thái sạch và chạy lại từ đầu.

---

## 1. Ấn tượng 5 giây

Vừa mở trang xong, chưa bấm gì, tôi đứng nhìn:

- **Đây là trang gì, làm được gì cho tôi?** Đây là màn hình chọn màn chơi của một trò xếp hình — thấy chữ "Bản đồ màn" và danh sách Màn 1, Màn 2, Màn 3, Màn 4 kèm số sao và điểm cao nhất. Nó cho tôi chọn tiếp màn nào để chơi.
- **Dành cho người như tôi hay ai khác?** Chắc dành cho người đã chơi quen rồi, vì nó không giải thích gì thêm, cứ như tôi phải tự biết luật.
- **Có tin để nhập email/số điện thoại không?** Trang này không hỏi gì cả nên chưa phải lo, nhưng nếu có hỏi chắc tôi cũng ngần ngại vì không thấy tên công ty hay gì đảm bảo.
- **Ba từ tả cảm giác:** tò mò, hơi rối, không chắc.

## 2. Chuyện đã xảy ra

Tôi thấy màn hình "Bản đồ màn", Màn 1–3 đã có sao, Màn 4 ghi "Chưa có tiến độ" — tôi hiểu đây là màn mới mở, đúng cái tôi định chơi. Tôi bấm vào Màn 4.

Vào trong, tôi thấy một bàn ô vuông rất nhiều viên (hình như 8 hàng 8 cột), phía trên có "Lượt: 20", "Điểm: 0", và "Mục tiêu" liệt kê vài thứ (0/12, 0/12, 0/4.000) — trong đầu tôi nghĩ: *"Ôi bàn to quá, mắt tôi không lướt hết được, chắc phải nhìn từng góc một."*

Tôi kéo thử hai viên cạnh nhau (nhìn hình có vẻ khác nhau) — điểm nhảy lên 180, lượt còn 19. Vài viên biến mất, vài viên khác rơi xuống thay vào chỗ trống — *"tôi thấy nó đổi chỗ xong vài viên tự nhiên biến mất, nhưng nổ ở đâu, tại sao đúng ba viên đó thì tôi không kịp nhìn."*

Tôi kéo tiếp một cặp viên khác ở gần đáy bàn. Lần này điểm nhảy mạnh hơn, lên 420 (tăng 240), lượt còn 18. Và đây là lúc tôi để ý: có một viên trông khác hẳn xuất hiện — không phải hình tròn trơn như mấy viên kia, mà có vạch sọc kẻ dọc trên mình nó. Nhưng nó không hiện đúng ngay chỗ tôi vừa kéo (chỗ đó ở gần giữa bàn) — nó hiện ra tuốt ở hàng dưới cùng, cột đầu tiên, tức là cách xa chỗ tay tôi vừa chạm. *"Ơ, sao viên lạ lại chạy xuống tuốt dưới đáy vậy? Tôi cứ tưởng nó phải nằm đúng chỗ tôi vừa đổi chứ."*

Tôi đoán: chắc do mấy viên nổ xong thì viên mới rơi từ trên xuống bù chỗ trống, nên viên đặc biệt cũng bị "rớt" xuống đáy theo luôn. Tôi muốn thử xem viên đó dùng làm gì. Tôi chạm một cái vào nó — chẳng có chuyện gì xảy ra cả, chỉ thấy nó được khoanh lại như kiểu "đã chọn", điểm và lượt vẫn y nguyên. *"Ủa, chạm vào không có phản hồi gì hết, chắc phải kéo nó đi đâu đó."*

Tôi bèn kéo viên vạch sọc đó sang ô ngay bên phải nó. Lượt giảm còn 17, điểm lại tăng lên 600 (tăng 180) — nhưng lạ ở chỗ: viên vạch sọc đó KHÔNG biến mất, nó chỉ dời sang ô bên cạnh và vẫn còn y nguyên hình vạch sọc trên bàn. Tôi không thấy cả một hàng hay một cột nổ tung ra như tôi tưởng. *"Điểm tăng đó, nhưng tăng vì cái gì tôi cũng không biết nữa — có phải do viên sọc gây ra không, hay lại do chỗ khác trên bàn tự nổ trùng lúc đó?"*

Đến đây tôi dừng lại, vì tôi không tự tin nói được viên vạch sọc dùng để làm gì nữa.

## 3. Con số

- Tổng số thao tác tôi làm: 1 lần bấm vào Màn 4, 3 lần kéo đổi viên, 1 lần chạm.
- Số lần quay lui: 0 (chưa bấm "Về bản đồ").
- Số lần bấm/chạm vào chỗ không thấy phản hồi rõ: 1 lần (chạm vào viên vạch sọc, chỉ thấy nó được khoanh chọn, không có gì nổ ra).
- Số lần phải cuộn trang để tìm thứ mình cần: 0 lần tôi tự cuộn — nhưng bàn 8x8 khá dày đặc so với mắt tôi ở độ phóng to 200%, nên nhìn hết một lượt cả bàn cũng phải đảo mắt qua lại nhiều, chỉ là chưa phải kéo thanh cuộn.
- Kết quả: chưa xong màn (còn 17/20 lượt, điểm 600/4.000), tôi dừng lại vì đã trả lời được câu hỏi của mình chứ chưa chơi hết màn.

## 4. Ba từ sau khi dùng

Ba từ: **bối rối, tò mò, chưa an tâm.**

Có quay lại không? Có, vì màn chơi vẫn hấp dẫn và tôi tò mò xem lượt sau viên sọc dùng đúng cách sẽ ra sao — nhưng tôi sẽ chơi dè dặt hơn, không dám tin chắc viên sọc "làm nổ cả hàng/cột" như tôi nghĩ, vì lần tôi thử nó không biến mất.

So với ấn tượng ban đầu (tò mò, hơi rối, không chắc) thì cảm giác cuối cùng đổi hướng ở chỗ: ban đầu tôi chỉ mơ hồ không chắc về cả trang, giờ tôi cụ thể không chắc về đúng MỘT thứ — cái viên vạch sọc — vì nó xuất hiện không đúng chỗ tôi thao tác, và lúc tôi dùng thử thì nó không cho tôi thấy rõ nó vừa làm gì.

## 5. Đính kèm thô

Ảnh chụp:
- p05-01-mo-trang.png
- p05-02-vao-ban-choi.png
- p05-03-vien-vach-soc-xuat-hien.png
- p05-04-sau-khi-dung-vien-soc.png

Log console:
```
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
[WARNING] The resource https://levananhduc.github.io/web-game-duck-match/_next/static/media/a65324f02aa278dc-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. @ https://levananhduc.github.io/web-game-duck-match/:0
[WARNING] The resource https://levananhduc.github.io/web-game-duck-match/_next/static/media/6a9c36ea9dc9b36b-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. @ https://levananhduc.github.io/web-game-duck-match/:0
[WARNING] The resource https://levananhduc.github.io/web-game-duck-match/_next/static/media/ee40bb094c99a29a-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. @ https://levananhduc.github.io/web-game-duck-match/:0
[WARNING] The resource https://levananhduc.github.io/web-game-duck-match/_next/static/media/86fbc9d8e118e1a5-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally. @ https://levananhduc.github.io/web-game-duck-match/:0
```
