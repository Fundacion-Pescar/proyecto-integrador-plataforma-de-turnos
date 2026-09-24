---
description: "External integrations rules (axios)"
alwaysApply: true
---

- External systems MUST be accessed via integrations/** using XxxClient.
- Use axios for HTTP calls.
- Timeouts MUST be configured.
- Remote failures MUST be mapped to internal errors with errorId and errorCode.
- Integrations MUST NOT contain business logic.

