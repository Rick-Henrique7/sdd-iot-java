# Spec — Change 002: auth-service

> **Behavioral contract. What the auth-service MUST do. This is the single source of truth for behavior.**

---

## 1. Endpoints

The service exposes **exactly** these two routes, both under
`/api/v1/auth`:

| Method | Path               | Auth required? | Body                | Response (status, body)                |
|--------|--------------------|----------------|---------------------|----------------------------------------|
| POST   | `/api/v1/auth/login`     | NO             | `LoginRequestDTO`   | `200 OK` · `AuthResponseDTO`           |
| POST   | `/api/v1/auth/register`  | NO             | `RegisterRequestDTO`| `201 Created` · `AuthResponseDTO`      |

Both endpoints MUST be **public** (no JWT required). The `api-gateway`
already exposes `/api/v1/auth/**` as a public route; auth-service MUST
NOT add its own authentication filter that would conflict with that.

## 2. Request DTOs

### `LoginRequestDTO`
```json
{ "email": "operador@johndeere.com", "password": "Secret123!" }
```

### `RegisterRequestDTO`
```json
{
  "name": "Joao da Silva",
  "email": "operador@johndeere.com",
  "password": "Secret123!",
  "role": "ROLE_OPERADOR"
}
```

`role` MUST be one of `ROLE_OPERADOR`, `ROLE_AGRONOMO`, `ROLE_GESTOR`.
A request with any other value returns `400 Bad Request`.

## 3. Response DTO

`AuthResponseDTO`:
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "type": "Bearer",
  "expiresInSeconds": 43200,
  "user": {
    "id": "usr-883921-2026",
    "name": "Joao da Silva",
    "email": "operador@johndeere.com",
    "role": "ROLE_OPERADOR"
  }
}
```

- `token` is the JWT compact serialization.
- `type` is always the literal `"Bearer"`.
- `expiresInSeconds` mirrors `jwt.expiration-ms` (default: 12h).
- `user.id` is the persisted user identifier (a stable string).
- `user.role` echoes the registered role.

## 4. Persistence

- Schema: `auth` (created by `init.sql`).
- Database user: `agrio_auth` (role restricted to the `auth` schema).
- Table: `users`
  - `id`        VARCHAR(64)  PRIMARY KEY
  - `name`      VARCHAR(255) NOT NULL
  - `email`     VARCHAR(255) NOT NULL, UNIQUE
  - `password`  VARCHAR(255) NOT NULL  *(BCrypt hash)*
  - `role`      VARCHAR(32)  NOT NULL
  - `created_at` TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()

## 5. JWT contract

The auth-service and the api-gateway MUST share these JWT properties:

- Algorithm: **HS256**
- Secret: `jwt.secret` property (env `JWT_SECRET`)
- Claims produced by `JwtProvider`:
  - `sub`   — user email
  - `userId` — persisted user id
  - `roles`  — `UserRole.name()` (e.g. `ROLE_OPERADOR`)
  - `iat`   — issued at
  - `exp`   — expires at
- Expiration: `jwt.expiration-ms` (default `43200000` ms = 12 hours).

The api-gateway validates this exact contract.

## 6. Error contract

| Condition                                | Response                          |
|------------------------------------------|-----------------------------------|
| Email not found                          | `401 Unauthorized`                |
| Password mismatch                        | `401 Unauthorized`                |
| Validation failure on the request body   | `400 Bad Request`                 |
| Email already registered                 | `409 Conflict`                    |
| Internal / unexpected error              | `500 Internal Server Error`       |

Error body shape (consistent across the platform):
```json
{ "code": "AUTH_INVALID_CREDENTIALS", "message": "Invalid email or password" }
```

## 7. Security baseline

- Passwords are stored ONLY as BCrypt hashes (`BCryptPasswordEncoder`).
- The plain-text password MUST NEVER appear in logs.
- The service MUST be stateless; no HTTP session.
- CORS is centralised at the `api-gateway`; auth-service does not
  declare its own CORS rules.

## 8. Non-functional requirements

| NFR                | Target                                                       |
|--------------------|--------------------------------------------------------------|
| Login latency      | < 200 ms p95 against PostgreSQL local                        |
| Cold memory        | < 256 MiB RSS at idle                                        |
| Throughput         | ≥ 500 logins/s on `2 vCPU / 2 GiB` (smoke target)            |
| Container security | Non-root user, JRE 17 alpine, multi-stage build              |

## 9. Acceptance criteria

1. `mvn -pl auth-service -am test` builds and passes all unit + integration tests.
2. The fat jar is produced and a Docker image can be built.
3. With the docker-compose stack up, `POST /api/v1/auth/register` followed
   by `POST /api/v1/auth/login` returns a valid JWT.
4. The issued JWT is accepted by the running `api-gateway` on a protected
   route (`GET /api/v1/fleet` with `Authorization: Bearer <token>`
   returns `200` from the downstream, not `401` from the gateway).
5. The domain layer (`domain/`) does not import any Spring, JPA, or JJWT class.
