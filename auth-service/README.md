# auth-service

**Status:** scaffold only — implementation tracked in **Change 002**.

## Responsibility
Authentication & authorization. Issues JWTs (HS256) consumed by the
`api-gateway`. Stores user credentials (BCrypt-hashed) in PostgreSQL
schema `auth` via a restricted role.

## Source of truth
- Spec: `docs/backend/microservices-specification/auth-service.md`
- Change artifacts: `changes/002-auth-service/` (TBD)

## Key contracts
- `POST /api/v1/auth/login` → `AuthResponseDTO`
- `POST /api/v1/auth/register` → `AuthResponseDTO` (201)

## Module layout (planned)
```
auth-service/
├── pom.xml
├── Dockerfile
└── src/
    ├── main/
    │   ├── java/com/johndeere/agrio/auth/
    │   │   ├── AuthApplication.java
    │   │   ├── domain/   (User, UserRole, PasswordEncoderService)
    │   │   ├── usecase/  (AuthenticateUserUseCase, RegisterUserUseCase)
    │   │   ├── infrastructure/ (security/JwtProvider, persistence/...)
    │   │   └── adapters/ (controller/AuthController, dto/...)
    │   └── resources/application.yml
    └── test/
```
