# DUCKERID — Test cases

Requirement: `docs/requirements/ducker-id.md` · quyết định: `docs/decisions/ducker-id.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. TC-DUCKERID-001 chạy trên bản
cờ tắt (project `app`); mọi TC khác trên bản cờ bật với issuer giả (project `app-auth`).

### TC-DUCKERID-001 — cờ tắt thì không có nút đăng nhập, không đọc URL, không chạm storage, không request ra ngoài

- **Requirement:** REQ-DUCKERID-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./?code=x&state=y` trên bản cờ tắt
- **Mong đợi:** không nút "Đăng nhập", không nút "Tài khoản Ducker ID"; header ghi "…không đăng nhập, không mất phí"; `?code=x` còn nguyên; sessionStorage trống; không request ra ngoài site
- **Automated:** `tests/e2e/ducker-id/flag-off.e2e.ts`

### TC-DUCKERID-002 — cờ bật: có nút đăng nhập, câu trấn an đổi, chưa bấm thì không gọi Ducker ID

- **Requirement:** REQ-DUCKERID-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** mở `./` trên bản cờ bật
- **Mong đợi:** nút "Đăng nhập" hiện; header ghi "…đăng nhập tuỳ chọn, không mất phí"; không request nào tới issuer
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-003 — đăng nhập: thấy tài khoản, URL sạch, tham số trang còn nguyên

- **Requirement:** REQ-DUCKERID-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./?keep=1` → "Đăng nhập"
- **Mong đợi:** nút "Tài khoản Ducker ID" hiện; URL chỉ còn `?keep=1`; không lỗi hydration trên console
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-004 — menu tài khoản: tên, email, hồ sơ; đăng xuất trả lại nút và focus

- **Requirement:** REQ-DUCKERID-04, REQ-DUCKERID-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** đăng nhập → mở menu → "Đăng xuất"
- **Mong đợi:** menu có "Lê Văn Anh Đức", "duc@ducker.id", "Mở hồ sơ Ducker ID" trỏ `http://ducker.test/profile`; sau "Đăng xuất" nút "Đăng nhập" hiện và có focus
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-005 — Esc đóng menu tài khoản và trả focus về nút tài khoản

- **Requirement:** REQ-DUCKERID-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** đăng nhập → mở menu → Esc
- **Mong đợi:** menu đóng; focus ở nút "Tài khoản Ducker ID"
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-006 — đã đăng nhập vẫn chơi được như thường

- **Requirement:** REQ-DUCKERID-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** đăng nhập → vào màn 1 → đi một nước hợp lệ
- **Mong đợi:** lượt 15 → 14; điểm > 0
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-007 — hồ sơ chỉ nằm trong bộ nhớ: tải lại là chưa đăng nhập, storage không giữ gì

- **Requirement:** REQ-DUCKERID-07
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** đăng nhập → đọc storage → tải lại
- **Mong đợi:** localStorage/sessionStorage không chứa email; không còn `ducker.pkce`; sau khi tải lại: nút "Đăng nhập", không nút tài khoản
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-008 — từ chối ở Ducker ID thì về chưa đăng nhập, URL sạch

- **Requirement:** REQ-DUCKERID-08
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** issuer từ chối → mở `./?keep=1` → "Đăng nhập"
- **Mong đợi:** nút "Đăng nhập" còn; URL chỉ còn `?keep=1`; không nút tài khoản
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-009 — state bị sửa thì không bao giờ gọi tới token

- **Requirement:** REQ-DUCKERID-08
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 6
- **Bước:** issuer trả `state` khác → "Đăng nhập"
- **Mong đợi:** nút "Đăng nhập" còn; URL sạch; token endpoint được gọi 0 lần
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-010 — issuer treo thì sau tối đa 15 giây về lại chưa đăng nhập

- **Requirement:** REQ-DUCKERID-09
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** token endpoint không trả lời → "Đăng nhập"
- **Mong đợi:** token được gọi 1 lần; trong vòng 20 giây nút "Đăng nhập" trở lại; URL sạch
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-011 — sessionStorage bị chặn thì bấm đăng nhập không đưa đi đâu cả

- **Requirement:** REQ-DUCKERID-10
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 5
- **Bước:** chặn `sessionStorage` → "Đăng nhập"
- **Mong đợi:** không request nào tới issuer; vẫn ở bản đồ; nút "Đăng nhập" vẫn bấm được
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-012 — nút đăng nhập đủ 44px và không đè chữ header ở 375px

- **Requirement:** REQ-DUCKERID-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** viewport 375×800 → mở `./`
- **Mong đợi:** nút ≥ 44×44; mép trái nút ≥ mép phải khối chữ header; mép phải nút ≤ 375
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`

### TC-DUCKERID-013 — menu tài khoản nằm trọn trong màn hình và không làm header nhảy

- **Requirement:** REQ-DUCKERID-11
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** viewport 320 và 375 (cao 800) → đăng nhập → mở menu
- **Mong đợi:** menu trong [0, bề rộng] và trên 800; header không đổi vị trí/kích thước; menu định vị tuyệt đối
- **Automated:** `tests/e2e/ducker-id/sign-in.e2e.ts`
