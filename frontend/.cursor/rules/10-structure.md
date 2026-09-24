---
description: Structure, naming and feature boundaries
alwaysApply: true
---

- Organize code by feature under src/features/<feature>/.
- Each feature MUST contain: pages/, components/, api/, model/, store/, hooks/.
- Shared generic code MUST live in src/shared/.
- Features MUST NOT import internal code from other features.
- Files/folders MUST be kebab-case.
- Components/types MUST be PascalCase.