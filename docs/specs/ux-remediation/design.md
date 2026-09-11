# Thiết kế — Đợt sửa theo UX persona review 2026-09-11

Liên quan: FR-19 · FR-20 · FR-21 · FR-22 · NFR-A11Y-01 · NFR-A11Y-02 · NFR-A11Y-04 ·
NFR-A11Y-05 · NFR-A11Y-06 · NFR-I18N-01 · NFR-PERF-06 · ADR-0008 · ADR-0010 ·
`docs/ux-reviews/2026-09-11-red-routes-full.md`

## 1. Đợt này giải gì

Mười phát hiện từ bảy phiên persona. Chín trong số đó là **khiếm khuyết trình bày**:
engine làm đúng, người chơi không đọc được nó đang làm gì. Phát hiện thứ mười (F-05)
là một quyết định sản phẩm, đã chốt trong brainstorm.

Không phát hiện nào chạm Non-Goal ở `01-product/overview.md` §4. Hai trong số đó vi
phạm thứ đã chốt từ trước:

- **F-02 vi phạm NFR-A11Y-02** ("focus luôn thấy được") và vi phạm luôn
  `MASTER.md` §Anti-Patterns, dòng "❌ Invisible focus states".
- **F-01 chặn tiêu chí thành công #1** ở `overview.md` §6 ("thắng màn 1 mà không cần
  hướng dẫn — luật tự hiện ra").

## 2. Bốn kết luận từ đo đạc, khác với báo cáo

Báo cáo là lời kể của persona. Trước khi sửa, từng phát hiện nặng được dựng lại trên
bản deploy. Bốn chỗ kết quả **khác** với báo cáo, và bản thiết kế này theo số đo:

### 2.1 F-07 không phải lỗi engine — nó là F-02

Báo cáo ngờ đường bàn phím cho kết quả khác đường chuột và yêu cầu dựng lại. Dựng lại
rồi: Tab trên màn chơi chỉ có **ba** điểm dừng — `Về bản đồ` → **một** ô bàn cờ →
`Chơi lại`. Bấm Enter ở điểm thứ ba làm màn chơi lại từ đầu. Bàn đổi từ
`rypyrygrbyyb…` sang `yrprryyryypr…`, HUD trở về `Lượt 15 · Điểm 0` — đúng hai dấu
hiệu mà persona p03 mô tả.

Cô ấy không gặp bug. Cô ấy **tự xoá màn của mình** bằng một phím Tab và một phím
Enter, và không có gì trên màn hình nói điều đó vừa xảy ra. F-07 bị gộp vào F-02 và
sinh ra FR-22.

Roving tabindex trong `Board` là **đúng** và giữ nguyên: 49 điểm dừng Tab mới là thứ
NFR-A11Y-02 tồn tại để ngăn.

### 2.2 Animation hoàn tác đã có, và nó chạy

Báo cáo ghi "màn hình không đổi một điểm ảnh nào" từ bốn persona. Đo thật: viên trượt
`x = 623.8 → 640.3 → 623.8` rồi dừng, `Lượt` giữ nguyên 15 (bất biến 6), toàn bộ
xong trong khoảng 300ms. FR-16 đã làm phần này.

Bốn persona là agent chụp ảnh **sau khi** hàng đợi sự kiện phát xong, nên một
animation 300ms nằm ngoài tầm quan sát của họ. Đây là **giới hạn của phép đo**, không
phải bằng chứng sản phẩm hỏng — và nó được ghi vào `backlog.md` như một hạn chế đã
biết của lượt chạy persona.

Phần còn lại vẫn thật: sau 300ms **không còn gì cả**. Người nhìn lệch đi một nhịp,
người đọc màn hình, và người chơi trên mạng chậm đều mất trắng tín hiệu. Nên FR-19
không dựng lại animation; nó thêm một dấu **đọng lại** và một dòng `aria-live`.

### 2.3 Gợi ý nhàn rỗi không vẽ ra pixel nào — lỗi này không có trong báo cáo

`HINT_AFTER_MS = 5_000` chạy đúng, `findHint` trả về nước đi, hai ô nhận
`data-hint="true"` và `animation: hint-nudge 1.1s` chạy thật. Nhưng `data-hint` nằm
trên **cái hốc** (`[data-testid="well"]`, `bg rgb(28,21,38)`, 56,3×56,3), còn viên đất
sét đục (`rgb(255,210,74)`) nằm **đè lên trên**, cùng kích thước tới từng phần mười
pixel, vì `PieceLayer` vẽ sau `role="grid"` trong DOM.

Một cú nhích `translateY(-4px)` của một hình gần đen, bị một hình đục cùng cỡ che
kín, trên nền slab cũng gần đen. Hai ảnh chụp cách nhau nửa chu kỳ animation không
phân biệt được bằng mắt.

Persona không báo được lỗi này vì không ai báo được thứ không tồn tại trên màn hình.
Ông Tám chỉ nói *"đứng yên chờ… chờ hoài vẫn vậy"* — và đó chính là nó.

### 2.4 Quân đặc biệt sinh đúng chỗ; người chơi không thấy điều đó

`specials.ts` đã đặt quân đặc biệt **tại ô người chơi vừa đổi**, miễn ô đó nằm trong
match. Chỉ khi match sinh ra từ cascade — không ai đổi gì cả — nó mới rơi về giữa
dãy. Cô Liên thấy viên sọc "tuốt dưới đáy" vì match của cô đến từ cascade, đúng theo
thiết kế.

Nên FR-19 không đụng vào `specials.ts`. Vấn đề là viên sọc **trông không khác** viên
thường đủ để người chơi nối được nhân với quả.

## 3. Nguyên tắc xuyên suốt

> Mỗi hành động của người chơi sinh ra **đúng một** phản hồi nhìn thấy được, và phản
> hồi đó luôn giống nhau — kể cả khi nội dung của nó là "không được".

Phương án "thêm màn hướng dẫn lần đầu" bị loại, không phải vì khó mà vì
`overview.md` §6 đã cấm: luật phải tự hiện ra qua chính chuyển động trên bàn.

## 4. FR-19 · Bàn cờ tự giải thích

### 4.1 Viên đặc biệt (F-01)

Hiện tại một viên đặc biệt mang **hai** dấu trên một mặt: hình khối của màu, tối và
lớn (`text-surface-base` `#17111F`, 64% bề rộng, `opacity-50`), và huy hiệu đặc biệt,
sáng nhưng **nhỏ** (`fill-ink-strong` `#F7F3FF`, inset 18%).

Dấu sáng đang là dấu nhỏ hơn, và viên không có gì tách nó khỏi 48 viên còn lại — đúng
như báo cáo mô tả: *"một ký tự trắng nhỏ nằm trong ô… không viền, không hào quang,
không phóng to"*. Vấn đề là **thứ bậc và diện tích**, không phải màu mực.

Quy tắc mới: **hai dấu, hai tầng sáng khác nhau** — chứ không phải hai dấu tối bằng
nhau, và cũng **không phải** bỏ bớt một dấu.

Bỏ hình khối màu trên viên đặc biệt là phương án đầu tiên được cân nhắc, và nó **bị
loại**: sọc đỏ và sọc lục khi đó chỉ còn khác nhau bằng màu, tức vi phạm NFR-A11Y-06
— đúng ngưỡng tồn tại vì persona p05 mù màu đỏ-lục. Hình khối của màu **phải ở lại
trên mọi viên**.

| | Viên thường | Viên đặc biệt |
| --- | --- | --- |
| Hình khối của màu | tối, 64%, `opacity-50` | **giữ** — lùi xuống `opacity-25` |
| Huy hiệu đặc biệt | — | sáng, **phủ rộng hơn** (inset 18% → 10%) |
| Viền | không | viền sáng quanh thân viên |

Thứ bậc làm bằng **độ sáng**, không bằng việc bỏ dấu. Người chơi vẫn đọc được màu qua
hình khối; viên đặc biệt vẫn tách khỏi 48 viên còn lại vì nó là viên duy nhất có một
dấu sáng và một viền.

### 4.2 Focus và đã-chọn (F-02)

Thứ tự bị đảo và phải đảo lại:

| Trạng thái | Hiện tại | Sau |
| --- | --- | --- |
| focus (bàn phím) | `ring-accent-pink` — **sáng** | giữ nguyên |
| đã chọn | `ring-ink-strong` — **tối, trên nền gần đen** | `accent` `#F59E0B`, dày hơn |

Bất biến giao diện: **dấu "đang chọn" không bao giờ được yếu hơn dấu "đang focus"**.
Hai dấu cùng lúc trên một ô là hợp lệ và phải phân biệt được với nhau.

### 4.3 Nước đi bị từ chối (F-03)

Animation trượt-qua-rồi-về giữ nguyên. Thêm:

- một dấu **đọng lại** trên hai ô vừa bị từ chối, sống lâu hơn cú trượt;
- một dòng `aria-live` nói nước đi không hợp lệ — cùng cơ chế NFR-A11Y-04 đang dùng
  cho điểm và lượt.

Lượt vẫn **không** bị trừ (bất biến 6). Dấu đọng phải tắt hẳn dưới
`prefers-reduced-motion` theo NFR-A11Y-05, nên nó là một thay đổi trạng thái có thời
hạn chứ không phải một animation lặp.

### 4.4 Gợi ý nhàn rỗi

`data-hint` chuyển từ cái hốc sang **viên** ở `PieceLayer`. Cái hốc không bao giờ
nhìn thấy được khi có viên nằm trong nó, nên nó là chỗ sai để gắn bất kỳ tín hiệu nào.

## 5. FR-20 · Bản đồ và hộp thoại

### 5.1 Khối nhận diện (F-05)

`MASTER.md` §Page Pattern **bỏ toàn bộ** khuôn hero/CTA/testimonial và ghi rõ sản
phẩm có hai màn hình. Nên đây **không** phải hero. Một khối gọn trên đầu bản đồ màn:
tên sản phẩm, một dòng nói nó là gì, một dòng trả lời nỗi sợ mà 5/7 persona nêu
("6 màn · không đăng nhập"), và một dấu nhận diện vẽ bằng SVG — `MASTER.md`
§Anti-Patterns cấm emoji làm icon.

Cộng một `favicon`: cả 7/7 phiên đều ghi `404 /favicon.ico`.

### 5.2 Ngưỡng sao (F-04)

Dữ liệu đã có sẵn: `levels.ts` khai `stars: [2000, 4000, 7000]` cho màn 1. Bốn lần
thắng trong lượt chạy đều được đúng 1/3 sao và không ai biết vì sao. Hiện **còn thiếu
bao nhiêu điểm để lên sao kế tiếp**, ở cả thẻ màn trên bản đồ lẫn hộp thoại thắng.
Đủ ba sao thì không hiện gì thêm.

### 5.3 Điều kiện mở khoá (F-09)

"Chưa mở" nói trạng thái nhưng không nói điều kiện. Thẻ màn khoá nói thẳng phải thắng
màn nào để mở.

### 5.4 Hộp thoại thua (F-10)

Nhánh thua hiện không có sao, không có điểm, và không nút nào mang trọng lượng nút
chính. Cân lại: hàng sao (rỗng), điểm trên mục tiêu, **một câu nói thẳng rằng sao và
điểm cao được giữ nguyên** — thứ p02 phải tự quay về bản đồ kiểm mới biết — và
`Chơi lại` thành nút chính.

## 6. FR-21 · HUD ở khung nhìn thấp (F-06)

Ở 720×450 (laptop 1440×900 zoom 200%), thanh đầu cộng hai thẻ HUD xếp dọc ăn 230 trên
450px, còn 3,5 trong 8 hàng bàn cờ. Lúc người chơi nhìn vào bàn thì Lượt, Điểm và Mục
tiêu đã trôi hẳn khỏi màn hình — nguyên nhân và kết quả không bao giờ cùng trong tầm
nhìn.

Khi chiều cao khung nhìn thấp, HUD gói vào **một hàng**. Mục tiêu mang **nhãn chữ**
chứ không chỉ icon: cô Liên đọc được "0/12, 0/12, 0/4.000" nhưng không nói được chúng
là mục tiêu gì.

## 7. FR-22 · Chặn hành động phá huỷ (F-07, F-08)

`Chơi lại` xoá màn đang dở, không hỏi, và đứng cách bàn cờ đúng một phím Tab. Khi màn
**đang dở** (đã dùng ít nhất một lượt) thì hỏi lại trước, nói rõ mất gì và giữ gì.
Màn chưa đụng tới thì chơi lại luôn — không có gì để mất thì không có gì để hỏi.

Cùng cơ chế áp cho việc rời màn giữa chừng (F-08): việc không lưu điểm giữa màn là
bình thường ở thể loại này và **không đổi**; cái đổi là nó không còn xảy ra trong im
lặng.

Token `destructive #DC2626` trong `MASTER.md` đang ghi "(chưa dùng)" — đây là chỗ
dùng nó.

## 8. Ngoài phạm vi

- `specials.ts`, `activate.ts`, `moves.ts`, `resolve.ts` — engine đúng, xem §2.4.
- Roving tabindex — đúng, xem §2.1.
- Bất biến 6 (swap hoàn tác không trừ lượt) — giữ nguyên, mọi thay đổi ở §4.3 là
  trình bày.
- FR-09 combo hai quân đặc biệt, FR-18 viên bay về HUD — vẫn `chưa`, không thuộc đợt
  này.
