'use client';

import { useEffect, useState } from 'react';
import { Clipboard, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useLogout';
import { decodeJwt, formatRemaining } from '@/lib/jwt';

interface SessionCardProps {
  onCopied: (msg: string) => void;
}

function formatDateTime(ts: number | undefined): string {
  if (!ts) return '—';
  try {
    return new Date(ts * 1000).toLocaleString('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  } catch {
    return '—';
  }
}

export function SessionCard({ onCopied }: SessionCardProps) {
  const token = useAuthStore((s) => s.token);
  const claims = decodeJwt(token);
  const logout = useLogout();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = window.setInterval(() => setTick((n) => n + 1), 60_000);
    return () => window.clearInterval(t);
  }, []);

  // `tick` keeps the countdown reactive on the minute boundary.
  void tick;

  async function handleCopy() {
    if (!token) return;
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(token);
      } else {
        // jsdom + older browsers
        const ta = document.createElement('textarea');
        ta.value = token;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }
      onCopied('Token copiado para a area de transferencia.');
    } catch {
      onCopied('Falha ao copiar o token.');
    }
  }

  return (
    <div className="panel space-y-3 p-4">
      <header className="flex items-center gap-2">
        <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Sessao</h2>
      </header>
      <dl className="grid grid-cols-[8rem_1fr] gap-x-3 gap-y-2 text-sm">
        <dt className="text-fg-muted">Emitido em</dt>
        <dd className="text-fg">{formatDateTime(claims?.iat)}</dd>
        <dt className="text-fg-muted">Expira em</dt>
        <dd className="font-mono text-fg">
          {formatDateTime(claims?.exp)}{' '}
          <span className="text-fg-muted">({formatRemaining(claims?.exp)})</span>
        </dd>
      </dl>
      <div className="flex items-center gap-2">
        <Button type="button" variant="secondary" size="sm" onClick={handleCopy} disabled={!token}>
          <Clipboard size={14} /> Copiar token
        </Button>
        <Button type="button" size="sm" onClick={logout}>
          <LogOut size={14} /> Encerrar sessao
        </Button>
      </div>
    </div>
  );
}
