# SPECIALS — Quyết định

Đi cặp với `docs/requirements/specials.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-02 sinh từ match 4 / L-T / 5 và kích hoạt, FR-19 quân đặc biệt nhận ra
  được), `docs/01-product/journeys.md` (US-04), `docs/01-product/glossary.md` (quân đặc biệt, viên sọc, viên bom, bom
  màu), `docs/specs/core-engine-and-goals/design.md` §4 (vị trí sinh), `docs/02-requirements/nfr.md` (NFR-A11Y-04).
- **Code:** `client/src/engine/specials.ts`, `client/src/engine/resolve.ts` (`spawnFor`: ô `to` nếu nằm trong hàng, không thì
  `from`), `client/src/engine/moves.ts` (`activatesOnSwap`), `client/src/views/Play/components/Tile/index.tsx`
  (`data-special`, `special-badge`, `data-shimmer`), `client/src/i18n/vi.ts` (`SPECIAL_NAME`, `cellLabel`).
- **Test đã gom (gợi ý):** "a special piece is marked so the player knows it is a weapon" trong `client/e2e/play.spec.ts`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Dựng bàn có hàng 4 / L / 5 bằng gì? → Đọc bàn mở màn của sáu màn (seed cố định) và chọn nước tạo đúng hình đó;
  ghi vào `SPECIAL_SWAPS` trong `src/data/test-data.ts` (sọc ngang: màn 6; sọc dọc: màn 4; L: màn 2; hàng 5: màn 3). Spec
  kiểm lại hình dạng trên bàn đang vẽ trước khi đi, nên màn bị chỉnh thì test đỏ rõ ràng.
- **Q2** "Đúng ô mình vừa chạm" áp chính xác cho hàng **ngang**: các viên khác trong hàng bị phá cùng hàng nên quân mới
  không rơi. Với hàng dọc, L và hàng 5, các viên bên dưới bị phá nên quân mới có thể rơi xuống → chỉ khẳng định quân đúng
  loại, đúng màu có trên bàn (hàng dọc: trong cột đó).
- **Q3** Kích hoạt sọc/bom bằng match tiếp theo phụ thuộc cascade, không dựng chắc chắn được; kích hoạt bằng cách đổi bom
  màu thì chắc chắn (luật: bom màu đổi với bất kỳ viên nào cũng hợp lệ) → chỉ test bom màu.

## Tài khoản test

Không có.

## Ngoài phạm vi

- FR-09 combo hai quân đặc biệt: trạng thái "chưa".
- Phạm vi nổ của từng loại (cả hàng, 3×3, cả màu): engine có unit test (`activate.test.ts`, `specials.test.ts`).
