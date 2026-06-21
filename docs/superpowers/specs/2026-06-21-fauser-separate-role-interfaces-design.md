# Fauser-Edu — Separate Role Interfaces (Student / Teacher / Segreteria / Admin)

**Date:** 2026-06-21  
**Status:** Design accepted by user. Proceeding to implementation plan + step-by-step build.

## 1. Goals

- Transform the platform from a single shared UI into **four distinct professional "operating system" experiences**:
  - **Student**: Personal academic workspace
  - **Teacher (Professore)**: Teaching & class management cockpit
  - **Segreteria**: Dedicated operational school management interface
  - **Admin / Tecnici**: Keep and own the existing Admin section for technical and high-privilege operations
- Achieve **full immersion**: after login the user lands in an environment that feels like *their* tool, not a generic app with tabs.
- Reuse as much existing functionality as possible (many rich pages already exist).
- Maintain single SPA + single codebase for maintainability.

## 2. Role Model

Current: `student | teacher | admin`

New enum:
- `student`
- `teacher`
- `segreteria`
- `admin` (reserved for Tecnici)

**Rules**:
- New users default to `student` (unchanged).
- Role is set/updated only via privileged flows (Admin or future Segreteria user management).
- Authorization is **server-authoritative** (DB role). Frontend uses it for UI only.

## 3. Architecture: Role-Driven Multi-Shell (Chosen Approach)

**Decision**: Use **Approach 1** (Role-Driven Multi-Shell) inside one SPA.

### How it works
- After authentication, call `useGetMe()` (or equivalent) to get the current user's `role`.
- A top-level `RoleWorkspace` component mounts one of four shells:
  - `StudentShell`
  - `TeacherShell`
  - `SegreteriaShell`
  - `AdminShell`
- Each shell provides:
  - Its own `Layout` (sidebar + header + main area)
  - Its own navigation items
  - Its own default home route
- Shared UI primitives (`@components/ui`, API client, etc.) are reused.
- Pages can be:
  - Role-specific (e.g. dedicated dashboards)
  - Shared with strong `<RoleGuard role="...">` wrappers
- Routing stays with wouter. Each shell can define its own route map or use a central one with guards.

### Login / Landing flow
1. User signs in (Clerk).
2. `ProtectedRoute` renders `RoleWorkspace`.
3. `RoleWorkspace` fetches `/me`, reads `role`.
4. Redirects to the role's primary home (or renders the shell directly).
5. Deep links are protected by guards.

### Benefits
- Strong separation of experience without code duplication.
- Incremental rollout possible.
- Easy to add more roles later.

## 4. Interface Design per Role (High Level)

### Student Shell
- **Home**: Current `/dashboard` (personal stats: voti, presenze, scadenze, eventi)
- **Nav** (student-focused):
  - Dashboard, Registro, Orario, Diario, Quiz, Portfolio, Giustificazioni, Colloqui, Libreria, Messaggi, Sondaggi, Certificati, Profilo
- **Tone**: "Il mio percorso scolastico"

### Teacher Shell
- **Home**: New or repurposed Teacher Dashboard showing:
  - Today's classes
  - Pending grades/assignments
  - Upcoming colloqui
  - Class announcements to send
- **Nav**:
  - Dashboard, Registro, Assegnazioni, Quiz, Materiali, Orario, Colloqui, Note Comportamento, Competenze, Comunicazioni, Forum, Uscite
- **Tone**: "Le mie classi e la didattica"

### Segreteria Shell (new dedicated interface)
- **Home**: Segreteria Dashboard
  - Pending approvals (giustificazioni, field trips)
  - Open certificates requests
  - Key stats (enrollment, attendance overview)
  - Recent activity
- **Nav** (operational focus):
  - Dashboard
  - Utenti & Classi
  - Orario Globale
  - Aule
  - Certificati
  - Giustificazioni (approval view)
  - Uscite Didattiche
  - Sondaggi (school-wide)
  - Comunicazioni Istituzionali
  - Analytics
  - Rooms
- **Tone**: "Gestione operativa della scuola"

### Admin / Tecnici Shell
- Reuses and owns the existing `/admin` route and page.
- Becomes the landing for `role === "admin"`.
- Can be expanded later with more technical tools.
- **Nav**: Current admin features + any high-privilege items.

## 5. Technical Changes

### Backend
- Extend `users.role` enum in:
  - `lib/db/src/schema/users.ts`
  - `lib/api-spec/openapi.yaml`
- Regenerate `lib/api-zod` and `lib/api-client-react` (or hand-maintain generated for now).
- Make `/api/dashboard/summary` (or add `/api/me/dashboard`) role-aware. Return different payloads or have separate endpoints.
- Strengthen `requireAuth` + add `requireRole` helper in routes.
- Update `getOrCreateUser` remains default "student".
- Existing role checks in grades, attendance, quizzes, etc. stay and will be augmented for "segreteria" where appropriate (most management pages should allow segreteria + admin).

### Frontend
- New folder structure suggestion:
  ```
  src/
    shells/
      StudentShell.tsx
      TeacherShell.tsx
      SegreteriaShell.tsx
      AdminShell.tsx
    components/
      layout/
        AppLayout.tsx          # keep as base or deprecate
        RoleWorkspace.tsx
        StudentLayout.tsx
        ...
  ```
- Major change in `App.tsx`:
  - Inside `ProtectedRoute`, instead of always `<AppLayout>`, render `<RoleWorkspace><Component /></RoleWorkspace>` or let each shell wrap its children.
- Create a `RoleGuard` component.
- Implement role-specific `navItems` arrays.
- Create dedicated dashboard pages:
  - Keep `Dashboard.tsx` for students.
  - Add `TeacherDashboard.tsx`
  - Add `SegreteriaDashboard.tsx`
- Update existing pages to use `<RoleGuard>` where needed.
- Update post-login redirect logic (`HomeRedirect`).

### Shared
- Keep using Clerk for auth.
- Role lives in the local `users` table (synced on login via getOrCreateUser + Admin flows).
- All sensitive actions remain server-side protected.

## 6. Migration & Phasing

Recommended implementation order (step-by-step):
1. Role model extension (schema + API + types).
2. Backend role helpers + dashboard adaptation.
3. Core routing + `RoleWorkspace` + basic shells (nav switching).
4. Student shell (preserve current experience).
5. Admin shell (map `admin` role to current Admin page).
6. Teacher shell + TeacherDashboard.
7. Segreteria shell + SegreteriaDashboard + curate management pages under it.
8. Add guards, polish redirects, test all roles.
9. Full verification (typecheck, lint, test, build).

## 7. Non-goals for this initiative
- Complete rewrite of every page.
- Separate codebases or micro-frontends.
- Visual redesign beyond what is needed for role separation.
- Changing Clerk user model (role stays in DB for now).

## 8. Acceptance Criteria
- A user with `role=student` sees only the student experience and lands on student home.
- A user with `role=teacher` sees only teacher tools and a relevant home.
- A user with `role=segreteria` gets a clean dedicated management interface.
- A user with `role=admin` lands in the Admin section.
- No role can see navigation items or data they shouldn't (UI + API).
- Existing functionality for each role continues to work.
- All quality gates (typecheck, lint, test, build) pass.

## 9. Open Decisions (to be resolved during implementation)
- Exact URLs for role homes (e.g. keep `/dashboard` smart or introduce `/teacher`, `/segreteria`).
- How much to customize visual identity per shell (subtle accents vs identical).
- Whether Segreteria gets write access to certain entities currently only for admin.

This design was reviewed and accepted in conversation. Implementation proceeds step by step following this spec.
