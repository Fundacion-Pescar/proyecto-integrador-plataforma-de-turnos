---
description: API access rules (React Query + shared axios)
alwaysApply: true
---

- Components MUST NOT call axios directly.
- All HTTP MUST go through src/shared/api/http-client.ts.
- API calls MUST be implemented as React Query hooks under features/<feature>/api/.
- Only feature models may leave the api layer.
- Wire DTO shapes MUST NOT leak outside api/.