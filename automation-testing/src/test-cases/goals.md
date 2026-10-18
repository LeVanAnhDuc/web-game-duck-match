# GOALS — Test cases

Requirement: `docs/requirements/goals.md` · quyết định: `docs/decisions/goals.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-GOALS-001 — màn chỉ có mục tiêu điểm hiện một dòng "Điểm 0/…"

- **Requirement:** REQ-GOALS-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** mở màn 1, 2, 5
- **Mong đợi:** đúng một dòng: chữ "Điểm", "0/2.000" · "0/4.000" · "0/6.000"; tên "Mục tiêu điểm 0/…"; chưa xong
- **Automated:** `tests/e2e/goals/hud.e2e.ts`

### TC-GOALS-002 — màn thu viên hiện dòng có hình và tên màu

- **Requirement:** REQ-GOALS-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** mở màn 3
- **Mong đợi:** một dòng "đỏ 0/12", hình tròn (hình của màu đỏ), tên "Mục tiêu viên đỏ 0/12"
- **Automated:** `tests/e2e/goals/hud.e2e.ts`

### TC-GOALS-003 — màn hai mục tiêu hiện đủ các dòng theo thứ tự

- **Requirement:** REQ-GOALS-01, REQ-GOALS-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** mở màn 4 và màn 6
- **Mong đợi:** màn 4: "Mục tiêu viên xanh dương 0/12", "Mục tiêu viên vàng 0/12", "Mục tiêu điểm 0/4.000"; màn 6: "Mục tiêu viên tím 0/12", "Mục tiêu điểm 0/4.000"
- **Automated:** `tests/e2e/goals/hud.e2e.ts`

### TC-GOALS-004 — mục tiêu điểm chạy theo điểm sau mỗi nước

- **Requirement:** REQ-GOALS-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** màn 1 → đi 2 nước hợp lệ
- **Mong đợi:** sau mỗi nước, dòng mục tiêu là "<điểm HUD>/2.000"
- **Automated:** `tests/e2e/goals/progress.e2e.ts`

### TC-GOALS-005 — một hàng ba đỏ làm mục tiêu đỏ tăng ít nhất 3

- **Requirement:** REQ-GOALS-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** màn 3 → đi một nước hợp lệ tạo hàng màu đỏ
- **Mong đợi:** dòng đỏ từ 0 lên ≥ 3 (trên 12)
- **Automated:** `tests/e2e/goals/progress.e2e.ts`

### TC-GOALS-006 — mục tiêu đạt thì được đánh dấu xong, chưa đạt thì không

- **Requirement:** REQ-GOALS-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** màn 1 chơi đến khi có dialog (thắng); màn 5 chơi đến khi có dialog (thua) — cùng cách chọn nước
- **Mong đợi:** màn 1: dòng điểm ở HUD đã xong (có dấu tích); màn 5: dòng điểm chưa xong, không có dấu tích
- **Automated:** `tests/e2e/goals/progress.e2e.ts`
