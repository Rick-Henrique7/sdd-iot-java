/**
 * DTOs mirrored from auth-service (see Change 002).
 *
 * The role union is the **raw** backend enum literal — same value the
 * JWT `role` claim carries and the same value the
 * `POST /api/v1/auth/register` body expects. Display
 * formatting lives in `lib/formatRole.ts` so the rest of the UI does
 * not have to repeat the mapping.
 */
export type UserRole = 'ROLE_OPERADOR' | 'ROLE_AGRONOMO' | 'ROLE_GESTOR';

export interface UserSummary {
  id: string;
  email: string;
  role: UserRole;
  fullName?: string;
}

export interface AuthResponse {
  token: string;
  user: UserSummary;
}
