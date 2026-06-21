# "Oggi" Command Center Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a role-aware actionable "Oggi" feed to the top of the teacher/segreteria/admin dashboards, backed by a new `GET /api/dashboard/today` endpoint.

**Architecture:** New additive endpoint in the existing `dashboard` router. All data-shaping lives in a pure, DB-free helper module (`dashboardToday.ts`) so it is unit-testable without a database; the route handler only runs Drizzle queries and calls the helpers. Frontend mounts a single `<OggiFeed />` (role switch) at the top of each role dashboard; existing grids stay below, unchanged.

**Tech Stack:** Express 5 + Drizzle ORM (Postgres), Zod v4, OpenAPI + Orval codegen, React + Vite + Tailwind + shadcn/ui + wouter, Vitest.

## Global Constraints

- Italian UI copy, English code/identifiers.
- Navy + gold theme, dense information-rich layouts (match existing pages).
- Contract-first: edit `lib/api-spec/openapi.yaml` BEFORE writing the route, then run codegen.
- No DB schema changes in this feature (do NOT run `db push`).
- Response schema names must be distinct from any `{OperationId}Body` name (Orval pitfall) — our response schemas (`TodayLesson`, etc.) are response-only, no conflict.
- `wouter` `Link` renders its own `<a>` — never nest `<a>` inside `<Link>`.
- Backend tests are DB-free (see `auth.test.ts`); there is NO frontend component test harness (no `@testing-library`). Frontend tasks are verified manually via `pnpm dev` + the DevRoleSwitcher.
- Date strings are ISO `YYYY-MM-DD`; Drizzle `date` columns return strings, `timestamp` columns return `Date` (serialize with `.toISOString()`).

---

### Task 1: OpenAPI contract for `/dashboard/today` + codegen

**Files:**
- Modify: `lib/api-spec/openapi.yaml` (add path after `/dashboard/upcoming` block ~line 731; add schemas after `DashboardSummary` ~line 2534)

**Interfaces:**
- Produces: generated hook `useGetDashboardToday` and model `DashboardToday` exported from `@workspace/api-client-react`; Zod schema in `@workspace/api-zod`.

- [ ] **Step 1: Add the path** — insert after the `/dashboard/upcoming` block in `lib/api-spec/openapi.yaml`:

```yaml
  /dashboard/today:
    get:
      operationId: getDashboardToday
      tags: [dashboard]
      summary: Role-aware actionable "today" feed for the dashboard header
      responses:
        "200":
          description: Today feed
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/DashboardToday"
```

- [ ] **Step 2: Add the component schemas** — insert right after the `DashboardSummary` schema (before `QuizSummary`) in the `components.schemas` section:

```yaml
    TodayLesson:
      type: object
      properties:
        scheduleId: { type: integer }
        classId: { type: integer }
        className: { type: string }
        subjectName: { type: string }
        hour: { type: integer }
        room: { type: ["string", "null"] }
        attendanceTaken: { type: boolean }
      required: [scheduleId, classId, className, subjectName, hour, attendanceTaken]

    TodayAssignment:
      type: object
      properties:
        id: { type: integer }
        title: { type: string }
        className: { type: string }
        dueDate: { type: string }
      required: [id, title, className, dueDate]

    TodayAppointment:
      type: object
      properties:
        id: { type: integer }
        date: { type: string }
        timeSlot: { type: string }
        studentName: { type: string }
      required: [id, date, timeSlot, studentName]

    PendingJustification:
      type: object
      properties:
        id: { type: integer }
        studentName: { type: string }
        className: { type: string }
        reason: { type: string }
        createdAt: { type: string }
      required: [id, studentName, className, reason, createdAt]

    TodayAbsence:
      type: object
      properties:
        studentId: { type: integer }
        studentName: { type: string }
        className: { type: string }
      required: [studentId, studentName, className]

    TodayRoom:
      type: object
      properties:
        room: { type: string }
        slots: { type: integer }
        conflict: { type: boolean }
      required: [room, slots, conflict]

    DashboardToday:
      type: object
      properties:
        role: { type: string }
        date: { type: string }
        todayLessons:
          type: array
          items: { $ref: "#/components/schemas/TodayLesson" }
        assignmentsDue:
          type: array
          items: { $ref: "#/components/schemas/TodayAssignment" }
        nextAppointment:
          oneOf:
            - $ref: "#/components/schemas/TodayAppointment"
            - type: "null"
        pendingJustifications:
          type: array
          items: { $ref: "#/components/schemas/PendingJustification" }
        todayAbsences:
          type: array
          items: { $ref: "#/components/schemas/TodayAbsence" }
        roomsToday:
          type: array
          items: { $ref: "#/components/schemas/TodayRoom" }
        pendingTotal: { type: integer }
      required: [role, date]
```

- [ ] **Step 3: Run codegen**

Run: `pnpm --filter @workspace/api-spec run codegen`
Expected: completes without error; `lib/api-client-react/src/generated/` now contains a `getDashboardToday` query hook.

- [ ] **Step 4: Verify the hook is generated**

Run: `grep -rl "useGetDashboardToday" lib/api-client-react/src/generated/`
Expected: at least one file path printed.

- [ ] **Step 5: Typecheck the generated output**

Run: `pnpm run typecheck`
Expected: PASS (no errors).

- [ ] **Step 6: Commit**

```bash
git add lib/api-spec/openapi.yaml lib/api-client-react/src/generated lib/api-zod/src/generated
git commit -m "feat(api-spec): add GET /dashboard/today contract + codegen"
```

---

### Task 2: Pure helper `mapTeacherToday`

**Files:**
- Create: `artifacts/api-server/src/routes/dashboardToday.ts`
- Test: `artifacts/api-server/src/routes/dashboardToday.test.ts`

**Interfaces:**
- Produces: `mapTeacherToday(args)` returning `{ todayLessons: TodayLesson[]; assignmentsDue: TodayAssignment[]; nextAppointment: TodayAppointment | null }` and the row/output types below. Consumed by Task 4 (route) and Task 3 shares the file.

- [ ] **Step 1: Write the failing test** — create `artifacts/api-server/src/routes/dashboardToday.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import { mapTeacherToday } from "./dashboardToday";

describe("mapTeacherToday", () => {
  it("returns today's lessons sorted by hour with attendanceTaken flag", () => {
    const result = mapTeacherToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      schedule: [
        { id: 10, classId: 3, dayOfWeek: 1, hour: 2, subjectId: 7, teacherId: 99, room: "A1" },
        { id: 11, classId: 3, dayOfWeek: 1, hour: 1, subjectId: 7, teacherId: 99, room: "A1" },
        { id: 12, classId: 4, dayOfWeek: 2, hour: 1, subjectId: 7, teacherId: 99, room: "B2" },
      ],
      attendance: [{ classId: 3, studentId: 1, date: "2026-06-22", status: "presente" }],
      assignments: [],
      appointments: [],
      classNames: new Map([[3, "3A"], [4, "4B"]]),
      subjectNames: new Map([[7, "Informatica"]]),
      studentNames: new Map(),
    });
    expect(result.todayLessons.map((l) => l.hour)).toEqual([1, 2]);
    expect(result.todayLessons[0]).toMatchObject({
      scheduleId: 11,
      className: "3A",
      subjectName: "Informatica",
      attendanceTaken: true,
    });
    expect(result.todayLessons.find((l) => l.scheduleId === 12)).toBeUndefined();
  });

  it("lists upcoming assignments by due date and picks earliest upcoming appointment", () => {
    const result = mapTeacherToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      schedule: [],
      attendance: [],
      assignments: [
        { id: 1, title: "Esercizi SQL", classId: 3, dueDate: "2026-06-30" },
        { id: 2, title: "Relazione", classId: 3, dueDate: "2026-06-24" },
        { id: 3, title: "Vecchio", classId: 3, dueDate: "2026-06-01" },
      ],
      appointments: [
        { id: 1, teacherId: 99, studentId: 5, date: "2026-06-25", timeSlot: "10:00", status: "confirmed" },
        { id: 2, teacherId: 99, studentId: 6, date: "2026-06-23", timeSlot: "09:00", status: "requested" },
        { id: 3, teacherId: 99, studentId: 7, date: "2026-06-20", timeSlot: "09:00", status: "confirmed" },
      ],
      classNames: new Map([[3, "3A"]]),
      subjectNames: new Map(),
      studentNames: new Map([[6, "Mario Rossi"]]),
    });
    expect(result.assignmentsDue.map((a) => a.id)).toEqual([2, 1]);
    expect(result.nextAppointment).toMatchObject({ id: 2, date: "2026-06-23", studentName: "Mario Rossi" });
  });

  it("returns null appointment when none upcoming", () => {
    const result = mapTeacherToday({
      today: "2026-06-22", dayOfWeek: 1,
      schedule: [], attendance: [], assignments: [], appointments: [],
      classNames: new Map(), subjectNames: new Map(), studentNames: new Map(),
    });
    expect(result.nextAppointment).toBeNull();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: FAIL — cannot find module `./dashboardToday`.

- [ ] **Step 3: Write the helper** — create `artifacts/api-server/src/routes/dashboardToday.ts`:

```ts
// Pure, DB-free data-shaping helpers for GET /dashboard/today.
// Kept free of Drizzle/DB imports so they can be unit-tested without a database.

export type TodayLesson = {
  scheduleId: number;
  classId: number;
  className: string;
  subjectName: string;
  hour: number;
  room: string | null;
  attendanceTaken: boolean;
};
export type TodayAssignment = { id: number; title: string; className: string; dueDate: string };
export type TodayAppointment = { id: number; date: string; timeSlot: string; studentName: string };
export type PendingJustification = { id: number; studentName: string; className: string; reason: string; createdAt: string };
export type TodayAbsence = { studentId: number; studentName: string; className: string };
export type TodayRoom = { room: string; slots: number; conflict: boolean };

export type ScheduleRow = { id: number; classId: number; dayOfWeek: number; hour: number; subjectId: number; teacherId: number; room: string | null };
export type AttendanceRow = { classId: number; studentId: number; date: string; status: string };
export type AssignmentRow = { id: number; title: string; classId: number; dueDate: string };
export type AppointmentRow = { id: number; teacherId: number; studentId: number; date: string; timeSlot: string; status: string };
export type JustificationRow = { id: number; studentId: number; reason: string; status: string; createdAt: string };

const DASH = "—";

export function mapTeacherToday(args: {
  today: string;
  dayOfWeek: number;
  schedule: ScheduleRow[];
  attendance: AttendanceRow[];
  assignments: AssignmentRow[];
  appointments: AppointmentRow[];
  classNames: Map<number, string>;
  subjectNames: Map<number, string>;
  studentNames: Map<number, string>;
}): { todayLessons: TodayLesson[]; assignmentsDue: TodayAssignment[]; nextAppointment: TodayAppointment | null } {
  const { today, dayOfWeek, schedule, attendance, assignments, appointments, classNames, subjectNames, studentNames } = args;

  const todayLessons: TodayLesson[] = schedule
    .filter((s) => s.dayOfWeek === dayOfWeek)
    .sort((a, b) => a.hour - b.hour)
    .map((s) => ({
      scheduleId: s.id,
      classId: s.classId,
      className: classNames.get(s.classId) ?? DASH,
      subjectName: subjectNames.get(s.subjectId) ?? DASH,
      hour: s.hour,
      room: s.room,
      attendanceTaken: attendance.some((a) => a.classId === s.classId && a.date === today),
    }));

  const assignmentsDue: TodayAssignment[] = assignments
    .filter((a) => a.dueDate >= today)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .map((a) => ({ id: a.id, title: a.title, className: classNames.get(a.classId) ?? DASH, dueDate: a.dueDate }));

  const upcoming = appointments
    .filter((a) => a.date >= today && a.status !== "cancelled")
    .sort((a, b) => a.date.localeCompare(b.date) || a.timeSlot.localeCompare(b.timeSlot));
  const nextAppointment: TodayAppointment | null = upcoming.length > 0
    ? { id: upcoming[0].id, date: upcoming[0].date, timeSlot: upcoming[0].timeSlot, studentName: studentNames.get(upcoming[0].studentId) ?? DASH }
    : null;

  return { todayLessons, assignmentsDue, nextAppointment };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/dashboardToday.ts artifacts/api-server/src/routes/dashboardToday.test.ts
git commit -m "feat(api): pure mapTeacherToday helper for today feed"
```

---

### Task 3: Pure helper `mapStaffToday`

**Files:**
- Modify: `artifacts/api-server/src/routes/dashboardToday.ts`
- Modify: `artifacts/api-server/src/routes/dashboardToday.test.ts`

**Interfaces:**
- Consumes: row/output types from Task 2.
- Produces: `mapStaffToday(args)` returning `{ pendingJustifications: PendingJustification[]; todayAbsences: TodayAbsence[]; roomsToday: TodayRoom[]; pendingTotal: number }`. Consumed by Task 4.

- [ ] **Step 1: Add the failing tests** — append to `dashboardToday.test.ts`:

```ts
import { mapStaffToday } from "./dashboardToday";

describe("mapStaffToday", () => {
  it("maps pending justifications and today's absences with names and classes", () => {
    const result = mapStaffToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      justifications: [{ id: 1, studentId: 5, reason: "Visita medica", status: "pending", createdAt: "2026-06-22T08:00:00.000Z" }],
      attendance: [
        { classId: 3, studentId: 5, date: "2026-06-22", status: "assente" },
        { classId: 3, studentId: 6, date: "2026-06-22", status: "presente" },
      ],
      schedule: [],
      classNames: new Map([[3, "3A"]]),
      studentNames: new Map([[5, "Mario Rossi"], [6, "Lucia Bianchi"]]),
      studentClassIds: new Map([[5, 3], [6, 3]]),
    });
    expect(result.pendingJustifications).toEqual([
      { id: 1, studentName: "Mario Rossi", className: "3A", reason: "Visita medica", createdAt: "2026-06-22T08:00:00.000Z" },
    ]);
    expect(result.todayAbsences).toEqual([{ studentId: 5, studentName: "Mario Rossi", className: "3A" }]);
    expect(result.pendingTotal).toBe(1);
  });

  it("flags a room conflict when two lessons share room+hour today", () => {
    const result = mapStaffToday({
      today: "2026-06-22",
      dayOfWeek: 1,
      justifications: [],
      attendance: [],
      schedule: [
        { id: 1, classId: 3, dayOfWeek: 1, hour: 1, subjectId: 7, teacherId: 9, room: "A1" },
        { id: 2, classId: 4, dayOfWeek: 1, hour: 1, subjectId: 8, teacherId: 10, room: "A1" },
        { id: 3, classId: 5, dayOfWeek: 1, hour: 2, subjectId: 8, teacherId: 10, room: "B2" },
        { id: 4, classId: 6, dayOfWeek: 2, hour: 1, subjectId: 8, teacherId: 10, room: "C3" },
      ],
      classNames: new Map(),
      studentNames: new Map(),
      studentClassIds: new Map(),
    });
    expect(result.roomsToday.find((r) => r.room === "A1")).toMatchObject({ slots: 2, conflict: true });
    expect(result.roomsToday.find((r) => r.room === "B2")).toMatchObject({ slots: 1, conflict: false });
    expect(result.roomsToday.find((r) => r.room === "C3")).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: FAIL — `mapStaffToday` is not exported.

- [ ] **Step 3: Add the helper** — append to `dashboardToday.ts`:

```ts
export function mapStaffToday(args: {
  today: string;
  dayOfWeek: number;
  justifications: JustificationRow[];
  attendance: AttendanceRow[];
  schedule: ScheduleRow[];
  classNames: Map<number, string>;
  studentNames: Map<number, string>;
  studentClassIds: Map<number, number>;
}): { pendingJustifications: PendingJustification[]; todayAbsences: TodayAbsence[]; roomsToday: TodayRoom[]; pendingTotal: number } {
  const { today, dayOfWeek, justifications, attendance, schedule, classNames, studentNames, studentClassIds } = args;

  const pendingJustifications: PendingJustification[] = justifications
    .filter((j) => j.status === "pending")
    .map((j) => ({
      id: j.id,
      studentName: studentNames.get(j.studentId) ?? DASH,
      className: classNames.get(studentClassIds.get(j.studentId) ?? -1) ?? DASH,
      reason: j.reason,
      createdAt: j.createdAt,
    }));

  const todayAbsences: TodayAbsence[] = attendance
    .filter((a) => a.date === today && a.status === "assente")
    .map((a) => ({
      studentId: a.studentId,
      studentName: studentNames.get(a.studentId) ?? DASH,
      className: classNames.get(a.classId) ?? DASH,
    }));

  const todaySched = schedule.filter((s) => s.dayOfWeek === dayOfWeek && s.room);
  const byRoom = new Map<string, ScheduleRow[]>();
  for (const s of todaySched) {
    const arr = byRoom.get(s.room as string) ?? [];
    arr.push(s);
    byRoom.set(s.room as string, arr);
  }
  const roomsToday: TodayRoom[] = [...byRoom.entries()]
    .map(([room, rows]) => {
      const hourCounts = new Map<number, number>();
      for (const r of rows) hourCounts.set(r.hour, (hourCounts.get(r.hour) ?? 0) + 1);
      return { room, slots: rows.length, conflict: [...hourCounts.values()].some((c) => c > 1) };
    })
    .sort((a, b) => a.room.localeCompare(b.room));

  return { pendingJustifications, todayAbsences, roomsToday, pendingTotal: pendingJustifications.length };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: PASS (5 tests total).

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/dashboardToday.ts artifacts/api-server/src/routes/dashboardToday.test.ts
git commit -m "feat(api): pure mapStaffToday helper for today feed"
```

---

### Task 4: Wire `GET /dashboard/today` route

**Files:**
- Modify: `artifacts/api-server/src/routes/dashboard.ts`

**Interfaces:**
- Consumes: `mapTeacherToday`, `mapStaffToday` from `./dashboardToday`; `requireAuth`, `getOrCreateUser` from `./auth`.
- Produces: HTTP `GET /api/dashboard/today` returning a `DashboardToday`-shaped JSON.

- [ ] **Step 1: Add imports** — in `dashboard.ts`, extend the `@workspace/db` import to also pull `classesTable, scheduleTable, appointmentsTable, justificationsTable, usersTable` (alongside the existing `subjectsTable`, `attendanceTable`, `assignmentsTable`), and add at the top:

```ts
import { mapTeacherToday, mapStaffToday } from "./dashboardToday";
```

- [ ] **Step 2: Add the route handler** — insert before `export default router;` in `dashboard.ts`:

```ts
router.get("/today", requireAuth, async (req: any, res: any) => {
  try {
    const auth = getAuth(req);
    const user = await getOrCreateUser(auth.userId!);
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const dayOfWeek = now.getDay(); // 0=Sun .. 6=Sat (Italian Mon-Fri = 1..5)

    const classes = await db.select().from(classesTable);
    const classNames = new Map(classes.map((c) => [c.id, c.name]));

    const allUsers = await db.select().from(usersTable);
    const studentNames = new Map(allUsers.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));

    if (user.role === "teacher") {
      const schedule = await db.select().from(scheduleTable).where(eq(scheduleTable.teacherId, user.id));
      const todayAttendance = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
      const assignments = await db.select().from(assignmentsTable).where(eq(assignmentsTable.teacherId, user.id));
      const appts = await db.select().from(appointmentsTable).where(eq(appointmentsTable.teacherId, user.id));
      const subjects = await db.select().from(subjectsTable);
      const subjectNames = new Map(subjects.map((s) => [s.id, s.name]));

      const payload = mapTeacherToday({
        today, dayOfWeek, schedule, attendance: todayAttendance,
        assignments, appointments: appts, classNames, subjectNames, studentNames,
      });
      return res.json({ role: "teacher", date: today, ...payload });
    }

    if (["segreteria", "admin"].includes(user.role)) {
      const pendingJust = await db.select().from(justificationsTable).where(eq(justificationsTable.status, "pending"));
      const todayAttendance = await db.select().from(attendanceTable).where(eq(attendanceTable.date, today));
      const schedule = await db.select().from(scheduleTable);
      const studentClassIds = new Map(allUsers.map((u) => [u.id, u.classId ?? -1]));

      const payload = mapStaffToday({
        today, dayOfWeek,
        justifications: pendingJust.map((j) => ({ ...j, createdAt: j.createdAt.toISOString() })),
        attendance: todayAttendance, schedule, classNames, studentNames, studentClassIds,
      });
      return res.json({ role: user.role, date: today, ...payload });
    }

    // Student keeps using /dashboard/summary; return a light payload here.
    return res.json({ role: "student", date: today });
  } catch (err) {
    req.log.error({ err }, "Error getting today dashboard");
    res.status(500).json({ error: "Internal server error" });
  }
});
```

- [ ] **Step 3: Typecheck**

Run: `pnpm run typecheck`
Expected: PASS.

- [ ] **Step 4: Manual smoke test** — start the stack and hit the endpoint as the dev mock user.

Run: `pnpm dev` (in a separate terminal), then:
`curl -s http://localhost:8080/api/dashboard/today | head`
Expected: JSON containing `"role"` and `"date"` keys (200, not 500). Stop `pnpm dev` after.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/dashboard.ts
git commit -m "feat(api): add GET /dashboard/today route using shaping helpers"
```

---

### Task 5: `OggiCard` primitive + `OggiFeed` shell

**Files:**
- Create: `artifacts/fauser-platform/src/components/oggi/OggiCard.tsx`
- Create: `artifacts/fauser-platform/src/components/oggi/OggiFeed.tsx`

**Interfaces:**
- Consumes: `useGetMe`, `useGetDashboardToday` from `@workspace/api-client-react`.
- Produces: `<OggiFeed />` default export (role switch + loading/error states); `OggiCard` (title, icon, children, optional CTA). Consumed by Tasks 6 and 7.

- [ ] **Step 1: Create `OggiCard.tsx`**

```tsx
import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export function OggiCard({
  title,
  icon,
  cta,
  children,
}: {
  title: string;
  icon?: ReactNode;
  cta?: { label: string; href: string };
  children: ReactNode;
}) {
  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        {cta && (
          <Link href={cta.href}>
            <Button size="sm" variant="secondary">{cta.label}</Button>
          </Link>
        )}
      </CardHeader>
      <CardContent className="text-sm">{children}</CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: Create `OggiFeed.tsx`**

```tsx
import { useGetMe, useGetDashboardToday } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import OggiTeacher from "./OggiTeacher";
import OggiSegreteria from "./OggiSegreteria";
import OggiAdmin from "./OggiAdmin";

export default function OggiFeed() {
  const { data: me } = useGetMe();
  const { data, isLoading, isError } = useGetDashboardToday();
  const role = me?.role ?? "student";

  if (role === "student") return null; // student keeps its existing dashboard

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">
          Oggi, {format(new Date(), "EEEE d MMMM", { locale: it })}
        </h2>
        <p className="text-sm text-muted-foreground">Le tue azioni di oggi.</p>
      </div>

      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      )}

      {isError && !isLoading && (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          Non è stato possibile caricare il riepilogo di oggi. Riprova più tardi.
        </div>
      )}

      {!isLoading && !isError && data && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {role === "teacher" && <OggiTeacher data={data} />}
          {role === "segreteria" && <OggiSegreteria data={data} />}
          {role === "admin" && <OggiAdmin data={data} />}
        </div>
      )}
    </section>
  );
}
```

- [ ] **Step 3: Typecheck (expect failures for missing children)**

Run: `pnpm run typecheck`
Expected: errors only about missing `./OggiTeacher`, `./OggiSegreteria`, `./OggiAdmin` (created in Tasks 6–7). Do not fix here.

- [ ] **Step 4: Commit**

```bash
git add artifacts/fauser-platform/src/components/oggi/OggiCard.tsx artifacts/fauser-platform/src/components/oggi/OggiFeed.tsx
git commit -m "feat(web): OggiCard primitive + OggiFeed shell"
```

---

### Task 6: `OggiTeacher` content + mount in TeacherDashboard

**Files:**
- Create: `artifacts/fauser-platform/src/components/oggi/OggiTeacher.tsx`
- Modify: `artifacts/fauser-platform/src/pages/TeacherDashboard.tsx` (mount `<OggiFeed />` at top)

**Interfaces:**
- Consumes: the `DashboardToday` object passed as `data` prop from `OggiFeed`.
- Produces: `<OggiTeacher data={...} />` default export.

- [ ] **Step 1: Create `OggiTeacher.tsx`**

```tsx
import { CalendarCheck2, ClipboardList, Clock } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiTeacher({ data }: { data: any }) {
  const lessons = data.todayLessons ?? [];
  const assignments = data.assignmentsDue ?? [];
  const next = data.nextAppointment ?? null;

  return (
    <>
      <OggiCard title="Lezioni di oggi" icon={<Clock className="h-4 w-4 text-primary" />}>
        {lessons.length === 0 ? (
          <span className="text-muted-foreground">Nessuna lezione oggi 🎉</span>
        ) : (
          <ul className="space-y-2">
            {lessons.map((l: any) => (
              <li key={l.scheduleId} className="flex items-center justify-between gap-2">
                <span>
                  <span className="font-medium">{l.hour}ª · {l.className}</span>{" "}
                  <span className="text-muted-foreground">{l.subjectName}{l.room ? ` · ${l.room}` : ""}</span>
                </span>
                <a
                  href={`/registro?classId=${l.classId}&tab=presenze`}
                  className={`text-xs rounded px-2 py-1 ${l.attendanceTaken ? "bg-muted text-muted-foreground" : "bg-primary text-primary-foreground"}`}
                >
                  {l.attendanceTaken ? "Appello fatto" : "Fai l'appello"}
                </a>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Compiti in scadenza"
        icon={<ClipboardList className="h-4 w-4 text-primary" />}
        cta={{ label: "Registro", href: "/registro" }}
      >
        {assignments.length === 0 ? (
          <span className="text-muted-foreground">Nessun compito in scadenza.</span>
        ) : (
          <ul className="space-y-1">
            {assignments.slice(0, 4).map((a: any) => (
              <li key={a.id} className="flex justify-between">
                <span className="truncate">{a.title} · {a.className}</span>
                <span className="text-muted-foreground text-xs">{a.dueDate}</span>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Prossimo colloquio"
        icon={<CalendarCheck2 className="h-4 w-4 text-primary" />}
        cta={{ label: "Colloqui", href: "/colloqui" }}
      >
        {next ? (
          <span>{next.date} · {next.timeSlot} — {next.studentName}</span>
        ) : (
          <span className="text-muted-foreground">Nessun colloquio in programma.</span>
        )}
      </OggiCard>
    </>
  );
}
```

Note: the `Fai l'appello` link is a raw `<a>` (full navigation with query params), NOT wrapped in a wouter `<Link>` — this keeps deep-link params intact and avoids nesting `<a>` inside `<Link>`.

- [ ] **Step 2: Mount `<OggiFeed />` in `TeacherDashboard.tsx`** — add the import at the top:

```tsx
import OggiFeed from "@/components/oggi/OggiFeed";
```

and insert `<OggiFeed />` as the first child inside the outer `<div className="space-y-8">`, immediately before the existing `<div>` that holds the `<h1>Dashboard Docente</h1>` header:

```tsx
  return (
    <div className="space-y-8">
      <OggiFeed />
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Docente</h1>
```

- [ ] **Step 3: Typecheck**

Run: `pnpm run typecheck`
Expected: PASS (OggiSegreteria/OggiAdmin still missing → errors remain only for those two imports in OggiFeed; if so, proceed — they are created in Task 7. If you prefer a clean typecheck per task, create Task 7 stubs first, but it is acceptable to leave these until Task 7.)

- [ ] **Step 4: Manual verification**

Run: `pnpm dev`, open the app, use the DevRoleSwitcher to select **teacher**, go to the dashboard. Expected: an "Oggi, <date>" section on top with three cards; "Fai l'appello" links point to `/registro?classId=...&tab=presenze`. The existing teacher grid still shows below. Stop `pnpm dev`.

- [ ] **Step 5: Commit**

```bash
git add artifacts/fauser-platform/src/components/oggi/OggiTeacher.tsx artifacts/fauser-platform/src/pages/TeacherDashboard.tsx
git commit -m "feat(web): OggiTeacher feed mounted atop TeacherDashboard"
```

---

### Task 7: `OggiSegreteria` + `OggiAdmin` + mounts

**Files:**
- Create: `artifacts/fauser-platform/src/components/oggi/OggiSegreteria.tsx`
- Create: `artifacts/fauser-platform/src/components/oggi/OggiAdmin.tsx`
- Modify: `artifacts/fauser-platform/src/pages/SegreteriaDashboard.tsx` (mount `<OggiFeed />` at top)
- Modify: `artifacts/fauser-platform/src/pages/Admin.tsx` (mount `<OggiFeed />` at top)

**Interfaces:**
- Consumes: `DashboardToday` `data` prop.
- Produces: `<OggiSegreteria data={...} />` and `<OggiAdmin data={...} />` default exports.

- [ ] **Step 1: Create `OggiSegreteria.tsx`**

```tsx
import { AlertCircle, UserX, Building2 } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiSegreteria({ data }: { data: any }) {
  const just = data.pendingJustifications ?? [];
  const absences = data.todayAbsences ?? [];
  const rooms = data.roomsToday ?? [];

  return (
    <>
      <OggiCard
        title="Giustificazioni in sospeso"
        icon={<AlertCircle className="h-4 w-4 text-primary" />}
        cta={{ label: "Apri", href: "/giustificazioni" }}
      >
        {just.length === 0 ? (
          <span className="text-muted-foreground">Nessuna giustificazione in sospeso.</span>
        ) : (
          <ul className="space-y-1">
            {just.slice(0, 5).map((j: any) => (
              <li key={j.id} className="flex justify-between">
                <span className="truncate">{j.studentName} · {j.className}</span>
                <span className="text-muted-foreground text-xs truncate max-w-[8rem]">{j.reason}</span>
              </li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard title="Assenze di oggi" icon={<UserX className="h-4 w-4 text-primary" />}>
        {absences.length === 0 ? (
          <span className="text-muted-foreground">Nessuna assenza registrata oggi.</span>
        ) : (
          <ul className="space-y-1">
            {absences.slice(0, 6).map((a: any) => (
              <li key={a.studentId}>{a.studentName} · {a.className}</li>
            ))}
          </ul>
        )}
      </OggiCard>

      <OggiCard
        title="Aule di oggi"
        icon={<Building2 className="h-4 w-4 text-primary" />}
        cta={{ label: "Aule", href: "/aule" }}
      >
        {rooms.length === 0 ? (
          <span className="text-muted-foreground">Nessuna aula occupata oggi.</span>
        ) : (
          <ul className="space-y-1">
            {rooms.slice(0, 6).map((r: any) => (
              <li key={r.room} className="flex justify-between">
                <span>{r.room} · {r.slots} ore</span>
                {r.conflict && <span className="text-xs text-red-600">conflitto</span>}
              </li>
            ))}
          </ul>
        )}
      </OggiCard>
    </>
  );
}
```

- [ ] **Step 2: Create `OggiAdmin.tsx`**

```tsx
import { AlertCircle } from "lucide-react";
import { OggiCard } from "./OggiCard";

export default function OggiAdmin({ data }: { data: any }) {
  const pending = data.pendingTotal ?? 0;
  return (
    <OggiCard
      title="Da evadere"
      icon={<AlertCircle className="h-4 w-4 text-primary" />}
      cta={{ label: "Pannello Admin", href: "/admin" }}
    >
      <div className="text-3xl font-bold">{pending}</div>
      <p className="text-xs text-muted-foreground">richieste/giustificazioni in sospeso</p>
    </OggiCard>
  );
}
```

- [ ] **Step 3: Mount in `SegreteriaDashboard.tsx`** — add import `import OggiFeed from "@/components/oggi/OggiFeed";` and insert `<OggiFeed />` as the first child inside the outer `<div className="space-y-8">`, before the `<div>` containing `<h1>Segreteria</h1>`.

- [ ] **Step 4: Mount in `Admin.tsx`** — add import `import OggiFeed from "@/components/oggi/OggiFeed";` and insert `<OggiFeed />` as the first child of the page's outermost content wrapper (above the existing Admin header). Keep it inside any existing `RoleGuard`.

- [ ] **Step 5: Typecheck**

Run: `pnpm run typecheck`
Expected: PASS (all three Oggi children now exist).

- [ ] **Step 6: Manual verification**

Run: `pnpm dev`; with the DevRoleSwitcher select **segreteria** then **admin**. Expected: segreteria sees three cards (giustificazioni / assenze / aule); admin sees the compact "Da evadere" card with the Admin shortcut. Existing dashboards remain below. Stop `pnpm dev`.

- [ ] **Step 7: Commit**

```bash
git add artifacts/fauser-platform/src/components/oggi/OggiSegreteria.tsx artifacts/fauser-platform/src/components/oggi/OggiAdmin.tsx artifacts/fauser-platform/src/pages/SegreteriaDashboard.tsx artifacts/fauser-platform/src/pages/Admin.tsx
git commit -m "feat(web): OggiSegreteria + OggiAdmin feeds mounted atop dashboards"
```

---

### Task 8: Registro deep-link (read `classId` + `tab`)

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/Registro.tsx`

**Interfaces:**
- Consumes: URL query params `classId` (string) and `tab` (e.g. `presenze`) produced by the OggiTeacher "Fai l'appello" link.

- [ ] **Step 1: Read params at component init** — near the top of the component body (right after the first `useState` declarations, before the JSX), add:

```tsx
const deepLinkParams = new URLSearchParams(
  typeof window !== "undefined" ? window.location.search : "",
);
const initialTab = deepLinkParams.get("tab") ?? "voti";
const initialClassId = deepLinkParams.get("classId") ?? "";
```

- [ ] **Step 2: Seed the attendance class selector** — change the `quickAtt` initial state (currently `useState({ classId: "", ... })` around line 69) so `classId` defaults to `initialClassId`:

```tsx
const [quickAtt, setQuickAtt] = useState({
  classId: initialClassId,
  // ...keep all other existing fields unchanged...
});
```

- [ ] **Step 3: Seed the active tab** — change the `Tabs` element (currently `<Tabs defaultValue="voti" className="w-full">` around line 263) to:

```tsx
<Tabs defaultValue={initialTab} className="w-full">
```

- [ ] **Step 4: Typecheck**

Run: `pnpm run typecheck`
Expected: PASS.

- [ ] **Step 5: Manual verification**

Run: `pnpm dev`; as **teacher**, click "Fai l'appello" on a lesson. Expected: Registro opens with the **Presenze** tab active and the class preselected in the attendance selector. Stop `pnpm dev`.

- [ ] **Step 6: Commit**

```bash
git add artifacts/fauser-platform/src/pages/Registro.tsx
git commit -m "feat(web): Registro reads classId/tab deep-link params"
```

---

### Task 9: Full verification gates

**Files:** none (verification only)

- [ ] **Step 1: Lint + format**

Run: `pnpm run lint && pnpm run format:check`
Expected: PASS. If format fails, run `pnpm run format` and re-commit.

- [ ] **Step 2: Tests**

Run: `pnpm test`
Expected: PASS, including the 5 `dashboardToday` tests.

- [ ] **Step 3: Typecheck + build**

Run: `pnpm run build`
Expected: PASS (typecheck + build across all packages).

- [ ] **Step 4: Manual role sweep**

Run: `pnpm dev`; via DevRoleSwitcher verify student (no Oggi feed, unchanged), teacher, segreteria, admin all render correctly and the "Fai l'appello" deep-link works. Stop `pnpm dev`.

- [ ] **Step 5: Final commit (if any format/lint fixes were made)**

```bash
git add -A
git commit -m "chore: lint/format pass for Oggi command center"
```

---

## Self-Review Notes

- **Spec coverage:** placement (feed in testa) → Tasks 6–7; teacher content → Task 6; segreteria/admin content → Task 7; backend `/today` → Tasks 1–4; deep-links → Task 8; loading/empty/error → Task 5 (shell) + per-card empties in Tasks 6–7; testing (DB-free helpers) → Tasks 2–3; ⌘K and auto-notifications excluded (non-goals) → not present. Student untouched → enforced in Task 4 (light payload) + Task 5 (`OggiFeed` returns null for student).
- **No DB schema changes** — `db push` intentionally absent.
- **Type consistency:** `mapTeacherToday`/`mapStaffToday` signatures and the `Today*` output types are defined in Task 2 and reused verbatim in Tasks 3–4; frontend reads the same field names (`todayLessons`, `assignmentsDue`, `nextAppointment`, `pendingJustifications`, `todayAbsences`, `roomsToday`, `pendingTotal`).
- **Open item resolved:** `dayOfWeek` uses JS `getDay()` (0=Sun..6=Sat); Italian school week maps Mon–Fri to 1–5. If seed data uses a different convention, adjust the comparison in the route (single line) — helpers are convention-agnostic (caller supplies `dayOfWeek`).
