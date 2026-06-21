# Fauser-Edu — Solid base + perfect deploy (10/10)

Date: 2026-06-21
Status: Approved scope (A+B+C+D), pending spec review

## 1. Context

`Fauser-Edu` is a pnpm-workspace school platform (React+Vite frontend, Express 5
backend, Postgres+Drizzle, Clerk auth, Orval codegen).

**Incident already recovered (this session):** commit `2983541` ("app") had deleted
the entire source tree and committed only compiled `dist` artifacts. It was reverted
in `23dc96b` ("Revert app"), restoring all 405 source files. No force-push was used.

**Measured baseline after recovery (local macOS arm64):**

| Check                                      | State                                                             |
| ------------------------------------------ | ----------------------------------------------------------------- |
| Typecheck (all packages)                   | ✅ clean                                                          |
| Build (api-server esbuild + frontend Vite) | ✅ ok                                                             |
| Local install on Apple Silicon             | ✅ (workspace overrides adjusted to keep `darwin-arm64` binaries) |
| Local Postgres                             | ✅ via `embedded-postgres` (`scripts/dev-db.mjs`), schema pushed  |
| Tests                                      | ❌ none (no runner)                                               |
| Lint                                       | ❌ none (no ESLint)                                               |
| CI                                         | ❌ none                                                           |
| `/api/healthz`                             | ❌ returns 500 — gated by global Clerk middleware                 |
| Local run without Clerk keys               | ❌ frontend throws, backend 500s every request                    |
| Frontend bundle                            | ⚠️ 1.38 MB single chunk (no code-splitting)                       |
| Vite build                                 | ⚠️ hard-requires `PORT` + `BASE_PATH` even at build time          |

## 2. Goals / Non-goals

**Goals**

- The app runs end-to-end locally with one command, **without external secrets**.
- Quality gates exist and pass: lint, typecheck, tests, build.
- CI enforces those gates on every push; deploy config is correct and documented.
- Guard against a repeat of the dist-overwrite incident.

**Non-goals**

- No new product features. No redesign of existing pages.
- No change to production auth behavior (Clerk stays the real auth in prod).
- No broad refactor beyond what these goals require.

## 3. Workstreams

### A. Local dev runnable end-to-end

**A1 — Public health check.** Mount the health route (`/api/healthz`) **before** the
Clerk middleware (or exempt it), so it returns `200 {status:"ok"}` regardless of auth
or Clerk config. Needed for autoscale health probes.
_Acceptance:_ `curl /api/healthz` → 200 with no Clerk keys set.

**A2 — Dev auth fallback (backend).** When `NODE_ENV==='development'` **and**
`CLERK_SECRET_KEY` is absent, replace `clerkMiddleware` with a dev middleware that
injects a fixed mock identity. Auth access is centralized behind a single helper
(`getAuthUserId(req)`) used by `requireAuth` and routes, so the fallback is one switch.
In production (keys present) behavior is byte-for-byte unchanged.
_Acceptance:_ with no keys + `NODE_ENV=development`, authenticated routes return data
for a mock user; with keys present, real Clerk is used.

**A3 — Dev auth fallback (frontend).** Route Clerk usage through a thin local auth
module. When no `VITE_CLERK_PUBLISHABLE_KEY` is set in dev, that module supplies a
mock signed-in user and a no-op provider instead of `ClerkProvider`, so the SPA loads
and protected routes render. With a key present, it delegates to the real Clerk SDK.
_Acceptance:_ `vite dev` boots and shows the dashboard as a mock user with no key set.

**A4 — One-command dev.** A root `dev` script orchestrates: start dev DB → run API →
run web (with the `/api` proxy already added). Documented in README.
_Acceptance:_ a single documented command brings the full stack up locally.

### B. Quality gates

**B1 — ESLint + Prettier.** Add a flat ESLint config (`typescript-eslint`) at the root
covering all packages, plus Prettier check. Add `lint` / `format:check` scripts. Fix
violations surfaced (target: zero errors).
_Acceptance:_ `pnpm run lint` exits 0.

**B2 — Vitest + tests.** Add Vitest. Write real unit tests for the highest-value pure
logic first: `custom-fetch` (response parsing / error mapping), `crypto.ts` (AES
round-trip), representative Zod schema validation, and `requireAuth` / dev-auth helper.
Add at least one backend route smoke test against the dev DB.
_Acceptance:_ `pnpm run test` runs and passes; meaningful (not trivial) assertions.

### C. Perfect deploy

**C1 — Robust Vite build.** `vite.config.ts` must not throw at build time for missing
`PORT`/`BASE_PATH`: default them during `build`, require them only when serving.
_Acceptance:_ `pnpm --filter @workspace/fauser-platform build` works with no env set.

**C2 — Code-splitting.** Lazy-load route page components (`React.lazy` + `Suspense`)
so the initial bundle drops well under the 500 kB warning threshold.
_Acceptance:_ Vite build emits no chunk-size warning; route chunks are split.

**C3 — CI (GitHub Actions).** Workflow on push/PR: pnpm install (frozen lockfile,
linux-x64) → typecheck → lint → test → build. Caches the pnpm store.
_Acceptance:_ CI is green on a clean checkout.

**C4 — Deploy config + incident guard.** Review `.replit` build/run for correctness
and document it. Ensure `dist`/artifacts stay git-ignored; add a CI/pre-commit guard
that fails if compiled `dist` is staged, preventing a repeat of the source-overwrite.
_Acceptance:_ committing a `dist` file is rejected by the guard.

### D. Housekeeping

- Resolve or document the `esbuild-plugin-pino` peer-range mismatch.
- Silence/annotate the Radix "use client" sourcemap warnings if cheaply doable.
- Update `README.md` / `replit.md` with local-dev and deploy instructions and the
  `.env.example` contract.

## 4. Sequencing

A (run it) → C1+C2 (build/deploy correctness) → B (lint/test) → C3+C4 (CI/guard) → D.
Each workstream ends with its acceptance check run and observed before moving on.

## 5. Risks & decisions

- **Dev auth fallback (frontend)** is the most invasive piece (touches every Clerk
  hook usage). Mitigation: introduce one auth-wrapper module and route imports through
  it; keep the production path identical. If the surface proves too large, fall back to
  requiring a (public) `VITE_CLERK_PUBLISHABLE_KEY` for the web tier only.
- **Lockfile**: `pnpm-workspace.yaml` now keeps `darwin-arm64` binaries; this is
  additive and platform-gated, so linux-x64 (Replit) installs are unaffected.
- **No secrets in git**: real keys live only in `.env.local` (git-ignored).

## 6. Verification

Final gate (all must pass on a clean checkout): `pnpm install` → `pnpm run lint` →
`pnpm run typecheck` → `pnpm run test` → `pnpm run build`, plus a manual local run
(DB+API+web) reaching the dashboard as a mock user, and `curl /api/healthz` → 200.
