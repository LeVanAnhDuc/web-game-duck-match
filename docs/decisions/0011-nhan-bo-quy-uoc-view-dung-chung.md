# ADR-0011 · Nhận bộ quy ước view dùng chung của workspace `web-game`

> **Ngày:** 2026-09-11
> **Trạng thái:** accepted
> **Liên quan:** ADR-0004 · [`docs/code-conventions.md`](../code-conventions.md)

## 1. Bối cảnh

Bộ quy ước dùng chung rút từ `quapp-developer-frontend`, đã lọc qua sáu lần áp thật
trước khi tới đây.

Repo này lệch ở hai chỗ nặng:

- **Hai màn hình nằm trong `src/app/`.** `MapScreen.tsx` và `PlayScreen.tsx` là UI
  thật, đặt cạnh `page.tsx` và `layout.tsx`. Tầng routing lẽ ra chỉ nối dây.
- **`src/ui/` là một cái túi.** Trong đó có component, một hook
  (`useExitingPieces.ts`), và một file token thuần (`tokens.ts`) mà **không file nào
  trong `src/` import** — hoá ra `tailwind.config.ts` đọc nó.

## 2. Quyết định

Theo [`docs/code-conventions.md`](../code-conventions.md):

- `src/ui/` → `src/views/Map/` và `src/views/Play/`. `MapScreen` → `views/Map/index.tsx`
  (hàm đổi tên thành `Map`), `PlayScreen` → `views/Play/index.tsx` (thành `Play`).
  `app/page.tsx` và `app/play/[id]/page.tsx` chỉ còn gọi view.
- `Board` → `mains/` của Play; `LevelMap` → `mains/` của Map. `EffectLayer` ·
  `GoalHud` · `MoveCounter` · `PieceLayer` · `ResultDialog` · `Tile` · `PieceShape`
  (tên cũ `shapes.tsx`) → `components/` của Play.
- `StarRow` dùng ở **cả hai** view (`LevelMap` và `ResultDialog`) nên nó ra
  `src/components/` — tầng dùng chung xuyên view.
- `useExitingPieces` → `src/hooks/`. `tokens.ts` → `src/lib/`, và
  `tailwind.config.ts` trỏ theo.
- Thêm barrel `hooks/index.ts`, năm luật ESLint chung, `.githooks/pre-commit`.

**KHÔNG áp R-04 (`ghosts/`).** Hai container của repo này không phải chỗ chứa
side-effect: `Play` có 0 `useEffect`, `Map` có 1 và nó tải tiến độ rồi `setState` để
render. Bốn effect còn lại nằm trong `MoveCounter` và `ResultDialog`, và chúng **là**
việc của chính hai component đó — đếm số có hoạt cảnh, và bẫy focus trong hộp thoại.
Ghost là thứ `return null`; không có effect nào ở đây thuộc loại đó.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Giữ hai màn hình trong `src/app/` | Chúng là UI, không phải route. Đặt ở đó thì người đọc phải mở `app/` để tìm màn hình, và tầng routing mất luôn tính chất "mỏng, đọc là hiểu" |
| Để `StarRow` trong `views/Play/components/` | `LevelMap` bên view Map cũng dùng nó. Một component có hai view dùng thì nó không thuộc view nào |
| Để `tokens.ts` trong `views/` | Không file nào trong `src/` import nó; người đọc duy nhất là `tailwind.config.ts`. Nó là dữ liệu cấu hình, nên nó thuộc `lib/` |
| Đổi tên `shapes.tsx` thành `Shapes/` | File xuất đúng một component tên `PieceShape`. Thư mục mang tên component là quy ước (R-05), nên tên thư mục phải là `PieceShape` |

## 4. Hệ quả

**Được:**
- `src/app/` còn đúng ba file, không file nào chứa UI.
- Mở `views/Play/` là thấy toàn bộ màn chơi.

**Mất / phải chấp nhận:**
- Commit này chạm gần như toàn bộ tầng UI; `git blame` trên một dòng UI sẽ dừng ở đây.
- `tailwind.config.ts` giờ phụ thuộc vào đường dẫn `src/lib/tokens`. Đổi chỗ file đó
  lần nữa mà quên config thì **build vẫn chạy** — chỉ là màu sai.

## 5. Một việc KHÔNG thuộc quyết định này

`src/engine/perf.test.ts` ("p95 dưới 16ms qua 1000 nước") **hết hạn 5000ms khi chạy
cùng cả bộ**, và **pass khi chạy riêng** (2.4-3.0s). Đúng như vậy cả trước và sau đợt
refactor này: 517 test, cùng một test đỏ.

Nguyên nhân là chính sự song song của vitest — một phép đo hiệu năng chạy cạnh 29 file
khác thì đo tranh chấp CPU, không đo code. Đây là việc riêng, đã ghi vào
`04-state/backlog.md` §Nợ kỹ thuật.
