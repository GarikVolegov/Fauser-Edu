# Dashboard / Oggi Hardening — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (or subagent-driven-development) to implement task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Add the missing dashboard error states, extract + test the student-summary numeric logic, and remove redundant runtime `import()`s in the dashboard route.

**Architecture:** Mirror the existing pure-helper pattern in `dashboardToday.ts` (`mapTeacherToday`/`mapStaffToday`): add `mapStudentSummary`, unit-test it, and have the route consume it. Frontend uses react-query `isError` flags already exposed by the generated hooks.

**Tech Stack:** Express 5, Drizzle, Vitest (node-only), React + react-query + Orval hooks.

## Global Constraints

- Italian UI copy, English code.
- No OpenAPI/codegen change: `/dashboard/summary` response keeps the same field names the frontend reads (`gradeAverage`, `totalGrades`, `attendancePercentage`, `pendingAssignments`, `upcomingEvents`, `unreadAnnouncements`, `recentGrades[]` with `id/subjectName/date/type/value`).
- Vitest node-only; test pure logic. Don't touch internalMail WIP.
- Gate before each commit: `pnpm run lint && pnpm run typecheck && pnpm test`.
- No `git add -A`. Commit trailer: `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`.

---

### Task 1: `mapStudentSummary` pure helper + tests

**Files:**
- Modify: `artifacts/api-server/src/routes/dashboardToday.ts`
- Modify: `artifacts/api-server/src/routes/dashboardToday.test.ts`

**Interfaces:**
- Produces: `mapStudentSummary(args: { grades: StudentGradeRow[]; attendance: { status: string }[]; pendingAssignmentsCount: number; upcomingEventsCount: number; unreadAnnouncementsCount: number; subjectNames: Map<number,string> }) => { role: "student"; gradeAverage: number|null; totalGrades: number; attendancePercentage: number|null; pendingAssignments: number; upcomingEvents: number; unreadAnnouncements: number; recentGrades: StudentRecentGrade[] }`
- `StudentGradeRow = { id: number; subjectId: number; value: string | number; type: string; date: string; description: string | null; createdAt: string }`
- `StudentRecentGrade = { id: number; subjectId: number; value: number; type: string; date: string; description: string | null; subjectName: string; createdAt: string }`

- [ ] **Step 1: Add failing tests** (append to `dashboardToday.test.ts`)

```ts
import { mapTeacherToday, mapStaffToday, mapStudentSummary } from "./dashboardToday";

describe("mapStudentSummary", () => {
  const subjectNames = new Map([[7, "Informatica"], [8, "Matematica"]]);

  it("computes rounded average, attendance %, and recent grades (newest first, max 5)", () => {
    const grades = [
      { id: 1, subjectId: 7, value: "8", type: "orale", date: "2026-06-01", description: null, createdAt: "2026-06-01T00:00:00.000Z" },
      { id: 2, subjectId: 8, value: "5", type: "scritto", date: "2026-06-10", description: "verifica", createdAt: "2026-06-10T00:00:00.000Z" },
      { id: 3, subjectId: 7, value: "7", type: "orale", date: "2026-06-05", description: null, createdAt: "2026-06-05T00:00:00.000Z" },
    ];
    const attendance = [
      { status: "presente" }, { status: "presente" }, { status: "assente" }, { status: "ritardo" },
    ];
    const result = mapStudentSummary({
      grades,
      attendance,
      pendingAssignmentsCount: 2,
      upcomingEventsCount: 1,
      unreadAnnouncementsCount: 4,
      subjectNames,
    });
    expect(result.role).toBe("student");
    expect(result.gradeAverage).toBeCloseTo(6.67, 2); // (8+5+7)/3 = 6.6666 → 6.67
    expect(result.totalGrades).toBe(3);
    expect(result.attendancePercentage).toBe(50); // 2 presenti / 4
    expect(result.pendingAssignments).toBe(2);
    expect(result.upcomingEvents).toBe(1);
    expect(result.unreadAnnouncements).toBe(4);
    expect(result.recentGrades.map((g) => g.id)).toEqual([2, 3, 1]); // by date desc
    expect(result.recentGrades[0]).toMatchObject({ subjectName: "Matematica", value: 5 });
  });

  it("returns null average and percentage when there is no data", () => {
    const result = mapStudentSummary({
      grades: [],
      attendance: [],
      pendingAssignmentsCount: 0,
      upcomingEventsCount: 0,
      unreadAnnouncementsCount: 0,
      subjectNames,
    });
    expect(result.gradeAverage).toBeNull();
    expect(result.attendancePercentage).toBeNull();
    expect(result.recentGrades).toEqual([]);
  });

  it("caps recentGrades at 5", () => {
    const grades = Array.from({ length: 7 }, (_, i) => ({
      id: i + 1, subjectId: 7, value: "6", type: "orale",
      date: `2026-06-0${i + 1}`, description: null, createdAt: `2026-06-0${i + 1}T00:00:00.000Z`,
    }));
    const result = mapStudentSummary({
      grades, attendance: [], pendingAssignmentsCount: 0,
      upcomingEventsCount: 0, unreadAnnouncementsCount: 0, subjectNames,
    });
    expect(result.recentGrades).toHaveLength(5);
  });
});
```

(Update the existing import line at the top of the test file to add `mapStudentSummary`.)

- [ ] **Step 2: Run, expect fail**

Run: `pnpm exec vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: FAIL — `mapStudentSummary is not a function`.

- [ ] **Step 3: Implement** (append to `dashboardToday.ts`)

```ts
export type StudentGradeRow = {
  id: number;
  subjectId: number;
  value: string | number;
  type: string;
  date: string;
  description: string | null;
  createdAt: string;
};
export type StudentRecentGrade = {
  id: number;
  subjectId: number;
  value: number;
  type: string;
  date: string;
  description: string | null;
  subjectName: string;
  createdAt: string;
};

export function mapStudentSummary(args: {
  grades: StudentGradeRow[];
  attendance: { status: string }[];
  pendingAssignmentsCount: number;
  upcomingEventsCount: number;
  unreadAnnouncementsCount: number;
  subjectNames: Map<number, string>;
}): {
  role: "student";
  gradeAverage: number | null;
  totalGrades: number;
  attendancePercentage: number | null;
  pendingAssignments: number;
  upcomingEvents: number;
  unreadAnnouncements: number;
  recentGrades: StudentRecentGrade[];
} {
  const {
    grades,
    attendance,
    pendingAssignmentsCount,
    upcomingEventsCount,
    unreadAnnouncementsCount,
    subjectNames,
  } = args;

  const values = grades.map((g) => parseFloat(String(g.value)));
  const gradeAverage =
    values.length > 0
      ? Math.round((values.reduce((s, v) => s + v, 0) / values.length) * 100) /
        100
      : null;

  const presenti = attendance.filter((a) => a.status === "presente").length;
  const attendancePercentage =
    attendance.length > 0
      ? Math.round((presenti / attendance.length) * 100)
      : null;

  const recentGrades: StudentRecentGrade[] = [...grades]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)
    .map((g) => ({
      id: g.id,
      subjectId: g.subjectId,
      value: parseFloat(String(g.value)),
      type: g.type,
      date: g.date,
      description: g.description,
      subjectName: subjectNames.get(g.subjectId) ?? "Unknown",
      createdAt: g.createdAt,
    }));

  return {
    role: "student",
    gradeAverage,
    totalGrades: grades.length,
    attendancePercentage,
    pendingAssignments: pendingAssignmentsCount,
    upcomingEvents: upcomingEventsCount,
    unreadAnnouncements: unreadAnnouncementsCount,
    recentGrades,
  };
}
```

- [ ] **Step 4: Run, expect pass**

Run: `pnpm exec vitest run artifacts/api-server/src/routes/dashboardToday.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add artifacts/api-server/src/routes/dashboardToday.ts artifacts/api-server/src/routes/dashboardToday.test.ts
git commit -m "$(cat <<'EOF'
feat(api): mapStudentSummary pure helper for dashboard student summary

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: dashboard route — consume helper + remove redundant dynamic imports

**Files:**
- Modify: `artifacts/api-server/src/routes/dashboard.ts`

**Interfaces:**
- Consumes: `mapStudentSummary` from `./dashboardToday`.

- [ ] **Step 1: Import the helper**

Change the existing import:

```ts
import { mapTeacherToday, mapStaffToday } from "./dashboardToday";
```

to:

```ts
import {
  mapTeacherToday,
  mapStaffToday,
  mapStudentSummary,
} from "./dashboardToday";
```

- [ ] **Step 2: Remove the redundant dynamic imports in the staff branch**

Replace:

```ts
      const allUsers = await db.select().from(
        (await import("@workspace/db")).usersTable
      );
      const pendingJust = await db
        .select()
        .from((await import("@workspace/db")).justificationsTable);
```

with:

```ts
      const allUsers = await db.select().from(usersTable);
      const pendingJust = await db.select().from(justificationsTable);
```

- [ ] **Step 3: Replace the student branch body with the helper**

Replace everything from `// Default: student view (existing logic)` down to the `res.json({ role: "student", … recentGrades });` block with:

```ts
    // Default: student view
    const grades = await db
      .select()
      .from(gradesTable)
      .where(eq(gradesTable.studentId, user.id));
    const attendance = await db
      .select()
      .from(attendanceTable)
      .where(eq(attendanceTable.studentId, user.id));
    const pendingAssignments = await db
      .select()
      .from(assignmentsTable)
      .where(gte(assignmentsTable.dueDate, today));
    const upcomingEvents = await db
      .select()
      .from(eventsTable)
      .where(gte(eventsTable.startDate, today));
    const allAnnouncements = await db.select().from(announcementsTable);
    const subjects = await db.select().from(subjectsTable);
    const subjectMap = new Map(subjects.map((s) => [s.id, s.name]));

    res.json(
      mapStudentSummary({
        grades: grades.map((g) => ({
          id: g.id,
          subjectId: g.subjectId,
          value: g.value,
          type: g.type,
          date: g.date,
          description: g.description,
          createdAt: g.createdAt.toISOString(),
        })),
        attendance,
        pendingAssignmentsCount: pendingAssignments.length,
        upcomingEventsCount: upcomingEvents.length,
        unreadAnnouncementsCount: allAnnouncements.length,
        subjectNames: subjectMap,
      }),
    );
```

- [ ] **Step 4: Remove the redundant dynamic import in `/upcoming`**

Replace:

```ts
    const { classesTable } = await import("@workspace/db");
    const classes = await db.select().from(classesTable);
```

with:

```ts
    const classes = await db.select().from(classesTable);
```

(`classesTable` is already imported at the top of the file.)

- [ ] **Step 5: Gate**

Run: `pnpm run typecheck && pnpm exec eslint artifacts/api-server/src/routes/dashboard.ts && pnpm test`
Expected: all PASS (typecheck confirms no remaining references to a locally-imported `classesTable`; helper response shape compiles).

- [ ] **Step 6: Commit**

```bash
git add artifacts/api-server/src/routes/dashboard.ts
git commit -m "$(cat <<'EOF'
refactor(api): dashboard — use mapStudentSummary, drop redundant runtime imports

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: Dashboard.tsx (student) — error state

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/Dashboard.tsx`

- [ ] **Step 1: Read `isError` from the hook**

Change:

```ts
  const { data: summary, isLoading } = useGetDashboardSummary();
```

to:

```ts
  const { data: summary, isLoading, isError } = useGetDashboardSummary();
```

- [ ] **Step 2: Render an error state**

Immediately after the `if (isLoading) { … }` block (before the `const container` declaration), add:

```tsx
  if (isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
        </div>
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          Non è stato possibile caricare il riepilogo. Riprova più tardi.
        </div>
      </div>
    );
  }
```

- [ ] **Step 3: Gate**

Run: `pnpm exec prettier --write artifacts/fauser-platform/src/pages/Dashboard.tsx && pnpm run typecheck && pnpm exec eslint artifacts/fauser-platform/src/pages/Dashboard.tsx && pnpm test`
Expected: all PASS.

- [ ] **Step 4: Commit**

```bash
git add artifacts/fauser-platform/src/pages/Dashboard.tsx
git commit -m "$(cat <<'EOF'
fix(web): Dashboard — surface a load error instead of silent zeros

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: TeacherDashboard.tsx — error state + typed rows

**Files:**
- Modify: `artifacts/fauser-platform/src/pages/TeacherDashboard.tsx`

- [ ] **Step 1: Read `isError` from the list hooks and add local row types**

Change:

```ts
  const { data: assignments = [] } = useListAssignments();
  const { data: classes = [] } = useListClasses();
```

to:

```ts
  const { data: assignments = [], isError: assignmentsError } =
    useListAssignments();
  const { data: classes = [], isError: classesError } = useListClasses();
```

Add, above the component, local row interfaces to replace the `any` casts:

```ts
interface TeacherClass {
  id: number;
  name?: string | null;
  anno?: number;
  sezione?: string | null;
  teacherId?: number;
}
interface TeacherAssignment {
  id: number;
  dueDate: string;
}
```

- [ ] **Step 2: Replace the `as any` filters with typed callbacks**

Change:

```ts
  const myClasses = classes.filter((c: any) => c.teacherId === me?.id);
  const pending = assignments.filter((a: any) => new Date(a.dueDate) >= new Date()).length;
```

to:

```ts
  const myClasses = (classes as TeacherClass[]).filter(
    (c) => c.teacherId === me?.id,
  );
  const pending = (assignments as TeacherAssignment[]).filter(
    (a) => new Date(a.dueDate) >= new Date(),
  ).length;
```

And the `.map((c: any) => …)` in the "Le mie classi" list:

```tsx
                {myClasses.slice(0, 4).map((c) => (
                  <li key={c.id}>{c.name || `${c.anno}${c.sezione}`}</li>
                ))}
```

- [ ] **Step 3: Add a soft error banner**

Right after `<OggiFeed />` in the returned JSX, add:

```tsx
      {(assignmentsError || classesError) && (
        <div className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
          Alcuni dati del riepilogo non sono stati caricati. Riprova più tardi.
        </div>
      )}
```

- [ ] **Step 4: Gate**

Run: `pnpm exec prettier --write artifacts/fauser-platform/src/pages/TeacherDashboard.tsx && pnpm run typecheck && pnpm exec eslint artifacts/fauser-platform/src/pages/TeacherDashboard.tsx && pnpm test`
Expected: all PASS. If a generated list type conflicts with the local interface cast, keep the cast minimal (`as unknown as TeacherClass[]`) only where typecheck requires it.

- [ ] **Step 5: Commit**

```bash
git add artifacts/fauser-platform/src/pages/TeacherDashboard.tsx
git commit -m "$(cat <<'EOF'
fix(web): TeacherDashboard — surface load errors, typed class/assignment rows

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: Full gate, live smoke test, finish

**Files:** none.

- [ ] **Step 1: Full gate**

Run: `pnpm run lint && pnpm run typecheck && pnpm test && pnpm run build`
Expected: green (only the pre-existing internalMail WIP lint errors remain, not in committed code).

- [ ] **Step 2: Live smoke test**

Ensure embedded DB is up. Start the built API (`node artifacts/api-server/dist/index.mjs` with dev env). Verify:
- `GET /api/dashboard/summary` → 200 (role-shaped object; `recentGrades` present for a student dev user, or staff/teacher shape otherwise).
- `GET /api/dashboard/today` → 200.
- `GET /api/dashboard/upcoming` → 200 `{ assignments, events }`.
Confirm no 500s. Stop the ad-hoc API afterward.

- [ ] **Step 3: Finish**

Merge the feature branch into `new`, verify tests on the merge, delete the branch, `git push origin new`.

---

## Self-Review

**Spec coverage:** #1 Dashboard error state → Task 3; #2 redundant dynamic imports → Task 2; #3 TeacherDashboard errors + `as any` → Task 4; #4 untested summary logic → Task 1. ✅

**Placeholder scan:** all code steps complete. ✅

**Type consistency:** `mapStudentSummary` signature + `StudentGradeRow`/`StudentRecentGrade` consistent between Task 1 (definition) and Task 2 (route maps grade rows to `StudentGradeRow` shape: `value`, `date`, `description`, `createdAt` ISO string). Response field names unchanged for the frontend. ✅
