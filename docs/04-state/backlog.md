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

Feature **`tactile-board`** (FR-15 · FR-16 · FR-17) trên nhánh
`feat/design-system-and-animation`. Thiết kế ở `docs/specs/tactile-board/design.md`,
kế hoạch ở `plan.md` cùng thư mục — **trạng thái từng task đọc ở checkbox trong
`plan.md`**, đó là nguồn đúng.

Người dùng chốt làm **cả 14 hạng mục trong một spec** sau khi đã được nói rõ rủi ro,
nên tài liệu chia ba phần A/B/C và plan xếp task theo thứ tự đó: dừng giữa đường vẫn
có thứ chạy được.

`design-bootstrap` đã chạy (một lần duy nhất, không chạy lại): bước 1 sinh
`docs/design-system/match-3/MASTER.md`, bước 2 ghi quyết định vào chính file đó, bước
3 là ADR-0008.

Giai đoạn 1 luật chơi đã xong và đã lên `main` (v1.0.0 / v1.0.1).

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Giai đoạn 2 — combo hai quân đặc biệt | FR-09 · ADR-0005 | cao | Là phần dễ sai nhất của match-3 và cần bảng test riêng cho từng cặp; làm sớm khi engine còn nhỏ thì rẻ hơn |
| Giai đoạn 3 — ô chặn + mục tiêu phá ô chặn | FR-10 | trung bình | Cũng là phép thử ranh giới module: nếu phải sửa ngoài `goals.ts`/`types.ts` thì thiết kế đã sai (`overview.md` §6.3) |
| Giai đoạn 4 — vật thể rơi xuống đáy | FR-11 | trung bình | Đắt nhất trong bốn loại mục tiêu, và phụ thuộc luật trọng lực đã ổn định |
| Giai đoạn 5 — đủ 15-20 màn, âm thanh, cân độ khó | FR-12 · FR-13 | thấp | Chỉ đáng làm khi cả bốn loại mục tiêu đã chạy, nếu không sẽ phải cân lại |
| Merge PR #1 để `main` có CI/CD và bản deploy đầu tiên | ADR-0006 | cao | `deploy.yml` và `release.yml` chỉ chạy trên push `main`, nên đến khi merge thì chưa có bản chơi thử nào và chưa có release nào |

## Nợ kỹ thuật — cố ý làm tạm

| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| Không có mockup canvas Artifact cho giai đoạn 1 | Bỏ cổng phê duyệt mockup của `feature-flow` bước 1 | Người dùng uỷ quyền tường minh chạy hết luồng không hỏi lại; không có ai đứng ở cổng đó | Giai đoạn nào có người review UI trước khi build |
| `ui/Board` ở bàn 9×9 dưới 400px | Ô nhỏ hơn 44px hoặc phải scroll ngang — vi phạm tinh thần NFR-A11Y-03 | 9×9 trên 375px không có cách nào vừa giữ ô 44px vừa thấy cả bàn. Chọn cho bàn tràn ra vùng scroll riêng thay vì co ô | Khi có màn > 9×9, hoặc khi quyết định giới hạn grid theo bề rộng thiết bị |
| Chỉ chạy E2E trên Chromium | Không kiểm Safari/Firefox, mà `pointercapture` và `touch-none` là chỗ dễ khác nhau nhất | CI cũng chỉ cài Chromium để một lần chạy không kéo dài quá lâu; các game cùng thư mục chạy nhiều viewport nhưng vẫn một engine | Khi có bug cử chỉ chỉ xuất hiện trên máy thật |
| Cân độ khó 6 màn chỉ dựa trên "người chơi ngu" | Đo bằng chiến lược yếu nhất (luôn lấy nước đi đầu), không có dữ liệu người thật | Không có người chơi thử, và đo được vẫn hơn đoán | FR-12, giai đoạn 5 |
| Không dựng mockup canvas cho `tactile-board` | Bỏ cổng mockup của `feature-flow` bước 1 lần thứ hai | Phần A (cái nhìn tĩnh) thì canvas hợp, nhưng phần B và C **là thời gian** — một artboard tĩnh không diễn tả được `lead` 90ms chồng lên transition 180ms. Cổng thật là bước 5: chạy app, chụp bốn bề rộng, đi vài nước | Feature nào thuần tĩnh |
| `lead` trong `timeline.ts` khác thời lượng trong CSS | Đọc một file không còn biết animation dài bao lâu | Đó là cái giá của nhịp chồng nhau (ADR-0010) | Nếu hai cột lệch nhau gây bug thật thì đưa cả hai vào một nguồn |
