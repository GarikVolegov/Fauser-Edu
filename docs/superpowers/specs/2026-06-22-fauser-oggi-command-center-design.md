# Fauser-Edu — "Oggi" Command Center (Role-Aware Actionable Dashboard Header)

**Date:** 2026-06-22
**Status:** Design accepted by user. Proceeding to implementation plan.
**Roadmap position:** Optimization #1 of 4 (next: Early-warning risk → Automation → PCTO/scrutini). This feature is the shell the others plug into.

## 1. Goals

- Turn the current dashboards from **navigation grids + counters** into an **actionable daily command center** ("Oggi").
- One role-aware `OggiFeed` that renders the right content for `student | teacher | segreteria | admin`, built as a single component (per user decision: all three staff roles together from v1).
- Each role surfaces **3–4 high-value actionable items**, each with a CTA that *performs* the action (deep-link into the relevant page), not just navigates.
- Add value **without removing anything**: the feed becomes the dashboard header; existing link/counter grids drop below, unchanged.
- Reuse existing data and follow the contract-first pattern (OpenAPI → Orval codegen → typed hooks).

## 2. Non-goals (YAGNI)

- **Command palette (⌘K)** — deferred to a later increment. v1 is entirely the actionable feed (~90% of the value).
- **Automatic parent notifications** — belongs to optimization #3 (Automation), not here.
- No refactor of the large `Registro.tsx` (42KB) beyond wiring it to read a deep-link query param.
- No visual redesign beyond the new header section; keep navy+gold, dense layout.
- No changes to the student dashboard data path (`/api/dashboard/summary` stays as-is).

## 3. Placement & Layout (chosen approach)

**Decision:** Feed in testa, griglie sotto. `OggiFeed` becomes the **header** of the dashboard; the existing per-role grids ([TeacherDashboard.tsx](../../../artifacts/fauser-platform/src/pages/TeacherDashboard.tsx), [SegreteriaDashboard.tsx](../../../artifacts/fauser-platform/src/pages/SegreteriaDashboard.tsx)) render below it, unchanged.

- Reuse the existing role-switch in [Dashboard.tsx](../../../artifacts/fauser-platform/src/pages/Dashboard.tsx): `me.role` decides which `OggiFeed` variant mounts; the existing dashboard body stays under it.
- Header row: greeting + today's date in Italian (`"Oggi, sabato 22 giugno"`, `date-fns` + `it` locale, already used).
- Body: a queue of **actionable cards**, each with a title, a synthetic figure, and a CTA button.

## 4. Content per role (v1)

Each item lists: source data → CTA target. Exact field availability is confirmed against the DB schema during planning.

### Teacher
1. **Lezioni di oggi** — from `schedule` (filtered to the teacher, today's weekday). Each row: ora, classe, aula, and a badge **"appello fatto / da fare"** derived from whether `attendance` rows exist for that class+date. CTA **"Fai l'appello"** → `/registro?classId=<id>&tab=presenze`. *(Primary/killer item.)*
2. **Compiti in scadenza / da valutare** — from `assignments` (teacher's, `dueDate >= today`). CTA → `/registro` (or `/classroom`).
3. **Prossimo colloquio** — from `appointments` (teacher's next upcoming). CTA → `/colloqui`.

### Segreteria
1. **Giustificazioni in sospeso** — from `justifications` (pending). Short list with inline CTA **"Approva"** (reuses the existing review action used in [Giustificazioni.tsx](../../../artifacts/fauser-platform/src/pages/Giustificazioni.tsx)). CTA fallback → `/giustificazioni`.
2. **Assenze di oggi** — from `attendance` (status `assente`, today). CTA → `/giustificazioni` / management.
3. **Aule di oggi / conflitti** — from `rooms` + `schedule`. CTA → `/aule`.

### Admin
- Compact variant: **school-wide pending totals** (justifications + other pending) + shortcut to `/admin`. Deliberately light to avoid duplicating the Admin panel.

### Student
- Out of scope for this feature's new feed (student already has a rich `/dashboard` via `/summary`). Student dashboard is left untouched.

## 5. Backend

**New additive endpoint:** `GET /api/dashboard/today` in [dashboard.ts](../../../artifacts/api-server/src/routes/dashboard.ts), role-aware, returning **actionable lists** (not just counts). Existing `/summary` and `/upcoming` are left intact.

Response shape (role-aware, named `$ref` schemas in the spec):
- Common: `{ role, date }`.
- Teacher: `todayLessons: [{ scheduleId, classId, className, subjectName, startTime, endTime, room, attendanceTaken: boolean }]`, `assignmentsDue: [{ id, title, className, dueDate }]`, `nextAppointment: { id, when, with } | null`.
- Segreteria/Admin: `pendingJustifications: [{ id, studentName, className, date, reason }]`, `todayAbsences: [{ studentId, studentName, className }]`, `roomsToday: [{ roomId, name, slots, conflict: boolean }]`, `pendingTotal: number`.

Each item carries the IDs needed to build a deep-link client-side.

**Contract-first steps:**
1. Edit `lib/api-spec/openapi.yaml`: add path `/api/dashboard/today` + named response component schemas (avoid the Orval `{OperationId}Body` naming pitfall noted in `replit.md`).
2. `pnpm --filter @workspace/api-spec run codegen` → generates `useGetDashboardToday` + Zod schemas.
3. Implement the route handler; serialize `numeric` grade-like values via `parseFloat(String(...))` where relevant (per repo convention).
4. Authorization: reuse `requireAuth` + the role check pattern already in `dashboard.ts` (`user.role` branch); staff data must be server-authoritative.

## 6. Deep-link targets

CTAs navigate to existing pages with query params, e.g. `/registro?classId=3&tab=presenze`. Reading the param on the destination page is implementation work, starting with **Registro** (parse `classId`/`tab` from the URL and preselect). No other Registro refactor.

## 7. Frontend components

- `OggiFeed.tsx` (role switch) → `OggiTeacher.tsx`, `OggiSegreteria.tsx`, `OggiAdmin.tsx`, sharing a small `OggiCard` primitive (title, figure, CTA, badge).
- Mounted at the top of the dashboard body in `Dashboard.tsx` / the role dashboards, above the existing grids.
- Data via the generated `useGetDashboardToday` hook (or `useQuery` + `getToken()` fallback if the generated hook lags, per repo convention).

## 8. States: loading / empty / error

- **Loading:** skeletons (reuse the `Skeleton` pattern already in `Dashboard.tsx`).
- **Empty (per card):** encouraging copy — e.g. "Nessuna lezione oggi 🎉", "Nessuna giustificazione in sospeso".
- **Error:** a single card degrades gracefully (inline error state); the rest of the dashboard keeps working. Endpoint returns `500` with the existing `{ error }` shape and `req.log.error`.

## 9. Testing (TDD)

- **Backend:** vitest integration tests on `/api/dashboard/today` per role (teacher / segreteria / admin), asserting shape and role gating — following the [auth.test.ts](../../../artifacts/api-server/src/routes/auth.test.ts) pattern.
- **Frontend:** component tests on `OggiFeed` role-aware rendering and empty states.

## 10. Implementation phasing

1. OpenAPI spec: add `/api/dashboard/today` + named schemas; run codegen.
2. Backend handler (teacher branch first) + tests.
3. Backend handler (segreteria/admin branches) + tests.
4. `OggiCard` primitive + `OggiTeacher` wired to the hook; mount above teacher grid.
5. `OggiSegreteria` + `OggiAdmin`.
6. Registro deep-link param reading (`classId`/`tab`).
7. Empty/error/loading polish.
8. Full gates: typecheck, lint, test, build.

## 11. Acceptance criteria

- A teacher's dashboard shows today's lessons with a working **"Fai l'appello"** CTA that lands on the correct class in Registro Presenze.
- Segreteria sees pending justifications with a working inline approve (or deep-link), today's absences, and today's rooms.
- Admin sees a compact pending overview + Admin shortcut.
- The existing dashboard grids/counters remain visible below the feed, unchanged.
- Empty/loading/error states behave as specified; a failing card does not break the page.
- Student experience is unchanged.
- All quality gates pass (typecheck, lint, test, build).

## 12. Open decisions (resolve during planning)

- Exact `schedule` shape for "today's lessons" (weekday mapping, time slots) — confirm against `lib/db` schema.
- Whether inline "Approva" reuses the justification review mutation directly or just deep-links for v1.
- Exact room-conflict definition for the segreteria "Aule di oggi" card.

This design was reviewed and accepted in conversation. Implementation proceeds per this spec.
