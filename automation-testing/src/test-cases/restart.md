# RESTART — Test cases

Requirement: `docs/requirements/restart.md` · quyết định: `docs/decisions/restart.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề.

### TC-RESTART-001 — chưa đi nước nào thì "Chơi lại" xếp lại bàn ngay, không hỏi

- **Requirement:** REQ-RESTART-01, REQ-RESTART-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** màn 1 → "Chơi lại"
- **Mong đợi:** không có hộp hỏi; bàn khác trước; 15 lượt, điểm 0; vùng thông báo "Đã xếp lại bàn từ đầu"
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-002 — nước bị từ chối không làm màn thành "đang dở"

- **Requirement:** REQ-RESTART-01
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Bước:** màn 1 → đổi một cặp không hợp lệ → "Chơi lại"
- **Mong đợi:** không có hộp hỏi; bàn được xếp lại
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-003 — đã đi một nước thì "Chơi lại" hỏi trước, nói điểm sẽ mất và điều được giữ

- **Requirement:** REQ-RESTART-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** màn 1 → một nước hợp lệ → "Chơi lại"
- **Mong đợi:** hộp "Chơi lại từ đầu?" có "Điểm <điểm> của lượt chơi này sẽ mất…" và "Sao và điểm cao nhất … giữ nguyên."; focus ở "Thôi, chơi tiếp"; lượt vẫn 14, điểm giữ nguyên
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-004 — xác nhận "Chơi lại" đặt lại lượt, điểm và bàn

- **Requirement:** REQ-RESTART-03, REQ-RESTART-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** màn 1 → một nước → "Chơi lại" → "Chơi lại" trong hộp
- **Mong đợi:** hộp đóng; 15 lượt; điểm 0; bàn khác bàn lúc bấm; vùng thông báo "Đã xếp lại bàn từ đầu"
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-005 — "Thôi, chơi tiếp" và Esc giữ nguyên ván

- **Requirement:** REQ-RESTART-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Bước:** màn 1 → một nước → "Chơi lại" → "Thôi, chơi tiếp" → "Chơi lại" → Esc
- **Mong đợi:** sau mỗi lần hộp đóng: lượt 14, điểm và bàn như trước khi bấm
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-006 — Tab chỉ vòng trong hộp hỏi

- **Requirement:** REQ-RESTART-05
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** mở hộp hỏi → Tab → Tab → Shift+Tab
- **Mong đợi:** focus đi "Thôi, chơi tiếp" → "Chơi lại" → "Thôi, chơi tiếp" → "Chơi lại", không ra ngoài hộp
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`

### TC-RESTART-007 — hai lần xếp lại liên tiếp đều được thông báo

- **Requirement:** REQ-RESTART-06
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 6
- **Bước:** màn 1 → "Chơi lại" → "Chơi lại"
- **Mong đợi:** sau mỗi lần vùng thông báo đều chứa "Đã xếp lại bàn từ đầu", và nội dung lần hai khác lần một
- **Automated:** `tests/e2e/restart/confirm.e2e.ts`
