# RESPONSIVE — Quyết định

Đi cặp với `docs/requirements/responsive.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-21 HUD một hàng khi khung nhìn thấp),
  `docs/specs/core-engine-and-goals/design.md` §6 (375 là bề rộng thiết kế, 768 và 1024 là hai mốc đổi bố cục, 1440 là
  artboard rộng nhất; bàn vuông, cạnh tối đa 560px), `docs/specs/ux-remediation/design.md` (F-06 ở 720×450).
- **Code:** `client/src/views/Play/index.tsx` (grid `lg:grid-cols-[14rem_1fr]`, `hud-strip`),
  `client/src/views/Play/mains/Board/index.tsx` (`--cell` clamp 38–64px), `client/src/app/globals.css` (`max-height: 560px`).
- **Test đã gom (gợi ý):** `client/e2e/screenshots.spec.ts` — chỉ chụp ảnh, không khẳng định gì.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bản cũ chỉ chụp ảnh để người xem. Giữ việc chụp (đính kèm vào report qua `testInfo.attach`) nhưng mỗi case giờ
  khẳng định bố cục đo được: không cuộn ngang, vị trí tương đối của HUD / bàn / nút.
- **Q2** Mốc đổi bố cục là 1024px (`lg` của Tailwind) theo code; design.md nói "768 và 1024 là hai mốc" — ở 768 code giữ bố
  cục dọc. Không có câu nào trong docs nói 768 phải khác 375 → không coi là bug.
- **Q3** Ảnh 9×9 ở 375 (bản cũ) → ngoại lệ NFR-A11Y-03 thuộc module `accessibility` (TC-ACCESSIBILITY-005).

## Tài khoản test

Không có.

## Ngoài phạm vi

- Đánh giá thẩm mỹ của ảnh chụp: người xem trong report.
