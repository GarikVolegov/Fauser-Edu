# Fauser-Edu-Hub

Digital school platform for **ITT G. Fauser di Novara** — electronic register,
classroom, calendar, messaging, and more. React + Vite frontend, Express 5 API,
PostgreSQL + Drizzle, Clerk auth.

Repository for https://replit.com/@volegovgarik18/Fauser-Edu-Hub

---

## Stack

- **Monorepo:** pnpm workspaces (`artifacts/*`, `lib/*`, `scripts`)
- **Frontend:** React 19 + Vite 7 + Tailwind + shadcn/ui + Framer Motion + wouter (`artifacts/fauser-platform`)
- **Backend:** Express 5 + Clerk auth (`artifacts/api-server`)
- **DB:** PostgreSQL + Drizzle ORM (`lib/db`)
- **API contract:** OpenAPI → Orval codegen (`lib/api-spec` → `lib/api-zod`, `lib/api-client-react`)
- **Tooling:** TypeScript 5.9, Vitest, ESLint (flat) + Prettier, GitHub Actions CI

## Prerequisites

- **Node.js 22+**
- **pnpm 9** (`corepack enable` or `npm i -g pnpm`)
- No system Postgres needed for local dev — it runs an embedded instance.

## Quickstart

```bash
pnpm install
pnpm dev
```

`pnpm dev` brings up the whole stack with one command:

1. starts a local Postgres (embedded, on `:5433`),
2. builds + runs the API (`:8080`),
3. runs the Vite dev server (`:3100`).

Then open **http://localhost:3100**.

> **No Clerk keys?** No problem. In development without Clerk keys, both tiers
> fall back to a **mock signed-in user** (`dev_user_local`), so you can run and
> explore the app with zero secrets. Production always uses real Clerk.

### Running with real auth / your own DB

Copy the env template and fill in what you need:

```bash
cp .env.example .env.local   # .env.local is git-ignored
```

| Variable                     | Purpose                                            |
| ---------------------------- | -------------------------------------------------- |
| `DATABASE_URL`               | Postgres connection (defaults to the embedded one) |
| `CLERK_PUBLISHABLE_KEY`      | Backend Clerk key                                  |
| `CLERK_SECRET_KEY`           | Backend Clerk key (enables real auth)              |
| `VITE_CLERK_PUBLISHABLE_KEY` | Frontend Clerk key                                 |
| `SESSION_SECRET`             | AES key for stored email passwords                 |
| `API_PORT` / `WEB_PORT`      | Dev ports (default 8080 / 3100)                    |

Set the Clerk keys → the mock fallback turns off and real Clerk is used.

## Scripts

| Command                                | What it does                              |
| -------------------------------------- | ----------------------------------------- |
| `pnpm dev`                             | Full local stack (DB + API + web)         |
| `pnpm db:start/stop`                   | Just the embedded dev Postgres            |
| `pnpm run lint`                        | ESLint over the workspace                 |
| `pnpm run format`                      | Prettier write (`format:check` to verify) |
| `pnpm run typecheck`                   | `tsc` across all packages                 |
| `pnpm test`                            | Vitest unit/integration tests             |
| `pnpm run build`                       | Typecheck + build every package           |
| `pnpm --filter @workspace/db run push` | Apply Drizzle schema to `DATABASE_URL`    |

## Local database

`pnpm dev` (or `pnpm db:start`) launches a real Postgres via
[`embedded-postgres`](https://www.npmjs.com/package/embedded-postgres) — no
sudo, no Docker, no system install. Data lives in `.dev/pgdata` (git-ignored).
On first start it creates the `fauser` database and applies the schema.

## How dev auth works

- **Backend** (`artifacts/api-server/src/middlewares/devAuthMiddleware.ts`):
  when `NODE_ENV=development` and `CLERK_SECRET_KEY` is unset, a middleware makes
  `getAuth(req)` return a fixed mock user. Otherwise the real Clerk middleware runs.
- **Frontend** (`artifacts/fauser-platform/src/dev/clerk-mock.tsx`): when serving
  with no `VITE_CLERK_PUBLISHABLE_KEY`, Vite aliases `@clerk/react` to a mock
  provider. Production builds always use the real Clerk SDK.

## Deployment

Deploys on **Replit autoscale** (`.replit`, `deploymentTarget = "autoscale"`,
linux-x64). The production build runs with real `DATABASE_URL` + Clerk keys set
as Replit secrets. `/api/healthz` is a public health endpoint for probes.

The workspace keeps `darwin-arm64` native binaries so it also installs and runs
on Apple Silicon Macs; those optional deps are platform-gated and ignored on the
linux-x64 deploy.

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push/PR:
`install --frozen-lockfile` → `lint` → `format:check` → `typecheck` → `test` →
`build` → build-artifact guard (`scripts/check-no-dist.mjs`, which fails if any
compiled `dist`/`.vite`/`.tsbuildinfo` file is ever committed).
