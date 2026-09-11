# p03 · Hạnh — RR-05 · Chơi một màn chỉ bằng bàn phím

- **Thiết bị dựng lại:** viewport 1440×900, mạng không throttle
- **Trạng thái ban đầu:** localStorage + cookie sạch
- **Ràng buộc diễn:** tool click/drag/hover bị cấm cứng — không chạm chuột lần nào, kể cả
  lúc bế tắc
- **Công cụ:** Playwright
- **Kết quả:** KHÔNG đạt `done_when` — chỉ làm được **1** lượt đổi chỗ (yêu cầu 2), bỏ cuộc
  sau 2 lần mất dấu con trỏ liên tiếp

---

**1. Ấn tượng 5 giây** (nhìn trang lúc mới mở, chưa bấm gì)
- Đây là trang gì, làm gì cho tôi: Là một trang "Bản đồ màn" chơi game — nhìn tiêu đề "Bản đồ màn" và danh sách Màn 1 → Màn 6, tôi đoán đây là game giải đố kiểu xếp hàng (match-3), có tiến trình mở khoá từng màn.
- Trang này dành cho ai: Có vẻ dành cho người chơi phổ thông, không phải cho dân kỹ thuật — nhưng giao diện khá trơ, không có gì nói đây là game "chơi được bằng bàn phím" cả.
- Có tin để nhập email/số điện thoại không: Không thấy chỗ nào đòi nhập gì cả ở màn này nên chưa phải lo, nhưng nếu phải đăng ký tôi sẽ ngần ngại vì trang không có gì tạo cảm giác "chuyên nghiệp, đáng tin" rõ ràng.
- Ba từ tả cảm giác: "trống", "không chắc", "phải tự mò".

**2. Chuyện đã xảy ra**
- Tôi thấy bản đồ 6 màn, chỉ Màn 1 có link, còn lại ghi "Chưa mở". Tôi bấm Tab ngay (đúng thói quen) — con trỏ nhảy thẳng vào link "Màn 1", thấy dòng active trong snapshot nên tôi tin là có nhận bàn phím. Tôi bấm Enter để vào — nghĩ trong đầu: "chắc bấm Enter vào được, xem thử".
- Vào Màn 1, thấy bàn cờ 7x7 các viên tròn màu (đỏ, vàng, tím, xanh lá, xanh dương). Tôi bấm Tab: con trỏ vào "Về bản đồ" trước (không tới bàn cờ ngay) — nghĩ: "ơ, sao lại nhảy vào cái nút quay lại, không phải vào bàn?". Bấm Tab thêm lần nữa thì mới vào được ô hàng 1 cột 1 (viên đỏ).
- Tôi bấm Enter để "chọn" viên đó — trạng thái ô báo "được chọn" (selected) trong dữ liệu trang, nhưng nhìn màn hình tôi không tự tin chỉ ra được ô nào sáng lên khác với 48 ô còn lại — tất cả vẫn là những vòng tròn màu giống hệt nhau về hình dạng.
- Tôi bấm Tab để qua ô kế bên (hàng 1 cột 2, viên vàng), rồi bấm Enter để chọn nó — **hai viên đổi màu cho nhau thật** (đỏ và vàng tráo chỗ) — vậy là đổi chỗ được bằng bàn phím, không chạm chuột, thành công 1 lần! Tôi mừng thầm.
- Nhưng ngay sau đó, tôi cần tìm ô tiếp theo để đổi chỗ lần hai. Tôi bấm Tab để đi tiếp — **con trỏ nhảy tọt xuống nút "Chơi lại" ở tít cuối trang**, cách xa cả bàn cờ 49 ô. Trong đầu tôi nghĩ: "ủa, mình đang ở đâu vậy? Sao lại nhảy xuống đây, viên tôi vừa chọn đâu rồi?".
- Tôi bấm Tab thêm một lần nữa để cố tìm lại vị trí — **con trỏ biến mất khỏi trang hoàn toàn**, không có ô, nút, hay link nào được đánh dấu đang chọn cả. Tôi hoàn toàn không biết mình đang ở chỗ nào trên màn hình.
- Đây là 2 lần liên tiếp tôi mất dấu con trỏ. Đúng như tính cách của tôi — quá 2 bước bế tắc liên tiếp là tôi bỏ. Tôi dừng lại ở đây, không cố đổi chỗ lần thứ hai nữa vì không còn biết bấm Tab tiếp sẽ trôi tới đâu.

**3. Con số**
- Số phím đã bấm: khoảng 7-8 lần (Tab, Enter, Tab, Enter, Tab, Enter, Tab, Tab).
- Số lần mất dấu con trỏ: **2 lần liên tiếp** — lần 1 khi con trỏ nhảy từ bàn cờ xuống nút "Chơi lại" mà không có gì báo trước; lần 2 khi bấm Tab tiếp thì con trỏ biến mất khỏi trang, không thấy dấu chọn ở đâu cả.
- Số lần bấm phím mà không có phản hồi rõ ràng: 1 lần — lúc chọn viên đầu tiên (Enter), tôi không tự tin nhìn ra ô nào vừa được đánh dấu chọn vì các viên tròn không có vòng sáng/khung nào khác biệt rõ.
- Kết quả: **chỉ hoàn thành được 1 lượt đổi chỗ** (không đạt được 2 lượt như dự định), bỏ cuộc ngay sau lượt đổi chỗ đầu tiên, ở bước cố tìm ô để thực hiện lượt thứ hai.

**4. Ba từ sau khi dùng**
"hụt hẫng", "mất phương hướng", "không dám tin".
Tôi sẽ không quay lại chơi tiếp bằng bàn phím — vì ngay lượt thứ hai tôi đã không biết bàn cờ đang ở đâu trên màn hình nữa, mà cổ tay tôi thì không cho phép cầm chuột để "chữa cháy". So với ấn tượng ban đầu (trung tính, "chưa chắc trang này cho tôi"), giờ tôi ngả hẳn sang tiêu cực: đúng như nỗi sợ ban đầu — người ta nói chơi được hết bằng bàn phím, nhưng thực tế bấm vài phím là lạc mất luôn.

**5. Đính kèm thô**

Ảnh đã chụp (tiền tố `p03-`):
- p03-01-landing.png — trang bản đồ màn lúc mới mở, chưa bấm phím
- p03-02-after-tab1.png — sau khi bấm Tab lần đầu tại trang bản đồ
- p03-03-level1-loaded.png — Màn 1 vừa tải xong, bàn cờ 7x7
- p03-04-after-tab-in-level.png — sau Tab đầu tiên trong Màn 1 (rơi vào "Về bản đồ")
- p03-05-focus-cell-1-1.png — con trỏ vào ô hàng 1 cột 1
- p03-06-after-enter-select1.png — sau khi bấm Enter chọn ô đầu tiên
- p03-07-focus-cell-1-2-with-1-1-selected.png — con trỏ sang ô hàng 1 cột 2
- p03-08-after-swap1-attempt.png — sau khi bấm Enter lần 2, hai viên đã đổi chỗ
- p03-09-focus-jumped-to-choi-lai.png — con trỏ nhảy xuống nút "Chơi lại" (mất dấu lần 1)
- p03-10-tab-after-choi-lai.png — sau Tab tiếp theo, không còn thấy dấu chọn ở đâu (mất dấu lần 2)
- p03-11-lost-focus-confirm.png — Tab thêm một lần, con trỏ vòng lại "Về bản đồ" — xác nhận đã văng khỏi hẳn bàn cờ

Log console (nguyên trạng, mức warning trở lên):
```
[ERROR] Failed to load resource: the server responded with a status of 404 () @ https://levananhduc.github.io/favicon.ico:0
[WARNING] The resource .../a65324f02aa278dc-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. Please make sure it has an appropriate `as` value and it is preloaded intentionally.
[WARNING] The resource .../6a9c36ea9dc9b36b-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../ee40bb094c99a29a-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
[WARNING] The resource .../86fbc9d8e118e1a5-s.p.woff2 was preloaded using link preload but not used within a few seconds from the window's load event. ...
(4 dòng trên lặp lại 2 lần, tổng 9 dòng, không có lỗi JS liên quan tới thao tác đổi chỗ)
```
