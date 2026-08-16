import { type LucideIcon } from 'lucide-react';
import { type ReactNode } from 'react';

interface PlaceholderPageProps {
  icon: LucideIcon;
  title: string;
  description: string;
  changeBadge: string;
  children?: ReactNode;
}

export function PlaceholderPage({
  icon: Icon,
  title,
  description,
  changeBadge,
  children,
}: PlaceholderPageProps) {
  return (
    <section className="animate-fade-in space-y-6">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <Icon size={12} aria-hidden />
          {changeBadge}
        </span>
        <h1 className="text-h1 font-semibold text-fg">{title}</h1>
        <p className="max-w-2xl text-sm text-fg-body">{description}</p>
      </header>

      <div className="glass grid place-items-center px-6 py-16 text-center">
        <div className="max-w-sm space-y-3">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-card-2 text-fg-muted">
            <Icon size={22} aria-hidden />
          </div>
          <h2 className="text-h2 uppercase tracking-wide text-fg-muted">
            Tela em construção
          </h2>
          <p className="text-sm text-fg-body">
            A interface completa desta área será entregue em
            próxima change. Por enquanto, a rota já está
            autenticada e navegável.
          </p>
        </div>
      </div>

      {children}
    </section>
  );
}
