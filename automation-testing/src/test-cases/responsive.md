# RESPONSIVE — Test cases

Requirement: `docs/requirements/responsive.md` · quyết định: `docs/decisions/responsive.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-RESPONSIVE-001 — bản đồ và màn chơi không cuộn ngang ở bốn bề rộng

- **Requirement:** REQ-RESPONSIVE-01
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** với 375, 768, 1024, 1440 (cao 900): mở bản đồ, mở màn 1; chụp ảnh đính kèm report
- **Mong đợi:** chiều rộng trang không vượt khung nhìn; mép phải của bàn ≤ bề rộng khung nhìn
- **Automated:** `tests/e2e/responsive/screenshots.e2e.ts`

### TC-RESPONSIVE-002 — dưới 1024px HUD ở trên bàn, "Chơi lại" ở dưới

- **Requirement:** REQ-RESPONSIVE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** 375×900 và 768×900 → màn 1
- **Mong đợi:** đáy của thẻ lượt và của danh sách mục tiêu ở trên mép trên của bàn; nút "Chơi lại" ở dưới mép dưới của bàn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-003 — từ 1024px HUD và "Chơi lại" thành cột bên trái bàn

- **Requirement:** REQ-RESPONSIVE-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** 1024×800 và 1440×900 → màn 1
- **Mong đợi:** mép phải của thẻ lượt, danh sách mục tiêu và nút "Chơi lại" ở bên trái mép trái của bàn
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-004 — khung nhìn thấp 720×450: HUD một hàng, bàn bắt đầu trong khung nhìn

- **Requirement:** REQ-RESPONSIVE-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** 720×450 → màn 1
- **Mong đợi:** danh sách mục tiêu nằm bên phải thẻ lượt và hai khối chồng nhau theo chiều dọc (cùng hàng); mép trên của bàn < 450
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`

### TC-RESPONSIVE-005 — bàn vuông và ô không quá 64px

- **Requirement:** REQ-RESPONSIVE-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** 1440×900 → màn 1, 375×900 → màn 1
- **Mong đợi:** bàn rộng = cao; ô ≤ 64px (1440: đúng 64px)
- **Automated:** `tests/e2e/responsive/layout.e2e.ts`
