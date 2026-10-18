# ACCESSIBILITY — Test cases

Requirement: `docs/requirements/accessibility.md` · quyết định: `docs/decisions/accessibility.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-ACCESSIBILITY-001 — Tab tới được bàn, bàn là một điểm dừng

- **Requirement:** REQ-ACCESSIBILITY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở màn 1 → nhấn Tab cho tới khi focus vào bàn
- **Mong đợi:** tới được một ô của bàn trong vài lần Tab; đúng một nút ô có `tabindex="0"`; Tab thêm một lần thì focus rời bàn
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-002 — mũi tên dừng ở mép bàn

- **Requirement:** REQ-ACCESSIBILITY-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** focus ô (1,1) → ↑ ↑ ← ← → ở (1,1) đi ↓ 10 lần, → 10 lần
- **Mong đợi:** dừng ở ô (1,1) [hàng 1 cột 1] sau ↑↑←←; dừng ở ô hàng 7 cột 7 sau 10 lần ↓ và 10 lần →
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-003 — ô đang có focus có vòng focus nhìn thấy được

- **Requirement:** REQ-ACCESSIBILITY-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** focus một ô bằng bàn phím
- **Mong đợi:** ô có viền focus (box-shadow có vòng 2px) trong khi một ô không focus thì không
- **Automated:** `tests/e2e/accessibility/keyboard.e2e.ts`

### TC-ACCESSIBILITY-004 — ở 375px các ô 7×7 và các nút đủ 44px

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** viewport 375×800 → màn 1 (7×7), bản đồ
- **Mong đợi:** mọi ô ≥ 44×44; "Chơi lại" và "Về bản đồ" cao ≥ 44; thẻ màn cao ≥ 44
- **Automated:** `tests/e2e/accessibility/targets.e2e.ts`

### TC-ACCESSIBILITY-009 — ở 375px các ô của bàn 8×8 đủ 44px

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** tiến độ mở tới màn 4
- **Bước:** viewport 375×800 → màn 4 (8×8)
- **Mong đợi:** mọi ô ≥ 44×44 (8×8 không thuộc ngoại lệ — chỉ 9×9 dưới 400px)
- **Automated:** `tests/e2e/accessibility/targets.e2e.ts`

### TC-ACCESSIBILITY-005 — bàn 9×9 ở 375px là ngoại lệ có giới hạn: không cuộn ngang trang

- **Requirement:** REQ-ACCESSIBILITY-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** tiến độ mở tới màn 6
- **Bước:** viewport 375×800 → màn 6
- **Mong đợi:** ô ≥ 38px; trang không rộng hơn khung nhìn; ô cuối hàng nằm trong khung nhìn
- **Automated:** `tests/e2e/accessibility/targets.e2e.ts`

### TC-ACCESSIBILITY-006 — lượt, điểm và kết quả nằm trong vùng được đọc ra

- **Requirement:** REQ-ACCESSIBILITY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 1
- **Bước:** màn 1 → thắng màn (nước hợp lệ đầu tiên mỗi lượt)
- **Mong đợi:** số lượt và điểm nằm trong phần tử `aria-live="polite"`; tiêu đề "Thắng màn!" nằm trong `role="status"`
- **Automated:** `tests/e2e/accessibility/announcements.e2e.ts`

### TC-ACCESSIBILITY-007 — giảm chuyển động: thời lượng về gần 0

- **Requirement:** REQ-ACCESSIBILITY-05
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** `prefers-reduced-motion: reduce` → màn 1 → đi một nước
- **Mong đợi:** thời lượng transition/animation của viên ≤ 1ms; bàn có `data-reduced-motion="true"` sau nước đi; không giảm chuyển động thì viên có transition > 0
- **Automated:** `tests/e2e/accessibility/motion.e2e.ts`

### TC-ACCESSIBILITY-008 — mỗi màu một hình khối riêng

- **Requirement:** REQ-ACCESSIBILITY-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** mở màn 5 (6 màu), đọc màu và hình của mọi viên
- **Mong đợi:** đủ 6 màu; mỗi màu đúng một hình theo bảng; 6 hình khác nhau
- **Automated:** `tests/e2e/accessibility/shapes.e2e.ts`
