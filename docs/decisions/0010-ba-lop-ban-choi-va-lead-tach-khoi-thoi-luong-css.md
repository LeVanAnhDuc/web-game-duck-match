# ADR-0010 · Bàn chơi ba lớp, và `lead` tách khỏi thời lượng CSS

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** FR-16 · NFR-A11Y-02 · NFR-A11Y-05 · NFR-PERF-06 · ADR-0002 · ADR-0009

## 1. Bối cảnh

ADR-0002 chốt renderer là React DOM và UI chỉ *phát lại* `GameEvent[]`. Cách hiện
thực hiện tại render `session.grid[row][col]` vào một CSS grid tĩnh: mỗi lần chiếu,
nội dung ô bị thay. Giữa hai lần render, viên **teleport** — nên `timeline.ts` thực
chất chỉ là một chuỗi khoảng chờ.

Người dùng yêu cầu trượt khi đổi chỗ, trượt-qua-rồi-về khi swap bị từ chối, rơi, và
sweep khi quân đặc biệt nổ. Không thứ nào làm được nếu cùng một node DOM không tồn
tại xuyên qua các lần render.

Đồng thời có một ràng buộc phải giữ: 25 test `Board` và 15 test E2E lái bàn **bằng
bàn phím** và đọc `aria-label`.

## 2. Quyết định

Bàn tách thành **ba lớp** trong cùng một container `position: relative`, dùng chung
biến `--cell`:

| Lớp | Nguồn | Chuyển động |
| --- | --- | --- |
| **semantic** — `role="grid"` + 1 `button`/ô | grid đã chiếu | **không**. Bàn phím, focus, `aria-label`, `aria-busy` |
| **piece** — 1 `Tile`/viên, `key = piece.id` | grid đã chiếu | **hiệu của state**: viên đổi `translate`, CSS nội suy |
| **effect** — phần tử sống ngắn, `aria-hidden` | `GameEvent[]` | keyframe ngắn, tự xoá |

Và `Step.duration` đổi thành **`Step.lead`**: không phải "animation dài bao lâu" mà
"bao lâu nữa nhịp sau khởi động". Thời lượng thật nằm ở CSS. Hai số tách nhau là điều
làm các nhịp **chồng nhau** được — một vòng cascade từ 550ms xuống 280ms mà nhìn
nhiều hơn.

`Step` thêm `visual?: { kind: 'swapOut' | 'swapBack' }` cho nhịp mà **engine không
báo** — animation kéo-về là phát minh của tầng trình bày.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Web Animations API cho tất cả: UI đọc event rồi tự dựng keyframe | Kiểm soát cao nhất, nhưng UI phải suy chuyển động từ event thay vì từ hiệu của state — nhiều code hơn, nhiều chỗ lệch với bàn thật hơn, và đánh nhau với vòng render của React |
| Canvas overlay cho lớp effect (hướng C của ADR-0002) | Đẹp hơn về sau (hạt thật), nhưng thêm hệ toạ độ thứ hai ngay bây giờ, để phục vụ bốn hiệu ứng mà DOM làm được |
| Giữ nguyên một lớp, animate bằng FLIP thủ công | Vẫn phải tự đo và tự đặt transform mỗi lần render. `key = piece.id` cho kết quả tương đương mà không có code đo |
| Nhét cờ `clearing` vào `Session.grid` | `Session` là dữ liệu của engine. Vòng đời DOM là chuyện của tầng vẽ, nên nó ở `ui/useExitingPieces.ts` |
| Dịch `swapReverted` thành hai `swapped` | Projection sẽ **trừ hai lượt** và phá bất biến 6. Đó là lý do `Step.visual` tồn tại |
| Bỏ khoá input để cascade không chặn người chơi | Phá bất biến 3 và mở ra cả một lớp bug đồng bộ giữa bàn đang chiếu và session thật |

## 4. Hệ quả

**Được:**
- Trượt và rơi **không có dòng animation nào** — chúng là hệ quả của việc `translate`
  đổi. Ít code hơn cách nào cũng vậy.
- Lớp semantic đứng yên, nên 25 test `Board` và 15 test E2E không phải viết lại. Đó
  là điều kiện đắt nhất của feature này và nó được thoả bằng kiến trúc, không bằng
  cẩn thận.
- `lead` tách khỏi CSS cho nhịp chồng nhau, tức "nhanh hơn mà nhiều hơn" — thứ mà một
  timeline tuần tự không thể có.
- `EffectLayer` render rỗng khi reduced motion, nên NFR-A11Y-05 là một nhánh chứ
  không phải một loạt `if` rải rác.

**Mất / phải chấp nhận:**
- **`Piece.id` từ chỗ là một bất biến trên giấy thành thứ chịu lực thật.** Nó là
  React key; trùng id là animation nhảy sai ô, và bất biến 5 (một viên kích hoạt một
  lần) mất tác dụng cùng lúc. Bất biến 9 đã nói điều này — giờ nó có hậu quả nhìn
  thấy được.
- Hai nguồn chân lý về hình học: `--cell` dùng bởi cả lớp semantic (kích thước ô) và
  lớp viên (`translate`). Lệch nhau là viên nằm sai chỗ. Chỉ được khai báo một nơi.
- `lead` khác thời lượng CSS nghĩa là đọc `timeline.ts` **không** còn cho biết
  animation dài bao lâu. Phải tra sang CSS. Bảng trong `design.md` §B.4 là chỗ duy
  nhất ghép hai cột đó lại, và nó phải được cập nhật cùng lúc với cả hai.
- Số phần tử DOM tăng: 49–81 button + 49–81 tile + effect. NFR-PERF-06 (không frame
  nào > 32ms trong một cascade) là cổng canh, và nó phải được đo lại chứ không suy ra.

**Điều kiện xem lại quyết định này:** nếu đo được frame > 32ms trên bàn 9×9 mà nguyên
nhân là số node DOM, thì lớp effect chuyển sang canvas trước — nó là lớp rẻ nhất để
đổi, vì nó không mang trạng thái game nào.
