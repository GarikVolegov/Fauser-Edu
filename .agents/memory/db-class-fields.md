---
name: DB class table field names
description: The classes table uses Italian field names, not the English equivalents.
---

The `classesTable` in `lib/db/src/schema/classes.ts` uses:

- `anno` (integer, 1-5) — NOT `year`
- `sezione` (text, e.g. "A") — NOT `section`
- `indirizzo` (text) — NOT `course` or `track`

**Why:** The project UI is Italian and the DB schema was designed to match. English callers (frontend code) must use `(c as any).anno` or cast when the Orval-generated `Class` type doesn't expose these fields by name.

**How to apply:** Any time you write code referencing a class record's year or section, use `anno` and `sezione`. In TypeScript, cast with `as any` if the generated type doesn't include the field.
