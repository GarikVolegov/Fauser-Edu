# Registro Solid Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Registro area (grades / attendance / behavior notes) correct and robust, and introduce three shared robustness primitives (ErrorBoundary, `apiFetch`, global Express error handler) reused by later areas.

**Architecture:** Backend correctness fixes (IDOR scoping, 404-on-missing, NaN id guard) are implemented as **pure, unit-tested helpers** consumed by thin route glue — matching the existing `mapTeacherToday`/`mapStaffToday` pattern (no DB in unit tests). Frontend `apiFetch` is a **thin wrapper over the existing, already-tested `customFetch`** (DRY) plus a Clerk-token hook. `ErrorBoundary` is a minimal React class component whose pure `getDerivedStateFromError` is unit-tested (no jsdom).

**Tech Stack:** TypeScript 5.9, Express 5, Drizzle ORM, Zod (`zod/v4`), Vitest (node env only), React 19 + wouter + @tanstack/react-query, Clerk.

## Global Constraints

- Italian UI copy, English code/identifiers.
- Navy + gold theme; dense layouts (no theme changes in this plan).
- Contract-first: no OpenAPI changes are expected. If any becomes necessary, edit `lib/api-spec/openapi.yaml` and run `pnpm --filter @workspace/api-spec run codegen` BEFORE touching routes/frontend.
- Grade `value` is stored `numeric`; always serialize with `parseFloat(String(value))` (unchanged here).
- Vitest runs in **node** environment only — no jsdom, no `@testing-library/react`. Do not add render tests; test pure logic.
- Gate before every commit: `pnpm run lint && pnpm run typecheck && pnpm test` all green.
- Test env already defines `DATABASE_URL`/`SESSION_SECRET`; unit tests must NOT connect to the DB.
- No secrets in code or commits; never `git add -A` (stage explicit paths only).
- Commit message trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Backend pure request helpers (`resolveStudentScope`, `parseId`)

**Files:**
- Create: `artifacts/api-server/src/lib/requestHelpers.ts`
- Test: `artifacts/api-server/src/lib/requestHelpers.test.ts`

**Interfaces:**
- Produces:
  - `resolveStudentScope(user: { id: number; role: string }, requestedStudentId?: number): number | undefined`
    — students always resolve to their own `id` (the requested id is ignored, closing the IDOR); staff (teacher/segreteria/admin) resolve to `requestedStudentId` (or `undefined` = all students).
  - `parseId(raw: string): number | null` — base-10 integer or `null` when not a number.

- [ ] **Step 1: Write the failing test**

```ts
// artifacts/api-server/src/lib/requestHelpers.test.ts
import { describe, it, expect } from "vitest";
import { resolveStudentScope, parseId } from "./requestHelpers";

describe("resolveStudentScope", () => {
  it("forces a student to their own id, ignoring a requested studentId (IDOR fix)", () => {
    expect(resolveStudentScope({ id: 5, role: "student" }, 9)).toBe(5);
    expect(resolveStudentScope({ id: 5, role: "student" }, undefined)).toBe(5);
  });

  it("lets staff filter by a requested studentId", () => {
    expect(resolveStudentScope({ id: 1, role: "teacher" }, 9)).toBe(9);
    expect(resolveStudentScope({ id: 1, role: "segreteria" }, 9)).toBe(9);
    expect(resolveStudentScope({ id: 1, role: "admin" }, 9)).toBe(9);
  });

  it("returns undefined (all students) for staff with no requested studentId", () => {
    expect(resolveStudentScope({ id: 1, role: "teacher" }, undefined)).toBeUndefined();
  });
});

describe("parseId", () => {
  it("parses a numeric string", () => {
    expect(parseId("42")).toBe(42);
  });
  it("returns null for a non-numeric id", () => {
    expect(parseId("abc")).toBeNull();
    expect(parseId("")).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run artifacts/api-server/src/lib/requestHelpers.test.ts`
Expected: FAIL — `Cannot find module './requestHelpers'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// artifacts/api-server/src/lib/requestHelpers.ts

/** A user shape sufficient for access-scope decisions. */
export interface ScopeUser {
  id: number;
  role: string;
}

/**
 * Resolve which studentId a request is allowed to read.
 * Students are always scoped to their own id (a requested studentId is ignored —
 * this closes the IDOR on grades/attendance). Staff may filter by any studentId,
 * or `undefined` to read across all students.
 */
export function resolveStudentScope(
  user: ScopeUser,
  requestedStudentId?: number,
): number | undefined {
  if (user.role === "student") return user.id;
  return requestedStudentId;
}

/** Parse a route :id param to a base-10 integer, or null when not numeric. */
export function parseId(raw: string): number | null {
  const n = Number.parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run artifacts/api-server/src/lib/requestHelpers.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/lib/requestHelpers.ts artifacts/api-server/src/lib/requestHelpers.test.ts
git commit -m "$(cat <<'EOF'
feat(api): pure request helpers — resolveStudentScope (IDOR) + parseId

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: Global Express error handler + 404 handler

**Files:**
- Create: `artifacts/api-server/src/middlewares/errorHandler.ts`
- Test: `artifacts/api-server/src/middlewares/errorHandler.test.ts`
- Modify: `artifacts/api-server/src/app.ts` (mount after the router)

**Interfaces:**
- Produces:
  - `notFoundHandler(req, res)` — responds `404 { error: "Not found" }`.
  - `errorHandler(err, req, res, next)` — logs via `req.log` when present; responds with `err.status` (number) or 500; body `{ error }` (generic message for 500, `err.message` otherwise). Delegates to `next(err)` if headers already sent.

- [ ] **Step 1: Write the failing test**

```ts
// artifacts/api-server/src/middlewares/errorHandler.test.ts
import { describe, it, expect, vi } from "vitest";
import { errorHandler, notFoundHandler } from "./errorHandler";

function makeRes() {
  return {
    statusCode: 200,
    body: undefined as unknown,
    headersSent: false,
    status(code: number) { this.statusCode = code; return this; },
    json(obj: unknown) { this.body = obj; return this; },
  };
}

describe("notFoundHandler", () => {
  it("responds 404 with a JSON error", () => {
    const res = makeRes();
    notFoundHandler({} as any, res as any);
    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: "Not found" });
  });
});

describe("errorHandler", () => {
  it("uses err.status and message when provided", () => {
    const res = makeRes();
    const next = vi.fn();
    errorHandler({ status: 400, message: "Bad thing" } as any, { log: { error: vi.fn() } } as any, res as any, next);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: "Bad thing" });
    expect(next).not.toHaveBeenCalled();
  });

  it("defaults to 500 with a generic message and logs", () => {
    const res = makeRes();
    const log = { error: vi.fn() };
    errorHandler(new Error("boom") as any, { log } as any, res as any, vi.fn());
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: "Internal server error" });
    expect(log.error).toHaveBeenCalled();
  });

  it("delegates to next when headers already sent", () => {
    const res = makeRes();
    res.headersSent = true;
    const next = vi.fn();
    const err = new Error("late");
    errorHandler(err as any, {} as any, res as any, next);
    expect(next).toHaveBeenCalledWith(err);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run artifacts/api-server/src/middlewares/errorHandler.test.ts`
Expected: FAIL — `Cannot find module './errorHandler'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// artifacts/api-server/src/middlewares/errorHandler.ts
import type { Request, Response, NextFunction } from "express";

/** 404 for any /api route that fell through the router. */
export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: "Not found" });
}

interface HttpError extends Error {
  status?: number;
}

/**
 * Last-resort error handler. Express 5 forwards rejected async handlers here,
 * so a missed try/catch never hangs a request. Produces a consistent
 * `{ error }` JSON shape.
 */
export function errorHandler(
  err: HttpError,
  req: Request & { log?: { error: (obj: unknown, msg?: string) => void } },
  res: Response,
  next: NextFunction,
): void {
  if (res.headersSent) {
    next(err);
    return;
  }
  const status = typeof err?.status === "number" ? err.status : 500;
  req.log?.error?.({ err }, "Unhandled error");
  res.status(status).json({
    error: status === 500 ? "Internal server error" : err?.message ?? "Error",
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run artifacts/api-server/src/middlewares/errorHandler.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Mount the handlers in `app.ts`**

In `artifacts/api-server/src/app.ts`, add the import near the other middleware imports:

```ts
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler";
```

Then replace the final mount line:

```ts
app.use("/api", router);

export default app;
```

with:

```ts
app.use("/api", router);

// Any unmatched /api route → 404 JSON (kept before the error handler).
app.use("/api", notFoundHandler);

// Last-resort error handler — consistent { error } shape, never hangs.
app.use(errorHandler);

export default app;
```

- [ ] **Step 6: Run gate to verify nothing broke**

Run: `pnpm run typecheck && pnpm exec vitest run artifacts/api-server`
Expected: typecheck PASS; existing `app.health.test.ts` still PASS (the public `/api/healthz` route is mounted before the router and is unaffected).

- [ ] **Step 7: Commit**

```bash
git add artifacts/api-server/src/middlewares/errorHandler.ts artifacts/api-server/src/middlewares/errorHandler.test.ts artifacts/api-server/src/app.ts
git commit -m "$(cat <<'EOF'
feat(api): global error handler + 404 JSON for /api

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Apply scoping + 404 + NaN guard to grades route

**Files:**
- Modify: `artifacts/api-server/src/routes/grades.ts`

**Interfaces:**
- Consumes: `resolveStudentScope`, `parseId` from `../lib/requestHelpers` (Task 1).
- The security logic is unit-tested in Task 1; this task is thin glue verified by typecheck + the full suite + manual run.

- [ ] **Step 1: Import the helpers**

At the top of `artifacts/api-server/src/routes/grades.ts`, add:

```ts
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
```

- [ ] **Step 2: Close the IDOR in `GET /summary`**

Replace the `let studentId` block (currently lines ~19-26) with:

```ts
    const requested = parsed.success ? parsed.data.studentId : undefined;
    const studentId = resolveStudentScope(user, requested) ?? user.id;
```

and ensure `user` is fetched first in that handler (it currently only fetches `user` in the `else`). Replace the start of the handler body so `user` always exists:

```ts
    const auth = getAuth(req);
    const parsed = GetGradesSummaryQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const requested = parsed.success ? parsed.data.studentId : undefined;
    const studentId = resolveStudentScope(user, requested) ?? user.id;
```

(Remove the now-unused `let studentId: number | undefined;` declaration.)

- [ ] **Step 3: Close the IDOR in `GET /`**

Replace the filter-building block (currently lines ~64-75) with:

```ts
    const filters: any[] = [];

    if (parsed.success) {
      const scoped = resolveStudentScope(user, parsed.data.studentId);
      if (scoped !== undefined)
        filters.push(eq(gradesTable.studentId, scoped));
      if (parsed.data.subjectId)
        filters.push(eq(gradesTable.subjectId, parsed.data.subjectId));
    } else {
      const scoped = resolveStudentScope(user, undefined);
      if (scoped !== undefined)
        filters.push(eq(gradesTable.studentId, scoped));
    }
```

- [ ] **Step 4: Add NaN guard + 404 to `PATCH /:id`**

In the `patch("/:id")` handler, replace `const id = parseInt(req.params.id);` with:

```ts
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
```

After the `db.update(...).returning()` call, before reading `grade.subjectId`, add:

```ts
    if (!grade) return res.status(404).json({ error: "Not found" });
```

- [ ] **Step 5: Add NaN guard + 404 to `DELETE /:id`**

Replace `const id = parseInt(req.params.id);` with:

```ts
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
```

Change the delete to detect missing rows:

```ts
    const deleted = await db
      .delete(gradesTable)
      .where(eq(gradesTable.id, id))
      .returning();
    if (deleted.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
```

- [ ] **Step 6: Run gate**

Run: `pnpm run typecheck && pnpm run lint && pnpm test`
Expected: all PASS. (Task 1 tests prove the scoping logic; route is thin glue.)

- [ ] **Step 7: Commit**

```bash
git add artifacts/api-server/src/routes/grades.ts
git commit -m "$(cat <<'EOF'
fix(api): grades — close IDOR (student-scope), 404 on missing, NaN id guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Apply scoping + 404 + NaN guard to attendance route

**Files:**
- Modify: `artifacts/api-server/src/routes/attendance.ts`

**Interfaces:**
- Consumes: `resolveStudentScope`, `parseId` from `../lib/requestHelpers` (Task 1).

- [ ] **Step 1: Import the helpers**

At the top of `artifacts/api-server/src/routes/attendance.ts`, add:

```ts
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
```

- [ ] **Step 2: Close the IDOR in `GET /summary`**

Replace the handler start (currently lines ~16-26) with:

```ts
    const auth = getAuth(req);
    const parsed = GetAttendanceSummaryQueryParams.safeParse(req.query);
    const user = await getOrCreateUser(auth.userId!);
    const requested = parsed.success ? parsed.data.studentId : undefined;
    const studentId = resolveStudentScope(user, requested) ?? user.id;
```

(Remove the now-unused `let studentId: number | undefined;` declaration.)

- [ ] **Step 3: Close the IDOR in `GET /`**

Replace the filter-building block (currently lines ~60-73) with:

```ts
    const filters: any[] = [];

    if (parsed.success) {
      const scoped = resolveStudentScope(user, parsed.data.studentId);
      if (scoped !== undefined)
        filters.push(eq(attendanceTable.studentId, scoped));
      if (parsed.data.classId)
        filters.push(eq(attendanceTable.classId, parsed.data.classId));
      if (parsed.data.date)
        filters.push(eq(attendanceTable.date, parsed.data.date));
    } else {
      const scoped = resolveStudentScope(user, undefined);
      if (scoped !== undefined)
        filters.push(eq(attendanceTable.studentId, scoped));
    }
```

- [ ] **Step 4: Add NaN guard + 404 to `PATCH /:id`**

In the `patch("/:id")` handler, replace `const id = parseInt(req.params.id);` with:

```ts
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
```

After the `db.update(...).returning()` call, add before `res.json`:

```ts
    if (!record) return res.status(404).json({ error: "Not found" });
```

- [ ] **Step 5: Run gate**

Run: `pnpm run typecheck && pnpm run lint && pnpm test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add artifacts/api-server/src/routes/attendance.ts
git commit -m "$(cat <<'EOF'
fix(api): attendance — close IDOR (student-scope), 404 on missing, NaN id guard

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Export `customFetch`/`ApiError` + frontend `apiFetch` wrapper + `useApi` hook

**Files:**
- Modify: `lib/api-client-react/src/index.ts` (export `customFetch`, `ApiError`, type `CustomFetchOptions`)
- Create: `artifacts/fauser-platform/src/lib/api.ts` (pure `apiFetch`)
- Create: `artifacts/fauser-platform/src/lib/useApi.ts` (Clerk-token hook)
- Test: `artifacts/fauser-platform/src/lib/api.test.ts`

**Interfaces:**
- Consumes: `customFetch`, `ApiError`, `CustomFetchOptions` from `@workspace/api-client-react`.
- Produces:
  - `apiFetch<T>(path: string, opts?: { token?: string | null; method?: string; body?: unknown; signal?: AbortSignal }): Promise<T>` — attaches `Authorization: Bearer <token>` when a token is given, JSON-serializes `body`, delegates to `customFetch` (which checks `r.ok`, throws `ApiError`, handles 204).
  - `useApi(): <T>(path: string, opts?: { method?; body?; signal? }) => Promise<T>` — same as `apiFetch` but supplies the Clerk token via `useAuth().getToken()`.

- [ ] **Step 1: Export the primitives from the api-client package**

In `lib/api-client-react/src/index.ts`, change line 3-4 to:

```ts
export {
  setBaseUrl,
  setAuthTokenGetter,
  customFetch,
  ApiError,
} from "./custom-fetch";
export type { AuthTokenGetter, CustomFetchOptions } from "./custom-fetch";
```

- [ ] **Step 2: Write the failing test**

```ts
// artifacts/fauser-platform/src/lib/api.test.ts
import { describe, it, expect, vi, afterEach } from "vitest";
import { ApiError } from "@workspace/api-client-react";
import { apiFetch } from "./api";

afterEach(() => vi.restoreAllMocks());

function jsonResponse(body: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
    ...init,
  });
}

describe("apiFetch", () => {
  it("attaches a Bearer token and returns parsed JSON", async () => {
    const spy = vi.fn(async () => jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", spy);

    const data = await apiFetch<{ ok: boolean }>("/api/thing", { token: "tok123" });

    expect(data).toEqual({ ok: true });
    const init = spy.mock.calls[0][1] as RequestInit;
    expect(new Headers(init.headers).get("authorization")).toBe("Bearer tok123");
  });

  it("serializes a JSON body for POST", async () => {
    const spy = vi.fn(async () => jsonResponse({ id: 1 }, { status: 201 }));
    vi.stubGlobal("fetch", spy);

    await apiFetch("/api/things", { token: "t", method: "POST", body: { a: 1 } });

    const init = spy.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ a: 1 }));
  });

  it("throws ApiError on a non-OK response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ error: "Nope" }), {
          status: 403,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    await expect(apiFetch("/api/secret", { token: "t" })).rejects.toBeInstanceOf(ApiError);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `pnpm exec vitest run artifacts/fauser-platform/src/lib/api.test.ts`
Expected: FAIL — `Cannot find module './api'`.

- [ ] **Step 4: Write `apiFetch`**

```ts
// artifacts/fauser-platform/src/lib/api.ts
import { customFetch, type CustomFetchOptions } from "@workspace/api-client-react";

export interface ApiFetchOptions {
  token?: string | null;
  method?: string;
  body?: unknown;
  signal?: AbortSignal;
}

/**
 * Thin wrapper over the shared, already-tested `customFetch`: attaches a Bearer
 * token, JSON-serializes the body, and delegates response handling (r.ok check,
 * ApiError throwing, 204 → null) to customFetch. Use this for manual API calls
 * that don't have a generated Orval hook yet.
 */
export function apiFetch<T = unknown>(
  path: string,
  opts: ApiFetchOptions = {},
): Promise<T> {
  const { token, method, body, signal } = opts;
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const init: CustomFetchOptions = { method, headers, signal };
  if (body !== undefined) init.body = JSON.stringify(body);

  return customFetch<T>(path, init);
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `pnpm exec vitest run artifacts/fauser-platform/src/lib/api.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 6: Write the `useApi` hook**

```ts
// artifacts/fauser-platform/src/lib/useApi.ts
import { useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch, type ApiFetchOptions } from "./api";

/**
 * Returns an apiFetch bound to the current Clerk session token. Pages use this
 * for manual API calls instead of hand-rolling fetch + getToken + r.ok checks.
 */
export function useApi() {
  const { getToken } = useAuth();
  return useCallback(
    async <T = unknown>(
      path: string,
      opts: Omit<ApiFetchOptions, "token"> = {},
    ): Promise<T> => {
      const token = await getToken();
      return apiFetch<T>(path, { ...opts, token });
    },
    [getToken],
  );
}
```

- [ ] **Step 7: Run gate**

Run: `pnpm run typecheck && pnpm exec vitest run artifacts/fauser-platform lib/api-client-react`
Expected: typecheck PASS; api.test.ts + existing custom-fetch.test.ts PASS.

- [ ] **Step 8: Commit**

```bash
git add lib/api-client-react/src/index.ts artifacts/fauser-platform/src/lib/api.ts artifacts/fauser-platform/src/lib/useApi.ts artifacts/fauser-platform/src/lib/api.test.ts
git commit -m "$(cat <<'EOF'
feat(web): apiFetch wrapper + useApi hook over shared customFetch

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: `ErrorBoundary` component + mount in `App.tsx`

**Files:**
- Create: `artifacts/fauser-platform/src/components/ErrorBoundary.tsx`
- Test: `artifacts/fauser-platform/src/components/ErrorBoundary.test.tsx`
- Modify: `artifacts/fauser-platform/src/App.tsx`

**Interfaces:**
- Produces: `ErrorBoundary` React class component. Props: `{ children: ReactNode; resetKey?: unknown; fallback?: ReactNode }`. Static `getDerivedStateFromError(error: Error): { hasError: true; error: Error }`. Resets when `resetKey` changes.
- Keep imports minimal (React only + a plain button) so the test imports cleanly in the node env.

- [ ] **Step 1: Write the failing test**

```tsx
// artifacts/fauser-platform/src/components/ErrorBoundary.test.tsx
import { describe, it, expect } from "vitest";
import { ErrorBoundary } from "./ErrorBoundary";

describe("ErrorBoundary.getDerivedStateFromError", () => {
  it("flips into the error state carrying the error", () => {
    const err = new Error("kaboom");
    expect(ErrorBoundary.getDerivedStateFromError(err)).toEqual({
      hasError: true,
      error: err,
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm exec vitest run artifacts/fauser-platform/src/components/ErrorBoundary.test.tsx`
Expected: FAIL — `Cannot find module './ErrorBoundary'`.

- [ ] **Step 3: Write the component**

```tsx
// artifacts/fauser-platform/src/components/ErrorBoundary.tsx
import { Component, type ReactNode, type ErrorInfo } from "react";

interface Props {
  children: ReactNode;
  /** When this value changes (e.g. the route), a caught error is cleared. */
  resetKey?: unknown;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render errors in its subtree so one broken page can't blank the whole
 * app. Without this, any thrown error in a lazy-loaded page unmounts the root.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidUpdate(prev: Props): void {
    if (prev.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error("ErrorBoundary caught an error:", error, info.componentStack);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
        <h2 className="text-xl font-semibold">Qualcosa è andato storto</h2>
        <p className="max-w-md text-sm text-muted-foreground">
          Si è verificato un errore imprevisto in questa sezione. Puoi riprovare;
          se il problema persiste, ricarica la pagina.
        </p>
        <button
          type="button"
          onClick={this.handleRetry}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Riprova
        </button>
      </div>
    );
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm exec vitest run artifacts/fauser-platform/src/components/ErrorBoundary.test.tsx`
Expected: PASS (1 test).

- [ ] **Step 5: Mount the boundary in `App.tsx`**

Add the import alongside the other component imports near the top of `artifacts/fauser-platform/src/App.tsx`:

```ts
import { ErrorBoundary } from "@/components/ErrorBoundary";
```

In `ClerkProviderWithRoutes`, capture the current location for the reset key. The function already calls `useLocation()` for `setLocation`; change it to also read the path:

```ts
  const [location, setLocation] = useLocation();
```

Then wrap the existing `<Suspense>...</Suspense>` block with an `ErrorBoundary` keyed on `location` so navigating away from a crashed page clears the error:

```tsx
        <ErrorBoundary resetKey={location}>
          <Suspense
            fallback={
              <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            }
          >
            {/* ...existing <Switch>...</Switch>... */}
          </Suspense>
        </ErrorBoundary>
```

Also wrap the top-level tree in `App()` so a crash outside the router still shows a fallback rather than a blank screen:

```tsx
function App() {
  return (
    <ErrorBoundary>
      <TooltipProvider>
        <WouterRouter base={basePath}>
          <ClerkProviderWithRoutes />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </ErrorBoundary>
  );
}
```

- [ ] **Step 6: Run gate**

Run: `pnpm run typecheck && pnpm run lint && pnpm exec vitest run artifacts/fauser-platform`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add artifacts/fauser-platform/src/components/ErrorBoundary.tsx artifacts/fauser-platform/src/components/ErrorBoundary.test.tsx artifacts/fauser-platform/src/App.tsx
git commit -m "$(cat <<'EOF'
feat(web): ErrorBoundary around routes + app root (no more white-screen crashes)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 7: Harden `Registro.tsx` (surface errors, controlled tabs, typed payloads)

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/Registro.tsx`

**Interfaces:**
- Consumes: `useApi` from `@/lib/useApi` (Task 5).
- Deliverable verified by typecheck + lint (no render tests, per codebase convention) + manual run in Task 8.

- [ ] **Step 1: Import `useApi` and add local types**

Add near the top imports:

```ts
import { useApi } from "@/lib/useApi";
```

Add a local type for behavior notes (above the component) to drop `note: any` in the map:

```ts
interface BehaviorNote {
  id: number;
  studentId: number;
  type: string;
  description: string;
  date: string;
  studentName?: string;
  teacherName?: string;
}
```

- [ ] **Step 2: Add a controlled tab state**

Inside the component, after `initialTab` is computed, add:

```ts
  const [activeTab, setActiveTab] = useState(initialTab);
```

Change the `<Tabs defaultValue={initialTab} ...>` to controlled:

```tsx
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
```

- [ ] **Step 3: Replace the DOM-hack tab switch button**

Replace the "Segna presenze" button's `onClick` (the one doing `document.querySelector('[value="presenze"]')...click()`) with:

```tsx
            <Button size="sm" variant="outline" onClick={() => setActiveTab("presenze")}>
              Segna presenze
            </Button>
```

- [ ] **Step 4: Route `behaviorNotes` through `useApi` and surface errors**

Replace the `behaviorNotes` query (currently using raw fetch with `if (!r.ok) return []`) with:

```ts
  const api = useApi();

  const {
    data: behaviorNotes = [],
    isLoading: loadingNotes,
    isError: notesError,
  } = useQuery<BehaviorNote[]>({
    queryKey: ["behaviorNotes", studentId],
    queryFn: () =>
      api<BehaviorNote[]>(
        studentId
          ? `/api/behavior-notes?studentId=${studentId}`
          : "/api/behavior-notes",
      ),
  });
```

- [ ] **Step 5: Convert `createNote` to `useApi` and add `onError`**

Replace the `createNote` mutation's `mutationFn` and add an `onError`:

```ts
  const createNote = useMutation({
    mutationFn: (data: {
      studentId: number;
      teacherId: number;
      type: string;
      description: string;
      date: string;
    }) => api("/api/behavior-notes", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["behaviorNotes"] });
      toast({ title: "Nota aggiunta" });
      setIsNoteDialogOpen(false);
      setNewNote({
        studentId: "",
        type: "nota",
        description: "",
        date: format(new Date(), "yyyy-MM-dd"),
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiungere la nota.",
        variant: "destructive",
      });
    },
  });
```

- [ ] **Step 6: Render an error state for the notes list**

In the Note tab, change the notes-list conditional so an error shows a message instead of "Nessuna nota". Replace the `loadingNotes ? (...) : behaviorNotes.length === 0 ? (...)` head with:

```tsx
              {loadingNotes ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : notesError ? (
                <div className="text-center py-8 text-destructive">
                  Impossibile caricare le note. Riprova più tardi.
                </div>
              ) : behaviorNotes.length === 0 ? (
```

Update the `.map((note: any)` to `.map((note: BehaviorNote)`.

- [ ] **Step 7: Run gate**

Run: `pnpm run typecheck && pnpm run lint && pnpm test`
Expected: all PASS. If `useListUsers({ role: "student" } as any)` still requires the cast for the generated type, leave it; the goal is removing the avoidable `any` on notes/payloads, not forcing unsafe changes.

- [ ] **Step 8: Commit**

```bash
git add artifacts/fauser-platform/src/pages/Registro.tsx
git commit -m "$(cat <<'EOF'
fix(web): Registro — surface note errors, controlled tabs, typed note payloads

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 8: Full gate, manual verification, and push

**Files:** none (verification + integration).

- [ ] **Step 1: Full workspace gate**

Run: `pnpm run lint && pnpm run typecheck && pnpm test && pnpm run build`
Expected: all green (lint now 0 errors for the files we touched; full build succeeds).

- [ ] **Step 2: Manual smoke test of the Registro**

Run: `pnpm dev` (embedded Postgres + API + web). Open http://localhost:3100.
Verify, using the DevRoleSwitcher:
- As **student**: `/registro` shows own grades/attendance/notes; no errors. Confirm the network call to `/api/grades?studentId=<other>` (via devtools) returns only own data (IDOR closed).
- As **teacher**: add a grade and a behavior note; the "Segna presenze" button switches to the Presenze tab (controlled state) and quick-marks work; toasts appear on success/error.
- Force a notes error (e.g. stop the API briefly) and confirm the Note tab shows the error message, not "Nessuna nota".

Record the observed results. If anything fails, fix under systematic-debugging before proceeding.

- [ ] **Step 3: Push the branch**

```bash
git push   # set upstream if needed: git push -u origin <branch>
```

If the push is rejected (remote ahead / multi-agent repo), report it — do NOT force-push.

---

## Self-Review

**Spec coverage:**
- §3.1 ErrorBoundary → Task 6. ✅
- §3.2 apiFetch helper → Task 5. ✅ (thin wrapper over existing customFetch — DRY)
- §3.3 global error handler + 404 → Task 2. ✅
- §4 backend Registro fixes (IDOR, 404, NaN) → Tasks 1, 3, 4. ✅
- §5 frontend Registro fixes (behaviorNotes errors, controlled tabs, createNote onError, fewer `any`) → Task 7. ✅
- §6 tests + definition of done → unit tests in Tasks 1, 2, 5, 6; full gate + manual run in Task 8. ✅
- §7 process (TDD, gate, push) → embedded per task + Task 8. ✅

**Deviation from spec (deliberate, consistent with the codebase):** §6 listed an
ErrorBoundary "render test" and an apiFetch test. Vitest here runs node-only with
no jsdom/testing-library and the repo has zero component render tests. So the
ErrorBoundary is covered via its pure `getDerivedStateFromError` (Task 6) and
manual verification (Task 8), and apiFetch via fetch-stub unit tests (Task 5) —
matching `dashboardToday.test.ts`/`custom-fetch.test.ts`. No new test deps added.

**Placeholder scan:** No TBD/TODO; every code step contains full code.

**Type consistency:** `resolveStudentScope`/`parseId` signatures match between Task 1
and their use in Tasks 3-4. `apiFetch`/`ApiFetchOptions` match between Tasks 5 and 7.
`ErrorBoundary` static method signature matches between Task 6 component and test.
`BehaviorNote` defined and used within Task 7.
