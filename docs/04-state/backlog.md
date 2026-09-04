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

Giai đoạn 1 — feature `core-engine-and-goals`, nhánh `feat/core-engine-and-goals`.
Thiết kế đã chốt (`docs/specs/core-engine-and-goals/design.md`), kế hoạch ở
`plan.md` cùng thư mục. **Trạng thái từng task đọc ở checkbox trong `plan.md`** —
đó là nguồn đúng, không phải mục này.

Không có gì đang chặn.

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Giai đoạn 2 — combo hai quân đặc biệt | FR-09 · ADR-0005 | cao | Là phần dễ sai nhất của match-3 và cần bảng test riêng cho từng cặp; làm sớm khi engine còn nhỏ thì rẻ hơn |
| Chạy `design-bootstrap` sinh `MASTER.md` | — | cao | Giai đoạn 1 dùng token tạm trong `tailwind.config.ts`. Phải trả trước khi giai đoạn 3 thêm màn hình mới, nếu không sẽ có hai hệ token |
| Giai đoạn 3 — ô chặn + mục tiêu phá ô chặn | FR-10 | trung bình | Cũng là phép thử ranh giới module: nếu phải sửa ngoài `goals.ts`/`types.ts` thì thiết kế đã sai (`overview.md` §6.3) |
| Giai đoạn 4 — vật thể rơi xuống đáy | FR-11 | trung bình | Đắt nhất trong bốn loại mục tiêu, và phụ thuộc luật trọng lực đã ổn định |
| Giai đoạn 5 — đủ 15-20 màn, âm thanh, cân độ khó | FR-12 · FR-13 | thấp | Chỉ đáng làm khi cả bốn loại mục tiêu đã chạy, nếu không sẽ phải cân lại |
| Tạo repo GitHub + workflow deploy Pages | — | thấp | Repo hiện chưa có remote. Chưa chặn việc gì, nhưng chặn việc người khác xem được |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| `tailwind.config.ts` | Token màu/spacing viết trực tiếp, không qua `MASTER.md` của `design-bootstrap` | Giai đoạn 1 chỉ có hai màn hình; dựng cả hệ design trước khi biết game nhìn ra sao là làm ngược | Trước khi giai đoạn 3 thêm màn hình mới |
| Không có mockup canvas Artifact cho giai đoạn 1 | Bỏ cổng phê duyệt mockup của `feature-flow` bước 1 | Người dùng uỷ quyền tường minh chạy hết luồng không hỏi lại; không có ai đứng ở cổng đó | Giai đoạn nào có người review UI trước khi build |
| `ui/Board` ở bàn 9×9 dưới 400px | Ô nhỏ hơn 44px hoặc phải scroll ngang — vi phạm tinh thần NFR-A11Y-03 | 9×9 trên 375px không có cách nào vừa giữ ô 44px vừa thấy cả bàn. Chọn cho bàn tràn ra vùng scroll riêng thay vì co ô | Khi có màn > 9×9, hoặc khi quyết định giới hạn grid theo bề rộng thiết bị |
| Repo chưa có remote | Không có `origin/main` để branch từ đó như `feature-flow` yêu cầu | Repo mới, chưa có ai khác làm cùng nên không có gì để lệch | Ngay khi tạo repo GitHub |
| Chưa có CI | `yarn audit` (NFR-SEC-05) và bộ test chỉ chạy khi gọi tay | Chưa có remote thì chưa có nơi chạy CI | Cùng lúc tạo repo GitHub |
