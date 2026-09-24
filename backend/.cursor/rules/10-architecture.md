---
description: "NestJS backend architecture and layering rules"
alwaysApply: true
---

Controllers MUST:
- accept request DTOs only and return response DTOs only
- validate inputs (class-validator via ValidationPipe)
- contain NO business logic
- NEVER access repositories directly
- NEVER expose entities

Services MUST:
- contain business rules
- split responsibilities:
  - XxxService for writes
  - XxxQueryService for reads and DTO mapping

Repositories MUST:
- contain persistence logic only
- contain NO business rules

External systems MUST:
- be accessed via integrations/** using XxxClient

