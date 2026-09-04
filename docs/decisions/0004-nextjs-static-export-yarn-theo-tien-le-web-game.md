# ADR-0004 · Next.js static export + Yarn classic, theo tiền lệ thư mục `web-game/`

> **Ngày:** 2026-09-04
> **Trạng thái:** accepted
> **Liên quan:** NFR-PERF-07 · NFR-SEC-05 · overview.md §5 (trần chi phí 0 đồng)

## 1. Bối cảnh

Trần chi phí hạ tầng là **0 đồng**, nên đích phát hành phải là file tĩnh. Ba game
đã làm cùng thư mục `web-game/` — minesweeper, gomoku, flappy-bird — đều dùng
Next.js + React + TypeScript + Tailwind, Vitest cho unit test, Playwright cho luồng,
và cả ba đều có `yarn.lock`. Chọn khác đi thì mỗi dự án trong thư mục lại là một
toolchain riêng.

## 2. Quyết định

Next.js 15 App Router với `output: 'export'`, React 19, TypeScript ở chế độ `strict`,
Tailwind CSS, Vitest + happy-dom + Testing Library, Playwright cho luồng, và **Yarn
classic** làm package manager. Không dùng thư viện game, không dùng state manager
ngoài (`useState`/`useReducer` là đủ cho hai màn hình). Sản phẩm build là `out/`,
phục vụ được bởi bất kỳ host tĩnh nào; GitHub Pages là đích dự kiến.

## 3. Phương án đã loại

| Phương án | Vì sao loại |
| --- | --- |
| Vite + React (như `web-app-calculate-badminton`) | Nhẹ hơn và thật ra đủ dùng cho hai route. Loại vì ba game cùng thư mục đều Next.js — giữ một toolchain cho cả thư mục đáng giá hơn vài trăm KB `node_modules` |
| npm | Workspace `web-app-*` dùng npm, nhưng cả ba game trong `web-game/` đều có `yarn.lock`. Đi theo thư mục gần nhất, không theo workspace |
| Next.js có server (SSR/route handler) | Không có gì cần server. Bật SSR là tự nguyện nhận một hoá đơn hàng tháng, trái Non-Goal |
| HTML + TS thuần, không framework | Rẻ nhất khi chạy, nhưng phải tự làm router, build, và tách component — và mất toàn bộ tiền lệ của ba dự án cạnh bên |

## 4. Hệ quả

**Được:**
- Lệnh giống ba game còn lại: `yarn dev` · `yarn test` · `yarn build` · `yarn lint` ·
  `yarn typecheck`. Không phải học lại gì khi nhảy giữa các dự án trong `web-game/`.
- `next build` với `output: 'export'` cho ra `out/` deploy được lên GitHub Pages, chi
  phí 0 đồng như `overview.md` §5 yêu cầu.
- `yarn audit` là ngưỡng NFR-SEC-05 có sẵn công cụ.

**Mất / phải chấp nhận:**
- Next.js là công cụ lớn hơn nhu cầu của hai route tĩnh; NFR-PERF-07 (bundle < 200KB
  gzip) tồn tại chính để canh cái giá đó.
- App Router mặc định là Server Component, mà toàn bộ game là client — mọi file UI
  phải có `'use client'`, và quên nó là một lỗi build khó đọc với người mới.
- Yarn classic đã ngừng phát triển. Chấp nhận vì nó chỉ là trình cài đặt, và đổi sang
  npm/pnpm về sau là việc một buổi.

**Điều kiện xem lại quyết định này:** nếu NFR-PERF-07 hỏng vì chính runtime của
Next.js, thì Vite là đường thoát và việc chuyển là khả thi — `engine/` không biết gì
về framework nên không phải sửa.
