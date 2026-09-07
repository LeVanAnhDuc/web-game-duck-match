# Quyết định kiến trúc (ADR)

> **Trả lời:** Sáu tháng sau — tại sao lại làm thế này?
> **Cập nhật khi:** chốt một quyết định kỹ thuật. Ghi **ngay trong phiên đó**.

## Mục lục

<!-- BEGIN:auto — bảng dưới do .claude/scripts/docs-regen.sh sinh từ các file ADR. Đừng sửa tay. -->
| ID | Tiêu đề | Ngày | Trạng thái |
| --- | --- | --- | --- |
| [ADR-0001](0001-progress-repository-async-tu-dau.md) | `ProgressRepository` trả `Promise` ngay từ đầu, dù adapter đầu tiên là localStorage | 2026-09-04 | accepted |
| [ADR-0002](0002-engine-thuan-phat-su-kien-renderer-dom.md) | Engine thuần phát ra danh sách sự kiện; renderer là React DOM + CSS | 2026-09-04 | accepted |
| [ADR-0003](0003-rng-co-seed-la-nguon-ngau-nhien-duy-nhat.md) | PRNG mulberry32 có seed là nguồn ngẫu nhiên duy nhất | 2026-09-04 | accepted |
| [ADR-0004](0004-nextjs-static-export-yarn-theo-tien-le-web-game.md) | Next.js static export + Yarn classic, theo tiền lệ thư mục `web-game/` | 2026-09-04 | accepted |
| [ADR-0005](0005-chia-nam-giai-doan-thay-vi-mot-spec.md) | Chia sản phẩm thành năm giai đoạn, mỗi giai đoạn một spec riêng | 2026-09-04 | accepted |
| [ADR-0006](0006-github-pages-ba-workflow-va-release-tu-conventional-commits.md) | Deploy lên GitHub Pages bằng ba workflow, release suy ra từ Conventional Commits | 2026-09-04 | accepted |
| [ADR-0007](0007-kiem-ban-deploy-bang-cach-choi-that.md) | Kiểm bản deploy bằng cách chơi thử nó, không tin mã trạng thái HTTP | 2026-09-07 | accepted |
<!-- END:auto -->

Trạng thái: `accepted` · `superseded by ADR-00xx` · `deprecated`

## Cách thêm một ADR

1. Lấy số kế tiếp, tạo `NNNN-<slug-tieng-anh>.md` từ [`_template.md`](_template.md).
   Ví dụ: `0003-dung-prisma-thay-typeorm.md`.
2. Điền. Giữ trong khoảng 15–40 dòng.
3. Thêm một dòng vào bảng trên.

## Ba quy tắc

- **Một quyết định, một file.** File thứ hai bàn cùng chuyện nghĩa là quyết định đầu chưa dứt.
- **Append-only.** ADR đã `accepted` thì **không sửa nội dung**. Đổi ý thì viết ADR mới, ghi `supersedes ADR-0007`, và đổi ADR cũ sang `superseded by`.
- **Ghi ngay khi chốt**, không để cuối phiên. Ngữ cảnh của một phiên dài có thể bị nén trước khi phiên kết thúc, và lúc đó lý do đã mất.

## Khi nào cần ADR

Cần: chọn thư viện/framework/datastore · đổi ranh giới module · chọn cách xử lý một vấn đề mà có ≥ 2 phương án hợp lý · chấp nhận một hạn chế lâu dài.

Không cần: sửa bug · thêm chức năng theo đúng khuôn có sẵn · quyết định có thể đảo trong 10 phút.
