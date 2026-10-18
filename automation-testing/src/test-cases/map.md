# MAP — Test cases

Requirement: `docs/requirements/map.md` · quyết định: `docs/decisions/map.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-MAP-001 — người chơi mới thấy bản đồ sáu màn, chỉ màn 1 mở

- **Requirement:** REQ-MAP-01, REQ-MAP-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./` với localStorage trống
- **Mong đợi:** tiêu đề "Bản đồ màn"; 6 thẻ "Màn 1"…"Màn 6" đúng thứ tự; đúng 1 liên kết (màn 1, tới `play/1/`); 5 thẻ `aria-disabled`
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-002 — thẻ khoá nói điều kiện mở và không phải liên kết

- **Requirement:** REQ-MAP-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** mở `./`, đọc thẻ màn 2…6
- **Mong đợi:** mỗi thẻ có "Chưa mở" và "Thắng màn N−1 để mở"; không chứa liên kết
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-003 — bấm thẻ khoá thì vẫn ở bản đồ

- **Requirement:** REQ-MAP-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** bấm thẻ màn 2
- **Mong đợi:** URL vẫn là bản đồ, không có bàn
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-004 — màn mở chưa có thành tích ghi "Chưa có tiến độ" và 0 sao

- **Requirement:** REQ-MAP-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** mở `./` với localStorage trống
- **Mong đợi:** thẻ màn 1 có "Chưa có tiến độ" và hàng sao "Đạt 0/3 sao"
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-005 — thẻ có thành tích hiện sao, điểm cao nhất và điểm còn thiếu cho sao kế

- **Requirement:** REQ-MAP-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Tiền điều kiện:** tiến độ `{levels: {1: {stars: 2, bestScore: 4200}}, unlockedUpTo: 2}`
- **Bước:** mở `./`
- **Mong đợi:** thẻ màn 1 "Đạt 2/3 sao", "Điểm cao nhất: 4.200", "Còn 2.800 điểm nữa là thêm một sao"; màn 2 mở, "Chưa có tiến độ"
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-006 — đủ ba sao thì không còn dòng điểm thiếu

- **Requirement:** REQ-MAP-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** tiến độ `{levels: {1: {stars: 3, bestScore: 7000}}, unlockedUpTo: 2}` (đúng ngưỡng sao 3)
- **Bước:** mở `./`
- **Mong đợi:** thẻ màn 1 "Đạt 3/3 sao", "Điểm cao nhất: 7.000", không có "Còn … điểm nữa"
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-007 — đầu bản đồ nói đây là sản phẩm gì

- **Requirement:** REQ-MAP-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Bước:** mở `./`
- **Mong đợi:** header có "Duck Match", câu mô tả và câu "…không đăng nhập, không mất phí"
- **Automated:** `tests/e2e/map/level-map.e2e.ts`

### TC-MAP-008 — vào màn 1 từ bản đồ rồi quay lại

- **Requirement:** REQ-MAP-07
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** bấm thẻ màn 1 → bấm "Về bản đồ"
- **Mong đợi:** ở `play/1/` thấy tiêu đề "Màn 1", bàn, số lượt, điểm; sau đó về lại bản đồ
- **Automated:** `tests/e2e/map/level-map.e2e.ts`
