# PROGRESS — Test cases

Requirement: `docs/requirements/progress.md` · quyết định: `docs/decisions/progress.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Ván chơi bằng "nước hợp lệ
đầu tiên mỗi lượt", `prefers-reduced-motion: reduce`.

### TC-PROGRESS-001 — thắng màn 1 thì bản lưu ghi đúng sao, điểm và mở màn 2

- **Requirement:** REQ-PROGRESS-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** thắng màn 1, đọc localStorage
- **Mong đợi:** `match3.progress.v1` = `{version: 1, levels: {1: {stars: <sao dialog>, bestScore: <điểm dialog>}}, unlockedUpTo: 2}`
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-002 — tiến độ vừa thắng còn nguyên sau khi tải lại trang

- **Requirement:** REQ-PROGRESS-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** thắng màn 1 → "Về bản đồ" → tải lại trang
- **Mong đợi:** màn 1 "Đạt 3/3 sao" và "Điểm cao nhất: <điểm>"; màn 2 mở; 4 thẻ khoá
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-003 — bản lưu có sẵn mở đúng số màn sau khi tải lại

- **Requirement:** REQ-PROGRESS-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Tiền điều kiện:** bản lưu `{levels: {1: {stars: 3, bestScore: 4200}}, unlockedUpTo: 3}`
- **Bước:** mở `./`
- **Mong đợi:** 3 liên kết (màn 1–3); thẻ màn 1 có "4.200"
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-004 — thua không ghi gì

- **Requirement:** REQ-PROGRESS-03
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** bản lưu `{levels: {}, unlockedUpTo: 5}`
- **Bước:** thua màn 5
- **Mong đợi:** bản lưu y hệt trước khi chơi
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-005 — đi dở vài nước rồi rời màn không ghi gì

- **Requirement:** REQ-PROGRESS-03
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 4
- **Bước:** màn 1 → 2 nước hợp lệ → "Về bản đồ"
- **Mong đợi:** localStorage không có bản lưu; bản đồ vẫn chỉ màn 1 mở
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-006 — thắng lại kém hơn không làm mất kỷ lục, màn đã mở không bị khoá lại

- **Requirement:** REQ-PROGRESS-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 3
- **Tiền điều kiện:** bản lưu `{levels: {1: {stars: 3, bestScore: 99999}}, unlockedUpTo: 4}`
- **Bước:** thắng màn 1 (điểm < 99.999)
- **Mong đợi:** bản lưu màn 1 vẫn `{stars: 3, bestScore: 99999}`, `unlockedUpTo` vẫn 4
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-007 — bản lưu hỏng thì app vẫn mở như người chơi mới

- **Requirement:** REQ-PROGRESS-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 5
- **Bước:** với từng bản lưu: `not json`, `{version: 2, …}`, `[]`, `{version: 1, levels: [], unlockedUpTo: 3}`, `{version: 1, levels: {}, unlockedUpTo: "3"}` → mở `./`
- **Mong đợi:** tiêu đề "Bản đồ màn"; đúng 1 liên kết; 5 thẻ khoá; không lỗi trang
- **Automated:** `tests/e2e/progress/corrupt.e2e.ts`

### TC-PROGRESS-008 — game không cất gì khác vào trình duyệt

- **Requirement:** REQ-PROGRESS-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** mở bản đồ, vào màn 1, chơi đến khi thắng
- **Mong đợi:** trước khi thắng: local và session trống; sau khi thắng: local chỉ có `match3.progress.v1`, session trống
- **Automated:** `tests/e2e/progress/save.e2e.ts`

### TC-PROGRESS-009 — thắng màn cuối giữ unlockedUpTo ở 6

- **Requirement:** REQ-PROGRESS-07
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** bản lưu `{levels: {}, unlockedUpTo: 6}`
- **Bước:** thắng màn 6
- **Mong đợi:** `levels[6]` có sao và điểm của ván; `unlockedUpTo` = 6
- **Automated:** `tests/e2e/progress/save.e2e.ts`
