'use client';

import { Wrench } from 'lucide-react';
import { useDowntimeQuery } from '@/modules/downtime/useDowntimeQuery';
import { DowntimeTable } from '@/modules/downtime/DowntimeTable';

export default function MaintenancePage() {
  const { data, isLoading, isError } = useDowntimeQuery();

  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <Wrench size={12} aria-hidden />
        </span>
        <h1 className="text-h1 font-semibold text-fg">Manutenção Preditiva</h1>
        <p className="text-sm text-fg-muted">
          Controle de horímetro, revisões programadas e alertas preditivos por equipamento.
        </p>
      </header>

      {isLoading && (
        <p className="text-sm text-fg-muted">Carregando paradas…</p>
      )}

      {isError && (
        <div className="rounded-md border border-critical bg-card p-6 text-sm text-critical">
          Falha ao carregar paradas. Tente novamente em alguns segundos.
        </div>
      )}

      {data && data.content.length === 0 && (
        <div className="rounded-md border border-border bg-card p-6 text-sm text-fg-muted">
          Sem paradas registradas.
        </div>
      )}

      {data && data.content.length > 0 && (
        <>
          <p className="text-xs text-fg-muted">
            {data.totalElements} parada(s) registrada(s) — atualizado a cada 15s.
          </p>
          <DowntimeTable rows={data.content} />
        </>
      )}
    </section>
  );
}
