# Nguồn requirement của Duck Match

**Requirement của module lấy ở đâu.** `/write-tests` đọc file này ở bước 1 và chỉ đọc các nơi liệt kê dưới đây, cộng với
những gì user nói trong chat. Không dùng Jira/Confluence.

Đường dẫn tính từ thư mục gốc repo test. Danh sách này được user xác nhận lúc scaffold; khi user chỉ thêm nơi khác, hoặc
một nơi bị bỏ/đóng băng, sửa bảng này trong cùng lượt.

## Tài liệu

- `../docs/README.md` — bản đồ tài liệu + quy ước ID (US / FR / NFR / ADR); đọc trước để biết file nào là nguồn đúng
- `../docs/01-product/overview.md` — định vị, Non-Goals (không server, không tài khoản game), ranh giới engine/UI
- `../docs/01-product/journeys.md` — luồng người dùng US-01…US-05 (chơi màn đầu, thua rồi chơi lại, quay lại sau khi đóng tab, quân đặc biệt, đăng nhập Ducker ID)
- `../docs/01-product/glossary.md` — tên khái niệm ↔ tên trong code ↔ tên trên UI (viên, ô, bàn, lượt, mục tiêu, màn, sao…)
- `../docs/02-requirements/scope.md` — danh mục chức năng FR-01…FR-23 và trạng thái (chỉ FR `xong` là hành vi đã ship)
- `../docs/02-requirements/nfr.md` — ngưỡng NFR-PERF / A11Y / I18N / REL / DATA áp cho mọi feature
- `../docs/03-design/invariants.md` — điều sai âm thầm (lượt chỉ trừ khi match, khoá input khi bàn đang chạy, chỉ ghi tiến độ khi thắng)
- `../docs/decisions/` — ADR-0001…0013: vì sao hành vi như vậy (vd ADR-0004 static export, ADR-0007 kiểm bản deploy bằng cách chơi thật, ADR-0012 đăng nhập sau cờ)
- `../docs/specs/<feature>/design.md` — thiết kế đã duyệt của từng feature (core-engine-and-goals, tactile-board, ux-remediation, ducker-id-sign-in)
- `../docs/design-system/match-3/MASTER.md` — ngưỡng hiển thị (vùng bấm 44px, tương phản, chuyển động)
- `../README.md` — mục Features + Controls: hợp đồng hành vi hướng tới người chơi

## Code

- `../client/src/i18n/vi.ts` — mọi chuỗi UI (tiếng Việt), nguồn của `src/data/copy.ts`
- `../client/src/levels/levels.ts` — sáu màn (kích thước, lượt, mục tiêu, ngưỡng sao), nguồn của `src/data/test-data.ts`
- `../client/src/views/` — hai màn hình: `Map` (header sản phẩm, thẻ màn, nút tài khoản) và `Play` (HUD, bàn, dialog kết quả, hỏi chơi lại)
- `../client/src/game/` — phát lại sự kiện của engine lên bàn, khoá input, gợi ý khi nhàn rỗi, ghi tiến độ khi thắng
- `../client/src/engine/` — luật chơi thuần (match, cascade, quân đặc biệt, điểm, mục tiêu, xáo bàn); chỉ đọc để hiểu luật, test **không** import nó
- `../client/src/storage/local.ts` — khoá localStorage `match3.progress.v1` và cách đọc dữ liệu hỏng
- `../client/src/auth/` — đăng nhập Ducker ID (OIDC + PKCE) sau cờ tính năng
- `../client/scripts/build-e2e-auth.mjs`, `../client/scripts/serve.mjs` — bản build bật cờ đăng nhập (issuer giả) và server tĩnh mà suite này dùng

## Không đọc như nguồn đúng

- `../docs/specs/*/plan.md` — danh sách task lúc build, không phải hành vi
- `../docs/04-state/backlog.md` — việc đang làm / nợ kỹ thuật, không phải hành vi đã ship (trừ ngoại lệ NFR-A11Y-03 của bàn 9×9 mà nfr.md trỏ tới)
- `../docs/code-conventions.md` — quy ước viết code dùng chung, không nói về hành vi
- `../docs/ux-reviews/` — nhật ký phiên persona (phát hiện UX lịch sử, đã xử lý ở `ux-remediation`)
- `../client/src/**/*.test.ts(x)`, `../client/test/` — unit/component test của app: gợi ý hành vi, không phải requirement

## Thứ tự thẩm quyền

User (chat) > tài liệu trên > code. Code cho biết app *đang* làm gì, không cho biết *nên* làm gì.
