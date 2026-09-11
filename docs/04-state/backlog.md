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

**Đổi thương hiệu sang `Duck Match`** (2026-09-08). Repo GitHub đổi từ
`web-game-match-3` thành `web-game-duck-match`; GitHub redirect URL *repo* cũ nhưng
**không** redirect đường dẫn Pages cũ — địa chỉ chơi giờ là
<https://levananhduc.github.io/web-game-duck-match/>. **Thư mục local vẫn là**
`web-game-match-3` — thương hiệu đổi, đường dẫn không.

README trước đây dùng chính slug làm tiêu đề (`# web-game-match-3`), tức là ô số 1 của
hợp đồng README chưa hề được điền; lần này điền luôn. Cụm "match-3" giữ nguyên ở mọi
chỗ nói về *thể loại* — đó là từ người chơi search. Khoá `localStorage`
`match3.progress.v1` **không** đổi: đổi là xoá tiến độ và điểm cao của người đang chơi.

Không có việc nào đang dở.

**Feature `tactile-board` xong** (FR-15 · FR-16 · FR-17) trên nhánh
`feat/design-system-and-animation`. 517 test đơn vị + 17 test luồng Playwright xanh,
`yarn build` ra `out/`, ảnh chụp bốn bề rộng đã xem.

`design-bootstrap` đã chạy **một lần duy nhất** — không chạy lại: bước 1 sinh
`MASTER.md`, bước 2 ghi quyết định vào chính file đó, bước 3 là ADR-0008.

**FR-18 (viên bay về ô mục tiêu) bị cắt khỏi feature này** — xem `design.md` §C.7 cho
lý do. Nó là hạng mục duy nhất trong 14 hạng mục không được làm.

Giai đoạn 1 luật chơi đã trên `main` (v1.0.0 / v1.0.1).

## Việc tiếp theo

| Việc | Liên quan | Ưu tiên | Vì sao ưu tiên đó |
| --- | --- | --- | --- |
| Giai đoạn 2 — combo hai quân đặc biệt | FR-09 · ADR-0005 | cao | Là phần dễ sai nhất của match-3 và cần bảng test riêng cho từng cặp; làm sớm khi engine còn nhỏ thì rẻ hơn |
| Viên bay về ô mục tiêu | FR-18 | thấp | Bị cắt khỏi `tactile-board` có chủ đích. Thiết kế đã có ở `design.md` §C.7, kể cả đường hạ cấp khi không đo được vị trí HUD |
| Giai đoạn 3 — ô chặn + mục tiêu phá ô chặn | FR-10 | trung bình | Cũng là phép thử ranh giới module: nếu phải sửa ngoài `goals.ts`/`types.ts` thì thiết kế đã sai (`overview.md` §6.3) |
| Giai đoạn 4 — vật thể rơi xuống đáy | FR-11 | trung bình | Đắt nhất trong bốn loại mục tiêu, và phụ thuộc luật trọng lực đã ổn định |
| Giai đoạn 5 — đủ 15-20 màn, âm thanh, cân độ khó | FR-12 · FR-13 | thấp | Chỉ đáng làm khi cả bốn loại mục tiêu đã chạy, nếu không sẽ phải cân lại |
| Merge PR #1 để `main` có CI/CD và bản deploy đầu tiên | ADR-0006 | cao | `deploy.yml` và `release.yml` chỉ chạy trên push `main`, nên đến khi merge thì chưa có bản chơi thử nào và chưa có release nào |

## Nợ kỹ thuật — cố ý làm tạm
**`engine/perf.test.ts` đỏ khi chạy cùng cả bộ, xanh khi chạy riêng** (2026-09-11).
Test p95 hết hạn 5000ms dưới sự song song của vitest — nó đo tranh chấp CPU chứ không
đo code. Đã kiểm: 517 test / cùng một test đỏ, **trước và sau** đợt refactor ADR-0011,
nên đây không phải hồi quy. CI cũng chạy `yarn test` nên có thể đỏ ngẫu nhiên ở đó.
Cách chữa nằm ở cấu hình test, không ở code: cho file này chạy tuần tự
(`poolOptions`/`fileParallelism: false` riêng cho nó) hoặc nâng `testTimeout` của nó.
**Buộc phải trả khi:** CI đỏ vì nó, hoặc khi có người tin con số p95 mà nó in ra.


| Chỗ nào | Đã đánh đổi gì | Vì sao chấp nhận | Khi nào buộc phải trả |
| --- | --- | --- | --- |
| Không có mockup canvas Artifact cho giai đoạn 1 | Bỏ cổng phê duyệt mockup của `feature-flow` bước 1 | Người dùng uỷ quyền tường minh chạy hết luồng không hỏi lại; không có ai đứng ở cổng đó | Giai đoạn nào có người review UI trước khi build |
| `ui/Board` ở bàn 9×9 dưới 400px | Ô nhỏ hơn 44px hoặc phải scroll ngang — vi phạm tinh thần NFR-A11Y-03 | 9×9 trên 375px không có cách nào vừa giữ ô 44px vừa thấy cả bàn. Chọn cho bàn tràn ra vùng scroll riêng thay vì co ô | Khi có màn > 9×9, hoặc khi quyết định giới hạn grid theo bề rộng thiết bị |
| Chỉ chạy E2E trên Chromium | Không kiểm Safari/Firefox, mà `pointercapture` và `touch-none` là chỗ dễ khác nhau nhất | CI cũng chỉ cài Chromium để một lần chạy không kéo dài quá lâu; các game cùng thư mục chạy nhiều viewport nhưng vẫn một engine | Khi có bug cử chỉ chỉ xuất hiện trên máy thật |
| Cân độ khó 6 màn chỉ dựa trên "người chơi ngu" | Đo bằng chiến lược yếu nhất (luôn lấy nước đi đầu), không có dữ liệu người thật | Không có người chơi thử, và đo được vẫn hơn đoán | FR-12, giai đoạn 5 |
| Không dựng mockup canvas cho `tactile-board` | Bỏ cổng mockup của `feature-flow` bước 1 lần thứ hai | Phần A (cái nhìn tĩnh) thì canvas hợp, nhưng phần B và C **là thời gian** — một artboard tĩnh không diễn tả được `lead` 90ms chồng lên transition 180ms. Cổng thật là bước 5: chạy app, chụp bốn bề rộng, đi vài nước | Feature nào thuần tĩnh |
| `lead` trong `timeline.ts` khác thời lượng trong CSS | Đọc một file không còn biết animation dài bao lâu | Đó là cái giá của nhịp chồng nhau (ADR-0010) | Nếu hai cột lệch nhau gây bug thật thì đưa cả hai vào một nguồn |
