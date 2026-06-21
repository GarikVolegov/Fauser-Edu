---
name: Fauser Platform Stack
description: Key conventions, gotchas, and decisions for the ITT G.Fauser school platform
---

## Project

ITT G.Fauser di Novara — full-stack school platform. React+Vite frontend, Express 5 backend, PostgreSQL+Drizzle ORM, Clerk auth, Orval codegen from OpenAPI spec.

## Codegen workflow

- After editing `lib/api-spec/openapi.yaml`, run `pnpm --filter @workspace/api-spec run codegen` (also runs `typecheck:libs`).
- After adding new DB schema files, run `pnpm run typecheck:libs` so api-server can see the new exports.
- Orval auto-generates `{OperationId}Body` names for request bodies. If a component schema has the same name it causes a duplicate-export TS error. Use different names for components (e.g. `EmailAccountCredentials` not `SaveEmailAccountBody`).

## Email (IMAP/SMTP)

- Uses `imapflow` for IMAP reading, `nodemailer` for SMTP sending, `mailparser` for parsing.
- Passwords stored AES-256-CBC encrypted in `email_accounts` table. Key derived from `SESSION_SECRET` via `lib/crypto.ts`.
- `simpleParser` from mailparser needs `as any` cast due to void & Promise type quirk.
- imapflow fetch: use sequence string `"${from}:${total}"` not `{ last: n }` for last-N messages.
- IMAP/SMTP route: `artifacts/api-server/src/routes/email.ts`

## DB schema

- All tables in `lib/db/src/schema/*.ts`, exported from `schema/index.ts`.
- Numeric grades stored as `numeric` string in DB; always `parseFloat(String(g.value))` when serializing.
- `date` type (not timestamp) for date-only fields.
- Run `pnpm --filter @workspace/db run push` to apply schema changes.

## Frontend routing

- wouter for routing. `Link` from wouter renders `<a>` itself — do NOT wrap in `<a>` (causes nested `<a>` error).
- All protected routes use `ProtectedRoute` wrapper in App.tsx → redirects to `/` if not signed in.
- Navigation items in `AppLayout.tsx` navItems array.

**Why:** Nested `<a>` tags cause React hydration errors and browser warnings. wouter's Link already renders an `<a>`.
