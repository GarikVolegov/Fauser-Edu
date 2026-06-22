# Fauser-Edu — Stabilizzazione "feature-by-feature": Sub-progetto 1, Registro solido

**Data:** 2026-06-22
**Stato:** Approvato (design) — in attesa di review della spec scritta
**Strategia complessiva scelta:** feature-by-feature (un'area chiusa a fondo per volta)
**Prima area:** Registro elettronico (voti + presenze + note) — apripista per gli
strumenti condivisi di robustezza, riusati dalle aree successive.

---

## 1. Contesto e problema

La piattaforma compila, builda e i 19 test passano, ma l'utente la percepisce
instabile ("si bugga, non ha una base solida"). L'audit ha mostrato che il
problema **non è la compilazione** ma la **robustezza a runtime** e le
**fondamenta sottili**.

Findings trasversali dell'audit (riferimento per i sub-progetti futuri):

| # | Gravità | Problema | Evidenza |
|---|---------|----------|----------|
| 1 | Critico | Nessun `ErrorBoundary` React | grep su tutto `src` → 0 |
| 2 | Alto | 35 `return r.json()` senza check `r.ok` nelle query GET | `pages/*.tsx` |
| 3 | Alto | Nessun error-handler globale Express | grep `err, req, res, next` → 0 |
| 4 | Medio-alto | Data layer incoerente (Orval + `fetch()` grezzo con `getToken()` duplicato) | ~16 pagine |
| 5 | Medio | Copertura test sottile: 19 test / 7 file per 33 route + 26 pagine | `git ls-files` |
| 6 | Basso (CI rossa) | 2 errori di lint | es. `no-empty` Messaggi.tsx:670 |
| 7 | Da decidere | Feature `internalMail` non committata e a metà | diff su 5 file |

Questo sub-progetto chiude il punto 1, 2, 3 (in forma di **strumenti condivisi**
introdotti qui e riusati dopo) e applica i fix specifici dell'area Registro.
I punti 5/6/7 e le altre 25 pagine restano per i sub-progetti successivi
(vedi §8 Fuori scope).

## 2. Bug specifici trovati nell'area Registro

### 2.1 🔒 IDOR — uno studente legge i dati di un altro (Alto / sicurezza)
In `routes/grades.ts:67` e `routes/attendance.ts:63`, il filtro su `user.id`
scatta **solo** se lo studente non passa `?studentId=`. Uno studente che passa
`?studentId=<altro>` ottiene voti/presenze altrui. Vale anche per `/summary`.

**Atteso:** uno studente vede **solo i propri** dati; qualunque `studentId`
diverso dal proprio viene ignorato/forzato. teacher/segreteria/admin possono
filtrare per `studentId`.

### 2.2 PATCH/DELETE su id inesistente → 500 invece di 404 (Medio)
`routes/grades.ts:149` (e `attendance.ts:119`): `db.update().returning()` su id
inesistente restituisce `[]`, quindi `grade` è `undefined` e `grade.subjectId`
lancia → 500. **Atteso:** 404 pulito.

### 2.3 `parseInt(req.params.id)` senza guardia NaN (Basso)
Un id non numerico produce `NaN` e una query inutile. **Atteso:** 400.

### 2.4 Frontend `Registro.tsx`
- `behaviorNotes` query: `if (!r.ok) return []` nasconde gli errori
  (`Registro.tsx:118`) → mostra "Nessuna nota" anche su 500.
- Tab switch tramite hack DOM `document.querySelector('[value="presenze"]')
  .click()` (`Registro.tsx:258`) invece di stato React controllato.
- `createNote` mutation senza `onError` → fallimento silenzioso.
- `as any` diffusi (users/classes/students/mutation payloads).

## 3. Architettura — strumenti condivisi (Sezione A)

Tre unità isolate, ognuna con uno scopo unico e un'interfaccia chiara.

### 3.1 `ErrorBoundary` (frontend)
- File: `artifacts/fauser-platform/src/components/ErrorBoundary.tsx`
- Class component React con `getDerivedStateFromError` + `componentDidCatch`
  (logga in console; in dev mostra il messaggio, in prod un fallback gentile).
- Fallback UI: card "Qualcosa è andato storto" + pulsante "Riprova" che resetta
  lo stato (`key` reset) e, opzionalmente, ricarica la route.
- Uso: uno a livello app (in `App.tsx`, attorno al router) e uno per-route
  attorno a `<Suspense>` così che il crash di una pagina non abbatta la shell.
- Dipendenze: nessuna oltre React.

### 3.2 `apiFetch` helper (frontend)
- File: `artifacts/fauser-platform/src/lib/api.ts`
- Firma: `apiFetch<T>(path, { token, method?, body?, signal? }): Promise<T>`
  (più un piccolo hook `useApi()` che incapsula `getToken()` di Clerk, così le
  pagine non ripetono il recupero del token).
- Comportamento: imposta `Authorization`/`Content-Type`, serializza il body,
  **controlla `r.ok`**; se non ok, estrae `{ error }` dal body e **lancia**
  `ApiError` (con `status` e `message`); se ok, ritorna `r.json()` tipizzato.
  Gestisce `204 No Content` → `undefined`.
- Sostituisce il `fetch()` grezzo: in questo sub-progetto viene applicato **alle
  chiamate manuali di `Registro.tsx`**; le altre pagine migrano nei sub-progetti
  delle rispettive aree.
- Dipendenze: `@clerk/react` (solo nell'hook).

### 3.3 Error-handler globale + 404 (backend)
- File: `artifacts/api-server/src/middlewares/errorHandler.ts` (+ `notFound.ts`)
- `notFoundHandler`: per route `/api/*` non trovate → 404 JSON `{ error }`.
- `errorHandler(err, req, res, next)`: logga via `req.log`, risponde con forma
  coerente `{ error }` e status appropriato (default 500). Montato **dopo** il
  router in `app.ts`. Express 5 inoltra automaticamente i reject async degli
  handler `async`.
- Le route mantengono i loro try/catch espliciti dove già presenti; il global
  handler è la rete di sicurezza per ciò che sfugge.

## 4. Fix backend Registro (Sezione B)

- `grades.ts` e `attendance.ts`, GET `/` e `/summary`: introdurre un helper di
  scoping `resolveStudentScope(user, requestedStudentId)` che ritorna lo
  studentId effettivo applicando la regola di sicurezza (studente → sé stesso).
- `grades.ts`/`attendance.ts` PATCH/DELETE: se `returning()` è vuoto → 404
  `{ error: "Not found" }`. Guardia `Number.isNaN(id)` → 400.
- Nessun cambiamento al contratto OpenAPI previsto (stessi path/shape); se emerge
  una modifica di contratto, prima si edita `lib/api-spec/openapi.yaml` e si
  rilancia il codegen (regola del repo).

## 5. Fix frontend Registro (Sezione C)

- `behaviorNotes`: usare `apiFetch`; on error mostrare uno stato d'errore
  (messaggio + retry) invece di lista vuota.
- Tabs: portare il valore attivo in `useState` controllato; il pulsante "Segna
  presenze" setta lo stato invece di simulare un click sul DOM.
- `createNote`: aggiungere `onError` con toast `destructive`.
- Tipi: sostituire gli `as any` dove i tipi generati lo permettono; dove i dati
  (es. `classId` sullo studente) sono realmente opzionali, modellarlo
  esplicitamente come opzionale, non con `any`.

## 6. Test e definizione di "fatto" (Sezione D)

Una feature è "a fondo" solo con **lint + typecheck verdi** e **test** sui
percorsi critici. Per il Registro (Vitest, stile dei test esistenti in
`routes/*.test.ts`):

- `grades.test.ts` / `attendance.test.ts`:
  - studente NON può leggere i dati di un altro passando `studentId` (regressione IDOR);
  - teacher/segreteria/admin possono filtrare per `studentId`;
  - PATCH/DELETE su id inesistente → 404;
  - input invalido → 400.
- `apiFetch`: test unitario — lancia `ApiError` su risposta non-ok, ritorna dati
  su ok, gestisce 204.
- `ErrorBoundary`: test di render — figlio che lancia → mostra il fallback.

## 7. Processo

- TDD dove sensato: prima i test che falliscono (IDOR, 404), poi il fix.
- `systematic-debugging` per i bug confermati.
- Gate prima del commit: `pnpm run lint && pnpm run typecheck && pnpm test`.
- A fine lavoro: commit locale **e** `git push` del branch (regola utente),
  solo di ciò che è committato, nessun segreto.
- Verifica finale: avvio reale dello stack (`pnpm dev`) e giro manuale del
  Registro nei ruoli studente/docente, prima di dichiarare l'area chiusa.

## 8. Fuori scope (sub-progetti successivi)

- Le altre 25 pagine e route (Messaggi/Email, Dashboard, Giustificazioni,
  Colloqui, ecc.) — ognuna avrà il proprio ciclo spec → piano → implementazione,
  riusando `apiFetch`/`ErrorBoundary`/error-handler introdotti qui.
- Decisione su `internalMail` WIP (finire vs. accantonare).
- Migrazione completa di tutte le pagine fuori dal `fetch()` grezzo.
- Eventuale scoping docente→classe sui voti (un docente vede/inserisce solo per
  le proprie classi) — da valutare come miglioramento di dominio separato.

## 9. Rischi e mitigazioni

- **Regressioni sul caso felice** durante i fix → mitigato dai test prima del fix
  e dal giro manuale finale.
- **`apiFetch` cambia la gestione errori** di `behaviorNotes` → ora gli errori
  emergono: comportamento corretto, ma va comunicato (toast/stato d'errore).
- **Contratto OpenAPI**: nessun cambiamento previsto; se serve, codegen prima del
  frontend.
