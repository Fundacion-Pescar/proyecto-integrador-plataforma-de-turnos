---
description: "Database migration rules (TypeORM)"
alwaysApply: true
---

- Schema changes MUST be represented in TypeORM migration files committed to the repo.
- Default approach: generate migrations from entity changes.
- Migrations MUST live under: src/database/migrations/
- Do NOT write manual SQL migrations unless explicitly approved.

