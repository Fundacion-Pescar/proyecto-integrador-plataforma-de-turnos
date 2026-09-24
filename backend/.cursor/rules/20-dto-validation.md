---
description: "DTO validation and mapping rules"
alwaysApply: true
---

- Request DTOs MUST use class-validator decorators.
- ValidationPipe MUST be enabled globally.
- Response mapping MUST be manual via web/mappers/** (no entity exposure).
- Controllers MUST NOT map entities directly; mapping belongs in services/query services and mappers.

