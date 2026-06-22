# Giustificazioni + Colloqui Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make Giustificazioni + Colloqui correct and robust — close IDOR reads, fix the broken student-cancel flow, add 404/NaN guards, remove the slot-availability PII leak, and route the frontend through `apiFetch`/`useApi` with surfaced errors.

**Architecture:** Reuse sub-project 1 primitives (`apiFetch`/`useApi`, `parseId`, `resolveStudentScope`, global error handler, `ErrorBoundary`). Authorization decisions are pure, unit-tested helpers consumed by thin route glue (no DB in unit tests). The slot-availability leak is fixed with a new minimal `/api/appointments/availability` endpoint returning only occupied slots.

**Tech Stack:** Express 5, Drizzle, Zod, Vitest (node-only), React + react-query + Clerk.

## Global Constraints

- Italian UI copy, English code.
- No OpenAPI/codegen changes: these routes use manual fetch, not Orval hooks.
- Vitest node-only; test pure logic, no DB/jsdom.
- Gate before each commit: `pnpm run lint && pnpm run typecheck && pnpm test`.
- Do NOT touch the uncommitted internalMail WIP files.
- No `git add -A`; stage explicit paths. Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: Pure helper `canSetAppointmentStatus`

**Files:**
- Modify: `artifacts/api-server/src/lib/requestHelpers.ts`
- Modify: `artifacts/api-server/src/lib/requestHelpers.test.ts`

**Interfaces:**
- Produces: `canSetAppointmentStatus(user: { id: number; role: string }, appointment: { studentId: number }, status: string): boolean` — staff (teacher/segreteria/admin) may set `confirmed` or `cancelled`; a student may only set `cancelled` on their own appointment; everyone else false.

- [ ] **Step 1: Add failing tests** (append to `requestHelpers.test.ts`)

```ts
import { resolveStudentScope, parseId, canSetAppointmentStatus } from "./requestHelpers";

describe("canSetAppointmentStatus", () => {
  const appt = { studentId: 5 };
  it("lets staff confirm or cancel any appointment", () => {
    for (const role of ["teacher", "segreteria", "admin"]) {
      expect(canSetAppointmentStatus({ id: 1, role }, appt, "confirmed")).toBe(true);
      expect(canSetAppointmentStatus({ id: 1, role }, appt, "cancelled")).toBe(true);
    }
  });
  it("lets a student cancel only their own appointment", () => {
    expect(canSetAppointmentStatus({ id: 5, role: "student" }, appt, "cancelled")).toBe(true);
    expect(canSetAppointmentStatus({ id: 9, role: "student" }, appt, "cancelled")).toBe(false);
  });
  it("forbids a student from confirming", () => {
    expect(canSetAppointmentStatus({ id: 5, role: "student" }, appt, "confirmed")).toBe(false);
  });
});
```

(Update the existing import line at the top of the file to include `canSetAppointmentStatus`.)

- [ ] **Step 2: Run, expect fail**

Run: `pnpm exec vitest run artifacts/api-server/src/lib/requestHelpers.test.ts`
Expected: FAIL — `canSetAppointmentStatus is not a function`.

- [ ] **Step 3: Implement** (append to `requestHelpers.ts`)

```ts
const STAFF_ROLES = ["teacher", "segreteria", "admin"];

/**
 * Authorization for a colloquio status change. Staff may confirm or cancel any
 * appointment; a student may only cancel their own. This closes the bug where
 * the student "Annulla richiesta" button hit a staff-only route and got 403.
 */
export function canSetAppointmentStatus(
  user: ScopeUser,
  appointment: { studentId: number },
  status: string,
): boolean {
  if (STAFF_ROLES.includes(user.role)) {
    return status === "confirmed" || status === "cancelled";
  }
  if (user.role === "student") {
    return status === "cancelled" && appointment.studentId === user.id;
  }
  return false;
}
```

- [ ] **Step 4: Run, expect pass**

Run: `pnpm exec vitest run artifacts/api-server/src/lib/requestHelpers.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/lib/requestHelpers.ts artifacts/api-server/src/lib/requestHelpers.test.ts
git commit -m "$(cat <<'EOF'
feat(api): canSetAppointmentStatus pure authorization helper

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: justifications route — IDOR scope + 404/NaN on PATCH

**Files:**
- Modify: `artifacts/api-server/src/routes/justifications.ts`

**Interfaces:**
- Consumes: `resolveStudentScope`, `parseId` from `../lib/requestHelpers`.

- [ ] **Step 1: Import helpers**

Add to the imports:

```ts
import { resolveStudentScope, parseId } from "../lib/requestHelpers";
```

- [ ] **Step 2: Close the IDOR in `GET /`**

Replace the filter block:

```ts
    if (req.query.studentId) {
      filters.push(
        eq(
          justificationsTable.studentId,
          parseInt(req.query.studentId as string),
        ),
      );
    } else if (user.role === "student") {
      filters.push(eq(justificationsTable.studentId, user.id));
    }
```

with:

```ts
    const requestedStudentId =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : undefined;
    const scoped = resolveStudentScope(user, requestedStudentId ?? undefined);
    if (scoped !== undefined)
      filters.push(eq(justificationsTable.studentId, scoped));
```

- [ ] **Step 3: Add NaN guard + 404 to `PATCH /:id`**

Replace `const id = parseInt(req.params.id);` with:

```ts
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
```

The handler wraps the update in `db.transaction` returning `r`. After the transaction, before `enrichJustification(record)`, add:

```ts
    if (!record) return res.status(404).json({ error: "Not found" });
```

- [ ] **Step 4: Gate**

Run: `pnpm run typecheck && pnpm exec eslint artifacts/api-server/src/routes/justifications.ts && pnpm test`
Expected: all PASS.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/justifications.ts
git commit -m "$(cat <<'EOF'
fix(api): justifications — close IDOR (student-scope), 404 + NaN guard on review

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: appointments route — scope reads, fix cancel auth, 404/NaN, availability endpoint

**Files:**
- Modify: `artifacts/api-server/src/routes/appointments.ts`

**Interfaces:**
- Consumes: `parseId`, `canSetAppointmentStatus` from `../lib/requestHelpers`.

- [ ] **Step 1: Imports**

Add:

```ts
import { parseId, canSetAppointmentStatus } from "../lib/requestHelpers";
```

- [ ] **Step 2: Scope reads in `GET /` by role**

Replace the filter-building block (the `if (req.query.teacherId)…` through the `if (filters.length === 0) {…}`) with:

```ts
    const qTeacher =
      typeof req.query.teacherId === "string"
        ? parseId(req.query.teacherId)
        : null;
    const qStudent =
      typeof req.query.studentId === "string"
        ? parseId(req.query.studentId)
        : null;
    const qDate = typeof req.query.date === "string" ? req.query.date : null;

    if (user.role === "student") {
      // Students only ever see their own appointments.
      filters.push(eq(appointmentsTable.studentId, user.id));
    } else if (user.role === "teacher") {
      // Teachers see their own; optionally narrowed to one student.
      filters.push(eq(appointmentsTable.teacherId, user.id));
      if (qStudent !== null)
        filters.push(eq(appointmentsTable.studentId, qStudent));
    } else {
      // segreteria / admin: full access with optional filters.
      if (qTeacher !== null)
        filters.push(eq(appointmentsTable.teacherId, qTeacher));
      if (qStudent !== null)
        filters.push(eq(appointmentsTable.studentId, qStudent));
    }
    if (qDate) filters.push(eq(appointmentsTable.date, qDate));
```

- [ ] **Step 3: Add the availability endpoint** (before `router.post("/")`)

```ts
// Slot availability without leaking other students' identities/notes:
// returns only the occupied (non-cancelled) time slots for a teacher+date.
router.get("/availability", requireAuth, async (req: any, res: any) => {
  try {
    const teacherId =
      typeof req.query.teacherId === "string"
        ? parseId(req.query.teacherId)
        : null;
    const date = typeof req.query.date === "string" ? req.query.date : null;
    if (teacherId === null || !date) {
      return res.status(400).json({ error: "teacherId and date are required" });
    }
    const rows = await db
      .select({
        timeSlot: appointmentsTable.timeSlot,
        status: appointmentsTable.status,
      })
      .from(appointmentsTable)
      .where(
        and(
          eq(appointmentsTable.teacherId, teacherId),
          eq(appointmentsTable.date, date),
        ),
      );
    const occupied = rows
      .filter((r) => r.status !== "cancelled")
      .map((r) => r.timeSlot);
    res.json({ occupied });
  } catch (err) {
    req.log.error({ err }, "Error getting appointment availability");
    res.status(500).json({ error: "Internal server error" });
  }
});
```

- [ ] **Step 4: Student-owns-it check in `POST /`**

The POST handler currently uses `requireAuth`. After destructuring `teacherId, studentId, …` and the required-fields check, add an ownership guard. First fetch the user at the top of the handler:

```ts
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const { teacherId, studentId, date, timeSlot, notes } = req.body;
    if (!teacherId || !studentId || !date || !timeSlot) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    if (user.role === "student" && user.id !== parseInt(String(studentId))) {
      return res
        .status(403)
        .json({ error: "Students can only book for themselves" });
    }
```

(Ensure `getAuth` and `getOrCreateUser` are imported — they already are.)

- [ ] **Step 5: Fix PATCH authorization + 404 + NaN**

Change the PATCH route from `requireRole([...])` to `requireAuth`, and rebuild the handler head:

```ts
router.patch("/:id", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const id = parseId(req.params.id);
    if (id === null) return res.status(400).json({ error: "Invalid id" });
    const { status } = req.body;

    if (!["confirmed", "cancelled"].includes(status)) {
      return res
        .status(400)
        .json({ error: "Status must be confirmed or cancelled" });
    }

    const [existing] = await db
      .select()
      .from(appointmentsTable)
      .where(eq(appointmentsTable.id, id))
      .limit(1);
    if (!existing) return res.status(404).json({ error: "Not found" });

    if (!canSetAppointmentStatus(user, existing, status)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const [record] = await db
      .update(appointmentsTable)
      .set({ status })
      .where(eq(appointmentsTable.id, id))
      .returning();
```

The rest of the handler (enrich + notification + `res.json(enriched)`) stays unchanged.

- [ ] **Step 6: Gate**

Run: `pnpm run typecheck && pnpm exec eslint artifacts/api-server/src/routes/appointments.ts && pnpm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add artifacts/api-server/src/routes/appointments.ts
git commit -m "$(cat <<'EOF'
fix(api): appointments — scope reads, student can cancel own, 404/NaN, availability endpoint

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: Giustificazioni.tsx — useApi + surfaced errors

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/Giustificazioni.tsx`

**Interfaces:**
- Consumes: `useApi` from `@/lib/useApi`.

- [ ] **Step 1: Import + api handle**

Add `import { useApi } from "@/lib/useApi";` and, inside the component (after `const { toast } = useToast();`), `const api = useApi();`. The `useAuth`/`getToken` import can stay only if still used; after this task it isn't, so remove `const { getToken } = useAuth();` and the `useAuth` import.

- [ ] **Step 2: Convert the justifications query**

Replace the `queryFn` body with `useApi`, and surface errors:

```ts
  const {
    data: justifications = [],
    isLoading: loadingJust,
    isError: justError,
  } = useQuery<JustificationType[]>({
    queryKey: ["justifications", studentId],
    enabled:
      !!studentId ||
      user?.role === "teacher" ||
      user?.role === "segreteria" ||
      user?.role === "admin",
    queryFn: () =>
      api<JustificationType[]>(
        studentId
          ? `/api/justifications?studentId=${studentId}`
          : "/api/justifications",
      ),
  });
```

- [ ] **Step 3: Convert mutations + add onError**

`createJustification`:

```ts
  const createJustification = useMutation({
    mutationFn: (data: { attendanceId: number; studentId: number; reason: string }) =>
      api("/api/justifications", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["justifications"] });
      toast({
        title: "Giustificazione inviata",
        description: "La giustificazione è in attesa di approvazione.",
      });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile inviare la giustificazione.",
        variant: "destructive",
      });
    },
  });
```

`updateStatus`:

```ts
  const updateStatus = useMutation({
    mutationFn: (data: { id: number; status: "approved" | "rejected" }) =>
      api(`/api/justifications/${data.id}`, {
        method: "PATCH",
        body: { status: data.status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["justifications"] });
      toast({ title: "Stato aggiornato" });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato.",
        variant: "destructive",
      });
    },
  });
```

- [ ] **Step 4: Surface a load error in the Storico tab**

In the `storico` TabsContent, change the head of the conditional so an error shows a message rather than the empty state. Replace:

```tsx
          {justifications.length === 0 ? (
```

with:

```tsx
          {justError ? (
            <div className="text-center py-8 text-destructive">
              Impossibile caricare le giustificazioni. Riprova più tardi.
            </div>
          ) : justifications.length === 0 ? (
```

(`loadingJust` is now used by this guard; if you still get an unused-var lint on it, add a skeleton/spinner branch using it.)

- [ ] **Step 5: Gate**

Run: `pnpm exec prettier --write artifacts/fauser-platform/src/pages/Giustificazioni.tsx && pnpm run typecheck && pnpm exec eslint artifacts/fauser-platform/src/pages/Giustificazioni.tsx && pnpm test`
Expected: all PASS.

- [ ] **Step 6: Commit**

```bash
git add artifacts/fauser-platform/src/pages/Giustificazioni.tsx
git commit -m "$(cat <<'EOF'
fix(web): Giustificazioni — useApi, surfaced load error, onError toasts

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Colloqui.tsx — useApi + surfaced errors + availability endpoint

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/Colloqui.tsx`

**Interfaces:**
- Consumes: `useApi` from `@/lib/useApi`; `GET /api/appointments/availability`.

- [ ] **Step 1: Import + api handle**

Add `import { useApi } from "@/lib/useApi";` and `const api = useApi();` inside the component. Remove `const { getToken } = useAuth();` and the `useAuth` import (no longer used after this task).

- [ ] **Step 2: Convert the appointments query (with error surface)**

```ts
  const {
    data: appointments = [],
    isError: appointmentsError,
  } = useQuery<AppointmentType[]>({
    queryKey: ["appointments", user?.id, user?.role],
    queryFn: () => {
      const param =
        user?.role === "teacher"
          ? `teacherId=${user?.id}`
          : `studentId=${user?.id}`;
      return api<AppointmentType[]>(`/api/appointments?${param}`);
    },
    enabled: !!user?.id,
  });
```

- [ ] **Step 3: Replace the teacherAppointments query with the availability endpoint**

```ts
  const { data: availability } = useQuery<{ occupied: string[] }>({
    queryKey: ["appointment-availability", selectedTeacher, date],
    queryFn: () =>
      api<{ occupied: string[] }>(
        `/api/appointments/availability?teacherId=${selectedTeacher}&date=${date}`,
      ),
    enabled: !!selectedTeacher && !!date,
  });
```

Then replace the `occupiedSlots` computation:

```ts
  const occupiedSlots = new Set(availability?.occupied ?? []);
```

(Remove the old `teacherAppointments` query and its `.filter(...).map(...)`.)

- [ ] **Step 4: Convert mutations + add onError**

`createAppointment`:

```ts
  const createAppointment = useMutation({
    mutationFn: (data: {
      teacherId: number;
      studentId: number;
      date: string;
      timeSlot: string;
      notes: string;
      status: string;
    }) => api("/api/appointments", { method: "POST", body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({
        title: "Colloquio prenotato",
        description: "In attesa di conferma del docente.",
      });
      setSelectedTeacher(null);
      setDate("");
      setTimeSlot("");
      setNotes("");
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile prenotare il colloquio.",
        variant: "destructive",
      });
    },
  });
```

`updateStatus`:

```ts
  const updateStatus = useMutation({
    mutationFn: (data: { id: number; status: "confirmed" | "cancelled" }) =>
      api(`/api/appointments/${data.id}`, {
        method: "PATCH",
        body: { status: data.status },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast({ title: "Stato aggiornato" });
    },
    onError: () => {
      toast({
        title: "Errore",
        description: "Impossibile aggiornare lo stato del colloquio.",
        variant: "destructive",
      });
    },
  });
```

- [ ] **Step 5: Surface a load error in "I miei colloqui"**

In the `miei-colloqui` TabsContent, change:

```tsx
          {appointments.length === 0 ? (
```

to:

```tsx
          {appointmentsError ? (
            <div className="text-center py-8 text-destructive">
              Impossibile caricare i colloqui. Riprova più tardi.
            </div>
          ) : appointments.length === 0 ? (
```

- [ ] **Step 6: Gate**

Run: `pnpm exec prettier --write artifacts/fauser-platform/src/pages/Colloqui.tsx && pnpm run typecheck && pnpm exec eslint artifacts/fauser-platform/src/pages/Colloqui.tsx && pnpm test`
Expected: all PASS.

- [ ] **Step 7: Commit**

```bash
git add artifacts/fauser-platform/src/pages/Colloqui.tsx
git commit -m "$(cat <<'EOF'
fix(web): Colloqui — useApi, availability endpoint (no PII), surfaced errors, onError toasts

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: Full gate, live smoke test, finish

**Files:** none.

- [ ] **Step 1: Full gate**

Run: `pnpm run lint && pnpm run typecheck && pnpm test && pnpm run build`
Expected: green (the only repo-wide lint errors are the pre-existing internalMail WIP, not in committed code or our files).

- [ ] **Step 2: Live smoke test**

Ensure embedded DB is up (`pnpm db:start`; clear stale `.dev/pgdata/postmaster.pid` if needed; `DATABASE_URL=… pnpm --filter @workspace/db run push`). Start the built API (`node artifacts/api-server/dist/index.mjs` with `DATABASE_URL`, `SESSION_SECRET`, `NODE_ENV=development`, `PORT=8080`, no `CLERK_SECRET_KEY`). Verify:
- `GET /api/justifications` → 200 array.
- `GET /api/appointments` → 200 array.
- `GET /api/appointments/availability?teacherId=1&date=2026-06-22` → `{"occupied":[...]}` (200).
- `GET /api/appointments/availability` (missing params) → 400.
- `PATCH /api/appointments/99999` (status confirmed) → 404 `{"error":"Not found"}` (when run as a staff dev user) — or 403 if dev user is a student; either way not a 500.
Stop the ad-hoc API afterward.

- [ ] **Step 3: Finish via finishing-a-development-branch**

Merge the feature branch into `new`, verify tests on the merge, delete the branch, and `git push origin new`.

---

## Self-Review

**Spec coverage:** IDOR justifications → Task 2; IDOR appointments → Task 3 (read scoping); bug #2 student-cancel → Task 1 + Task 3 (canSetAppointmentStatus + PATCH requireAuth); 404/NaN → Tasks 2 & 3; PII leak #4 → Task 3 (availability endpoint) + Task 5 (frontend uses it); silent errors #5 → Tasks 4 & 5. ✅

**Placeholder scan:** every code step has full code. ✅

**Type consistency:** `canSetAppointmentStatus` signature matches between Task 1 and Task 3. `useApi` usage matches sub-project 1. `availability` response shape `{ occupied: string[] }` matches between Task 3 (backend) and Task 5 (frontend). ✅
