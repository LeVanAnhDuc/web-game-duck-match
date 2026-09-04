# Đang làm · Việc tiếp theo · Nợ

> **Trả lời:** Đang làm gì, tiếp theo làm gì, và đang nợ những gì?
> **Trạng thái:** 🟢 đủ
> **Cập nhật:** 2026-09-04 · commit feat/core-engine-and-goals
> **Cập nhật khi:** bắt đầu/kết thúc một việc · brainstorm ra việc mới · cố ý đi đường tắt

<!-- CÁCH ĐIỀN
Mục "Đang làm" là chỗ một phiên làm việc MỚI đọc đầu tiên. Giữ nó ngắn: đang làm
gì, dừng ở bước nào, cái gì đang chặn. Cập nhật nó TRƯỚC KHI DỪNG phiên.

Mục "Nợ kỹ thuật" chỉ ghi thứ CỐ Ý làm tạm, và ghi NGAY LÚC ĐÓ. Bug thì không
thuộc đây. Việc chưa làm cũng không — đó là mục 2.

KHÔNG chứa: tính năng ngoài phạm vi (-> 01-product/overview.md §Non-Goals).
-->

## Đang làm

Không có việc nào đang dở.

**Giai đoạn 1 (`core-engine-and-goals`) xong** trên nhánh `feat/core-engine-and-goals`:
FR-01…FR-08 ở trạng thái `xong`, 392 test đơn vị + 15 test luồng Playwright xanh,
`yarn build` ra `out/` với cả 6 màn. Kế tiếp là giai đoạn 2 — combo hai quân đặc biệt
(FR-09, ADR-0005).

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Giai đoạn 2 — combo hai quân đặc biệt | FR-09 · ADR-0005 | cao | Là phần dễ sai nhất của match-3 và cần bảng test riêng cho từng cặp; làm sớm khi engine còn nhỏ thì rẻ hơn |
| Chạy `design-bootstrap` sinh `MASTER.md` | — | cao | Giai đoạn 1 dùng token tạm trong `tailwind.config.ts`. Phải trả trước khi giai đoạn 3 thêm màn hình mới, nếu không sẽ có hai hệ token |
| Giai đoạn 3 — ô chặn + mục tiêu phá ô chặn | FR-10 | trung bình | Cũng là phép thử ranh giới module: nếu phải sửa ngoài `goals.ts`/`types.ts` thì thiết kế đã sai (`overview.md` §6.3) |
| Giai đoạn 4 — vật thể rơi xuống đáy | FR-11 | trung bình | Đắt nhất trong bốn loại mục tiêu, và phụ thuộc luật trọng lực đã ổn định |
| Giai đoạn 5 — đủ 15-20 màn, âm thanh, cân độ khó | FR-12 · FR-13 | thấp | Chỉ đáng làm khi cả bốn loại mục tiêu đã chạy, nếu không sẽ phải cân lại |
| Workflow CI + deploy GitHub Pages | NFR-SEC-05 | trung bình | Remote đã có (`LeVanAnhDuc/web-game-match-3`), nhánh `main` và nhánh feature đã push. Thiếu nơi chạy test và thiếu bản deploy để người khác chơi thử |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `tailwind.config.ts` | Token màu/spacing viết trực tiếp, không qua `MASTER.md` của `design-bootstrap` | Giai đoạn 1 chỉ có hai màn hình; dựng cả hệ design trước khi biết game nhìn ra sao là làm ngược | Trước khi giai đoạn 3 thêm màn hình mới |
| Không có mockup canvas Artifact cho giai đoạn 1 | Bỏ cổng phê duyệt mockup của `feature-flow` bước 1 | Người dùng uỷ quyền tường minh chạy hết luồng không hỏi lại; không có ai đứng ở cổng đó | Giai đoạn nào có người review UI trước khi build |
| `ui/Board` ở bàn 9×9 dưới 400px | Ô nhỏ hơn 44px hoặc phải scroll ngang — vi phạm tinh thần NFR-A11Y-03 | 9×9 trên 375px không có cách nào vừa giữ ô 44px vừa thấy cả bàn. Chọn cho bàn tràn ra vùng scroll riêng thay vì co ô | Khi có màn > 9×9, hoặc khi quyết định giới hạn grid theo bề rộng thiết bị |
| Chưa có CI, và **NFR-SEC-05 chưa từng được kiểm** | `yarn audit` timeout ở endpoint registry hai lần trên máy này (ESOCKETTIMEDOUT), nên chưa ai biết cây phụ thuộc có lỗ hổng mức high hay không | Remote vừa có; workflow chưa viết. Không thể tự kiểm ở đây nên đừng coi ngưỡng này là đã đạt | Ngay khi dựng CI — đó cũng là nơi lệnh audit chạy được |
| `src/ui/GoalHud.tsx` và `src/ui/Tile.tsx` | Mỗi file tự vẽ bộ hình khối theo màu, hai bản SVG song song | Hai file do hai phiên khác nhau viết cùng lúc; gộp lúc đó sẽ là hai người sửa một file | Khi có màn hình thứ ba cần cùng bộ hình — muộn nhất là giai đoạn 3 |
| `src/ui/ResultDialog.tsx` | Tự vẽ ba ngôi sao thay vì dùng `StarRow` | Dialog cần **một** nhãn trợ năng cho cả nhóm, `StarRow` trên bản đồ có thể cần khác | Khi `StarRow` có prop chọn cách gán nhãn |
| `reshuffled` không chiếu được ở `game/project.ts` | Sự kiện không mang bàn mới, nên nhịp xáo bàn không hiện; bàn nhảy khi hàng đợi cạn | Nhồi cả một grid vào một sự kiện chỉ để phục vụ một nhịp animation là cái giá đắt hơn | Khi có animation xáo bàn thật |
| Chỉ chạy E2E trên Chromium | Không kiểm Safari/Firefox, mà `pointercapture` và `touch-none` là chỗ dễ khác nhau nhất | Máy phát triển chỉ có Chromium cài sẵn; CI chưa tồn tại | Cùng lúc dựng CI |
| Cân độ khó 6 màn chỉ dựa trên "người chơi ngu" | Đo bằng chiến lược yếu nhất (luôn lấy nước đi đầu), không có dữ liệu người thật | Không có người chơi thử, và đo được vẫn hơn đoán | FR-12, giai đoạn 5 |
