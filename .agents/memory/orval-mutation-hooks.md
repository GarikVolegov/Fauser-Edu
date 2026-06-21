---
name: Orval mutation hooks
description: Orval-generated mutation hooks must be called directly as hooks, not passed as mutationFn.
---

**Rule:** Orval mutation hooks (e.g. `useCreateClass`, `useUpdateGrade`) return a `UseMutationResult` — they ARE the mutation. Do not pass them to another `useMutation`.

Wrong:
```typescript
const m = useMutation({ mutationFn: useCreateClass() }); // ERROR
```

Correct:
```typescript
const createClass = useCreateClass({
  mutation: {
    onSuccess: () => { ... }
  }
});
createClass.mutate({ data: { ... } });
```

**Why:** Calling `useCreateClass()` inside `useMutation` violates the rules of hooks (called conditionally/inside non-component function) and mismatches the type — it returns a result object, not a function.
