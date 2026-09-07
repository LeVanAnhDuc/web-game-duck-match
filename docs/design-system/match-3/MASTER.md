# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** Match 3
**Generated:** 2026-09-07 15:57:49
**Category:** Casual Puzzle Game

---

## Global Rules

### Color Palette

> **Bước 2 đã quyết lại.** Bảng dưới là palette CUỐI CÙNG, không phải đề xuất của
> bước 1. Lý do từng chỗ override nằm ở ADR-0008; số đo nằm ở
> `docs/specs/tactile-board/design.md` §A.

**Bề mặt — tối ấm ngả plum**

| Role | Hex | Token |
|------|-----|-------|
| Page | `#17111F` | `surface.base` |
| Board slab | `#241B31` | `surface.board` |
| Cell well | `#1C1526` | `surface.well` |
| Card | `#31253F` | `surface.card` |
| Raised / button | `#423356` | `surface.raised` |
| Text strong | `#F7F3FF` | `ink.strong` — 15,06:1 trên board |
| Text muted | `#C9BBDB` | `ink.muted` — 9,10:1 trên board |

`board` vs `well` = **1,08:1**, CÓ CHỦ ĐÍCH. Cái hố được định nghĩa bằng inset
shadow, không bằng màu. Đừng "sửa" con số này.

**Sáu màu viên — palette chịu lực của sản phẩm**

| Piece | Hex | Hình khối |
|-------|-----|-----------|
| red | `#FF5470` | circle |
| blue | `#3B9EFF` | square |
| green | `#3DD68C` | triangle |
| yellow | `#FFD24A` | diamond |
| purple | `#A855F7` | star |
| orange | `#F97316` | hexagon |

Tương phản viên/nền thấp nhất **4,16:1**; cặp màu gần nhau nhất **ΔE 50**. Bộ cũ là
2,57:1 và ΔE 23 — tức đang vi phạm ngưỡng 3:1. Màu **không bao giờ** là tín hiệu duy
nhất: mỗi màu có một hình khối riêng (NFR-A11Y-06).

**Màu nhấn**

| Role | Hex | Dùng ở |
|------|-----|--------|
| Primary / ring | `#EC4899` | focus ring, nút chính |
| Accent / CTA | `#F59E0B` | sao, nút hành động |
| Destructive | `#DC2626` | (chưa dùng) |

Violet `#8B5CF6` mà bước 1 đề xuất làm secondary bị **bỏ**: nó cạnh viên tím
`#A855F7`, và một màu nhấn UI không được lẫn với một màu viên.

### Typography

> **Bước 2 đã quyết lại.** Bước 1 đề xuất `Fredoka` + `Nunito`.

- **Heading:** `Baloo 2` — 600 / 700
- **Body:** `Nunito` — 400 / 600
- **Nạp bằng:** `next/font/google`, subset `['latin', 'vietnamese']`

`Fredoka` **không dùng được**: Google chỉ phục vụ `latin`, `latin-ext`, `hebrew` cho
font đó — không có `vietnamese`. Khối U+1EA0–1EF9 sẽ rơi glyph sang font fallback và
"Lượt", "Điểm", "Mục tiêu" hiện lệch nét ngay trên HUD. `Baloo 2` cùng tinh thần
chunky/tròn/toy-like và **có** `vietnamese`. Xem ADR-0008.

Không dùng thẻ `@import` hay `<link>` tới fonts.googleapis.com: `next/font` self-host
lúc build, nên bản deploy trên GitHub Pages không gọi ra ngoài và không có CLS.

### Spacing Variables

| Token | Value | Usage |
|-------|-------|-------|
| `--space-xs` | `4px` / `0.25rem` | Tight gaps |
| `--space-sm` | `8px` / `0.5rem` | Icon gaps, inline spacing |
| `--space-md` | `16px` / `1rem` | Standard padding |
| `--space-lg` | `24px` / `1.5rem` | Section padding |
| `--space-xl` | `32px` / `2rem` | Large gaps |
| `--space-2xl` | `48px` / `3rem` | Section margins |
| `--space-3xl` | `64px` / `4rem` | Hero padding |

### Shadow Depths

| Level | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle lift |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.1)` | Cards, buttons |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Modals, dropdowns |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Hero images, featured cards |

---

## Component Specs

### Buttons

```css
/* Primary Button */
.btn-primary {
  background: #F59E0B;
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}

.btn-primary:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* Secondary Button */
.btn-secondary {
  background: transparent;
  color: #EC4899;
  border: 2px solid #EC4899;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 200ms ease;
  cursor: pointer;
}
```

### Cards

```css
.card {
  background: #FDF2F8;
  border-radius: 12px;
  padding: 24px;
  box-shadow: var(--shadow-md);
  transition: all 200ms ease;
  cursor: pointer;
}

.card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

### Inputs

```css
.input {
  padding: 12px 16px;
  border: 1px solid #E2E8F0;
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 200ms ease;
}

.input:focus {
  border-color: #EC4899;
  outline: none;
  box-shadow: 0 0 0 3px #EC489920;
}
```

### Modals

```css
.modal-overlay {
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.modal {
  background: white;
  border-radius: 16px;
  padding: 32px;
  box-shadow: var(--shadow-xl);
  max-width: 500px;
  width: 90%;
}
```

---

## Style Guidelines

**Style:** Claymorphism

**Keywords:** Soft 3D, chunky, playful, toy-like, bubbly, thick borders (3-4px), double shadows, rounded (16-24px)

**Best For:** Educational apps, children's apps, SaaS platforms, creative tools, fun-focused, onboarding, casual games

**Key Effects:** Inner+outer shadows (subtle, no hard lines), soft press (200ms ease-out), fluffy elements, smooth transitions

### Page Pattern — **BỎ TOÀN BỘ**

Bước 1 trả về *"Hero > Problem statement > Solution overview > Testimonials carousel
> CTA"* với chiến lược "social proof trước CTA, testimonial có ảnh và chức danh".

Đó là khuôn landing page bán SaaS. Sản phẩm này là một game có **hai màn hình** (bản
đồ màn và bàn chơi) và không bán gì. Không có hero, không có testimonial, không có
CTA. Mục này không áp dụng và không được dùng làm căn cứ cho bất kỳ màn hình nào.

### Signature element — cái giếng

Bàn không phải 49 ô rời mà **một phiến đất sét liền có 49 lỗ ấn xuống**; viên là khối
dày nằm trong lỗ. Ô rỗng = inset shadow trên+trái. Viên = outer shadow dưới+phải +
viền sáng 3px ở cạnh trên. Viên được chọn thì **nhấc lên** (`translateY(-3px)` +
shadow lớn hơn) — nghịch đảo của "soft press". Ring hồng vẫn giữ, vì a11y cần một
tín hiệu không phụ thuộc chiều sâu.

## Anti-Patterns (Do NOT Use)

- ❌ Muted colors
- ❌ Low energy

### Additional Forbidden Patterns

- ❌ **Emojis as icons** — Use SVG icons (Heroicons, Lucide, Simple Icons)
- ❌ **Missing cursor:pointer** — All clickable elements must have cursor:pointer
- ❌ **Layout-shifting hovers** — Avoid scale transforms that shift layout
- ❌ **Low contrast text** — Maintain 4.5:1 minimum contrast ratio
- ❌ **Instant state changes** — Always use transitions (150-300ms)
- ❌ **Invisible focus states** — Focus states must be visible for a11y

---

## Pre-Delivery Checklist

Before delivering any UI code, verify:

- [ ] No emojis used as icons (use SVG instead)
- [ ] All icons from consistent icon set (Heroicons/Lucide)
- [ ] `cursor-pointer` on all clickable elements
- [ ] Hover states with smooth transitions (150-300ms)
- [ ] Light mode: text contrast 4.5:1 minimum
- [ ] Focus states visible for keyboard navigation
- [ ] `prefers-reduced-motion` respected
- [ ] Responsive: 375px, 768px, 1024px, 1440px
- [ ] No content hidden behind fixed navbars
- [ ] No horizontal scroll on mobile
