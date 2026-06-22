# Fauser-Edu — Stabilizzazione feature-by-feature: Sub-progetto 2, Giustificazioni + Colloqui

**Data:** 2026-06-22
**Stato:** Approvato (design) — procede a spec/piano/implementazione
**Strategia:** feature-by-feature (vedi sub-progetto 1, Registro).
**Area:** Giustificazioni (`/giustificazioni`, `/api/justifications`) + Colloqui
(`/colloqui`, `/api/appointments`). Scelta perché auto-contenuta e **non
intrecciata col WIP `internalMail`** (Messaggi/Email e SegreteriaDashboard lo sono).

## 1. Problemi rilevati (con evidenza)

| # | Gravità | Problema | Dove |
|---|---------|----------|------|
| 1 | Alto | IDOR lettura: studente con `?studentId=<altro>` legge dati altrui | justifications.ts:52, appointments.ts:50 |
| 2 | Alto | Bug funzionale: studente che annulla la propria richiesta → 403 (PATCH richiede ruolo staff, ma il bottone è mostrato agli studenti) | appointments.ts:135 vs Colloqui.tsx:390 |
| 3 | Medio | PATCH su id inesistente → 500 (record `undefined` → enrich crasha); nessuna guardia NaN | entrambe le PATCH |
| 4 | Medio | Leak privacy: la disponibilità slot fa ricevere allo studente nome+note di altri studenti | Colloqui.tsx:67-79 |
| 5 | Medio | Errori silenziosi (`if(!r.ok) return []`) + mutation senza `onError`; fetch grezzo | entrambe le pagine |

## 2. Design

Riusa i primitivi del sub-progetto 1: `apiFetch`/`useApi`, `parseId`,
`resolveStudentScope`, error-handler globale, `ErrorBoundary` (già montato).

### Backend
- **IDOR (justifications)**: GET `/` usa `resolveStudentScope(user, requestedStudentId)`
  — studente→solo i propri; staff→filtrabile.
- **IDOR (appointments)**: GET `/` scopa per ruolo — studente→`studentId=self`,
  teacher→`teacherId=self` (con filtro studente opzionale), segreteria/admin→tutto
  con filtri opzionali.
- **Bug #2 (cancel)**: PATCH appointments passa a `requireAuth` + helper puro
  `canSetAppointmentStatus(user, appointment, status)`: staff → confirmed|cancelled;
  studente → solo `cancelled` e solo sul **proprio** colloquio. Niente più 403 sul
  bottone "Annulla richiesta".
- **404 + NaN** su entrambe le PATCH: `parseId` → 400 se non numerico; fetch del
  record prima dell'enrich → 404 se assente.
- **Ownership in POST**: studente può creare colloquio/giustificazione solo per sé
  (justifications POST lo fa già; appointments POST aggiunge il check).
- **Slot senza PII**: nuovo `GET /api/appointments/availability?teacherId&date` →
  `{ occupied: string[] }` (solo gli slot non-cancellati, nessun nome/nota).
  Nessun codegen: queste route usano fetch manuale, non hook Orval.

### Frontend (Colloqui.tsx, Giustificazioni.tsx)
- Tutte le query/mutation passano per `useApi`: niente `return []` ciechi; gli
  errori emergono (stato d'errore in lista) e ogni mutation ha `onError` con toast.
- La prenotazione usa `/api/appointments/availability` per gli slot occupati.

### Test (logica pura, stile codebase — niente DB/jsdom)
- `canSetAppointmentStatus` — helper puro, copre il fix #2 e l'ownership.
- `resolveStudentScope` già coperto (sub-progetto 1); `parseId` già coperto.

## 3. Definizione di "fatto"
lint + typecheck + test verdi; build ok; smoke test live degli endpoint
(404 JSON, scope, availability) come nel sub-progetto 1; merge in `new` + push.

## 4. Fuori scope
Messaggi/Email + SegreteriaDashboard (bloccati dal WIP internalMail), le altre
pagine, e l'eventuale notifica allo studente sull'annullamento da parte sua.
