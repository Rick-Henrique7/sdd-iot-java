'use client';

import { ClipboardList } from 'lucide-react';
import { useWorkOrdersQuery } from '@/modules/work-orders/useWorkOrdersQuery';
import { WorkOrdersTable } from '@/modules/work-orders/WorkOrdersTable';

export default function OperationsPage() {
  const { data, isLoading, isError } = useWorkOrdersQuery();

  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <ClipboardList size={12} aria-hidden />
        </span>
        <h1 className="text-h1 font-semibold text-fg">Operações</h1>
        <p className="text-sm text-fg-muted">
          Acompanhamento de Ordens de Serviço e paradas em campo.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-fg-muted">Carregando work-orders…</p>
      )}

      {isError && (
        <div className="rounded-md border border-critical bg-card p-6 text-sm text-critical">
          Falha ao carregar work-orders. Tente novamente em alguns segundos.
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-fg-muted">
          <p>Sem work-orders ativas nesta janela.</p>
          <p className="mt-2 text-xs">
            Crie uma via <code className="rounded bg-card-2 px-1.5 py-0.5 font-mono text-fg">/operator/workspace</code>
            (Operador autenticado com <code className="rounded bg-card-2 px-1.5 py-0.5 font-mono text-fg">ROLE_OPERADOR</code>).
          </p>
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <p className="text-xs text-fg-muted">
            {data.totalElements} ordem(ns) de serviço — atualizado a cada 10s.
          </p>
          <WorkOrdersTable rows={data.content} />
        </>
      )}
    </section>
  );
}
