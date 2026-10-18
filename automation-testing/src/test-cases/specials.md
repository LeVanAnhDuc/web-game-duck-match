# SPECIALS — Test cases

Requirement: `docs/requirements/specials.md` · quyết định: `docs/decisions/specials.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Nước đi lấy từ
`SPECIAL_SWAPS` (Q1), kiểm lại trên bàn đang vẽ.

### TC-SPECIALS-001 — bàn mới không có quân đặc biệt

- **Requirement:** REQ-SPECIALS-01
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** mở màn 1
- **Mong đợi:** không viên nào có dấu đặc biệt (ánh lấp lánh, huy hiệu); mọi ô có tên "… viên <màu>"
- **Automated:** `tests/e2e/specials/spawn.e2e.ts`

### TC-SPECIALS-002 — hàng ngang 4 viên sinh viên sọc ngang tại ô vừa đổi

- **Requirement:** REQ-SPECIALS-02, REQ-SPECIALS-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 6 → đổi (hàng 1, cột 6) với (hàng 2, cột 6)
- **Mong đợi:** ô vừa đổi trong hàng 4 viên có viên sọc ngang cùng màu hàng đó; tên ô "Ô hàng r cột c, viên sọc ngang <màu>"; viên có huy hiệu và ánh lấp lánh
- **Automated:** `tests/e2e/specials/spawn.e2e.ts`

### TC-SPECIALS-003 — hàng dọc 4 viên sinh viên sọc dọc trong cột đó

- **Requirement:** REQ-SPECIALS-03, REQ-SPECIALS-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 4 → đổi (hàng 4, cột 5) với (hàng 4, cột 6)
- **Mong đợi:** trong cột của hàng dọc có một viên sọc dọc cùng màu, tên ô có "viên sọc dọc"
- **Automated:** `tests/e2e/specials/spawn.e2e.ts`

### TC-SPECIALS-004 — hàng chữ L sinh viên bom

- **Requirement:** REQ-SPECIALS-04, REQ-SPECIALS-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 2 → đổi (hàng 6, cột 5) với (hàng 6, cột 6)
- **Mong đợi:** trên bàn có viên bom cùng màu hàng L, tên ô có "viên bom"
- **Automated:** `tests/e2e/specials/spawn.e2e.ts`

### TC-SPECIALS-005 — hàng 5 viên sinh bom màu

- **Requirement:** REQ-SPECIALS-05, REQ-SPECIALS-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** màn 3 → đổi (hàng 3, cột 3) với (hàng 3, cột 4)
- **Mong đợi:** trên bàn có một bom màu, tên ô có "bom màu"
- **Automated:** `tests/e2e/specials/spawn.e2e.ts`

### TC-SPECIALS-006 — đổi bom màu với viên kề là nước hợp lệ và kích hoạt nó

- **Requirement:** REQ-SPECIALS-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** màn 3 → tạo bom màu (TC-SPECIALS-005) → đổi bom với viên kề
- **Mong đợi:** lượt giảm 1; bom màu không còn trên bàn; điểm tăng
- **Automated:** `tests/e2e/specials/activate.e2e.ts`
