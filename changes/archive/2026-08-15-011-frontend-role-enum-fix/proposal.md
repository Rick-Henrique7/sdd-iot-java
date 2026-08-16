# Change 011 — Frontend role enum mismatch (hotfix)

## Why

Trying to register a new account from the UI (`/register`) fails with
`AUTH_MALFORMED_REQUEST` ("Request body is missing or malformed").
The `auth-service` returns 400 because Jackson cannot deserialize the
`role` field: the backend enum is `ROLE_OPERADOR | ROLE_AGRONOMO |
ROLE_GESTOR`, but the frontend `AuthForm` is sending
`OPERATOR | AGRONOMIST`. `fromString` even uppercases the input, so
`OPERATOR` still does not match any of the three declared values.

This blocks the first user-facing flow (self-service sign-up) and is
inconsistent with the rest of the platform, which already speaks
backend-enum strings everywhere else.

## What changes

Rename the frontend `UserRole` union so it mirrors the backend
`UserRole` enum exactly. Add the missing `ROLE_GESTOR` option to the
profile select. Display the badge in human-friendly Portuguese via a
new `formatRole` helper so the sidebar / profile card stop showing
`ROLE_OPERADOR` raw.

## Out of scope

- `PATCH /api/v1/auth/me` (deferred to a follow-up change).
- Any backend change — `UserRole` and the register DTO are correct.
- Authorization rules in api-gateway / services — the JWT claim
  value is already the right enum string, only the frontend was off.
