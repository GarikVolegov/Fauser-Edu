# Fauser-Edu — Stabilizzazione feature-by-feature: Sub-progetto 3, Dashboard / Oggi

**Data:** 2026-06-22
**Stato:** Approvato (design)
**Strategia:** feature-by-feature (vedi sub-progetti 1-2).
**Area:** Dashboard studente (`/dashboard`), TeacherDashboard, feed Oggi, route
`/api/dashboard`. Esclusa `SegreteriaDashboard` (intrecciata col WIP internalMail).

## 1. Stato dell'area
Più sana delle precedenti: usa hook Orval generati (niente fetch grezzi) e il
feed Oggi ha già stati loading/errore/vuoto. I problemi sono minori ma reali.

| # | Gravità | Problema | Dove |
|---|---------|----------|------|
| 1 | Medio | Dashboard studente: solo `isLoading`, nessuno stato d'errore → summary fallito mostra "-/0" come fosse vuoto | Dashboard.tsx:29 |
| 2 | Medio | Import dinamici ridondanti `await import("@workspace/db")` per tabelle già importate in cima | dashboard.ts:52-57, 145 |
| 3 | Basso | TeacherDashboard senza stati d'errore + `as any` su classes/assignments | TeacherDashboard.tsx:17-18 |
| 4 | Info | La logica numerica del summary studente (media, % presenze, recentGrades) non è testata | dashboard.ts:70-123 |

## 2. Design
Riusa il pattern degli helper puri già presenti in `dashboardToday.ts`
(`mapTeacherToday`, `mapStaffToday`).

### Backend
- **`mapStudentSummary`** (nuovo helper puro in `dashboardToday.ts`): calcola
  `gradeAverage` (arrotondata a 2 decimali), `attendancePercentage`,
  `recentGrades` (ultimi 5, valore numerico, subjectName), e i conteggi. Pure,
  DB-free, testato. La route `/summary` (ramo studente) lo consuma.
- **Pulizia import dinamici**: rimpiazzo i tre `await import("@workspace/db")`
  con le import già presenti in cima (`usersTable`, `justificationsTable`,
  `classesTable`).

### Frontend
- **Dashboard studente**: stato d'errore visibile quando `useGetDashboardSummary`
  fallisce (invece dei "-/0" silenziosi).
- **TeacherDashboard**: stato d'errore sulle liste + tipi al posto di `as any`.

### Test
`mapStudentSummary` — helper puro (stile codebase, no DB/jsdom). 404/IDOR non si
applicano (summary già self-scoped su `user.id`).

## 3. Definizione di "fatto"
lint + typecheck + test verdi; build ok; smoke test live (`/dashboard/summary`,
`/dashboard/today` → 200, niente 500); merge in `new` + push.

## 4. Fuori scope
SegreteriaDashboard (WIP), le altre pagine, il tracking reale "annunci non letti"
(oggi conta tutti gli annunci — modello senza stato di lettura, invariato).
