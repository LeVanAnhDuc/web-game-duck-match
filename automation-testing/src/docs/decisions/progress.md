# PROGRESS — Quyết định

Đi cặp với `docs/requirements/progress.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-07), `docs/01-product/journeys.md` (US-03, US-02 "thua không mất tiến
  độ"), `docs/03-design/invariants.md` (#10 chỉ ghi khi thắng, giữ giá trị lớn hơn), `docs/02-requirements/nfr.md`
  (NFR-REL-03, NFR-DATA-04), `docs/decisions/0001-progress-repository-async-tu-dau.md`.
- **Code:** `client/src/storage/local.ts` (`STORAGE_KEY`, `isProgress`, `recordWin`), `client/src/game/useGameSession.ts`
  (ghi khi `lastResult.status === 'won'`), `client/src/views/Map/index.tsx`.
- **Test đã gom (gợi ý):** "US-03 · saved progress unlocks levels after a reload", "US-03 · garbage in storage still opens
  the app" trong `client/e2e/play.spec.ts`.

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Hình dạng bản lưu là hợp đồng có thể kiểm? → Có: NFR-DATA-04 khoá tên khoá và trường `version`; invariant #10
  nói rõ cách gộp. Test đọc thẳng localStorage sau khi thắng.
- **Q2** "Hỏng" gồm gì? → Năm biến thể mà `isProgress` phải từ chối: không phải JSON, `version: 2`, mảng, `levels` là mảng,
  `unlockedUpTo` là chuỗi. Mỗi biến thể chạy riêng, app phải mở với đúng một màn.
- **Q3** Ván thắng/thua dựng như module `result` (nước hợp lệ đầu tiên mỗi lượt, seed cố định).

## Tài khoản test

Không có.

## Ngoài phạm vi

- FR-14 đồng bộ qua backend: chưa làm.
- Đường đọc dữ liệu version cũ: chưa có version nào khác 1.
