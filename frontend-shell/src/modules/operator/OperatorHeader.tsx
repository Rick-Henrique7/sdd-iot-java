'use client';

interface OperatorHeaderProps {
  equipmentId: string;
  equipmentModel?: string;
  operatorName: string;
  operatorCode: string;
  connected: boolean;
}

/**
 * Top identification bar for the Operator Workspace.
 *
 * Layout: 3 blocks (equipment / operator / connection).
 * All identifiers are rendered in `font-mono` so they don't
 * shift around as values stream in over WebSocket.
 */
export function OperatorHeader({
  equipmentId,
  equipmentModel,
  operatorName,
  operatorCode,
  connected,
}: OperatorHeaderProps) {
  return (
    <header
      data-testid="operator-header"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-5 py-4"
    >
      <div className="space-y-0.5">
        <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-fg-muted">
          Equipamento
        </p>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-base font-semibold text-fg">
            {equipmentId}
          </span>
          {equipmentModel && (
            <span className="font-mono text-xs text-fg-muted">
              {equipmentModel}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-0.5">
        <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-fg-muted">
          Operador
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-fg">{operatorName}</span>
          <span className="font-mono text-xs text-fg-muted">
            ({operatorCode})
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-2"
        aria-live="polite"
        aria-label={connected ? 'Conectado' : 'Sem conexao'}
      >
        <span
          aria-hidden
          className={`h-2.5 w-2.5 rounded-full ${
            connected ? 'bg-brand animate-pulse' : 'bg-critical'
          }`}
        />
        <span
          className={`text-xs font-semibold uppercase tracking-widest ${
            connected ? 'text-brand' : 'text-critical'
          }`}
        >
          {connected ? 'Conectado' : 'Sem conexao'}
        </span>
      </div>
    </header>
  );
}
