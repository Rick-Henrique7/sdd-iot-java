import type { UserRole } from '@/types/auth';
import { routes } from '@/lib/routes';

/**
 * Role-based navigation guard (Change 021).
 *
 * - `landingPath(role)` — onde levar o usuário após login/registro
 * - `hasAccess(role, pathname)` — checa se o role pode acessar o path
 *
 * Por enquanto stateless (sem estado React); exportado como hook só
 * para casar com o padrão do projeto e permitir futura extensão
 * reativa (ex.: role dinâmico vindo de refresh de token).
 */

const ROLE_LANDING: Record<UserRole, string> = {
  ROLE_OPERADOR: routes.operatorWorkspace,
  ROLE_AGRONOMO: routes.dashboard,
  ROLE_GESTOR:   routes.dashboard,
};

const ROLE_PREFIX: Record<UserRole, string> = {
  ROLE_OPERADOR: routes.operatorWorkspace.split('/').slice(0, 2).join('/'),
  ROLE_AGRONOMO: '',
  ROLE_GESTOR:   '',
};

export function useRoleGuard() {
  return {
    landingPath: (role: UserRole): string => ROLE_LANDING[role],

    hasAccess: (role: UserRole, pathname: string): boolean => {
      // Caminhos públicos: sempre acessíveis.
      if (
        pathname.startsWith(routes.login) ||
        pathname.startsWith(routes.register) ||
        pathname === routes.root
      ) {
        return true;
      }

      // Operador: confinado a /operator/**.
      if (role === 'ROLE_OPERADOR') {
        return pathname.startsWith(ROLE_PREFIX[role]);
      }

      // Agrônomo e Gestor: tudo sob o shell do Gestor.
      // (Operações e Manutenção são restritos no nível do Sidebar via roles[]).
      return true;
    },
  };
}
