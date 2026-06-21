# Fauser-Edu Solid Base + Perfect Deploy — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the recovered Fauser-Edu workspace a solid, runnable-anywhere, deployable codebase with quality gates (lint, tests, CI) and a frictionless local dev experience.

**Architecture:** Keep production behavior identical (real Clerk, real Postgres). Add dev-only fallbacks (mock auth on both tiers), make the build environment-independent, split the frontend bundle, and enforce everything in CI. Auth on the backend is gated by a single middleware swap; on the frontend by a dev-only Vite alias — neither touches route/page code.

**Tech Stack:** pnpm workspaces, Node 22 (local) / 24 (Replit), TypeScript 5.9, Express 5, Clerk, Drizzle/Postgres, Vite 7 + React 19, Vitest, ESLint flat config, GitHub Actions.

## Global Constraints

- Package manager: **pnpm** only (root `preinstall` enforces it). Use `pnpm` for all installs.
- `minimumReleaseAge: 1440` in `pnpm-workspace.yaml` — any new dependency must be ≥1 day old.
- Production auth behavior MUST NOT change. All dev fallbacks gate on `NODE_ENV==='development'` AND absence of Clerk keys.
- No secrets in git. Real keys live only in `.env.local` (git-ignored).
- `darwin-arm64` native binaries stay un-excluded in `pnpm-workspace.yaml`; linux-x64 deploy unaffected.
- React is pinned to `19.1.0`; do not bump.
- Each task ends green (its acceptance check observed) and is committed.

---

### Task A1: Public health check

**Files:**

- Modify: `artifacts/api-server/src/app.ts`
- Test: `artifacts/api-server/src/app.health.test.ts` (new)

**Interfaces:**

- Produces: `GET /api/healthz` → `200 {status:"ok"}`, mounted before any auth middleware.

- [ ] **Step 1 — Failing test** (`app.health.test.ts`): use `supertest` against the express `app`, assert `GET /api/healthz` returns 200 and `{status:"ok"}` with no Clerk env set.
- [ ] **Step 2 — Run, expect FAIL** (route currently behind Clerk → 500). `pnpm --filter @workspace/api-server exec vitest run src/app.health.test.ts`
- [ ] **Step 3 — Implement:** in `app.ts`, before `app.use(clerkMiddleware(...))`, add:
  ```ts
  app.get("/api/healthz", (_req, res) => res.json({ status: "ok" }));
  ```
  (Keep the existing `/api/healthz` inside the router too; the earlier public one wins.)
- [ ] **Step 4 — Run, expect PASS.**
- [ ] **Step 5 — Commit:** `fix(api): make /api/healthz public for health probes`

---

### Task A2: Backend dev-auth fallback

**Files:**

- Create: `artifacts/api-server/src/middlewares/devAuthMiddleware.ts`
- Modify: `artifacts/api-server/src/app.ts`
- Test: `artifacts/api-server/src/middlewares/devAuthMiddleware.test.ts`

**Interfaces:**

- Produces: `devAuthMiddleware` — sets `req.auth = () => ({ userId: DEV_USER_CLERK_ID, ... })` so `getAuth(req)` (which calls `req.auth(opts)`) returns a mock signed-in user. `DEV_USER_CLERK_ID = "dev_user_local"`.
- Consumes: existing `getAuth`/`requireAuth` (unchanged).

- [ ] **Step 1 — Failing test:** mount `devAuthMiddleware` then a handler calling `getAuth(req)`; assert `userId === "dev_user_local"`.
- [ ] **Step 2 — Run, expect FAIL** (module missing).
- [ ] **Step 3 — Implement** `devAuthMiddleware.ts`:
  ```ts
  import type { RequestHandler } from "express";
  export const DEV_USER_CLERK_ID = "dev_user_local";
  export const devAuthMiddleware: RequestHandler = (req, _res, next) => {
    (req as any).auth = () => ({
      userId: DEV_USER_CLERK_ID,
      sessionId: "dev_session",
      orgId: null,
      getToken: async () => null,
      has: () => false,
      debug: () => ({}),
    });
    next();
  };
  ```
- [ ] **Step 4 — Run, expect PASS.** If `getAuth` rejects the shape, extend the mock object until it returns `userId`.
- [ ] **Step 5 — Wire in `app.ts`:** replace the unconditional clerk middleware with:
  ```ts
  const devAuth =
    process.env.NODE_ENV === "development" && !process.env.CLERK_SECRET_KEY;
  if (devAuth) {
    logger.warn("DEV AUTH FALLBACK active — all requests run as a mock user");
    app.use(devAuthMiddleware);
  } else {
    app.use(
      clerkMiddleware((req) => ({
        publishableKey: publishableKeyFromHost(
          getClerkProxyHost(req) ?? "",
          process.env.CLERK_PUBLISHABLE_KEY,
        ),
      })),
    );
  }
  ```
- [ ] **Step 6 — Manual check:** with no keys + `NODE_ENV=development`, `curl /api/users/me` returns a user (mock). Commit: `feat(api): dev auth fallback when Clerk keys absent`

---

### Task A3: Frontend dev-auth fallback (Vite alias)

**Files:**

- Create: `artifacts/fauser-platform/src/dev/clerk-mock.tsx`
- Modify: `artifacts/fauser-platform/vite.config.ts` (dev-only alias)
- Modify: `artifacts/fauser-platform/src/App.tsx` (tolerate missing key in mock mode)

**Interfaces:**

- `clerk-mock.tsx` exports the symbols pages use: `ClerkProvider`, `useAuth`, `useUser`, `useClerk`, `SignIn`, `SignUp`, `Show`. Mock `useAuth` → `{ isSignedIn: true, isLoaded: true, userId: "dev_user_local", getToken: async()=>null }`; `useUser` → `{ isSignedIn:true, isLoaded:true, user:{ id:"dev_user_local", firstName:"Dev", lastName:"User", primaryEmailAddress:{emailAddress:"dev@local"} } }`.

- [ ] **Step 1 — Implement `clerk-mock.tsx`** with the components/hooks above; `ClerkProvider`/`Show` render `children`; `SignIn`/`SignUp` render a small "dev mode" placeholder.
- [ ] **Step 2 — Vite alias (dev-only):** in `vite.config.ts`, compute `const devAuth = process.env.NODE_ENV !== "production" && !process.env.VITE_CLERK_PUBLISHABLE_KEY;` and when true add `resolve.alias["@clerk/react"] = path.resolve(__dirname, "src/dev/clerk-mock.tsx")`.
- [ ] **Step 3 — App.tsx guard:** only `throw "Missing VITE_CLERK_PUBLISHABLE_KEY"` when NOT in devAuth mode; in devAuth use a placeholder publishable key string so the mock provider mounts.
- [ ] **Step 4 — Verify:** `VITE_CLERK_PUBLISHABLE_KEY` unset, `pnpm --filter @workspace/fauser-platform dev` (PORT=3000 BASE_PATH=/) → SPA loads, dashboard renders as Dev User. Typecheck still green (tsc resolves real Clerk types).
- [ ] **Step 5 — Commit:** `feat(web): dev auth fallback via Vite alias when no Clerk key`

---

### Task A4: One-command local dev

**Files:**

- Create: `scripts/dev.mjs` (orchestrator) OR root `package.json` `dev` script using `concurrently`-free child processes.
- Modify: root `package.json` (add `dev`, `db:start`, `db:stop` scripts), `README.md`.

- [ ] **Step 1 — Implement** `scripts/dev.mjs`: load `.env.local` (simple parser, no dep), start `dev-db.mjs` (wait for ready line), then spawn api-server (`build` once then `start`, PORT=API_PORT) and vite (PORT=WEB_PORT, BASE_PATH), pipe logs prefixed `[db]/[api]/[web]`, handle SIGINT to tear all down.
- [ ] **Step 2 — Root scripts:** `"dev": "node scripts/dev.mjs"`, `"db:start": "node scripts/dev-db.mjs start"`, `"db:stop": "node scripts/dev-db.mjs stop"`.
- [ ] **Step 3 — Verify:** `pnpm dev` brings up DB+API+web; open `http://localhost:3000` → dashboard as Dev User; `curl http://localhost:3000/api/healthz` (through vite proxy) → 200.
- [ ] **Step 4 — README:** document prerequisites (Node, pnpm), `pnpm install`, `pnpm dev`, env contract, and Clerk-keys-optional behavior.
- [ ] **Step 5 — Commit:** `feat: one-command local dev (db+api+web)`

---

### Task C1: Environment-independent Vite build

**Files:** Modify `artifacts/fauser-platform/vite.config.ts`

- [ ] **Step 1 — Failing check:** `env -u PORT -u BASE_PATH pnpm --filter @workspace/fauser-platform build` currently throws "PORT required".
- [ ] **Step 2 — Implement:** default at build time — `const port = Number(process.env.PORT ?? 5173)` and `const basePath = process.env.BASE_PATH ?? "/"`; keep `strictPort`/host for serve. Only the dev/preview _server_ needs a real PORT; build must not throw.
- [ ] **Step 3 — Verify:** `env -u PORT -u BASE_PATH pnpm --filter @workspace/fauser-platform build` succeeds.
- [ ] **Step 4 — Commit:** `fix(web): build no longer requires PORT/BASE_PATH env`

---

### Task C2: Frontend code-splitting

**Files:** Modify `artifacts/fauser-platform/src/App.tsx`

- [ ] **Step 1 — Implement:** convert page imports to `const X = lazy(() => import("@/pages/X"))` for all route pages (keep `Landing`/`NotFound` eager if desired); wrap `<Switch>` routes in `<Suspense fallback={<LoadingScreen/>}>`.
- [ ] **Step 2 — Verify:** `pnpm --filter @workspace/fauser-platform build` emits multiple chunks and **no** ">500 kB" warning; initial JS chunk well under 500 kB.
- [ ] **Step 3 — Manual:** app still navigates between routes (dev run).
- [ ] **Step 4 — Commit:** `perf(web): lazy-load route pages to split the bundle`

---

### Task B1: ESLint (flat) + Prettier

**Files:**

- Create: `eslint.config.mjs` (root), add root scripts.
- Modify: root `package.json` (devDeps: `eslint`, `typescript-eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `globals`; scripts `lint`, `lint:fix`, `format:check`).

- [ ] **Step 1 — Install** devDeps at root (respect minimumReleaseAge).
- [ ] **Step 2 — Config** `eslint.config.mjs`: typescript-eslint recommended, ignores (`**/dist`, `**/generated`, `**/*.d.ts`, `.dev`, `node_modules`), React hooks rules for the frontend glob. Pragmatic rules (no blanket `any` ban given existing code; warn not error where needed to reach zero-error).
- [ ] **Step 3 — Run** `pnpm run lint`; fix real issues; for unavoidable generated/legacy noise, scope ignores rather than disabling rules globally.
- [ ] **Step 4 — Verify** `pnpm run lint` exits 0 and `pnpm run format:check` passes (prettier already a root devDep).
- [ ] **Step 5 — Commit:** `chore: add ESLint flat config + Prettier check`

---

### Task B2: Vitest + meaningful tests

**Files:**

- Create: `vitest.config.ts` (root or per-package), add root `test` script.
- Tests: `lib/api-client-react/src/custom-fetch.test.ts`, `artifacts/api-server/src/lib/crypto.test.ts`, a Zod schema test in `lib/api-zod`, plus the A1/A2 tests already added.

- [ ] **Step 1 — Install** `vitest` + `supertest` (+ `@types/supertest`) devDeps where used.
- [ ] **Step 2 — custom-fetch tests:** JSON success parse, `ApiError` on non-OK with problem+json detail, `hasNoBody` 204 handling, `setBaseUrl` prefixing relative paths only. (Pure, no network — stub `fetch`.)
- [ ] **Step 3 — crypto tests:** AES round-trip `encrypt(x)` → `decrypt` === `x`; different ciphertext per call (IV) if applicable; uses `SESSION_SECRET` default.
- [ ] **Step 4 — Zod test:** a representative generated schema accepts a valid payload and rejects an invalid one.
- [ ] **Step 5 — Verify** `pnpm run test` passes; assertions are behavioral, not trivial.
- [ ] **Step 6 — Commit:** `test: add Vitest with unit tests for fetch, crypto, schemas, health`

---

### Task C3: CI (GitHub Actions)

**Files:** Create `.github/workflows/ci.yml`

- [ ] **Step 1 — Implement** workflow on `push`/`pull_request`: `ubuntu-latest`, `pnpm/action-setup`, `actions/setup-node@v4` (node 22, cache pnpm), `pnpm install --frozen-lockfile`, then `pnpm run lint`, `pnpm run typecheck`, `pnpm run test`, `pnpm run build`. Provide build env (`PORT`/`BASE_PATH` now optional after C1).
- [ ] **Step 2 — Verify locally** the exact sequence passes on a clean `pnpm install --frozen-lockfile` (frozen lockfile resolves — the darwin additions are platform-gated, linux-x64 unaffected).
- [ ] **Step 3 — Commit:** `ci: typecheck + lint + test + build on push/PR`

---

### Task C4: Deploy config review + dist guard

**Files:** Modify `.replit` (if needed), `README.md`/`replit.md`; create `.github/workflows` step or a `scripts/check-no-dist.mjs` guard.

- [ ] **Step 1 — Review `.replit`:** confirm build/run commands produce + serve the app (api-server build+start; frontend build served). Document the deploy flow in `replit.md`.
- [ ] **Step 2 — Incident guard:** add `scripts/check-no-dist.mjs` that exits non-zero if any tracked path matches `**/dist/**` or `*.tsbuildinfo`; wire it as a CI step (and optionally a pre-commit note in README). This prevents another source-overwrite-by-artifacts.
- [ ] **Step 3 — Verify:** staging a fake `artifacts/x/dist/y.mjs` makes the guard fail; normal tree passes.
- [ ] **Step 4 — Commit:** `ci: guard against committing build artifacts; document deploy`

---

### Task D1: Housekeeping

**Files:** `pnpm-workspace.yaml` or package notes; `README.md`/`replit.md`.

- [ ] **Step 1 — esbuild-plugin-pino peer mismatch:** document why esbuild is pinned `0.27.3` (security override) despite the plugin's `<=0.25.8` peer range, or pin the plugin to a compatible version if one exists without weakening the override. Confirm api-server build still succeeds.
- [ ] **Step 2 — Radix "use client" sourcemap warnings:** confirm they're non-fatal; if a one-line Vite/rollup `onwarn` filter cleanly silences them without hiding real warnings, add it; otherwise document as benign.
- [ ] **Step 3 — Docs:** finalize `README.md` + `replit.md` (local dev, env, deploy, testing).
- [ ] **Step 4 — Commit:** `docs: housekeeping notes + finalized README/replit docs`

---

## Self-Review

**Spec coverage:** A1 (health)→TaskA1; A2 (backend dev auth)→A2; A3 (frontend dev auth)→A3; A4 (one-command dev)→A4; B1 (eslint)→B1; B2 (vitest)→B2; C1 (robust build)→C1; C2 (code-split)→C2; C3 (CI)→C3; C4 (deploy+guard)→C4; D (housekeeping)→D1. All spec items mapped.

**Placeholder scan:** Concrete files/commands/code given for the substantive tasks. Config-heavy tasks (B1/C3) specify exact tools, globs, and step sequence; exact config bodies are produced during execution against installed versions.

**Type consistency:** `DEV_USER_CLERK_ID = "dev_user_local"` is used consistently by backend (A2) and frontend mock (A3). `getAuth(req)` relies on `req.auth` being a function — matches Clerk's `requestHasAuthObject`/`req.auth(opts)` mechanism verified in `@clerk/express`.
