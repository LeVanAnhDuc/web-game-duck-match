# ADR-0013 · Chấp nhận advisory high không có bản vá, chỉ nằm trong dev tooling

> **Trạng thái:** accepted
> **Ngày:** 2026-10-18
> **Liên quan:** NFR-SEC-05 · `scripts/check-audit.mjs`

## Bối cảnh

`braces <=3.0.3` (GHSA-vfj7-8cjw-p6xm, high) không có bản phát hành nào được vá
(`patched_versions: <0.0.0`). Nó vào cây phụ thuộc chỉ qua dev tooling:
tailwindcss 3 → chokidar/micromatch và eslint-config-next → fast-glob → micromatch.
Không phần nào của nó nằm trong bản static export. `pnpm update` / `pnpm.overrides`
không gỡ được, nên NFR-SEC-05 đỏ vĩnh viễn và chặn mọi PR.

## Quyết định

`check-audit.mjs` có danh sách `ACCEPTED` theo mã GHSA, mỗi mục kèm lý do. Một mục chỉ
có hiệu lực khi advisory **vẫn chưa có bản vá**; khi có bản vá, mục đó tự hết khớp và
gate đỏ trở lại để buộc nâng cấp. Gate vẫn fail-closed như cũ: advisory đã chấp nhận
vẫn được đếm trong kiểm tra "metadata khớp danh sách advisory".

Chủ project duyệt ngoại lệ này ngày 2026-10-18.

## Hệ quả

- CI xanh trở lại mà không nới ngưỡng high/critical cho các advisory khác.
- Gỡ hẳn cần lên Tailwind v4 và thay chuỗi eslint-config-next — nợ kỹ thuật, làm riêng.
