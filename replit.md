# ITT G.Fauser — Piattaforma Scolastica Digitale

Ecosistema scolastico digitale completo per studenti e docenti dell'ITT G.Fauser di Novara (indirizzi: Informatica, Logistica, Aeronautica).

## Run & Operate

- `pnpm dev` — **one-command local stack**: embedded Postgres + API + web. With
  no Clerk keys it runs as a mock user (dev only). See `README.md` for details.
- `pnpm db:start && pnpm --filter @workspace/api-server run dev` — run only the API server (after starting embedded DB; uses PORT=8080 / DATABASE_URL defaults or your env)
- `pnpm run lint` / `pnpm run format:check` — ESLint + Prettier gates
- `pnpm test` — Vitest unit/integration tests
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env (production): `DATABASE_URL` — Postgres connection string,
  `SESSION_SECRET` — for email password encryption, and Clerk keys
  (`CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `VITE_CLERK_PUBLISHABLE_KEY`).
- CI (`.github/workflows/ci.yml`) enforces lint + format + typecheck + test +
  build, and guards against committing build artifacts (`scripts/check-no-dist.mjs`).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 + Clerk auth middleware
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec at `lib/api-spec/openapi.yaml`)
- Frontend: React + Vite + Tailwind + shadcn/ui + Framer Motion + wouter
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/index.ts` (re-exports all tables)
- API contract: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- Generated Zod schemas: `lib/api-zod/src/generated/`
- API routes: `artifacts/api-server/src/routes/index.ts`
- Frontend pages: `artifacts/fauser-platform/src/pages/`
- Navigation: `artifacts/fauser-platform/src/components/layout/AppLayout.tsx`
- Theme: `artifacts/fauser-platform/src/index.css` (navy + gold)

## Product — Feature Matrix

| Feature                                | Frontend Route         | Backend Routes                       |
| -------------------------------------- | ---------------------- | ------------------------------------ |
| Registro elettronico (voti + presenze) | `/registro`            | `/api/grades`, `/api/attendance`     |
| Classroom (compiti + materiali)        | `/classroom`           | `/api/assignments`, `/api/materials` |
| Calendario eventi                      | `/calendario`          | `/api/events`                        |
| Comunicazioni/Annunci                  | `/comunicazioni`       | `/api/announcements`                 |
| Email client (IMAP/SMTP)               | `/messaggi`            | `/api/email`                         |
| Chat di classe                         | `/messaggi`            | `/api/groups`                        |
| **Orario settimanale**                 | `/orario`              | `/api/schedule`                      |
| **Giustificazioni assenze**            | `/giustificazioni`     | `/api/justifications`                |
| **Prenotazione colloqui**              | `/colloqui`            | `/api/appointments`                  |
| **Notifiche con badge**                | (sidebar bell)         | `/api/notifications`                 |
| **Profilo + QR tessera**               | `/profilo`             | `/api/users/me`                      |
| **Note disciplinari**                  | `/registro` (tab Note) | `/api/behavior-notes`                |
| **Libreria risorse condivise**         | `/libreria`            | `/api/materials`                     |
| **Bacheca tutoraggio**                 | `/tutoraggio`          | `/api/tutoring`                      |
| **Panel admin segreteria**             | `/admin`               | existing endpoints                   |

## Architecture decisions

- Contract-first API: OpenAPI spec drives Orval codegen → typed hooks + Zod validators; always edit the spec before writing routes.
- Orval naming pitfall: component schema names in the spec must NOT match auto-generated `{OperationId}Body` names. For PATCH endpoints with inline bodies, use named `$ref` schemas (e.g. `JustificationReviewInput`, not an inline body).
- Clerk auth: `requireAuth` middleware + `getOrCreateUser` helper in `routes/auth.ts` sync Clerk users to the local DB users table.
- Grade values stored as `numeric` in DB — always serialize with `parseFloat(String(g.value))`.
- Email passwords encrypted with AES-256-GCM, key derived from `SESSION_SECRET`.
- New API endpoints that don't have generated hooks yet: use `useQuery` + `useMutation` from @tanstack/react-query with manual fetch + `getToken()` from `useAuth()`.
- DB class table uses `anno` (integer) and `sezione` (text), not `year`/`section`.

## Gotchas

- After any change to `lib/db/schema/`: run `pnpm --filter @workspace/db run push` then `pnpm --filter @workspace/api-spec run codegen`.
- After adding new OpenAPI paths: run codegen before touching the frontend.
- `wouter` Link renders its own `<a>` — never nest `<a>` inside `<Link>`.
- React Query v5 `UseQueryOptions` has `queryKey` as required — Orval-generated hook second arg `{ query: { enabled } }` pattern will complain. Just omit the options arg or use the hook without enabled constraint.
- `useCreateClass()` (and all Orval mutation hooks) return a `UseMutationResult` — call them directly as a hook, not inside `useMutation({ mutationFn: useCreateClass() })`.

## User preferences

- Italian UI, English code
- Navy + gold theme
- Dense, information-rich layouts
