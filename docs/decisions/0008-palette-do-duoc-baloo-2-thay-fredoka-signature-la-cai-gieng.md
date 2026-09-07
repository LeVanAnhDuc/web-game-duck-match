# ADR-0008 · Palette chọn bằng đo, Baloo 2 thay Fredoka, signature là cái giếng

> **Ngày:** 2026-09-07
> **Trạng thái:** accepted
> **Liên quan:** FR-15 · NFR-A11Y-01 · NFR-A11Y-06 · NFR-I18N-01 · NFR-PERF-07

## 1. Bối cảnh

`design-bootstrap` bước 1 (`ui-ux-pro-max --design-system`) trả về: light hồng tươi
`#FDF2F8` làm nền, `#EC4899` primary, `#F59E0B` accent, type pairing
`Fredoka` + `Nunito`, style Claymorphism, và một `Page Pattern` tên
*"Hero + Testimonials + CTA"*. Bước 2 là nơi `frontend-design` có quyền quyết cuối về
màu, font và signature element.

Ràng buộc riêng của sản phẩm này: **sáu màu viên là palette chịu lực**. Nền chỉ có
một việc — làm chúng nổi và tách nhau. Và UI viết bằng **tiếng Việt**.

## 2. Quyết định

**Nền tối ấm ngả plum**, không light hồng: `base #17111F` · `board #241B31` ·
`well #1C1526` · `card #31253F` · `raised #423356` · `ink #F7F3FF` ·
`muted #C9BBDB`.

**Sáu màu viên đổi hết**, chọn bằng cách đo bốn bộ ứng viên × bốn nền ứng viên:
`red #FF5470` · `blue #3B9EFF` · `green #3DD68C` · `yellow #FFD24A` ·
`purple #A855F7` · `orange #F97316`.

**`Baloo 2` thay `Fredoka`** cho heading; `Nunito` giữ cho body. Nạp qua
`next/font/google`, subset `['latin', 'vietnamese']`.

**Signature element: cái giếng** — bàn là một phiến đất sét liền có 49 lỗ ấn xuống,
viên là khối dày nằm trong lỗ.

**`Page Pattern` của bước 1 bị bỏ toàn bộ.**

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Light hồng `#FDF2F8` như bước 1 đề xuất | Nền hồng cạnh tranh trực tiếp với viên đỏ và viên tím — hai màu mục tiêu `collect` dùng nhiều nhất |
| Giữ nguyên sáu màu hiện tại | **Đo được là đang vi phạm:** viên tím trên nền cũ chỉ `2,57:1`, dưới ngưỡng 3:1 cho vật thể đồ hoạ; cặp đỏ/cam chỉ `ΔE 23` trong khi màn 3 thu đỏ |
| Nền light trung tính (xám/kem) | Không màu viên nào bị nền đè, nhưng mất "cheerful" mà bước 1 coi là chống anti-pattern "low energy" |
| Làm cả dark và light cho người chơi đổi | Mọi màu viên phải đạt ngưỡng trên **hai** nền, và shadow clay phải viết hai bản. Không đáng ở feature này |
| `Fredoka` như bước 1 đề xuất | Google chỉ phục vụ `latin`, `latin-ext`, `hebrew` — **không có `vietnamese`**. Khối U+1EA0–1EF9 rơi glyph sang fallback, "Lượt"/"Điểm"/"Mục tiêu" lệch nét ngay trên HUD. Kiểm bằng cách gọi `css2` với UA Chrome rồi đọc các dòng subset |
| Giữ font hệ thống như hiện tại | Rẻ nhất, nhưng bỏ mất toàn bộ "toy-like" mà claymorphism dựa vào, và bước 1 yêu cầu >= 2 họ chữ phân biệt |
| Violet `#8B5CF6` làm secondary như bước 1 | Nằm ngay cạnh viên tím `#A855F7`. Một màu nhấn UI không được lẫn với một màu viên |
| Bước 1 chọn cả hai vai type là một họ (như lần chạy "task management" của nó) | Vi phạm chính ràng buộc >= 2 họ mà bước 1 đặt ra |

## 4. Hệ quả

**Được:**
- Tương phản viên/nền thấp nhất từ `2,57:1` lên **`4,16:1`**; cặp màu gần nhau nhất
  từ `ΔE 23` lên **`ΔE 50`**. Cả hai đều là số đo, không phải đánh giá.
- Chữ Việt hiện đúng nét ở mọi chỗ, và không có request nào ra
  `fonts.googleapis.com` khi chơi — `next/font` self-host lúc build.
- `MASTER.md` thành nguồn token thật, trả dòng nợ *"token chưa qua MASTER.md"*.

**Mất / phải chấp nhận:**
- Ảnh chụp cũ trong `test-results/` và mọi mô tả "nền xanh đen" trong tài liệu đều
  lạc hậu ngay lập tức.
- Hai họ chữ web thêm bytes vào bundle. `yarn check:bundle` (NFR-PERF-07, trần
  200KB gzip) là cổng canh; hiện đang ở 106KB và 114KB nên còn chỗ, nhưng con số
  phải được đo lại sau khi thêm font.
- `board` so với `well` chỉ `1,08:1`. Trông như lỗi nếu đọc rời khỏi ngữ cảnh, và
  sẽ có người muốn "sửa". Cái hố được định nghĩa bằng inset shadow, không bằng màu.
- Bỏ light theme nghĩa là người chơi ngoài trời nắng không có lựa chọn nào.

**Điều kiện xem lại quyết định này:** nếu có người chơi thật báo bàn khó nhìn dưới
nắng, thì light theme là một feature riêng — và lúc đó phải đo lại cả sáu màu trên
nền mới, không được suy ra.
