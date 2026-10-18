# DEPLOY — Test cases

Requirement: `docs/requirements/deploy.md` · quyết định: `docs/decisions/deploy.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Chạy trên dev (bản xuất tĩnh ở
máy) và trên prd (`ENV=prd`, sau mỗi lần deploy).

### TC-DEPLOY-001 — site trả về chính game, không phải trang 404

- **Requirement:** REQ-DEPLOY-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** mở `./`, nếu tiêu đề chưa phải "Duck Match" thì mở lại sau 5 giây (tối đa 3 phút)
- **Mong đợi:** tiêu đề "Duck Match"; 1 liên kết màn; 5 thẻ khoá
- **Automated:** `tests/e2e/deploy/live.e2e.ts`

### TC-DEPLOY-002 — bản đã deploy chơi được

- **Requirement:** REQ-DEPLOY-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** như TC-DEPLOY-001 → bấm màn 1 → đi một nước hợp lệ
- **Mong đợi:** lượt 15 → 14; điểm khác 0; không lỗi JavaScript
- **Automated:** `tests/e2e/deploy/live.e2e.ts`

### TC-DEPLOY-003 — mở thẳng trang của từng màn, màn không tồn tại thì 404

- **Requirement:** REQ-DEPLOY-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Bước:** mở thẳng `play/1/` … `play/6/`, rồi `play/7/`
- **Mong đợi:** `play/1/`…`play/6/` trả < 400, tiêu đề "Màn N", có bàn; `play/7/` trả 404
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`

### TC-DEPLOY-004 — mọi tài nguyên của site tải được dưới đúng đường dẫn gốc

- **Requirement:** REQ-DEPLOY-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** mở `./`, rồi `./play/1/`
- **Mong đợi:** không response nào từ chính site có status ≥ 400
- **Automated:** `tests/e2e/deploy/static-export.e2e.ts`
