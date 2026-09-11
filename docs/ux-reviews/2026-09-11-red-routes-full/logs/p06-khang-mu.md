# p06 · Khang — PHIÊN MÙ (negative persona, power user desktop) — không có mục tiêu

- **Thiết bị dựng lại:** viewport 1440×900, mạng không throttle (cáp quang)
- **Trạng thái ban đầu:** localStorage + cookie sạch
- **Công cụ:** Playwright
- **Kết quả:** chủ động dừng giữa Màn 1 (360/2.000, còn 13/15 lượt) sau khi đã kết luận
  xong về chiều sâu nội dung

---

## 1. Ấn tượng 5 giây (trả lời ngay, không sửa lại)

- **Đây là trang gì, làm được gì cho tôi:** Bản đồ màn chơi của một game match-3 tên "Duck Match" — 6 màn xếp dọc, màn 1 mở, còn lại khoá. Nhìn phát biết ngay đây là game xếp hình, không cần đoán.
- **Dành cho người như tôi hay dành cho ai khác:** Cảm giác nó dành cho người chơi giải trí nhẹ, không phải dân mê combo/tổ hợp như tôi — không có chữ nào gợi ý "chiến thuật sâu", "quân đặc biệt", "combo" ngay từ đầu.
- **Có tin đủ để nhập email/số điện thoại không:** Không có chỗ nào đòi nhập gì nên chưa phải nghĩ, nhưng nếu có thì tôi sẽ ngần ngại — trang không có logo studio, không badge, không gì bảo chứng, chữ tối giản đến mức trống trải.
- **Ba từ tả cảm giác:** "trống", "sơ khai", "chưa rõ ý đồ".

## 2. Chuyện đã xảy ra

Mở link → thấy ngay bản đồ 6 màn, chỉ Màn 1 có link (`/play/1/`), Màn 2–6 hiện chữ xám "Chưa mở", không phải link/button (không con trỏ tay). Tôi đếm luôn trong đầu: 6 màn hiển thị sẵn, không có nút "xem thêm" hay cuộn để lộ thêm màn — tức là con số 6 gần như là toàn bộ những gì trang chịu khoe ra ngay lúc này. Nghĩ bụng: "6 màn — nếu đây là tất cả thì chắc 20 phút là hết bài".

Bấm vào Màn 1. Vào bàn chơi 7x7, chỉ có 5 màu viên thường (đỏ, vàng, tím, xanh dương, xanh lá), một mục tiêu duy nhất: đạt điểm (0/2.000), 15 lượt. Không thấy ô chặn, không thấy icon quân đặc biệt nào có sẵn trên bàn. Tôi nghĩ: "vậy có 1 loại mục tiêu, chưa thấy blocker — không hứa hẹn gì nhiều".

Tôi chủ động dò bàn để tìm nước đi ghép 4 quân thẳng hàng hoặc hình chữ L (thứ tạo ra quân đặc biệt trong mọi game match-3 chuẩn). Bàn có kiểu xen kẽ màu khá cố tình (kiểu bàn cờ), khó ghép 4 chỉ bằng một nước đổi chỗ. Tôi thử 3 nước:
- Nước 1: đổi chỗ 2 viên → ăn match-3 thường (điểm 0→180), bàn refill random, **không có quân đặc biệt nào xuất hiện**.
- Nước 2: đổi chỗ 1 cặp mà tôi tính sẽ không ra match gì → game **từ chối, hoàn tác về nguyên trạng, không trừ lượt**. Đúng như tôi đoán, xác nhận game có validate nước đi.
- Nước 3: đổi chỗ để ăn match-3 khác (180→360). Vẫn chỉ là match-3 phẳng, không có gì đặc biệt bật ra.

Sau 2 nước match liên tiếp mà không thấy dấu hiệu nào của quân đặc biệt (không sọc, không bom, không khung viền lạ), tôi bỏ ý định cày tiếp để "vô tình" ra combo — bàn 7x7 này không tự bày sẵn cơ hội 4-match/L-match nào rõ ràng trong tầm mắt, và với 15 lượt cho 2.000 điểm (~11 match cần thiết) việc dò tay từng ô để set-up 1 combo là phí lượt so với chỉ ăn điểm thường.

Tôi thoát ra "Về bản đồ" để xem còn gì nữa không — tiến độ màn 1 mất luôn (map vẫn ghi "Chưa có tiến độ", "Đạt 0/3 sao"), tức là chơi dở không lưu. Bấm thử vào chữ "Màn 2" (dòng bị khoá) — **không có gì xảy ra**: không toast, không tooltip, không rung lắc báo "khoá", trang đứng yên hệt như trước khi bấm.

## 3. Con số

- **Số hành động trình duyệt:** 18 (1 navigate, 4 screenshot, 6 snapshot, 3 click, 3 drag, 1 đọc console) — trong ngân sách 40.
- **Số lần quay lui:** 1 (bấm "Về bản đồ" rời Màn 1).
- **Số lần bấm vào chỗ không phản hồi:** 1 rõ ràng (bấm "Màn 2" đang khoá — im lặng tuyệt đối), cộng 1 nước đi trong game bị từ chối vì không tạo match (hoàn tác, không trừ lượt).
- **Kết quả cuối:** Bỏ ngang giữa Màn 1 — điểm 360/2.000, còn 13/15 lượt. Không phải vì thua hay bí, mà **chủ động dừng** vì đã trả lời được câu hỏi mình quan tâm (không có quân đặc biệt nào xuất hiện trong 2 match đầu, bàn không bày sẵn cơ hội combo rõ ràng) và 5 màn còn lại đều khoá cứng, không có gì để thăm dò thêm.

## 4. Ba từ sau khi dùng

**"Nông", "im lặng", "chưa đủ".**
Có quay lại không? Có thể ghé lại một lần nữa *nếu* nghe ai đó nói game đã có thêm màn hoặc thêm quân đặc biệt, nhưng ngay lúc này thì không có gì kéo tôi quay lại chủ động. So với ấn tượng đầu ("trống, sơ khai, chưa rõ ý đồ") — sau khi chơi thì không đổi hướng, mà **xác nhận đúng linh cảm ban đầu**: đây đúng là bản sơ khai, chỉ khác là giờ tôi có bằng chứng cụ thể (1 loại mục tiêu, không quân đặc biệt, 5/6 màn khoá cứng) thay vì chỉ đoán.

**Trả lời thẳng câu hỏi bắt buộc:** Không, game **không hề tự nói** nó đang ở giai đoạn nào. Khi tôi chạm giới hạn — 5/6 màn khoá, một loại mục tiêu duy nhất, không quân đặc biệt sau vài nước ăn điểm — không có badge "bản thử nghiệm"/"beta", không có dòng chữ "sắp ra mắt thêm màn", không có trang giới thiệu hay changelog nào tôi thấy được từ bản đồ hay màn chơi. Dấu hiệu duy nhất trên màn hình là chữ "Chưa mở" cạnh Màn 2–6 — nhưng chữ đó chỉ nói "bị khoá", không nói "chưa được làm" hay "sẽ sớm có". Bấm thẳng vào nó cũng không cho phản hồi gì thêm (không tooltip giải thích điều kiện mở khoá). Tôi phải tự đâm vào bức tường (đếm số màn, thử ghép quân, bấm thử màn khoá) rồi mới tự suy ra kết luận, không phải do game chủ động cho biết.

## 5. Đính kèm thô

Ảnh chụp (đã lưu):
- `p06-01-first-look.png` — màn hình bản đồ lúc vừa mở trang, chưa bấm gì.
- `p06-02-level1-board.png` — bàn chơi Màn 1 lúc mới vào.
- `p06-03-map-locked-levels.png` — bản đồ đầy đủ (full page), chỗ chạm trần nội dung: 5/6 màn khoá.
- `p06-04-click-locked-level.png` — ảnh cuối, sau khi bấm vào "Màn 2" đang khoá, không có gì đổi trên màn hình.

Log console (dán nguyên trạng, không bình luận):
```
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
[WARNING] The resource .../a65324f02aa278dc-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../6a9c36ea9dc9b36b-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../ee40bb094c99a29a-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../86fbc9d8e118e1a5-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
```
(4 dòng cảnh báo font/favicon lặp lại nhiều lần trong log, đã rút gọn còn mỗi loại 1 dòng đại diện.)
