# Remaining Routes Hardening Sweep — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Close the IDOR and missing-authorization holes still open on the un-hardened API routes, and make every `:id` route reject non-numeric ids (400) and missing rows (404) instead of throwing 500 — finishing the feature-by-feature security stabilization started in sub-projects 1 & 2 (Registro, Giustificazioni/Colloqui).

**Architecture:** Reuse the existing, unit-tested primitives `resolveStudentScope` and `parseId` from `artifacts/api-server/src/lib/requestHelpers.ts`, plus the `requireRole([...])` middleware from `routes/auth.ts`. No new pure logic is needed — these primitives already encode every authorization decision, so this sweep is thin route glue with no new unit tests (the primitives stay covered by `requestHelpers.test.ts`). Each route is one independently committable task.

**Tech Stack:** Express 5, Drizzle, Zod, Vitest (node-only). No frontend changes.

## Global Constraints

- Italian UI copy, English code.
- No OpenAPI/codegen changes: these routes use manual fetch, not Orval hooks.
- Reuse `resolveStudentScope` / `parseId` — do not re-implement scope/parse logic inline.
- Gate before each commit: `pnpm run typecheck && pnpm exec eslint <changed files> && pnpm test`.
  (Repo-wide `pnpm run lint` is red on the uncommitted internalMail WIP — scope eslint to changed files.)
- **Do NOT touch the uncommitted internalMail WIP** (email.ts, users.ts, dashboard.ts, Messaggi.tsx, SegreteriaDashboard.tsx, App.tsx, index.html, index.css, schema/index.ts, schema/internalMail.ts). The user is editing these live.
- No `git add -A`; stage explicit paths. Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: behaviorNotes — close disciplinary-notes IDOR + parseId/404

**File:** `artifacts/api-server/src/routes/behaviorNotes.ts`

**Bug:** `GET /` honors `?studentId=X` for any role, so a student can read another student's disciplinary notes. `DELETE /:id` uses bare `parseInt` (NaN → no 400, missing → still 204).

- [ ] **Step 1:** Add `import { resolveStudentScope, parseId } from "../lib/requestHelpers";`
- [ ] **Step 2:** Replace the `GET /` filter block (the `if (req.query.studentId) {…} else if (user.role === "student") {…}`) with:

```ts
    const requestedStudentId =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : undefined;
    const scoped = resolveStudentScope(user, requestedStudentId ?? undefined);
    if (scoped !== undefined)
      filters.push(eq(behaviorNotesTable.studentId, scoped));
```

- [ ] **Step 3:** In `DELETE /:id`, replace `const id = parseInt(req.params.id);` with:

```ts
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const deleted = await db
      .delete(behaviorNotesTable)
      .where(eq(behaviorNotesTable.id, id))
      .returning();
    if (deleted.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.status(204).send();
```

(remove the old bare `db.delete(...)` + `res.status(204).send()`).

- [ ] **Step 4:** Gate, then commit `fix(api): behaviorNotes — close disciplinary IDOR (student-scope), 400/404 on delete`.

---

### Task 2: competencies — close student-competency IDOR + require teacher role on writes

**File:** `artifacts/api-server/src/routes/competencies.ts`

**Bug:** `GET /student` honors `?studentId=X` for any role → a student reads another student's competency assessments. `POST /` and `POST /student` are `requireAuth` only → any student can create competency definitions and assess (grade) competencies for any student.

- [ ] **Step 1:** Imports — add `requireRole` and the helper:

```ts
import { requireAuth, requireRole, getOrCreateUser } from "./auth";
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
```

- [ ] **Step 2:** Scope `GET /student`. Replace the `const studentId = req.query.studentId ? … : undefined;` expression with:

```ts
    const requestedStudentId =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : undefined;
    const studentId = resolveStudentScope(user, requestedStudentId ?? undefined);
```

- [ ] **Step 3:** Gate writes. Change `router.post("/", requireAuth, …)` → `router.post("/", requireRole(["teacher", "admin"]), …)` and `router.post("/student", requireAuth, …)` → `router.post("/student", requireRole(["teacher", "admin"]), …)`. In `POST /student`, the handler reads `req.user` from requireRole instead of re-fetching: replace `const auth = getAuth(req); const user = await getOrCreateUser(auth.userId!);` with `const user = req.user;`. (`getAuth`/`getOrCreateUser` may become unused — remove from imports if so.)
- [ ] **Step 4:** Gate, then commit `fix(api): competencies — close student IDOR, require teacher role on writes`.

---

### Task 3: notifications — bind read-state changes to the owner + parseId/404

**File:** `artifacts/api-server/src/routes/notifications.ts`

**Bug:** `PATCH /:id/read` updates by `id` only — a user can mark another user's notification read. Bare `parseInt`; when no row returns, `record.createdAt` throws → 500.

- [ ] **Step 1:** Add `import { parseId } from "../lib/requestHelpers";`
- [ ] **Step 2:** Rewrite the `PATCH /:id/read` handler body:

```ts
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const [record] = await db
      .update(notificationsTable)
      .set({ read: true })
      .where(
        and(
          eq(notificationsTable.id, id),
          eq(notificationsTable.userId, user.id),
        ),
      )
      .returning();
    if (!record) return res.status(404).json({ error: "Not found" });
    res.json({ ...record, createdAt: record.createdAt.toISOString() });
```

(`and` is already imported.)

- [ ] **Step 3:** Gate, then commit `fix(api): notifications — scope read-state to owner, 400/404 guard`.

---

### Task 4: robustness + ownership sweep — remaining `:id` routes

For each route below: read it, then **(a)** replace every `const X = parseInt(req.params.id);` (and `req.params.studentId`, `req.params.uid`) with `parseId(...)` + `if (id === null) return res.status(400).json({ error: "Invalid id" });`; **(b)** where the mutation/delete returns rows, add `if (deleted.length === 0 / !record) return res.status(404)…`; **(c)** if the resource has an owner column and a non-staff user could mutate another user's row, add the owner/role guard. Import `parseId` from `../lib/requestHelpers`.

- [ ] tutoring.ts (`PATCH /:id`, `DELETE /:id` — check author ownership)
- [ ] diary.ts (`PATCH /:id`, `DELETE /:id` — student-owned entries)
- [ ] materials.ts (`DELETE /:id`)
- [ ] assignments.ts (`PATCH /:id`, `DELETE /:id`, `POST /:id/submit`)
- [ ] events.ts (`PATCH /:id`, `DELETE /:id`)
- [ ] announcements.ts (`GET /:id`)
- [ ] schedule.ts (`DELETE /:id`)
- [ ] classes.ts (`GET /:id`, `PATCH /:id`, `DELETE /:id`)
- [ ] rooms.ts (`DELETE /:id`)
- [ ] polls.ts (`POST /:id/vote`, `DELETE /:id` — one-vote/ownership)
- [ ] fieldTrips.ts (`PATCH /:id/status`, `POST /:id/join`, `DELETE /:id/participants/:studentId`, `GET /:id/participants`)
- [ ] forum.ts (`GET /threads/:id/posts`, `POST /threads/:id/posts`)
- [ ] quizzes.ts (`GET/PATCH/DELETE /:id`, submit/attempt routes)

Commit per route or per small group: `fix(api): <route> — parseId 400 + 404 guard[ + ownership]`.

---

### Task 5: full gate + finish

- [ ] **Step 1:** `pnpm run typecheck && pnpm test && pnpm exec eslint artifacts/api-server/src/routes` — expect green on changed routes (WIP files excluded from our staging).
- [ ] **Step 2:** `git push -u origin stabilize/sub3-routes-hardening`.
- [ ] **Step 3:** Report; offer to open a PR into `new` via finishing-a-development-branch.

## Self-Review

- **Spec coverage:** every route from the `parseInt(req.params…)` inventory + the two `req.query.studentId` IDOR routes (behaviorNotes, competencies) + the notifications ownership IDOR are assigned to a task. ✅
- **Primitive reuse:** all scope/parse decisions go through `resolveStudentScope`/`parseId`; no inline re-implementation. ✅
- **No new pure logic** → no new unit tests, consistent with the project's pure-logic-only test convention. ✅
