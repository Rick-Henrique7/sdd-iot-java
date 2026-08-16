# Change 011 — Frontend role enum mismatch (hotfix)

## Spec

### Functional requirements

- `frontend-shell/src/types/auth.ts` declares:
  ```ts
  export type UserRole = 'ROLE_OPERADOR' | 'ROLE_AGRONOMO' | 'ROLE_GESTOR';
  ```
- `AuthForm` sends the `role` value selected in the **Perfil de Acesso**
  select as-is in the JSON body of `POST /api/v1/auth/register`. The
  selected value is one of the three backend enum literals.
- The **Perfil de Acesso** select exposes **three** options in this
  order, with Portuguese labels and backend-enum values:
  - `Operador`   → `ROLE_OPERADOR`
  - `Agrônomo`   → `ROLE_AGRONOMO`
  - `Gestor`     → `ROLE_GESTOR`
- The default value is `ROLE_OPERADOR`.
- The sidebar footer and the settings `ProfileCard` render the role as
  `Operador` / `Agrônomo` / `Gestor` (not the raw `ROLE_*` literal)
  via a new `formatRole(user.role)` helper exported from
  `frontend-shell/src/lib/formatRole.ts`.

### Non-functional requirements

- TypeScript strict mode keeps passing.
- `npm test` stays at 47/47 (or grows if a new test for
  `formatRole` is added).
- `npm run build` keeps producing a production bundle without
  warnings about mismatched role values.

### Acceptance criteria

- A new user can complete `/register` for all three roles without
  `AUTH_MALFORMED_REQUEST`.
- After successful register, the sidebar shows `Operador` /
  `Agrônomo` / `Gestor` (not `ROLE_OPERADOR` etc.) for the just
  created user.
- The settings `ProfileCard` "Perfil" badge shows the same
  human-friendly label.
