---
name: Orval naming conflicts
description: How to avoid duplicate export errors when Orval generates types from OpenAPI PATCH endpoints.
---

When an OpenAPI PATCH operation has an **inline** request body schema, Orval generates a type named `{OperationId}Body` in BOTH `api.ts` and `types.ts`, causing a "already exported a member" TypeScript error.

**Rule:** Never use inline body schemas for PATCH endpoints. Always use a named `$ref` component schema, and name it something OTHER than `{OperationId}Body`.

Good naming pattern: `{Noun}ReviewInput`, `{Noun}StatusInput`, `{Noun}UpdateParams`.

**Why:** Orval emits the inline body type in two generated files when the body is anonymous. A named $ref is only emitted in types.ts and imported in api.ts.

**How to apply:** Any time you add a PATCH (or PUT) endpoint to the OpenAPI spec, define the request body as a `$ref` to a named component schema.
