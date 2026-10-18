# EFFECTS — Test cases

Requirement: `docs/requirements/effects.md` · quyết định: `docs/decisions/effects.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-EFFECTS-001 — điểm của một match bay lên trên bàn rồi biến mất

- **Requirement:** REQ-EFFECTS-01
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 1
- **Bước:** đồng hồ giả → màn 1 → một nước hợp lệ → cho trôi từng 50ms đến khi có nhãn → cho trôi 5 giây
- **Mong đợi:** có ít nhất một nhãn "+N" (N là số, ≥ 180) trên bàn; sau 5 giây không còn nhãn nào
- **Automated:** `tests/e2e/effects/feedback.e2e.ts`

### TC-EFFECTS-002 — giảm chuyển động thì lớp hiệu ứng không vẽ gì, kể cả nước đầu tiên

- **Requirement:** REQ-EFFECTS-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** `prefers-reduced-motion: reduce` → đồng hồ giả → màn 1 → một nước hợp lệ → cho trôi từng 50ms trong 1 giây
- **Mong đợi:** không lúc nào có phần tử hiệu ứng (`data-effect`) trên bàn
- **Automated:** `tests/e2e/effects/feedback.e2e.ts`

### TC-EFFECTS-003 — viên đã chọn vẫn được đánh dấu khi focus dời sang ô khác

- **Requirement:** REQ-EFFECTS-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** màn 1 → focus ô (3,3) → Enter → mũi tên xuống (sang ô (4,3) không đổi chỗ được vì chưa Enter)
- **Mong đợi:** viên ở (3,3) mang dấu "đã chọn" và "nhấc lên"; viên ở (4,3) (đang focus) không mang dấu nào
- **Automated:** `tests/e2e/effects/feedback.e2e.ts`
