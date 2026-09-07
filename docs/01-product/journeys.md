# Luồng người dùng

> **Trả lời:** Người dùng đi qua những luồng nào từ đầu đến cuối?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** có luồng người dùng mới · một luồng cũ đổi bản chất

<!-- CÁCH ĐIỀN
Một luồng = một mục tiêu người dùng đi từ đầu đến cuối, KHÔNG phải một màn hình và
KHÔNG phải một chức năng. Viết theo góc nhìn người dùng, không theo góc nhìn code.

ID không tái dùng. Bỏ một luồng thì đổi trạng thái thành (bỏ), giữ số.

KHÔNG chứa: danh mục chức năng (-> 02-requirements/scope.md), bố cục màn hình
(-> tài liệu thiết kế của feature).
-->

## US-01 · Chơi màn đầu tiên và mở màn tiếp theo

**Ai:** người chơi mới, lần đầu mở link, trên điện thoại.

1. Mở app → thấy bản đồ màn. Màn 1 mở, các màn sau hiện khoá.
2. Bấm màn 1 → vào bàn chơi. Thấy số lượt, điểm, và mục tiêu ngay trên bàn.
3. Kéo hoặc bấm hai ô kề nhau để đổi chỗ → thấy viên nổ, viên rơi xuống, điểm tăng.
4. Đạt mục tiêu → dialog kết quả hiện sao và điểm.
5. Bấm "Màn tiếp" → vào màn 2. Bấm "Về bản đồ" → màn 2 đã mở.

**Xong khi:** người chơi đang ở màn 2 hoặc thấy màn 2 đã mở trên bản đồ.

## US-02 · Thua một màn rồi chơi lại

**Ai:** người chơi đang ở một màn khó (màn 5, 6).

1. Đang chơi, hết lượt mà mục tiêu chưa xong.
2. Dialog kết quả hiện "chưa đạt" + mục tiêu còn thiếu bao nhiêu.
3. Bấm "Chơi lại" → bàn mới của **cùng màn đó**, lượt và điểm về ban đầu.

**Xong khi:** người chơi đang chơi lại cùng màn với bàn mới. Thua không mất tiến độ
đã có ở các màn trước, và không khoá lại màn nào.

## US-03 · Quay lại sau khi đóng tab

**Ai:** người chơi đã chơi vài màn, đóng trình duyệt, hôm sau mở lại cùng máy.

1. Mở lại app → bản đồ màn hiện đúng số màn đã mở, đúng sao và điểm cao từng màn.
2. Chơi tiếp từ màn đang dở.

**Xong khi:** không mất tiến độ. Nếu dữ liệu lưu bị hỏng hoặc trống, app vẫn mở được
và quay về trạng thái người chơi mới — **không màn hình lỗi, không màn hình trắng**
(NFR-REL-03).

## US-04 · Dùng quân đặc biệt để về đích

**Ai:** người chơi đã qua vài màn, gặp màn phải dùng quân đặc biệt mới đủ lượt.

1. Match 4 viên → thấy một viên sọc xuất hiện đúng ở ô mình vừa chạm.
2. Cho viên sọc nổ → cả hàng biến mất, kéo theo cascade dài, điểm nhảy nhiều bậc.
3. Nhìn mục tiêu chạy nhanh hơn hẳn so với match 3 lẻ.

**Xong khi:** người chơi hiểu được rằng quân đặc biệt sinh ra **tại ô mình chạm** và
dùng được điều đó có chủ đích. Đây là luồng học kỹ năng, không có màn hình riêng.
