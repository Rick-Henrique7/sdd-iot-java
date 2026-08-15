/** DTOs mirrored from auth-service (see Change 002). */
export type UserRole = 'OPERATOR' | 'AGRONOMIST' | 'ADMIN';

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
