# Change 011 — Design

## Approach

Two-line surface fix + one tiny helper. No architectural change.

### Type rename

`frontend-shell/src/types/auth.ts`:

```ts
/** DTOs mirrored from auth-service (see Change 002). */
export type UserRole = 'ROLE_OPERADOR' | 'ROLE_AGRONOMO' | 'ROLE_GESTOR';
```

Renaming this type cascades through `UserSummary.role`. All call sites
already use the value as an opaque string (display only), so the
rename is mechanical:

- `AuthForm.tsx` — `useState<...>` and `as` cast updated; Select
  options use the new values and add a third one for `ROLE_GESTOR`.
- `authStore.test.ts` — fixtures switched from `'OPERATOR' /
  'AGRONOMIST'` to `'ROLE_OPERADOR' / 'ROLE_AGRONOMO'`.
- `api.test.ts` — same fixture swap.

### Display helper

`frontend-shell/src/lib/formatRole.ts`:

```ts
import type { UserRole } from '@/types/auth';

const LABELS: Record<UserRole, string> = {
  ROLE_OPERADOR: 'Operador',
  ROLE_AGRONOMO: 'Agrônomo',
  ROLE_GESTOR:   'Gestor',
};

export function formatRole(role: UserRole | string | null | undefined): string {
  if (!role) return '—';
  return LABELS[role as UserRole] ?? role;
}
```

Used in:

- `components/layout/Sidebar.tsx` — replace `{user?.role}` with
  `{formatRole(user?.role)}`.
- `modules/settings/ProfileCard.tsx` — replace `const role = user?.role`
  with `const role = formatRole(user?.role)`.

`formatRole` is deliberately tolerant: it falls back to the raw value
for any future role the backend may add before the frontend learns
about it, so the UI never goes blank.

### Test impact

Existing tests are fixture-only — they verify store / interceptor
behavior, not role values. Swapping `'OPERATOR'` for `'ROLE_OPERADOR'`
keeps the test counts the same. A 48th test for `formatRole` would
be nice-to-have; deferred to keep the hotfix minimal.

### Out-of-scope (deferred)

- The `Edicao de perfil chega em uma change futura.` note in
  `ProfileCard` stays — `PATCH /api/v1/auth/me` is a future change.
