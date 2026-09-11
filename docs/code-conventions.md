# Quy ước code — workspace `web-game`

> **Trả lời:** Code mới đặt ở thư mục nào, đặt tên ra sao, viết theo khuôn nào?
> **Phạm vi:** bản sao trong repo `duck-match`. Bản canon nằm ở gốc workspace `web-game/`.
> **Trạng thái ở repo này:** 🟢 đã áp — xem §8 và ADR-0011
> **Nguồn:** rút từ `quapp-developer-frontend`, đã lọc qua lần áp thật đầu tiên ở `duck-caro`
> **Cập nhật:** 2026-09-11
> **Cập nhật khi:** chốt/bác một rule · một project đổi stack · thêm một tầng thư mục mới

<!-- CÁCH ĐIỀN
File này là bản CANON cho cả workspace. Mỗi repo giữ một bản sao trong
docs/03-design/code-conventions.md của chính nó — bản sao đó ghi TRẠNG THÁI ÁP DỤNG
của riêng repo ấy, còn LÝ DO thì ở đây. Lý do chép sang repo thì hai bản sẽ lệch.

Repo phải tự đứng được sau một lần clone, nên bản sao là cố ý, không phải trùng lặp.

Mỗi rule có một mã R-xx. Mã KHÔNG tái dùng, KHÔNG xoá — rule bị bác thì giữ nguyên
tại chỗ kèm lý do, vì lần sau sẽ có người hỏi lại đúng câu đó.

KHÔNG chứa: quyết định riêng của một project (-> ADR của repo đó), bất biến
(-> invariants.md của repo đó).
-->

## 0. Hai stack, một bộ rule

Workspace có hai hình dạng project. Rule là một bộ; chỗ nào khác nhau thì ghi rõ.

| | **Next** (App Router, static export) | **Vite** (SPA) |
| --- | --- | --- |
| Project | caro · drift · flap · match · mines · push · solitaire | defense · runner · stack · stomp |
| Tầng routing | `src/app/` | `src/main.tsx` |
| Tầng màn hình | `src/views/<Tên>/` | `src/views/<Tên>/` |
| Ranh giới nghiệp vụ | `src/game/` hoặc `src/engine/` | `src/engine/` · `src/core/` |

**Tầng màn hình trùng tên ở cả hai stack, và đó là điểm của bộ rule này.** Một người
đọc `duck-stack` phải tìm được thứ mình cần bằng đúng thói quen đã có từ `duck-caro`,
dù một bên là Vite còn một bên là Next.

## 1. Cây thư mục

### R-01 — Mỗi vai trò một thư mục cấp 1 dưới `src/`

```
src/
  app/ | main.tsx   routing — mỏng, không logic
  views/            màn hình, một thư mục một màn
  components/       component dùng chung XUYÊN màn hình
  hooks/            custom hook, có barrel index.ts
  game/ | engine/   nghiệp vụ: TS thuần, không React, không DOM
  lib/              hàm thuần + chuỗi UI
  i18n/ storage/ input/ audio/ render/   tầng hạ tầng, mỗi thứ một thư mục
```

Không tạo `src/types/` — xem R-14. Không tạo `src/utils/` rỗng nghĩa — dùng `lib/`.

`src/ui/` là **tên cũ** của `src/views/`. Project nào còn `ui/` thì đổi tên khi áp rule.

### R-02 — Tầng routing chỉ nối dây, không chứa UI

Một file route = lấy dữ liệu nếu cần + gọi đúng một view. Khoảng 5-15 dòng.

```tsx
// Next
export default function Page() {
  return <Home />;
}
```

```tsx
// Vite — main.tsx chỉ mount, mọi thứ khác nằm trong views/
createRoot(document.getElementById('root')!).render(<App />);
```

### R-03 — Ba tầng trong một view: `index` · `mains` · `components`

```
views/Home/
  index.tsx                  ghép các mains lại, KHÔNG có JSX chi tiết
  mains/<Khối>/index.tsx     khối lớn của màn, dựng ĐÚNG MỘT LẦN
  components/<Mảnh>/index.tsx  mảnh dựng LẠI trong nội bộ view
```

**Tiêu chí là VAI TRÒ, không phải kích thước:**

- `mains/` — khối **cấu trúc**: thứ định hình bố cục của màn hình và chỉ có một chỗ
  đứng trong đó. `Header`, `BoardStage`, `GameStage`, `StartOverlay`, `SettingsSheet`.
- `components/` — mảnh **hiển thị**: thứ mà index hoặc một main dùng để dựng nên nội
  dung bên trong. `Hud`, `StatusLine`, `MoveList`, `Controls`, `WinSheet`, các overlay.

Hai phép thử phụ, dùng khi vai trò chưa rõ:

1. **Dựng nhiều hơn một lần ⇒ chắc chắn `components/`.** Prop kiểu `variant` /
   `orientation` / `size` chính là lời khai rằng nó bị dựng nhiều lần. Phép thử này
   chỉ **đủ**, không **cần**: một mảnh dựng đúng một lần vẫn có thể là `components/`.
2. **Bỏ nó đi thì màn hình còn đứng được không?** Còn → `components/`. Sập bố cục →
   `mains/`.

Chỉ có **hai tầng**. Không đặt component con bên trong thư mục của một main
(`mains/GameStage/Hud.tsx`) — đó là tầng thứ ba không có trong rule, và nó cũng vi
phạm R-05. Mảnh của một main đi ra `components/`.

Hai lần rule này bị sửa vì code cãi lại:

- `duck-caro`: `Controls` từng bị xếp là khối dựng một lần, trong khi code dựng hai lần.
- `duck-flap`: năm overlay của `GameStage` mỗi cái dựng đúng một lần, nên phép thử "số
  lần dựng" một mình xếp chúng vào `mains/` — sai. Chúng là mảnh hiển thị bên trong
  một main, nên chúng thuộc `components/`. Đó là lý do tiêu chí chính phải là vai trò.

### R-04 — `ghosts/`: component `return null` chỉ chạy side-effect

`useEffect` nào không vẽ gì thì ra khỏi component cha thành một ghost mang tên đúng
việc nó làm (`ResumeSavedGame`, `RecordResult`, `PlayMoveSound`).

Ba ràng buộc, cả ba đều sai **âm thầm** nếu vi phạm — mỗi repo áp R-04 phải ghi chúng
vào `invariants.md` của mình:

1. **Khoá đi cùng effect.** `useRef` chống chạy lại phải nằm trong cùng ghost với
   effect nó bảo vệ. Tách ra là mở lại đúng cái lỗi nó sinh ra để chặn.
2. **Thứ tự ghost trong JSX = thứ tự chạy effect.** Effect của con chạy trước effect
   của cha và theo đúng thứ tự con.
3. **Ghost render vô điều kiện.** Gắn sau một `&&` là dựng lại thứ nó sở hữu mỗi lần
   điều kiện đổi.

## 2. File và đặt tên

### R-05 — Một component = một thư mục + một `index.tsx`

Không có `MenuOverlay.tsx` nằm trơ cạnh `index.tsx`. Luôn là `MenuOverlay/index.tsx`.

### R-06 — Thư mục component `PascalCase`; file `.ts` thường `camelCase`

### R-07 — File test nằm cạnh source, tên `<source>.test.ts`

Chuyển file thì chuyển cả test đi kèm, trong cùng một commit.

**Điều kiện chặn:** project **không có test** thì chưa được refactor cấu trúc. Viết
test cho phần sắp động vào trước — refactor không lưới an toàn không phải refactor,
là viết lại.

## 3. Khuôn component

### R-08 — Kiểu export: **mỗi repo giữ kiểu đang có**, không đổi hàng loạt

Workspace này có sẵn hai kiểu, và cả hai đều nhất quán trong repo của mình:

| Kiểu | Repo | |
| --- | --- | --- |
| `export default` + arrow | flap, và các repo dựng từ cùng bản mẫu quapp | quy ước gốc quapp |
| named export + `function` | caro | 143 named / 2 default |

**Không đổi.** Lý do bác việc đổi là như nhau cho cả hai hướng: đổi kiểu export là chạm
mọi file component để được một thứ không người dùng nào thấy, và `git blame` thì mất
dấu. Rule thật ở đây là **nhất quán trong một repo**, không phải nhất quán xuyên repo —
người đọc mở một repo tại một thời điểm, không mở mười.

Đây là chỗ rule đã bị sửa sau lần áp thứ hai: bản đầu ghi "dùng named export", rút từ
caro. Đem sang flap thì chính lý do đó lật ngược lại, nên nó không phải một rule về
named export, mà là một rule về đừng churn.

✅ Nhận `arrow-body-style: ["error", "as-needed"]` — để ESLint ép, không sửa tay.

### R-09 — Props destructure ngay ở signature

### R-10 — ❌ BÁC idiom `{...{ x }}`

Tiết kiệm vài ký tự, đổi lại `grep "moves="` không còn tìm ra chỗ truyền prop.

## 4. Import

### R-11 — Import chia khối, mỗi khối một comment nhãn

Thứ tự phản ánh hướng phụ thuộc, ngoài vào trong:

```tsx
// libs       react, next, lucide-react
// types      import type từ bất kỳ đâu
// game       @/game/**, @/engine/**  <- nghiệp vụ, tầng trong cùng
// hooks      @/hooks/**
// components @/components/**, ./mains/**, ./components/**
// ghosts     ./ghosts/**
// others     @/lib/**, hằng số cục bộ
```

Quy ước **thủ công** — không script nào ép được, nên nó sẽ trôi trước mọi rule khác.
Khi thấy trôi thì thay bằng `eslint-plugin-import` + `import/order`.

### R-12 — `import type` cho mọi import chỉ dùng ở vị trí type

Ép bằng `@typescript-eslint/consistent-type-imports`, không bằng mắt người.

### R-13 — Alias `@/` cho import xuyên tầng; đường dẫn tương đối cho trong view

## 5. Type

### R-14 — ❌ BÁC `src/types/`

Type thuộc về module sinh ra nó (`game/core/types.ts` nằm cạnh `board.ts`). Kéo lên
thư mục riêng là cắt nó khỏi module, và làm luật chặn kiến trúc mất ý nghĩa.

Rule này đúng cho workspace này vì mọi project ở đây **có nghiệp vụ**. Nó KHÔNG đúng
cho một web chỉ hiển thị JSON từ CMS — đó là lý do quapp có `src/types/`.

### R-15 — ❌ BÁC tiền tố `I` / `T`

TypeScript không phân biệt nơi dùng, nên tiền tố không mang thêm thông tin.

### R-16 — Props viết INLINE trong signature

Không tách `type XProps` riêng, kể cả khi dài. Test cần kiểu thì lấy từ chính
component: `Parameters<typeof X>[0]`.

### R-17 — Hằng số cục bộ viết HOA, để đầu file

Không dùng `enum` (sinh object lúc chạy, không tree-shake được). Chuỗi UI đi qua
`lib/strings.ts` hoặc `i18n/`.

## 6. Hook

### R-18 — Barrel `hooks/index.ts`

`export * from` từng file, không re-export default. Chỉ gom hook mà `views/` gọi tới —
hàm thuần dùng riêng cho một hook thì không đưa vào, đó là chi tiết nội bộ.

⚠️ Barrel mở một lỗ hổng cho luật chặn kiến trúc: nếu ESLint cấm `@/hooks/*` thì
`@/hooks` (không có dấu gạch) **lọt**. Thêm cả dạng bare vào `no-restricted-imports`.

### R-19 — Hook custom bọc mọi truy cập hạ tầng

Component không gọi thẳng `localStorage`, `AudioContext`, `fetch`, `Worker`.

### R-20 — ❌ BÁC đổi cấu hình Prettier

Mỗi repo giữ cấu hình của nó. Đổi = format lại toàn bộ `src/`, `git blame` mất dấu,
đổi lại không được gì.

## 7. Cấu hình

### R-21 — Luật ESLint bổ sung

```jsonc
"arrow-body-style": ["error", "as-needed"],
"object-shorthand": "warn",
"react/jsx-fragments": ["warn", "syntax"],
"@typescript-eslint/array-type": ["warn", { "default": "array" }],
"@typescript-eslint/consistent-type-imports": [
  "error", { "prefer": "type-imports", "fixStyle": "separate-type-imports" }
]
```

Cần `@typescript-eslint/eslint-plugin` + `parser` là **devDependency tường minh**, và
`"parser"` + `"plugins"` khai trong config — `next/core-web-vitals` một mình KHÔNG
đăng ký plugin, lint sẽ báo "Definition for rule was not found".

KHÔNG hạ `react-hooks/exhaustive-deps` xuống `warn`. Chỗ nào cố ý lệch thì
`eslint-disable-next-line` kèm một câu giải thích.

### R-22 — `.githooks/pre-commit` lint file staged

Mọi repo trong workspace đã dùng `.githooks/` cho `commit-msg`. Thêm `pre-commit` vào
cùng thư mục đó.

**Một repo chỉ được có MỘT cơ chế hook.** Husky ghi đè `core.hooksPath`, và
`.githooks/commit-msg` dựa vào đúng biến đó — hai cái cùng lúc thì commit-lint **im
lặng ngừng chạy**, không báo gì cả.

Đây không phải rủi ro lý thuyết: `duck-flap` có cả `.husky/` lẫn `.githooks/`, và
`git config core.hooksPath` trả về `.husky/_` — tức `commit-msg` ở đó đã chết từ lúc
husky được cài. Kiểm repo của bạn bằng đúng lệnh đó.

Cách chữa đi theo cơ chế repo **đang thật sự dùng**:

- Repo chỉ có `.githooks/` → thêm `.githooks/pre-commit`. Không cài husky.
- Repo đã có husky → để husky giữ `core.hooksPath`, và thêm `.husky/commit-msg` gọi
  `.githooks/commit-lint.sh`. Gỡ husky ra chỉ để theo rule là churn.

Hook chỉ **báo**, không `--fix`: hook sửa file đang staged sẽ commit một nội dung khác
với nội dung người viết vừa đọc lại.

---

## 8. Trạng thái theo project

Mỗi ô: ✅ đã áp · ⏳ đang làm · ⬜ chưa · ➖ không áp dụng.

| Project | Stack | R-03 view | R-04 ghosts | R-05 | R-11 | R-12/21 | R-18 | R-22 | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| caro | Next | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ADR-0023 · bất biến 13 |
| flap | Next | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | husky giữ hooksPath `.githooks/commit-msg` đã chết → chữa bằng `.husky/commit-msg` |
| mines | Next | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 3 ghost; `<header>` inline tách thành `mains/Header` |
| push | Next | ✅ | ➖ | ✅ | ✅ | ✅ | ✅ | ✅ | R-04 ➖ có lý do: 3 effect đều sinh state để render (ADR-0007) |
| drift | Next | ✅ | ✅ | ✅ | ✅ | ✅ | ➖ | ✅ | R-18 ➖: chỉ có 1 hook. Tách `ui.tsx` → 6 thư mục; tách file test 381 dòng → 8 file |
| solitaire | Next | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | `GameBoard` 562 dòng → `views/Home` + 3 ghost; `matchMedia` → `useReducedMotion` (R-19) |
| match | Next | ✅ | ➖ | ✅ | ✅ | ✅ | ✅ | ✅ | R-04 ➖ có lý do (ADR-0011); 2 màn hình ra khỏi `src/app/` |
| stack | Vite | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | `ui/` → `views/`; `PlayScreen` 452 · **0 e2e** |
| stomp | Vite | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | `game/scenes/`; **0 e2e** |
| defense | Vite | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | `ui/screens/`; **0 unit test** — R-07 chặn, phải viết test trước |
| runner | Vite | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ | `ui/`; **0 unit test, 0 e2e** — R-07 chặn |

**Thứ tự làm** đi theo rủi ro tăng dần: flap → mines → push → drift → solitaire →
match → stack → stomp → defense → runner. Hai project cuối phải qua R-07 trước.
