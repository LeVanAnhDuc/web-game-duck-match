# Tổng quan sản phẩm

> **Trả lời:** Sản phẩm này là gì, cho ai, và **KHÔNG** làm gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** định vị đổi · thêm/bớt một Non-Goal · trần chi phí đổi

<!-- CÁCH ĐIỀN
File này là nơi DUY NHẤT trả lời "cái này có thuộc phạm vi không". Mọi tranh luận
về scope kết thúc ở đây.

Mục 4 (Non-Goals) là mục quan trọng nhất và là mục dễ bỏ trống nhất. Một Non-Goal
tốt là thứ nghe HỢP LÝ mà vẫn bị từ chối — "không làm chat realtime", "không hỗ trợ
nhiều tổ chức". Nếu danh sách Non-Goals trống, file này chưa làm được việc của nó.

KHÔNG chứa: danh sách tính năng (-> 02-requirements/scope.md), ngưỡng kỹ thuật
(-> 02-requirements/nfr.md), thuật ngữ (-> 01-product/glossary.md).
-->

## 1. Một câu định vị

Một game match-3 chơi trên trình duyệt, **có màn và có mục tiêu** (không phải chế độ
đếm thời gian vô hạn), chạy hoàn toàn ở client nên mở link là chơi được ngay — không
đăng nhập, không tải app, không chờ server.

## 2. Vấn đề đang giải

Đây là **dự án học tập** trong workspace `web-game/`. Vấn đề nó giải là của người
làm, không của người chơi: match-3 có mục tiêu là bài tập hiếm có ở chỗ phần khó nằm
trọn trong *luật* — cascade, quân đặc biệt kích hoạt theo chuỗi, phát hiện bế tắc,
chấm mục tiêu — chứ không nằm ở hạ tầng. Nó buộc phải tách một engine thuần khỏi
tầng hiển thị, và trả giá ngay nếu không tách.

Với người chơi, nó giải một vấn đề nhỏ và thật: match-3 có màn thì hầu hết là app
phải tải về, có tường năng lượng và có mua bán trong game.

## 3. Người dùng mục tiêu

Nhóm chính: người chơi bình thường mở game trên **điện thoại**, chơi vài phút một
lượt, không lập tài khoản. Vì vậy mọi thiết kế bắt đầu ở 375px.

Nhóm phụ: chính người làm — engine phải đọc được, test được, và mở rộng được sang
bốn giai đoạn còn lại (xem ADR-0005).

## 4. Non-Goals — dứt khoát không làm

- **Không có tài khoản, không đăng nhập.** Tiến độ nằm ở máy người chơi. Đổi máy là
  mất tiến độ, và đó là đánh đổi đã chấp nhận để giữ chi phí bằng 0.
- **Không có bảng xếp hạng chung.** Điểm gửi từ client không kiểm chứng được nếu
  không replay-verify ở server; làm nửa vời thì bảng xếp hạng chỉ là bảng của người
  gian lận.
- **Không có mua bán trong game, không có tường năng lượng, không có quảng cáo.**
  Không có ai trả tiền cho dự án này nên cũng không có gì để bán.
- **Không multiplayer, không realtime.** Toàn bộ giá trị của match-3 có mục tiêu nằm
  ở chơi một mình; thêm realtime là thêm một sản phẩm khác.
- **Không native app, không React Native.** Web là đích duy nhất; PWA thì chưa quyết.
- **Không level editor trong app.** Level là JSON viết tay (xem FR-12); editor là một
  sản phẩm con, nếu làm thì làm sau khi đủ màn.
- **Không đồng bộ nhiều thiết bị ở giai đoạn hiện tại.** Cổng lưu trữ (ADR-0001) chừa
  đường cho việc đó, nhưng bản thân việc đồng bộ là FR-14 và chưa thuộc phạm vi nào.

## 5. Mô hình

| Câu hỏi | Trả lời |
| --- | --- |
| Ai trả tiền | không ai — dự án học tập |
| Trả bằng gì | — |
| **Trần chi phí hạ tầng / tháng** | **0 đồng.** Static export, host bằng GitHub Pages. Ràng buộc này là lý do không có backend, và là lý do hai Non-Goal đầu tiên tồn tại |

## 6. Thế nào là thành công

1. Một người chơi mới **thắng được màn 1 mà không cần hướng dẫn** — luật tự hiện ra
   qua sáu màn đầu.
2. Toàn bộ luật chơi ở `docs/specs/core-engine-and-goals/design.md` §4 có test tự
   động phủ, và test luật chạy **không cần render** — đo bằng việc `src/engine/`
   không import React trong bất kỳ file nào.
3. Thêm một loại mục tiêu mới (giai đoạn 3, 4) **không phải sửa file nào trong
   `src/engine/` ngoài `goals.ts` và `types.ts`** — đây là phép thử thật cho ranh
   giới module, và nó sẽ được nghiệm thu ở giai đoạn 3.
