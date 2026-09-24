---
description: "Security rules (Keycloak, JWT via JWKS)"
alwaysApply: true
---

- Auth is handled by Keycloak (OIDC/OAuth2).
- Backend validates JWT offline using JWKS (no per-request calls to Keycloak).
- Keycloak token introspection is a capability only (use only when explicitly requested).
- Do NOT implement custom username/password flows in the backend.
- NEVER log tokens, credentials, or sensitive security data.

