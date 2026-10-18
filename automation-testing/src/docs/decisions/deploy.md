# DEPLOY — Quyết định

Đi cặp với `docs/requirements/deploy.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/decisions/0004-nextjs-static-export-yarn-theo-tien-le-web-game.md`,
  `docs/decisions/0006-github-pages-ba-workflow-va-release-tu-conventional-commits.md`,
  `docs/decisions/0007-kiem-ban-deploy-bang-cach-choi-that.md`, `README.md` §Releases and versioning.
- **Code:** `client/next.config.ts` (`output: 'export'`, `basePath` từ `NEXT_PUBLIC_BASE_PATH`, `trailingSlash`),
  `client/src/app/play/[id]/page.tsx` (`generateStaticParams` chỉ dựng id có trong `LEVELS`), `.github/workflows/deploy.yml`.
- **Test đã gom (gợi ý):** `client/e2e-live/deployed.spec.ts` (chạy sau deploy với `LIVE_URL`).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Bản cũ đọc `LIVE_URL` do `deploy.yml` truyền. Giờ URL của prd nằm trong `src/config/urls.ts` (một chỗ), và
  `deploy.yml` chạy module này với `ENV=prd`. Trên dev, cùng các case chạy trên bản xuất tĩnh ở máy — rẻ và bắt được lỗi
  export trước khi deploy.
- **Q2** Bản cũ chọn nước bằng engine; bản mới đọc bàn từ màn hình (`readBoard` + `utils/match3.ts`).
- **Q3** "Chờ Pages cập nhật" chỉ có nghĩa trên prd; trên dev vòng chờ thoát ngay ở lần đầu. Chờ bằng tín hiệu thật (tiêu đề
  trang) có hạn 3 phút, không ngủ cố định.
- **Q4** Response lỗi chỉ tính request tới chính site (cùng origin); request ra ngoài thuộc module `ducker-id`.

## Tài khoản test

Không có.

## Ngoài phạm vi

- Quyền bật Pages, `actions/deploy-pages` thành công: CI lo, không phải hành vi của game.
