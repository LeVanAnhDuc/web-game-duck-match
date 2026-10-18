# RESULT — Test cases

Requirement: `docs/requirements/result.md` · quyết định: `docs/decisions/result.md`.
Lăng kính: 1 truy vết · 2 phân vùng · 3 biên · 4 chuyển trạng thái · 5 negative · 6 ngoài lề. Ván chơi bằng "nước hợp lệ
đầu tiên mỗi lượt" (Q1), `prefers-reduced-motion: reduce`.

### TC-RESULT-001 — chơi trọn màn 1: mỗi nước trừ một lượt, điểm không giảm, kết thúc bằng dialog

- **Requirement:** REQ-RESULT-01
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 1
- **Bước:** màn 1 → đi nước hợp lệ đầu tiên cho đến khi có dialog
- **Mong đợi:** sau mỗi nước lượt giảm đúng 1, điểm ≥ điểm trước; dialog kết quả hiện
- **Automated:** `tests/e2e/result/full-level.e2e.ts`

### TC-RESULT-002 — thắng đủ ba sao: tiêu đề, sao, điểm, không còn dòng điểm thiếu

- **Requirement:** REQ-RESULT-02
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 3
- **Bước:** chơi màn 1 đến khi có dialog
- **Mong đợi:** "Thắng màn!"; "Đạt 3/3 sao" (điểm ≥ 7.000); điểm trong dialog = điểm HUD, nhóm `vi-VN`; không có "Còn … điểm nữa"
- **Automated:** `tests/e2e/result/dialog.e2e.ts`

### TC-RESULT-003 — thắng chưa đủ sao thì nói còn bao nhiêu điểm cho sao kế

- **Requirement:** REQ-RESULT-02
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 2
- **Bước:** chơi màn 2 đến khi có dialog
- **Mong đợi:** "Thắng màn!"; "Đạt n/3 sao" với n tính từ ngưỡng [4000, 6000, 9000]; "Còn X điểm nữa là thêm một sao" với X = ngưỡng kế − điểm
- **Automated:** `tests/e2e/result/dialog.e2e.ts`

### TC-RESULT-004 — hết lượt: dialog thua nói mục tiêu còn thiếu và trấn an tiến độ

- **Requirement:** REQ-RESULT-03
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 2
- **Bước:** chơi màn 5 đến khi có dialog
- **Mong đợi:** "Hết lượt!"; lượt 0; "Đạt 0/3 sao"; "Còn X điểm…" với X = 6.000 − điểm; dòng mục tiêu "Mục tiêu điểm <điểm>/6.000"; "Sao và điểm cao nhất của bạn được giữ nguyên."; có "Chơi lại", "Về bản đồ", không có "Màn tiếp"
- **Automated:** `tests/e2e/result/dialog.e2e.ts`

### TC-RESULT-005 — dialog nhận focus, giữ Tab bên trong, Esc về bản đồ

- **Requirement:** REQ-RESULT-04
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 6
- **Bước:** thắng màn 1 → Tab 3 lần → Shift+Tab → Esc
- **Mong đợi:** focus ở "Màn tiếp"; sau 3 lần Tab về lại "Màn tiếp"; Shift+Tab sang "Về bản đồ"; Esc → bản đồ
- **Automated:** `tests/e2e/result/dialog.e2e.ts`

### TC-RESULT-006 — thua thì focus ở "Chơi lại"

- **Requirement:** REQ-RESULT-04
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 2
- **Bước:** thua màn 5
- **Mong đợi:** focus ở "Chơi lại" trong dialog
- **Automated:** `tests/e2e/result/dialog.e2e.ts`

### TC-RESULT-007 — "Màn tiếp" mở màn 2 từ đầu

- **Requirement:** REQ-RESULT-05
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** thắng màn 1 → "Màn tiếp"
- **Mong đợi:** URL `play/2/`; tiêu đề "Màn 2"; 15 lượt; điểm 0; không dialog
- **Automated:** `tests/e2e/result/navigation.e2e.ts`

### TC-RESULT-008 — "Về bản đồ" sau khi thắng thấy màn kế đã mở

- **Requirement:** REQ-RESULT-06
- **Layer:** e2e · **Priority:** P0 · **Tags:** @smoke · **Lăng kính:** 4
- **Bước:** thắng màn 1 → "Về bản đồ"
- **Mong đợi:** bản đồ có 2 liên kết (màn 1, 2), 4 thẻ khoá
- **Automated:** `tests/e2e/result/navigation.e2e.ts`

### TC-RESULT-009 — thua không mở thêm và không khoá lại màn nào

- **Requirement:** REQ-RESULT-06
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 5
- **Tiền điều kiện:** tiến độ đã mở tới màn 5
- **Bước:** thua màn 5 → "Về bản đồ"
- **Mong đợi:** vẫn đúng 5 liên kết (màn 1–5), màn 6 khoá
- **Automated:** `tests/e2e/result/navigation.e2e.ts`

### TC-RESULT-010 — "Chơi lại" trên dialog thua cho bàn mới của cùng màn, không hỏi lại

- **Requirement:** REQ-RESULT-07
- **Layer:** e2e · **Priority:** P1 · **Lăng kính:** 4
- **Bước:** thua màn 5 → "Chơi lại"
- **Mong đợi:** vẫn `play/5/`; 16 lượt; điểm 0; không dialog kết quả, không hộp "Chơi lại từ đầu?"; bàn khác bàn lúc thua
- **Automated:** `tests/e2e/result/navigation.e2e.ts`

### TC-RESULT-011 — thắng màn cuối không có "Màn tiếp"

- **Requirement:** REQ-RESULT-08
- **Layer:** e2e · **Priority:** P2 · **Lăng kính:** 3
- **Tiền điều kiện:** tiến độ đã mở tới màn 6
- **Bước:** chơi màn 6 đến khi có dialog
- **Mong đợi:** "Thắng màn!"; có "Chơi lại", "Về bản đồ"; không có "Màn tiếp"
- **Automated:** `tests/e2e/result/navigation.e2e.ts`
