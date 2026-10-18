# PLAY — Test cases

Requirement: `docs/requirements/play.md` · quyết định: `docs/decisions/play.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Nước đi tính từ bàn đang
vẽ (`readBoard` + `utils/match3.ts`).

### TC-PLAY-001 — mỗi màn mở ra đúng kích thước, đủ lượt, điểm 0

- **Requirement:** REQ-PLAY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** mở `play/1/` … `play/6/`
- **Mong đợi:** tiêu đề "Màn N"; số lượt 15/15/18/20/16/18; điểm `0`; số ô = 49/49/49/64/64/81
- **Automated:** `tests/e2e/play/board.e2e.ts`

### TC-PLAY-002 — tên mỗi ô nói đúng hàng, cột và màu viên đang vẽ

- **Requirement:** REQ-PLAY-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** mở `play/1/`, đọc màu viên và tên nút của từng ô
- **Mong đợi:** mọi ô có tên "Ô hàng r cột c, viên <tên màu>" khớp màu vẽ
- **Automated:** `tests/e2e/play/board.e2e.ts`

### TC-PLAY-003 — bàn mở ra không có hàng ba đứng sẵn và có nước đi

- **Requirement:** REQ-PLAY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mở từng màn 1…6, đọc bàn
- **Mong đợi:** không có hàng ba nào; có ít nhất một nước hợp lệ
- **Automated:** `tests/e2e/play/board.e2e.ts`

### TC-PLAY-004 — đổi chỗ hợp lệ bằng bàn phím trừ một lượt và cộng điểm

- **Requirement:** REQ-PLAY-03, REQ-PLAY-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → Enter trên viên của một nước hợp lệ → mũi tên → Enter
- **Mong đợi:** lượt 15 → 14; điểm ≥ 180; bàn khác trước
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-005 — đổi chỗ không hợp lệ không tốn lượt, bàn trở về như cũ

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** màn 1 → đổi một cặp kề nhau không tạo hàng ba
- **Mong đợi:** lượt vẫn 15, điểm `0`, bàn y như trước
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-006 — nước bị từ chối được đánh dấu và được nói ra

- **Requirement:** REQ-PLAY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** đồng hồ giả → đổi một cặp không hợp lệ → cho trôi 300ms (nhịp trượt về)
- **Mong đợi:** đúng hai viên của cặp đó mang dấu bị từ chối; vùng thông báo "Nước đi không hợp lệ — …"; sau ~1 giây dấu và câu thông báo biến mất
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-007 — chạm viên rồi chạm viên kề cũng đổi chỗ

- **Requirement:** REQ-PLAY-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** màn 1 → bấm chuột viên đầu của một nước hợp lệ → bấm viên kề
- **Mong đợi:** lượt 15 → 14
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-008 — kéo một viên thả lên viên kề cũng đổi chỗ

- **Requirement:** REQ-PLAY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 1 → nhấn giữ viên đầu của một nước hợp lệ → kéo sang viên kề → thả
- **Mong đợi:** lượt 15 → 14
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-009 — chọn, bỏ chọn, chuyển lựa chọn và Esc

- **Requirement:** REQ-PLAY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** bấm ô (0,0) → bấm lại (0,0) → bấm (0,0) → bấm (2,2) (không kề) → Enter trên (4,4) bằng phím → Esc
- **Mong đợi:** (0,0) được chọn rồi bỏ chọn; sau khi bấm (2,2) chỉ (2,2) được chọn, lượt vẫn 15; Esc để lại không ô nào được chọn
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-010 — thao tác trong lúc bàn đang chạy bị bỏ qua

- **Requirement:** REQ-PLAY-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** đồng hồ giả → đi một nước hợp lệ (bàn `aria-busy="true"`, đồng hồ đứng) → thử đổi một cặp khác → cho đồng hồ trôi 10 giây
- **Mong đợi:** trong lúc chờ lượt đã là 14 và bàn bận; sau khi trôi, bàn hết bận, lượt vẫn 14 (nước thứ hai không được tính)
- **Automated:** `tests/e2e/play/swap.e2e.ts`

### TC-PLAY-011 — đứng yên 5 giây thì có gợi ý, trước đó thì không

- **Requirement:** REQ-PLAY-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** đồng hồ giả → mở màn 1 → trôi 4,9 giây → trôi thêm 0,2 giây
- **Mong đợi:** 4,9 giây: không viên nào được gợi ý; 5,1 giây: đúng hai viên kề nhau, và đổi chúng là một nước hợp lệ trên bàn đang vẽ
- **Automated:** `tests/e2e/play/hint.e2e.ts`

### TC-PLAY-012 — gợi ý biến mất khi người chơi đi một nước

- **Requirement:** REQ-PLAY-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** đồng hồ giả → chờ gợi ý hiện → đi đúng nước được gợi ý → cho bàn chạy xong
- **Mong đợi:** lượt 15 → 14; không còn viên nào được gợi ý ngay sau nước đi
- **Automated:** `tests/e2e/play/hint.e2e.ts`

### TC-PLAY-013 — mỗi ô một viên, viên chiếm phần lớn ô

- **Requirement:** REQ-PLAY-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** mở `play/1/`
- **Mong đợi:** 49 viên, 49 hốc; viên ở ô (0,0) rộng hơn 70% ô
- **Automated:** `tests/e2e/play/board.e2e.ts`
