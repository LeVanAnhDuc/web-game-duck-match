# Thiết kế · `tactile-board`

**Liên quan:** FR-15 · FR-16 · FR-17 · US-01 · US-02 · US-04 ·
NFR-A11Y-01 · NFR-A11Y-02 · NFR-A11Y-04 · NFR-A11Y-05 · NFR-A11Y-06 ·
NFR-PERF-06 · NFR-PERF-07 · NFR-I18N-01 ·
ADR-0002 · ADR-0006 · ADR-0008 · ADR-0009 · ADR-0010

> **Trạng thái:** đã chốt với người dùng (brainstorm 07.09.2026)
> **Track:** trình bày — **vuông góc** với 5 giai đoạn luật chơi của ADR-0005,
> chen vào trước giai đoạn 2

## 1. Vì sao có feature này

Bàn chơi hiện tại **nhảy**: mọi thay đổi trạng thái xuất hiện tức thì, nên
`game/timeline.ts` chỉ là một chuỗi khoảng chờ chứ không phải animation. Ba hệ quả
đo được:

- Nhân tử cascade là một luật **vô hình**. Engine tính `cascade` và `points` cho
  từng match, UI không hiện gì. Màn 2 tồn tại để dạy "một cascade dài hơn nhiều
  match lẻ" — người chơi hiện **không có cách nào** học được điều đó.
- Sáu màu viên **đang vi phạm ngưỡng tương phản**: viên tím trên nền hiện tại đo
  được **2,57:1**, dưới ngưỡng 3:1 cho vật thể đồ hoạ. Cặp đỏ/cam chỉ **ΔE 23**,
  trong khi màn 3 thu đỏ và các màn khác dùng cam.
- Một swap không hợp lệ **không phản hồi gì** ngoài việc không có gì xảy ra, nên
  người chơi không biết mình vừa bị từ chối hay vừa bấm hụt.

Người dùng yêu cầu năm thứ (trượt khi đổi chỗ · trượt qua rồi về khi không hợp lệ ·
sweep khi quân đặc biệt nổ · viên có bóng và màu dễ nhìn hơn · hiệu ứng rơi) và chốt
thêm bốn nhóm nữa. Tất cả nằm trong **một** spec theo yêu cầu tường minh, chia ba
phần A/B/C, và `plan.md` xếp task theo đúng thứ tự đó để dừng giữa đường vẫn có thứ
chạy được.

## 2. Ba quyết định nền

**Ngân sách motion: nhanh hơn hiện tại, đẹp hơn.** Input vẫn khoá cả hàng đợi (bất
biến 3), nhưng một vòng cascade rút từ 550ms xuống 280ms bằng cách cho các nhịp
**chồng nhau**.

**Kiểu kéo: trượt qua nhau, không dính ngón tay.** Input giữ nguyên
(pointerdown → pointerup ô kề · tap-tap · bàn phím). Không theo `pointermove`. Đó là
điều giữ cho 25 test `Board` và 15 test E2E hiện có không phải viết lại — chúng lái
bàn bằng bàn phím và đọc `aria-label`.

**Nền tối nhưng ấm.** Không dùng light hồng như `MASTER.md` bước 1 đề xuất: trong
match-3 sáu màu viên mới là palette chịu lực, và nền chỉ có một việc — làm chúng nổi
và tách nhau. Xem ADR-0008.

---

# Phần A · Token và ngôn ngữ hình ảnh (FR-15)

## A.1 Bề mặt

| Token | Hex | Việc |
| --- | --- | --- |
| `surface.base` | `#17111F` | trang, tối nhất, để bàn nổi lên như một phiến |
| `surface.board` | `#241B31` | phiến đất sét chứa cả bàn |
| `surface.well` | `#1C1526` | lòng ô rỗng |
| `surface.card` | `#31253F` | thẻ HUD |
| `surface.raised` | `#423356` | nút |
| `ink.strong` | `#F7F3FF` | chữ chính — **15,06:1** trên `board` |
| `ink.muted` | `#C9BBDB` | chữ phụ — **9,10:1** trên `board` |

`board` so với `well` chỉ **1,08:1**, và đó là **có chủ đích**: cái hố được định
nghĩa bằng inset shadow, không bằng màu. Đừng "sửa" con số này.

## A.2 Sáu màu viên

`red #FF5470` · `blue #3B9EFF` · `green #3DD68C` · `yellow #FFD24A` ·
`purple #A855F7` · `orange #F97316`

Chọn bằng đo, không bằng khẩu vị — bốn bộ ứng viên × bốn nền ứng viên, tính tương
phản WCAG và khoảng cách CIE76 từng cặp:

| | Bộ hiện tại | Bộ này |
| --- | --- | --- |
| Tương phản viên/nền thấp nhất | **2,57:1** (tím) — **vi phạm** 3:1 | **4,16:1** (tím) |
| Cặp màu gần nhau nhất | **ΔE 23** (đỏ/cam) | **ΔE 50** (đỏ/cam và vàng/cam) |

Mỗi màu vẫn giữ một hình khối riêng (NFR-A11Y-06) — màu không bao giờ là tín hiệu
duy nhất, và bộ hình khối không đổi trong feature này.

**Màu nhấn:** hồng `#EC4899` (focus ring, primary) · hổ phách `#F59E0B` (sao, CTA).
Violet `#8B5CF6` mà bước 1 đề xuất làm secondary bị **bỏ**: nó nằm ngay cạnh viên
tím `#A855F7`, và một màu nhấn UI không được lẫn với một màu viên.

## A.3 Type

`Baloo 2` (heading, 600/700) + `Nunito` (body, 400/600), nạp qua
**`next/font/google`** với subset `['latin', 'vietnamese']`.

`MASTER.md` bước 1 đề xuất `Fredoka` cho heading. **Không dùng được:** Google chỉ
phục vụ `latin`, `latin-ext`, `hebrew` cho font đó — không có `vietnamese`, nên khối
U+1EA0–1EF9 rơi glyph sang font fallback và "Lượt", "Điểm", "Mục tiêu" hiện lệch nét
ngay trên HUD. Đã kiểm bằng cách gọi `fonts.googleapis.com/css2` với UA Chrome và
đọc các dòng subset. `Baloo 2` cùng tinh thần (chunky, tròn, toy-like) và **có**
`vietnamese`.

`next/font` self-host lúc build: không request nào ra fonts.googleapis.com khi chơi
(quan trọng vì site chạy trên GitHub Pages), không CLS, và subset giữ bundle nhỏ —
`yarn check:bundle` là cổng canh NFR-PERF-07.

## A.4 Signature element — cái giếng

Bàn không phải 49 ô rời mà **một phiến đất sét liền có 49 lỗ ấn xuống**. Viên là khối
dày nằm trong lỗ.

```
một ô, nhìn ngang:                      một ô, nhìn thẳng:
                                        ╭───────────────╮
   ╭─────────────╮  ← viên: bo 20px,    │ ╭───────────╮ │ ← inset shadow trên+trái
  ╱               ╲   viền sáng 3px      │ │           │ │   = thành giếng
 │   ▲ hình khối   │  ở cạnh trên        │ │    ▲▲▲    │ │
  ╲               ╱                      │ │   ▲▲▲▲▲   │ │ ← viên: outer shadow
   ╰─────────────╯                       │ ╰───────────╯ │   dưới+phải
  ══════════════════ ← outer shadow      ╰───────────────╯
     giếng (lõm)                          nền = board, lòng = well
```

Viên được chọn thì **nhấc lên**: `translateY(-3px)` + shadow lớn hơn — nghịch đảo của
"soft press" mà `MASTER.md` gọi là key effect. Ring hồng **vẫn giữ**, vì a11y cần một
tín hiệu không phụ thuộc chiều sâu (NFR-A11Y-02).

## A.5 Cái gì của `MASTER.md` bị bỏ

`Page Pattern` của bước 1 là *"Hero > Problem statement > Solution overview >
Testimonials carousel > CTA"* với chiến lược "social proof trước CTA, testimonial có
ảnh và chức danh". Đó là khuôn landing page bán SaaS. Sản phẩm này có hai màn hình và
không bán gì. Bỏ toàn bộ mục đó.

Giữ nguyên và **không được override**: thang spacing · bốn mức shadow · 4.5:1 · focus
thấy được · `prefers-reduced-motion` · 375/768/1024/1440 · không đổi trạng thái tức
thời (150–300ms) · không dùng emoji làm icon · `cursor-pointer` trên mọi thứ bấm được.

## A.6 Nơi token sống

`docs/design-system/match-3/MASTER.md` là nguồn đúng; các quyết định trên được ghi
**vào chính file đó** (bước 2 của skill `design-bootstrap`).
`tailwind.config.ts` chép lại từ nó. Đây là dòng nợ *"token chưa qua MASTER.md"*
trong `backlog.md` được trả.

---

# Phần B · Kiến trúc motion (FR-16)

## B.1 Ba lớp

```
ui/Board.tsx          container position:relative, giữ --cell, và:
  ├─ semantic grid    role="grid" + 1 button/ô — KHÔNG ĐỔI
  ├─ ui/PieceLayer    1 Tile/viên, key = piece.id, translate(col×cell, row×cell)
  └─ ui/EffectLayer   hiệu ứng sống ngắn, key = effect id, aria-hidden toàn bộ
```

| Lớp | Nguồn | Chuyển động đến từ đâu |
| --- | --- | --- |
| semantic | grid đã chiếu | không chuyển động. Bàn phím, focus, `aria-label`, `aria-busy` |
| piece | grid đã chiếu | **hiệu của state** — viên đổi `translate`, CSS nội suy |
| effect | `GameEvent[]` | keyframe ngắn, tự xoá |

Trượt và rơi vì thế **không có dòng animation nào**. Lớp semantic đứng yên là điều giữ
cho test hiện có không đỏ.

## B.2 Viên đang bị xoá

`Session.grid` là dữ liệu của engine — không nhét cờ UI vào đó. `PieceLayer` tự nhớ
frame trước: viên nào mất khỏi grid thì được giữ thêm một nhịp với `data-clearing`
(co + mờ) rồi mới bỏ. Tách thành `ui/useExitingPieces.ts`. Vòng đời DOM là chuyện của
tầng vẽ.

## B.3 `Step.visual` — nhịp do timeline tự nghĩ ra

Dịch `swapReverted` thành hai sự kiện `swapped` sẽ làm projection **trừ hai lượt** và
phá bất biến 6. Nên:

```ts
type Step = {
  events: GameEvent[]                                            // của engine
  visual?: { kind: 'swapOut' | 'swapBack'; from: Pos; to: Pos }   // của timeline
  lead: number
}
```

Một `swapReverted` thành hai step: `swapOut` (đổi chỗ, **không** trừ lượt) rồi
`swapBack` (đổi về). Trường riêng vì animation kéo-về là **phát minh của tầng trình
bày** — engine không báo có chuyện đó, và trộn nó vào `events` là nói dối trong chính
cấu trúc dữ liệu.

## B.4 `duration` → `lead`

`lead` không phải "animation dài bao lâu" mà **"bao lâu nữa nhịp sau khởi động"**.
Thời lượng thật nằm ở CSS. Hai số tách nhau là điều làm nhịp chồng nhau được.

| Nhịp | `lead` (ms) | CSS (ms) |
| --- | --- | --- |
| `swapped` | 120 | 140 |
| `swapOut` / `swapBack` | 120 / 140 | 140 |
| `matched` (+ nổ, + sinh) | 90 | 180 |
| `specialActivated` (sweep) | 60 | 260 |
| `fell` | 110 | 200 |
| `refilled` | 80 | 200 |
| `reshuffled` | 200 | 300 |
| `levelWon` / `levelLost` | 0 | — |

Một vòng cascade: `90 + 110 + 80 = 280ms` lead, trong khi viên vẫn đang co và sweep
vẫn đang chạy. Hôm nay là `550ms`.

## B.5 Sweep "ăn hàng"

Không phải hiệu của state ⇒ `EffectLayer`, đọc `specialActivated` (đã mang `at`,
`special`, `cleared`):

| Quân | Hiệu ứng |
| --- | --- |
| `stripedH` | thanh sáng chạy từ `at` ra hai đầu **hàng** |
| `stripedV` | thanh sáng chạy từ `at` ra hai đầu **cột** |
| `wrapped` | vòng sáng lan ra vùng 3×3 |
| `colorBomb` | nháy tại `at`, rồi mỗi ô trong `cleared` nhấp một nhịp lệch pha |

Key của effect là `${moveId}:${eventIndex}` — duy nhất trong một nước đi, nên hai
sweep cùng lúc không đè nhau.

## B.6 Reduced motion

`lead` về 0 · CSS tắt transition qua `data-reduced-motion` trên root · **`EffectLayer`
render rỗng**. Một sweep 0ms là một cú nháy, tệ hơn không có. Bàn nhảy thẳng tới kết
quả — đúng thứ test hiện tại đang assert (NFR-A11Y-05).

---

# Phần C · Lớp phản hồi (FR-17)

## C.1 Điểm bay và bậc cascade

Từ `matched`: thả `+360 ×2` tại tâm match, trôi lên rồi mờ. Nhân tử chỉ hiện khi
`cascade >= 2`. Nguyên nhân và kết quả cùng một chỗ.

Bộ đếm điểm HUD **chạy số** giữa hai giá trị engine đã cho, thay vì nhảy. Đó là nội
suy hiển thị — cùng loại với việc CSS nội suy vị trí — **không** phải UI tự tính
điểm (bất biến 2). Điểm đích luôn là `session.score`.

## C.2 Quân đặc biệt nhấp nháy

CSS trên `Tile` khi `piece.special !== 'none'`. Reduced motion → viền tĩnh.

## C.3 Gợi ý sau 5s idle

Tìm nước đi là **luật chơi**, nên nó không được ở `ui/`. Thêm vào
`src/engine/index.ts`:

```ts
findHint(session: Session): { from: Pos; to: Pos } | null
```

Bọc mỏng `findLegalMoves`, ưu tiên nước tạo được match ≥ 4 (gợi ý cũng dạy luôn), trả
`null` khi không có hoặc level đã kết thúc. Hook gọi khi `!busy && status === 'playing'`
và không có input trong 5s; UI nhấp nháy hai ô đó. Engine quyết, UI hiện.

## C.4 `reshuffled` mang theo grid — đảo một quyết định đã ghi

`backlog.md` ghi: *"nhồi cả một grid vào một sự kiện chỉ để phục vụ một nhịp animation
là cái giá đắt hơn"*. Đúng ở thời điểm đó. Giờ không còn đúng: `moves.reshuffle` xáo
**chính các object `Piece`**, nên `id` giữ nguyên — nếu event mang grid mới thì lớp
viên tự trượt từng viên về chỗ mới, **không cần một dòng animation nào**. Giá: một
event mang `rows × cols` object, xảy ra rất thưa.

```ts
| { t: 'reshuffled'; grid: Grid }
```

Xem ADR-0009. Kèm theo, `t.reshuffled` được đọc trong vùng `aria-live` để người dùng
screen reader biết bàn vừa được xáo và **không mất lượt** (NFR-A11Y-04).

## C.5 Đếm lượt đập

CSS trên `MoveCounter` khi `movesLeft <= 3`. Reduced motion → chỉ đổi màu sang hổ
phách, không đập.

## C.6 Dialog kết quả

Scale-in, ba sao đáp xuống lệch nhịp. **Focus vẫn vào nút đầu ngay lập tức** — không
chờ animation, vì chờ là làm hại đúng người dùng bàn phím mà focus trap phục vụ. 18
test `ResultDialog` hiện có không được đỏ.

## C.7 Viên bay về ô mục tiêu — **ĐÃ CẮT**, thành FR-18

Cần đo vị trí `GoalHud` từ trong `Board`, mà HUD đổi chỗ giữa các breakpoint (trên bàn
ở 375, cột trái từ `lg`). Cách làm: `GoalHud` đăng ký một ref cho mỗi màu qua context
`GoalTargets`; lớp bay đo `getBoundingClientRect` lúc khởi động chuyến bay; **không có
target đăng ký thì tự hạ cấp** thành "token bật lên rồi tan" tại chỗ.

**Kết quả: đã cắt.** Thiết kế trên vẫn đứng, nhưng nó không được hiện thực trong
feature này và giờ là FR-18.

Lý do cắt, nói thẳng: nó là món trang trí nhất trong danh sách (bộ đếm mục tiêu đã
nhấp, viên đã nổ, điểm đã bay), lại là món duy nhất cần đo vị trí xuyên qua hai
component ở bốn breakpoint. Nó cũng là hạng mục đã được ghi trước là "cắt đầu tiên
nếu plan dài ra" — và plan **đã** dài: 16 task trong một pass, cộng bốn lỗi phải sửa
sau khi code review tìm ra. Nửa vời một hiệu ứng giòn thì tệ hơn là chưa làm.

Bỏ nó không kéo theo gì, đúng như thiết kế: không file nào khác tham chiếu tới nó.

---

## 3. Chiến lược test

| Tầng | Công cụ | Cái gì |
| --- | --- | --- |
| `engine/` | Vitest | `findHint` (C.3) · `reshuffled.grid` (C.4) · test hiện có không đỏ |
| `game/timeline` | Vitest | `lead` từng loại nhịp · `swapReverted` → 2 step · reduced motion về 0 |
| `game/project` | Vitest | `visual` swapOut/swapBack **không** trừ lượt · `reshuffled.grid` áp được |
| `test/engine-ui-agreement` | Vitest | **vẫn phải xanh** — 4320 nước đi, chiếu vẫn tái tạo đúng engine |
| `ui/useExitingPieces` | Vitest | viên mất khỏi grid được giữ đúng một nhịp rồi bỏ |
| `ui/PieceLayer` | Testing Library | 49 tile có `key`/`data-piece-id` đúng · `translate` theo row/col · `data-clearing` |
| `ui/EffectLayer` | Testing Library | mỗi loại `specialActivated` sinh đúng loại sweep · rỗng khi reduced motion · `aria-hidden` |
| `ui/` còn lại | Testing Library | 25 `Board` + 19 HUD + 18 `ResultDialog` + 8 `LevelMap` **không đỏ** |
| luồng | Playwright | 15 test hiện có không đỏ · ảnh chụp 375/768/1024/1440 |
| live | Playwright | `verify:live` sau deploy vẫn xanh |

**Hai phòng tuyến quan trọng nhất** không phải test mới mà là hai test cũ:
`test/engine-ui-agreement.test.ts` (chiếu phải khớp engine — thêm `visual` và
`reshuffled.grid` là đúng chỗ dễ làm nó lệch) và 15 test E2E (lái bàn bằng bàn phím —
đúng chỗ mà việc tách lớp semantic khỏi lớp viên dễ làm vỡ).

## 4. Cổng mockup — nói rõ vì sao không dựng canvas

`feature-flow` bước 1 yêu cầu mockup canvas Artifact. Phần A (cái nhìn tĩnh) thì
canvas hợp; phần B và C **là thời gian**, và một artboard tĩnh không diễn tả được
`lead` 90ms chồng lên transition 180ms. Dựng canvas cho chúng là diễn kịch.

Cổng thật cho feature này là **bước 5 của `feature-flow`**: chạy app thật, chụp ảnh
bốn bề rộng, và đi vài nước để xem chuyển động. Wireframe ASCII ở A.4 giữ vai trò bản
thiết kế cho phần tĩnh. Ghi vào `backlog.md` như một sai lệch có ý thức.
