# ADR-0006 · Deploy lên GitHub Pages bằng ba workflow, release suy ra từ Conventional Commits

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-SEC-05 · NFR-PERF-07 · ADR-0004 · overview.md §5 (trần chi phí 0 đồng)

## 1. Bối cảnh

Sau giai đoạn 1, repo có bản build tĩnh chạy được nhưng **không có nơi nào chạy
test tự động và không ai chơi được ngoài máy của người viết**. Hai ngưỡng NFR vì thế
chưa từng được kiểm: `NFR-SEC-05` (không lỗ hổng mức high) vì `yarn audit` timeout ở
registry trên máy này, và `NFR-PERF-07` (bundle < 200KB gzip) vì chưa có ai đo.

Ba game cùng thư mục `web-game/` — minesweeper, gomoku, flappy-bird — đã giải xong
bài này. Quyết định ở đây là **đi theo tiền lệ đó**, không phát minh lại.

## 2. Quyết định

Ba workflow, mỗi cái một việc, cộng năm script trong `scripts/`:

| Workflow | Chạy khi | Gác gì |
| --- | --- | --- |
| `ci.yml` | pull request | lint · typecheck · 395 test · `check-audit` · build · budget bundle · 15 test E2E |
| `deploy.yml` | push `main` | typecheck + test, rồi build với `GITHUB_PAGES=true` và publish `out/` |
| `release.yml` | push `main` | typecheck + test, rồi tag + tạo GitHub Release với ghi chú tự sinh |

`ci.yml` **không** chạy trên push `main`: hai workflow kia đã gác chỗ đó, để CI chạy
thêm là ba lần cùng một bộ test cho một cú push.

Phiên bản và ghi chú release **suy ra từ subject của commit**: `feat:` → minor,
`type!:` hoặc `BREAKING CHANGE` → major, còn lại → patch; `[skip release]` trong
subject thì không release. Logic nằm ở `scripts/next-version.sh` và
`scripts/release-notes.sh` — script trong repo, không phải shell nhúng trong YAML,
để chạy thử được bằng `yarn release:next` / `yarn release:notes v1.2.0`.

`basePath` chỉ bật khi `GITHUB_PAGES=true`, biến chỉ do `deploy.yml` đặt.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| `gh release create --generate-notes` | GitHub nhóm ghi chú theo **nhãn pull request**, mà repo này không gắn nhãn PR. Thứ nó có là Conventional Commit ở mọi commit — nhóm theo cái đang có thật |
| Một workflow làm tất cả | Lint đỏ và bàn chơi hỏng là hai tin khác nhau, không nên xếp hàng sau nhau. Ba file cũng cho ba `concurrency` khác nhau: CI được hủy giữa đường, deploy và release thì không |
| `semantic-release` | Kéo cả một cây phụ thuộc và một file cấu hình cho việc mà 60 dòng bash làm được, trong dự án lấy `yarn audit` sạch làm ngưỡng |
| Suy `basePath` từ `NODE_ENV` | `next build` ở máy nào cũng là production, nên `out/index.html` mở bằng `file://` sẽ hỏng hết đường dẫn asset. Phải là một biến chỉ CI đặt |
| Dùng `npx serve` cho E2E | Phải tải từ mạng ở máy nguội, và cờ `-s` của nó rewrite mọi đường dẫn lạ về `index.html` — đã làm `/play/1/` trả về trang bản đồ và 4 test đỏ vì lý do không liên quan gì đến app. Thay bằng `scripts/serve.mjs`, 60 dòng, không có cờ nào để đặt sai |
| `enablement: true` cho `configure-pages` | `GITHUB_TOKEN` mặc định deploy được lên một Pages site **đã có** nhưng không tạo được site mới — đó là thao tác quản trị repo, và nó báo lỗi "Resource not accessible by integration". Bật Pages một lần bằng tay (lệnh ở README) |

## 4. Hệ quả

**Được:**
- `NFR-SEC-05` **lần đầu tiên được kiểm** — CI là nơi duy nhất lệnh audit chạy được
  từ môi trường này. `check-audit.mjs` gác đúng "high trở lên", không phải mọi mức,
  vì `yarn audit` trả bitmask cho **mọi** severity nên gác thẳng vào nó thì một
  advisory mức moderate cũng làm đỏ build.
- `NFR-PERF-07` đo từ HTML đã export, cả hai route: 106 kB và 114 kB gzip / 200 kB.
- Có link chơi thử được cho người khác, chi phí vẫn 0 đồng.
- Mỗi push `main` có một release với ghi chú nhóm theo loại commit, không ai viết tay.

**Mất / phải chấp nhận:**
- **Conventional Commits trở thành ràng buộc thật**, không còn là quy ước: sai
  prefix là sai số phiên bản. Tiêu đề commit giờ là dữ liệu.
- Bộ test chạy tối đa ba lần cho một thay đổi (PR, deploy, release). Vài chục giây
  mỗi lần, và đổi lại là không workflow nào phải tin kết quả nó không thấy được.
- `basePath` là một đường dẫn khác giữa máy và production, tức là một dạng lệch môi
  trường. `deploy.yml` đo lại budget trên đúng bản Pages để bù phần đó.
- Pages phải bật tay một lần; quên thì `configure-pages` đỏ với thông báo không nói
  ra nguyên nhân.

**Điều kiện xem lại quyết định này:** nếu có PR từ fork (secrets không tới được), hoặc
nếu số lần chạy lại bộ test trở thành nút cổ chai, thì gộp `deploy` và `release` vào
một workflow chạy tuần tự.
