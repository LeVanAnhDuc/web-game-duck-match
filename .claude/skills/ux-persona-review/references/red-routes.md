# Red Routes — Duck Match

> Chốt ngày 2026-09-11. Đây là hợp đồng phạm vi: mọi lần chạy về sau đều so với file này.
> Sửa file này là mất khả năng so sánh giữa các lần chạy — chỉ sửa khi sản phẩm đổi bản chất.

**Quy ước `min_steps`:** số hành động người dùng trên đường đi tối ưu. Đoạn chơi thật
đếm bằng số thao tác tối thiểu của một người *đã biết chơi* thể loại đó.

**Quy ước `done_when`:** chỉ nói thứ nhìn thấy trên màn hình. Không nhắc tên hàm, tên
component, khoá lưu trữ — persona không được biết những thứ đó.

---

## RR-01 · Qua màn 1 và mở được màn 2

- **id:** RR-01
- **name:** Qua màn 1 và mở được màn 2
- **actor:** người chơi mới, lần đầu mở link, trên điện thoại
- **entry:** `https://levananhduc.github.io/web-game-duck-match/`
- **done_when:** người chơi đang ở màn 2, **hoặc** nhìn thấy màn 2 đã mở khoá trên bản
  đồ màn
- **min_steps:** 5 — bấm màn 1 · 3 lượt đổi chỗ đạt mục tiêu · bấm "Màn tiếp"
- **why_red:** bản đồ màn khoá tuyến tính nghĩa là màn 1 là cổng duy nhất vào sản phẩm.
  Kẹt ở đây là kẹt hoàn toàn
- **status:** live
- **derived_from:** docs/01-product/journeys.md:18 (US-01) · README.md:20 §Features

## RR-02 · Thua một màn rồi chơi lại mà không mất gì

- **id:** RR-02
- **name:** Thua một màn rồi chơi lại mà không mất gì
- **actor:** người chơi đang ở màn 5 hoặc 6
- **entry:** `https://levananhduc.github.io/web-game-duck-match/`
- **done_when:** người chơi đang chơi lại **đúng màn đó** với bàn mới, lượt và điểm về
  ban đầu; trên bản đồ không có màn nào bị khoá lại
- **min_steps:** 2 — hết lượt · bấm "Chơi lại"
- **why_red:** match-3 sống bằng vòng thua-thử-lại. Nếu thua có vẻ như mất tiến độ thì
  người chơi dừng ở màn khó đầu tiên
- **status:** live
- **derived_from:** docs/01-product/journeys.md:30 (US-02)

## RR-03 · Đóng tab rồi mở lại, tiến độ còn nguyên

- **id:** RR-03
- **name:** Đóng tab rồi mở lại, tiến độ còn nguyên
- **actor:** người đã chơi vài màn, hôm sau mở lại cùng máy
- **entry:** `https://levananhduc.github.io/web-game-duck-match/` (sau khi đã qua ít nhất 2 màn rồi tải lại trang)
- **done_when:** bản đồ màn hiện **đúng số màn đã mở**, đúng số sao và điểm cao của
  từng màn; không có màn hình lỗi và không có màn hình trắng
- **min_steps:** 1 — vào màn đang dở
- **why_red:** sao và điểm cao là toàn bộ thành tích người chơi có. Mất chúng một lần
  là mất người chơi
- **status:** live
- **derived_from:** docs/01-product/journeys.md:41 (US-03)

## RR-04 · Tự hiểu quân đặc biệt sinh ra ở đâu

- **id:** RR-04
- **name:** Tự hiểu quân đặc biệt sinh ra ở đâu
- **actor:** người đã qua vài màn, gặp màn phải dùng quân đặc biệt mới đủ lượt
- **entry:** `https://levananhduc.github.io/web-game-duck-match/`
- **done_when:** người chơi tự nói được rằng viên sọc xuất hiện **tại ô mình vừa chạm**,
  và dùng được điều đó có chủ đích ít nhất một lần
- **min_steps:** 2 — 1 lượt match 4 · 1 lượt cho viên sọc nổ
- **why_red:** không có màn hình hướng dẫn nào dạy điều này. Nó phải học được từ chính
  chuyển động trên bàn, nếu không thì màn 5 và 6 là bất khả
- **status:** live
- **derived_from:** docs/01-product/journeys.md:52 (US-04) · README.md:20 §Features

## RR-05 · Chơi một màn chỉ bằng bàn phím

- **id:** RR-05
- **name:** Chơi một màn chỉ bằng bàn phím
- **actor:** người không dùng chuột, không dùng cảm ứng
- **entry:** `https://levananhduc.github.io/web-game-duck-match/`
- **done_when:** thực hiện được ít nhất hai lượt đổi chỗ **mà không chạm chuột lần
  nào**, và luôn nhìn thấy ô nào đang được chọn
- **min_steps:** 8 — Tab vào bàn · 2 × (di chuyển + Enter + di chuyển + Enter)
- **why_red:** README hứa "fully keyboard playable". Trên một bàn 9×9 thì điều đó chỉ
  đúng nếu luôn nhìn thấy con trỏ đang ở ô nào
- **status:** live
- **derived_from:** README.md:37 §Features

---

## Đã loại khỏi mọi lượt chạy

| Route | Vì sao loại | status |
| --- | --- | --- |
| Kết hợp hai quân đặc biệt với nhau (giai đoạn 2) | chưa làm | planned |
| Ô chặn và mục tiêu phá ô chặn (giai đoạn 3) | chưa làm | planned |
| Vật thể rơi xuống đáy (giai đoạn 4) | chưa làm | planned |
| Đủ 15–20 màn · âm thanh · cân độ khó (giai đoạn 5) | chưa làm; hiện có 6 màn | planned |
| Viên bay về ô mục tiêu ở HUD | bị cắt khỏi bản đầu có chủ đích | planned |
