'use client';

import { User } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { decodeJwt } from '@/lib/jwt';
import { formatRole } from '@/lib/formatRole';

function formatDate(iat: number | undefined): string {
  if (!iat) return '—';
  try {
    return new Date(iat * 1000).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function ProfileCard() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const claims = decodeJwt(token);
  const displayName = user?.fullName?.trim() || (user?.email?.split('@')[0] ?? 'Operador');
  const role = formatRole(user?.role);

  return (
    <div className="panel space-y-3 p-4">
      <header className="flex items-center gap-2">
        <User size={14} className="text-fg-muted" aria-hidden />
        <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Perfil</h2>
      </header>
      <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-fg-muted">Nome</dt>
        <dd className="text-fg">{displayName}</dd>
        <dt className="text-fg-muted">E-mail</dt>
        <dd className="font-mono text-xs text-fg">{user?.email ?? '—'}</dd>
        <dt className="text-fg-muted">Perfil</dt>
        <dd>
          <span className="inline-flex items-center rounded-md border border-border bg-card-2 px-2 py-0.5 font-mono text-[0.6875rem] uppercase tracking-wider text-fg">
            {role}
          </span>
        </dd>
        <dt className="text-fg-muted">Membro desde</dt>
        <dd className="text-fg">{formatDate(claims?.iat)}</dd>
      </dl>
      <p className="text-[0.6875rem] text-fg-muted">
        Edicao de perfil chega em uma change futura.
      </p>
    </div>
  );
}
