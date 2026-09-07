# ADR-0009 · `reshuffled` mang theo grid mới

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** FR-17 · FR-08 · NFR-A11Y-04 · ADR-0002 · ADR-0010

## 1. Bối cảnh

`GameEvent` là union đóng, và mọi nhịp animation đều được chiếu từ nó
(`game/project.ts`). Một sự kiện là ngoại lệ: `{ t: 'reshuffled' }` không mang dữ
liệu nào, nên projection không chiếu được và bàn **teleport** sang trạng thái đã xáo.

Điều đó đã được ghi làm nợ có ý thức trong `backlog.md`, với lý do nguyên văn:
*"nhồi cả một grid vào một sự kiện chỉ để phục vụ một nhịp animation là cái giá đắt
hơn"*. Lý do đó đúng khi lớp vẽ còn render `grid[row][col]` vào ô tĩnh — lúc ấy có
grid trong event cũng vẫn phải viết animation bằng tay.

ADR-0010 đổi điều kiện: lớp viên định vị theo `Piece.id` và CSS nội suy mọi di
chuyển. Và `moves.reshuffle` xáo **chính các object `Piece`** (`allPieces` →
`shuffle` → `withPieces`), nên `id` giữ nguyên qua một lần xáo.

## 2. Quyết định

```ts
| { t: 'reshuffled'; grid: Grid }
```

`resolve.ts` đính bàn sau khi xáo (hoặc bàn sinh mới, khi mười lần xáo không settle)
vào sự kiện. `project.ts` áp nó như mọi sự kiện khác. Lớp viên thấy 49 viên đổi
`translate` cùng lúc và tự trượt về chỗ mới — **không thêm một dòng animation nào**.

Kèm theo: `t.reshuffled` được đọc trong vùng `aria-live`, để người dùng screen reader
biết bàn vừa được xáo và **không mất lượt** (NFR-A11Y-04).

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ event rỗng, che bằng một overlay "đang xáo" | Trả nợ bằng cách dán băng lên nó: bàn vẫn teleport phía dưới, chỉ là người chơi không thấy. Và overlay là một hệ animation thứ hai chỉ dùng một lần |
| Giữ event rỗng, `EffectLayer` tự vẽ gom-và-rải | Lớp effect sẽ phải bịa ra viên nào đi đâu, tức là **bịa dữ liệu**. Đúng thứ bất biến 2 cấm |
| Cho event mang danh sách `{ id, from, to }` thay vì cả grid | Nhỏ hơn thật, nhưng nó là một biểu diễn thứ hai của cùng một bàn, và projection sẽ phải dựng lại grid từ đó. Một `Grid` là thứ `project.ts` đã biết áp |
| Để `applySwap` trả hai `SwapResult` (trước và sau xáo) | Đổi API công khai của engine cho một trường hợp thưa, và mọi caller phải xử lý hai kết quả |

## 4. Hệ quả

**Được:**
- Nhịp xáo bàn animate miễn phí, và dòng nợ được trả **thật** chứ không phải trả bằng
  một overlay che đi.
- Người chơi thấy game vừa cứu mình. Trước đó bàn tự đổi và không ai giải thích gì.
- `project.ts` không còn nhánh "không chiếu được" nào — mọi loại sự kiện đều chiếu
  được, nên bất biến "chiếu lại phải tái tạo đúng engine" áp cho **toàn bộ** union
  chứ không phải cho mọi thứ trừ một.

**Mất / phải chấp nhận:**
- Một `GameEvent` mang `rows × cols` object. Với 9×9 là 81 object mỗi lần xáo. Xáo
  là chuyện thưa, nên chi phí thực tế nhỏ — nhưng `GameEvent[]` không còn là thứ
  "rẻ để log toàn bộ" nữa.
- `test/engine-ui-agreement.test.ts` hiện **bỏ qua** những nước đi có `reshuffled`.
  Sau ADR này nó không được bỏ qua nữa — và đó là việc phải làm trong cùng feature,
  không phải để sau.
- Serialise một `GameEvent[]` (nếu sau này có replay) sẽ to hơn đáng kể.

**Điều kiện xem lại quyết định này:** nếu có tính năng replay lưu `GameEvent[]` xuống
đĩa, thì `reshuffled` là chỗ đầu tiên phải nén — lúc đó dạng `{ id, from, to }` mới
đáng giá.
