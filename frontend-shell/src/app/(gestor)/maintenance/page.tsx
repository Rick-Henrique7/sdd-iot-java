'use client';

import { Wrench } from 'lucide-react';

export default function MaintenancePage() {
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

      <div className="rounded-md border border-border bg-card p-6 text-sm text-fg-muted">
        <p>Sem manutenções programadas.</p>
        <p className="mt-2 text-xs">
          Página placeholder da Change 021. Conteúdo (gráfico de horímetro, ranking de risco, fila de OS
          corretiva) virá em uma change futura após o backend expor os endpoints necessários.
        </p>
      </div>
    </section>
  );
}
