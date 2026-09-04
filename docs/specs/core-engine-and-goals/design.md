# Thiết kế · `core-engine-and-goals`

**Liên quan:** FR-01 · FR-02 · FR-03 · FR-04 · FR-05 · FR-06 · FR-07 · FR-08 ·
US-01 · US-02 · US-03 · US-04 · NFR-PERF-05 · NFR-PERF-06 · NFR-A11Y-01 ·
NFR-A11Y-02 · NFR-A11Y-03 · NFR-A11Y-05 · NFR-I18N-01 · NFR-REL-03 ·
ADR-0001 · ADR-0002 · ADR-0003 · ADR-0004 · ADR-0005

> **Trạng thái:** đã chốt với người dùng (brainstorm 04.09.2026)
> **Giai đoạn:** 1 / 5 — xem ADR-0005 cho bốn giai đoạn còn lại

## 1. Phạm vi giai đoạn này

Một vertical slice **chơi được thật**: mở app → thấy bản đồ màn → chơi màn 1 →
thắng/thua → thấy sao → mở màn tiếp theo → đóng tab mở lại vẫn còn tiến độ.

Trong phạm vi: luật match cơ bản + cascade · bốn loại quân đặc biệt (sinh và kích
hoạt **đơn lẻ**) · hai loại mục tiêu (`score`, `collect`) · sáu màn · chấm sao ·
bản đồ màn + mở màn tuyến tính · lưu tiến độ cục bộ · phát hiện bế tắc và xáo bàn.

Ngoài phạm vi, đã có chỗ đứng trong `scope.md`: combo giữa hai quân đặc biệt
(FR-09, giai đoạn 2) · ô chặn (FR-10, giai đoạn 3) · vật thể rơi xuống đáy (FR-11,
giai đoạn 4) · bộ 15-20 màn và cân độ khó (FR-12, giai đoạn 5) · âm thanh (FR-13) ·
đồng bộ backend (FR-14).

## 2. Kiến trúc — ranh giới chịu lực

Ranh giới quan trọng nhất của dự án: **`engine/` là TypeScript thuần, đồng bộ,
không import React, không đọc DOM, không gọi `Date.now()`, không gọi
`Math.random()`.** Nó là nơi *duy nhất* được phép quyết định kết quả một nước đi.

Một nước đi đi qua đúng một hàm:

```ts
applySwap(session: Session, from: Pos, to: Pos): SwapResult
type SwapResult = { session: Session; events: GameEvent[] }
```

`applySwap` trả về **trạng thái cuối cùng ngay lập tức**, kể cả sau năm tầng
cascade, kèm một danh sách sự kiện **có thứ tự** mô tả mọi thứ đã xảy ra. Tầng UI
chỉ *phát lại* danh sách đó thành timeline animation.

Hệ quả — và đây là lý do chọn kiến trúc này (ADR-0002):

- Test toàn bộ luật chơi bằng Vitest, không render, không chờ animation.
- UI không thể tính điểm khác engine, vì nó không tính gì cả.
- Bàn tái tạo được từ `(LevelConfig, seed, danh sách nước đi)` — bug dựng lại được.

```
src/
  engine/         TS thuần
    types.ts      Color · Special · Piece · Pos · LevelConfig · GoalSpec · Session · GameEvent
    rng.ts        PRNG có seed (mulberry32). Nguồn ngẫu nhiên DUY NHẤT (ADR-0003)
    board.ts      grid bất biến: đọc/ghi theo toạ độ, hoán vị, nén cột
    match.ts      tìm match hàng/cột >= 3 và hình L/T
    specials.ts   match nào sinh quân đặc biệt nào, sinh ở ô nào
    activate.ts   hiệu ứng kích hoạt từng loại quân đặc biệt
    resolve.ts    một vòng giải: xoá -> sinh đặc biệt -> rơi -> refill -> lặp cascade
    moves.ts      liệt kê nước đi hợp lệ · phát hiện bế tắc · xáo bàn
    goals.ts      tiến độ mục tiêu · điều kiện thắng/thua
    scoring.ts    MỌI hằng số điểm nằm ở đây, không rải rác
    session.ts    API công khai duy nhất: newSession · applySwap
  game/           keo dán engine <-> React
    useGameSession.ts  giữ session, hàng đợi sự kiện, khoá input khi đang animate
    timeline.ts        GameEvent[] -> các bước animation + thời lượng
  ui/             Board · Tile · GoalHud · MoveCounter · LevelMap · ResultDialog
  storage/
    ports.ts      interface ProgressRepository — cổng chừa cho backend (ADR-0001)
    local.ts      adapter localStorage, key có version
  levels/
    levels.ts     danh sách level có type, được test validate
  i18n/
    vi.ts         mọi chuỗi hiển thị (NFR-I18N-01)
```

Chiều phụ thuộc một hướng, không có ngoại lệ:
`ui/ -> game/ -> engine/` và `ui/ -> storage/ports.ts`.
`engine/` không phụ thuộc gì. `storage/local.ts` chỉ được import ở một chỗ duy nhất
(điểm khởi tạo app), để đổi adapter là đổi một dòng.

## 3. Mô hình dữ liệu

```ts
type Color   = 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange'
type Special = 'none' | 'stripedH' | 'stripedV' | 'wrapped' | 'colorBomb'
type Pos     = { row: number; col: number }
type Piece   = { id: number; color: Color; special: Special }
type Cell    = Piece | null           // null = ô trống trong lúc giải

type GoalSpec =
  | { kind: 'score';   target: number }
  | { kind: 'collect'; per: Partial<Record<Color, number>> }
  // giai đoạn 3 thêm 'clearBlockers', giai đoạn 4 thêm 'deliver'.
  // GoalSpec là union nên mở rộng không phá nhánh cũ — switch phải exhaustive.

type LevelConfig = {
  id: number
  rows: number; cols: number
  colors: Color[]
  moves: number
  goals: GoalSpec[]                   // mảng: một màn có thể có nhiều mục tiêu
  stars: [number, number, number]     // ba mốc điểm, tăng dần
}

type GoalProgress =
  | { kind: 'score';   current: number; target: number; done: boolean }
  | { kind: 'collect'; current: Partial<Record<Color, number>>
                     ; per: Partial<Record<Color, number>>; done: boolean }

type Session = {
  level: LevelConfig
  grid: Cell[][]
  rng: RngState                       // giá trị, không phải hàm — nên serialise được
  movesLeft: number
  score: number
  progress: GoalProgress[]
  status: 'playing' | 'won' | 'lost'
  nextPieceId: number
}

type Progress = {                     // thứ ProgressRepository lưu
  version: 1
  levels: Record<number, { stars: 0 | 1 | 2 | 3; bestScore: number }>
  unlockedUpTo: number
}
```

`GameEvent` là union đóng, và **thứ tự trong mảng là thứ tự thời gian**.

Hai trường được thêm khi hiện thực, vì thiếu chúng thì tầng UI **không thể** phát lại
đúng: `specialSpawned` mang cả `piece` (UI không được tự nghĩ ra `id` và màu — làm
vậy là nó phải biết luật sinh), và `specialActivated` mang `points` là phần điểm
riêng của lần kích hoạt đó. Bất biến kèm theo: **mọi điểm mà `score` nhảy lên đều
phải nằm trên một sự kiện nào đó**, nếu không điểm hiển thị không thể khớp điểm
engine. Có test ở cả hai phía canh chỗ này.


```ts
type GameEvent =
  | { t: 'swapped';   from: Pos; to: Pos }
  | { t: 'swapReverted'; from: Pos; to: Pos }          // swap không tạo match
  | { t: 'matched';   cells: Pos[]; cascade: number; points: number }
  | { t: 'specialSpawned';  at: Pos; special: Special; piece: Piece }
  | { t: 'specialActivated'; at: Pos; special: Special; cleared: Pos[]; points: number }
  | { t: 'fell';      moves: { from: Pos; to: Pos }[] }
  | { t: 'refilled';  cells: { at: Pos; piece: Piece }[] }
  | { t: 'goalProgressed'; index: number; progress: GoalProgress }
  | { t: 'reshuffled' }
  | { t: 'levelWon';  score: number; stars: 0 | 1 | 2 | 3 }
  | { t: 'levelLost' }
```

## 4. Luật chơi

**Bàn ban đầu.** Sinh từ `rng` sao cho không có match sẵn và có >= 1 nước đi hợp lệ.
Thuật toán: điền ngẫu nhiên, ô nào tạo match thì đổi màu khác; xong thì kiểm tra
nước đi hợp lệ, không có thì sinh lại (tối đa 50 lần, sau đó throw — một level mà
không sinh được bàn hợp lệ là lỗi cấu hình level, phải nổ ở test chứ không im lặng).

**Nước đi.** Chỉ swap hai ô kề nhau theo hàng hoặc cột. Swap không tạo match nào thì
hoàn tác, phát `swapReverted`, **không trừ lượt**. Ngoại lệ: swap có bom màu
(`colorBomb`) với một viên thường **luôn hợp lệ** và kích hoạt bom.

**Match.** Hàng hoặc cột >= 3 cùng màu. Hình L/T tính là một match khi một hàng >= 3
và một cột >= 3 cùng màu giao nhau tại một ô.

**Sinh quân đặc biệt.**

| Hình match | Sinh ra | Kích hoạt |
| --- | --- | --- |
| 4 thẳng ngang | `stripedH` | xoá sạch hàng của nó |
| 4 thẳng dọc | `stripedV` | xoá sạch cột của nó |
| L / T (>= 5 ô, hai nhánh >= 3) | `wrapped` | xoá vùng 3×3 quanh nó |
| 5 thẳng | `colorBomb` | xoá **toàn bộ** viên cùng màu với viên được swap cùng |

Ô sinh: **ô người chơi vừa swap** nếu ô đó thuộc match, ngược lại ô giữa của match
(với L/T là ô giao). Quy tắc này cố định — người chơi học được nó và dựa vào nó.

Một match >= 5 mà cũng là hình L/T thì `colorBomb` thắng (5 thẳng ưu tiên cao hơn).
Trong một vòng giải có nhiều match, mỗi match sinh tối đa một quân đặc biệt.

**Khoảng trống luật đã biết, cố ý để lại cho giai đoạn 2.** Bảng trên định nghĩa bom
màu theo "viên **được swap cùng**". Nó không nói gì về một bom màu bị *một quân khác*
nổ trúng. Hiện thực chọn: trong cùng một vòng giải, mọi bom màu trong chuỗi dùng
**cùng một màu** — màu của viên người chơi vừa swap; nếu nước đi đó không xuất phát từ
một swap có bom màu thì mỗi bom ăn màu của chính nó. Hệ quả lạ: swap bom màu với một
viên đỏ, mà chuỗi nổ trúng một bom màu xanh, thì bom xanh đó cũng xoá đỏ. Chấp nhận
được ở giai đoạn 1 vì `resolveClears` nhận **một** màu cho cả lần gọi, và toàn bộ
chuyện "hai quân đặc biệt tác động lên nhau" là FR-09 — giai đoạn 2 phải quyết lại
chỗ này chứ không được kế thừa im lặng.

**Kích hoạt.** Quân đặc biệt kích hoạt khi bị xoá — bởi một match chứa nó, hoặc bởi
hiệu ứng của một quân đặc biệt khác. Kích hoạt theo chuỗi (sọc phá hàng, trong hàng
có bom, bom nổ tiếp) chạy đến khi không còn quân đặc biệt nào bị xoá thêm. Chống lặp
vô hạn: một quân chỉ kích hoạt **một lần** trong một vòng giải — giữ một `Set` id đã
kích hoạt. Giai đoạn 1 **không có** combo swap trực tiếp hai quân đặc biệt với nhau
(FR-09): swap đó xử lý như kích hoạt lần lượt cả hai, không có hiệu ứng hợp nhất.

**Cascade.** Một vòng giải = xoá -> sinh quân đặc biệt -> rơi theo trọng lực (chỉ
rơi thẳng xuống, không rơi chéo) -> refill từ đỉnh -> tìm match lại. Lặp đến hết
match. Mỗi vòng là một *bậc cascade*, bắt đầu từ 1.

**Điểm** (mọi số trong `scoring.ts`): 60 điểm/viên bị xoá × nhân tử bậc cascade
(bậc 1 ×1, bậc 2 ×2, bậc 3 ×3, bậc 4 ×4, bậc >= 5 ×5) + 120 cho mỗi lần kích hoạt
quân đặc biệt.

**Mục tiêu `collect`** đếm theo viên **bị xoá**, gồm cả viên bị xoá do hiệu ứng quân
đặc biệt. Quân đặc biệt vẫn giữ màu gốc nên vẫn được đếm.

**Thắng / thua.** Thắng **ngay khi** mọi mục tiêu `done` — lượt còn lại không quy ra
điểm thưởng ở giai đoạn 1. Thua khi `movesLeft === 0` mà còn mục tiêu chưa xong.
Kiểm tra thắng/thua chỉ ở **cuối** `applySwap`, sau khi cascade dừng hoàn toàn.

**Sao.** `score >= stars[2]` -> 3 sao, `>= stars[1]` -> 2, `>= stars[0]` -> 1, dưới
nữa -> 0 sao. Thắng với 0 sao vẫn là thắng và vẫn mở màn sau.

**Bế tắc.** Sau mỗi vòng giải, nếu `findLegalMoves()` rỗng: xáo lại bàn **giữ nguyên
số lượng từng màu và từng quân đặc biệt** (Fisher-Yates từ `rng`), phát `reshuffled`,
**không trừ lượt**. Xáo tối đa 10 lần; vẫn bế tắc thì sinh bàn mới hoàn toàn theo
luật bàn ban đầu.

## 5. Sáu màn của giai đoạn 1

| # | Grid | Màu | Lượt | Mục tiêu | Mốc sao | Dạy điều gì |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 7×7 | 5 | 15 | `score` 2 000 | 2 000 / 4 000 / 7 000 | luật swap và cascade |
| 2 | 7×7 | 5 | 15 | `score` 4 000 | 4 000 / 6 000 / 9 000 | cascade dài đáng giá hơn nhiều match lẻ |
| 3 | 7×7 | 5 | 18 | `collect` 12 đỏ | 4 000 / 7 000 / 11 000 | nhắm màu, không chỉ nhắm điểm |
| 4 | 8×8 | 5 | 20 | `collect` 12 xanh + 12 vàng, `score` 4 000 | 4 000 / 6 500 / 9 000 | hai mục tiêu cùng lúc |
| 5 | 8×8 | 6 | 16 | `score` 6 000 | 6 000 / 8 000 / 11 000 | thêm màu ⇒ match khó hơn, cần quân đặc biệt |
| 6 | 9×9 | 6 | 18 | `collect` 12 tím, `score` 4 000 | 5 000 / 7 000 / 10 000 | buộc dùng sọc/bom mới đủ lượt |

**Những con số này là số ĐO ĐƯỢC, không phải số ước lượng.** Bản đầu của bảng này
là phỏng đoán lúc viết design; sau khi engine chạy, một "người chơi ngu" — luôn lấy
nước đi hợp lệ đầu tiên, chiến lược yếu nhất có thể — được cho chạy qua ba seed cố
định mỗi màn. Phỏng đoán lệch rất xa: **màn 1 thắng trong 5 trên 20 lượt với điểm
gấp sáu lần mục tiêu**, nên ngân sách lượt không bó ai và ba sao không tốn gì. Bảng
trên là bản đã cân lại: mục tiêu nằm trong tầm của người chơi ngu, sao cao nhất nằm
ngoài. Kết quả đo sau khi cân:

| # | Người chơi ngu | Điểm |
| --- | --- | --- |
| 1 | thắng 3/3, dùng 5-10 lượt | 2 160 – 9 180 (1 đến 3 sao) |
| 2 | thắng 3/3, dùng 9-10 lượt | 4 140 – 4 500 (1 sao) |
| 3 | thắng 3/3, dùng 15-18 lượt | 5 040 – 7 800 |
| 4 | thắng 3/3, dùng 13-19 lượt | 5 040 – 8 160 |
| 5 | thắng 2/3 | 5 580 – 7 020 |
| 6 | thắng 2/3 | 4 140 – 6 480 |

Cân độ khó đầy đủ là FR-12 (giai đoạn 5); đây chỉ là mức đủ để sáu màn dạy được thứ
chúng tồn tại để dạy.

Test validate mọi level: `stars` tăng dần, `moves > 0`, `colors.length >= 4`, mục
tiêu `collect` chỉ dùng màu có trong `colors`, và bàn ban đầu sinh được trong 50 lần
thử với ba seed cố định.

## 6. UI — bố cục

Mobile-first 375. Wireframe đã chốt trong hội thoại; đây là bản ghi lại.

**Màn hình chơi** (`/play/[id]`):

```
375                                    1440
┌───────────────────────────┐          ┌──────────────────────────────────────┐
│ ← Màn 3        ⭐⭐☆      │          │ ← Màn 3   ┌────────────────┐  ⭐⭐☆  │
├───────────────────────────┤          │           │                │         │
│  Lượt  17   Điểm  2 340   │          │  Lượt 17  │                │  Mục    │
├───────────────────────────┤          │  Điểm     │     BÀN        │  tiêu   │
│ Mục tiêu  🔴 8/15         │          │  2 340    │     9×9        │  🔴 8/15│
├───────────────────────────┤          │           │                │         │
│                           │          │  [Chơi    │                │         │
│          BÀN              │          │   lại]    └────────────────┘         │
│      (vuông, cạnh         │          └──────────────────────────────────────┘
│       = min(vw-32, ...))  │
│                           │          768: bàn giữa, HUD thành một cột bên
├───────────────────────────┤               phải, nút "Chơi lại" hiện thường
│      [ Chơi lại ]         │               trực thay vì nằm trong menu
└───────────────────────────┘
```

- Bàn luôn **vuông**, cạnh `min(100vw - 32px, vùng dọc còn lại, 560px)`; ô >= 44px ở
  375 với grid 7×7 và 8×8. Grid 9×9 ở 375 cho ra ô ~38px — **dưới ngưỡng
  NFR-A11Y-03**, nên ở màn 9×9 dưới 400px bàn được phép tràn ra vùng scroll riêng
  thay vì co ô lại. Đây là đánh đổi có ý thức, ghi vào `backlog.md` §Nợ kỹ thuật.
- **Kết quả** là một dialog (`ResultDialog`) chồng lên bàn, không phải trang riêng:
  thắng thì hiện sao + điểm + [Màn tiếp] + [Chơi lại]; thua thì hiện [Chơi lại] +
  [Về bản đồ]. Focus trap, `Esc` = về bản đồ.
- **Bản đồ màn** (`/`): danh sách thẻ màn theo lưới, mỗi thẻ có số màn, sao đạt
  được, điểm cao nhất. Màn chưa mở hiện khoá và `aria-disabled`.

**Bàn phím (NFR-A11Y-02).** Bàn là một `role="grid"`; mỗi ô là một `role="gridcell"`
chứa `button`. Mũi tên di chuyển con trỏ, `Enter`/`Space` chọn ô thứ nhất rồi ô thứ
hai kề nó để swap, `Esc` bỏ chọn. Ô đang chọn có ring nhìn thấy được, không chỉ đổi
màu.

**Màu và animation.** Sáu màu **không được phân biệt chỉ bằng màu sắc** — mỗi màu có
một hình khối riêng (tròn, vuông, tam giác, thoi, ngôi sao, lục giác) để người mù màu
vẫn chơi được. Animation bằng `transform`/`opacity`; thời lượng nằm trong
`timeline.ts`: xoá 180ms, rơi 220ms, sinh quân đặc biệt 150ms. Khi
`prefers-reduced-motion: reduce` thì mọi thời lượng về 0 và trạng thái nhảy thẳng
đến kết quả (NFR-A11Y-05) — engine không đổi gì, chỉ timeline đổi.

## 7. Chiến lược test

| Tầng | Công cụ | Cái gì |
| --- | --- | --- |
| `engine/` | Vitest, không DOM | mọi luật ở §4, bằng bàn dựng tay từ chuỗi ký tự |
| `levels/` | Vitest | validate 6 level + sinh được bàn với 3 seed cố định |
| `storage/` | Vitest | round-trip · dữ liệu rác trong localStorage · thiếu key |
| `game/` | Vitest + happy-dom | hàng đợi sự kiện, khoá input, reduced-motion |
| `ui/` | Testing Library | bàn phím, `aria`, ResultDialog focus trap |
| luồng | Playwright | US-01 -> US-03, chụp ảnh 375/768/1024/1440 |

Bàn trong test engine viết dạng chuỗi để đọc được bằng mắt — một helper
`parseBoard()` dịch `'RRB / GBR / YYY'` thành grid. Không có helper này thì test
luật cascade không ai đọc nổi.

Bất biến "engine không dùng `Math.random`" được canh bằng một test grep source, chứ
không chỉ bằng lời trong `invariants.md`.

## 8. Sai lệch có ý thức so với `feature-flow`

Bước 1 của `feature-flow` yêu cầu mockup canvas Artifact + cổng phê duyệt tường
minh. Người dùng đã **uỷ quyền tường minh cho toàn bộ phần còn lại của luồng**
("chạy cho đến khi làm xong hết... không cần hỏi lại"), nên cổng phê duyệt không có
người đứng ở đó. Wireframe ASCII ở §6 giữ vai trò bản thiết kế bố cục; không dựng
canvas Artifact cho giai đoạn 1. `design-bootstrap` / `MASTER.md` vì vậy cũng chưa
chạy — token thiết kế của giai đoạn 1 nằm trong `tailwind.config.ts` và được coi là
nợ, ghi ở `backlog.md`, phải trả trước khi có màn hình mới ở giai đoạn 3.
