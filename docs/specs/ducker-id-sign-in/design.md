# Thiết kế — Đăng nhập Ducker ID (duck-match)

Phần riêng của repo này. Hành vi, chữ và biến môi trường dùng chung nằm ở
`web-game/docs/superpowers/specs/2026-10-04-ducker-id-sign-in-design.md`; quyết định ở
ADR-0012. FR-23 · US-05.

## Chỗ đặt và hình dạng

- Khe: `src/views/Map/components/ProductHeader`, bên phải. Component
  `src/components/AccountButton`, trả `null` khi tính năng tắt (header không đổi).
- Claymorphism theo `docs/design-system/match-3/MASTER.md`, token qua Tailwind:
  nút `bg-surface-raised` + `shadow-clay` + `rounded-clay` (20), cao ≥ 44px; avatar nền
  `accent-pink` (màu tương tác/focus; amber chỉ dành cho sao và CTA) chữ `surface-base`
  (đo 5,3:1); popover `bg-surface-card` bo 20. Viền focus là outline 3px hồng toàn cục.
  Giảm chuyển động đã được `globals.css` lo (media query và `[data-reduced-motion]`).
- Icon là SVG inline, không dùng emoji.
- Chữ (vi) trong `src/i18n/vi.ts`, từ ngữ khoá ở `glossary.md`.

## Hành vi menu

`role="menu"` / `menuitem`; ↑ ↓ vòng tròn, Home/End, Esc đóng và trả focus về nút, Tab hoặc
focus ra ngoài thật sự (`relatedTarget` khác null và nằm ngoài) đóng mà không giành lại
focus, bấm ra ngoài đóng. Sau "Đăng xuất" focus sang nút "Đăng nhập" cùng chỗ.
Không có email thì không vẽ dòng email; không có tên thì email là dòng chính.

## Callback

`redirect_uri` = gốc app (`/` ở local, `/web-game-duck-match/` ở Pages). Chỉ bản đồ có nút
nên `returnTo` thường là `/`; mã nguồn vẫn khôi phục đúng đường dẫn + query lúc bấm. Next
router có thể ghi lại URL lúc hydrate (còn `?code`), nên `settleCallbackUrl` chạy ở effect
đầu tiên để trả URL sạch về.

## Tệp

`src/auth/{types,duckerConfig,pkce,duckerAuth,duckerRequests,duckerSession}.ts` (+test),
`src/lib/initials.ts`, `src/hooks/{useDuckerAuth,useAccountMenu}.ts`,
`src/components/AccountButton`, `e2e/ducker-id-sign-in.spec.ts` (export riêng
`out-auth/`, cổng 4174), `e2e/ducker-id-flag-off.spec.ts`, `scripts/build-e2e-auth.mjs`.

## Ngoại lệ NFR

`sessionStorage` key `ducker.pkce` only, deleted on return; network only to the configured Ducker ID issuer, only after the player clicks "Đăng nhập"; nothing at all when the flag is off. Áp cho NFR-REL-01, NFR-DATA-04 (xem nfr.md).
