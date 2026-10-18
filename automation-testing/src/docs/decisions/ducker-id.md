# DUCKERID — Quyết định

Đi cặp với `docs/requirements/ducker-id.md`.

## Nguồn

Đọc ngày 2026-10-18 (đường dẫn tính từ gốc repo app).

- **Tài liệu:** `docs/02-requirements/scope.md` (FR-23), `docs/01-product/journeys.md` (US-05),
  `docs/decisions/0012-ducker-id-sign-in-sau-co-tinh-nang.md`, `docs/specs/ducker-id-sign-in/design.md`,
  `docs/02-requirements/nfr.md` (NFR-REL-01 ngoại lệ có giới hạn, NFR-DATA-04 khoá `ducker.pkce`), `README.md` §Features,
  `client/.env.example`.
- **Code:** `client/src/auth/` (`duckerAuth.ts`, `duckerSession.ts`, `duckerRequests.ts` — `REQUEST_TIMEOUT_MS = 15000`,
  `duckerConfig.ts`), `client/src/hooks/useDuckerAuth.ts`, `client/src/hooks/useAccountMenu.ts`,
  `client/src/components/AccountButton/index.tsx`, `client/src/views/Map/components/ProductHeader/index.tsx`,
  `client/scripts/build-e2e-auth.mjs`.
- **Test đã gom (gợi ý):** `client/e2e/ducker-id-flag-off.spec.ts`, `client/e2e/ducker-id-sign-in.spec.ts` (issuer giả).

## Quyết định chốt (Chốt bởi agent — user uỷ quyền)

- **Q1** Ducker ID thật không có trong CI → bản build bật cờ (`build:e2e-auth`, issuer `http://ducker.test`) chạy ở project
  `app-auth`, mọi request tới issuer do fixture `fakeIssuer` trả lời (ok / deny / tamper / hang). Chỉ có trên dev: bản
  trên Pages tắt cờ.
- **Q2** Hết 15 giây đo bằng thời gian thật: `AbortSignal.timeout` là timer gốc, `page.clock` không tua được.
- **Q3** `sessionStorage` bị chặn giả lập bằng init script ném `SecurityError` khi đọc `window.sessionStorage`.
- **Q4** Case cũ "keeps the game URL params across the round trip" (`?keep=1`) giữ nguyên ý trong TC-DUCKERID-003.

## Tài khoản test

Không có tài khoản thật: issuer giả trả hồ sơ `{ name: "Lê Văn Anh Đức", email: "duc@ducker.id" }` (`DUCKER` trong
`src/data/test-data.ts`).

## Ngoài phạm vi

- Ducker ID thật (đăng ký client, CORS): kiểm tay theo `client/.env.example`.
