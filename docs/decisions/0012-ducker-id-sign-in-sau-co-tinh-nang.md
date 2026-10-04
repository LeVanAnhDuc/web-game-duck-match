# ADR-0012 · Đăng nhập Ducker ID tuỳ chọn, chỉ danh tính, ship tắt sau cờ tính năng

> **Ngày:** 2026-10-04
> **Trạng thái:** accepted
> **Liên quan:** FR-23 · US-05 · NFR-REL-01 · NFR-DATA-04 · NFR-SEC-04 · overview §Non-Goals

## 1. Bối cảnh

Người dùng yêu cầu (2026-10-04) cả 11 game web có "Đăng nhập bằng Ducker ID" như
`web-app-calculate-badminton`: OIDC Authorization Code + PKCE, public client. Chỉ danh
tính; lưu, điểm, cài đặt không đổi. Không được phép hiện trên bản deploy ở Pages.

## 2. Quyết định

Thêm `src/auth/` (config → PKCE → bắt callback → token/userinfo → store ngoài React) và
nút `AccountButton` ở `ProductHeader` của bản đồ. Cấu hình **chỉ từ env** (sáu biến
`NEXT_PUBLIC_*`, không giá trị mặc định nào trong code); `readDuckerConfig` trả `null`
trừ khi cờ đúng là `"true"` **và** đủ bốn giá trị — `null` nghĩa là không vẽ gì, không
đụng URL/storage/mạng. `deploy.yml` không truyền cờ hay `DUCKER_*`, nên bản Pages không
bao giờ hiện nút. `basePath` giờ đọc từ `NEXT_PUBLIC_BASE_PATH` (thay `GITHUB_PAGES`) để
`redirect_uri` và đường dẫn asset cùng một nguồn. Hồ sơ chỉ nằm trong bộ nhớ.

Ngoại lệ có giới hạn cho các NFR: `sessionStorage` key `ducker.pkce` only, deleted on return; network only to the configured Ducker ID issuer, and the profile picture URL it returns, only after the player clicks "Đăng nhập"; nothing at all when the flag is off.
NFR-REL-01 và NFR-DATA-04 được sửa thành ngoại lệ đúng như trên; NFR-SEC-04 ghi lại
rằng biến công khai và `CLIENT_ID` để trống trong `.env.example`.

Cùng PR: `e2e-live/deployed.spec.ts` bỏ URL viết cứng — `LIVE_URL` là biến bắt buộc,
thiếu là dừng ngay.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Lưu phiên ở `localStorage` | Thêm một key và một rủi ro lộ token; tải lại là chưa đăng nhập đủ cho "chỉ danh tính" |
| Ship bật, ẩn bằng CSS | Vẫn gọi mạng và đọc URL ở bản deploy; người dùng muốn "không thấy trên bản deploy" |
| Giá trị mặc định trong code | Người dùng cấm: không import hay fallback giá trị cứng |
| Đồng bộ tiến độ qua Ducker ID | Ngoài phạm vi (FR-14); cổng `ProgressRepository` không đổi |

## 4. Hệ quả

**Được:** game biết người chơi là ai mà không có backend; bản deploy không đổi một byte hành vi.

**Mất / phải chấp nhận:**
- Hai ngoại lệ NFR ở trên; một test e2e phải dựng thêm một bản export (`out-auth/`).
- **Nợ release:** commit của PR này mang `[skip release]`, mà `release.yml` quét cả khoảng từ tag gần nhất, nên mọi push sau lên `main` cũng bị bỏ qua cho tới khi có tag mới hơn. Lần release thật kế tiếp cắt tay một lần: `pnpm release:next` → `git tag vX.Y.Z && git push origin vX.Y.Z` → `gh release create vX.Y.Z --notes "$(pnpm -s release:notes)"`; sau đó khoảng sạch và tự động trở lại.
- Muốn bật thật: đăng ký client ở Ducker ID admin (redirect URI `https://levananhduc.github.io/web-game-duck-match/`), thêm cờ và bốn `DUCKER_*` thành repo variables rồi truyền trong `deploy.yml`.
- Không thêm dependency nào.

**Điều kiện xem lại quyết định này:** khi bật trên bản deploy, hoặc khi muốn lưu/đồng bộ gì ngoài danh tính.
