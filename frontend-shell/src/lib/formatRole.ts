import type { UserRole } from '@/types/auth';

/**
 * Human-friendly label for a backend `UserRole` enum literal.
 *
 * Used in the sidebar footer and the settings `ProfileCard` so the
 * UI never renders a raw `ROLE_*` value. Falls back to the raw value
 * if a future enum is added before the frontend learns about it,
 * so the badge never goes blank.
 */
const LABELS: Record<UserRole, string> = {
  ROLE_OPERADOR: 'Operador',
  ROLE_AGRONOMO: 'Agrônomo',
  ROLE_GESTOR: 'Gestor',
};

export function formatRole(
  role: UserRole | string | null | undefined,
): string {
  if (!role) return '—';
  return LABELS[role as UserRole] ?? role;
}
