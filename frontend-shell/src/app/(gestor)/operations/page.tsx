'use client';

import { ClipboardList } from 'lucide-react';

export default function OperationsPage() {
  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <ClipboardList size={12} aria-hidden />
          Change 021 (placeholder)
        </span>
        <h1 className="text-h1 font-semibold text-fg">Operações</h1>
        <p className="text-sm text-fg-muted">
          Acompanhamento de Ordens de Serviço e paradas em campo.
        </p>
      </header>

      <div className="rounded-md border border-border bg-card p-6 text-sm text-fg-muted">
        <p>
          Sem work-orders ativas nesta janela.
        </p>
        <p className="mt-2 text-xs">
          O endpoint <code className="rounded bg-card-2 px-1.5 py-0.5 font-mono text-fg">GET /api/v1/operations/work-orders</code> será adicionado em uma change futura para listar
          as ordens criadas pelo Operador via <code className="rounded bg-card-2 px-1.5 py-0.5 font-mono text-fg">/operator/workspace</code>.
        </p>
      </div>
    </section>
  );
}
