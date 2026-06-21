---
name: React Query v5 + Orval query options
description: How to pass enabled/options to Orval-generated query hooks with react-query v5.
---

In @tanstack/react-query v5, `UseQueryOptions` has `queryKey` as **required**. Passing `{ query: { enabled: false } }` as the second arg to an Orval hook will fail with "queryKey is missing".

**Rule:** Do not pass the second options arg to Orval hooks with a `{ query: { enabled } }` pattern. Instead, either:

1. Omit the second arg entirely (let the hook always run — data will be empty if params are undefined)
2. Pass the full valid options object with a queryKey

**Why:** Orval internally provides the queryKey, but the TypeScript type still requires it in the options object you pass, so partial options objects fail.

**How to apply:** When using Orval hooks in components where conditional fetching is desired, rely on the params being undefined (the API returns the current user's data by default in this project) rather than using the enabled flag.
