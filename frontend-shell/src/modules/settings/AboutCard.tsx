import { ExternalLink, Info } from 'lucide-react';
import { PLATFORM_NAME, PLATFORM_VERSION } from '@/lib/version';

interface AboutCardProps {
  onCopied: (msg: string) => void;
}

const DOCS: { label: string; href: string }[] = [
  { label: 'Blueprint de UI', href: 'https://github.com/Rick-Henrique7/sdd-iot-java/blob/main/docs/frontend/blueprint.md' },
  { label: 'Estrutura técnica', href: 'https://github.com/Rick-Henrique7/sdd-iot-java/blob/main/docs/frontend/struct-frontend.md' },
  { label: 'Repositorio', href: 'https://github.com/Rick-Henrique7/sdd-iot-java' },
];

export function AboutCard(_: AboutCardProps) {
  return (
    <div className="panel space-y-3 p-4">
      <header className="flex items-center gap-2">
        <Info size={14} className="text-fg-muted" aria-hidden />
        <h2 className="text-h2 uppercase tracking-wider text-fg-muted">Sobre</h2>
      </header>
      <div>
        <p className="text-base text-fg">{PLATFORM_NAME}</p>
        <p className="text-xs text-fg-muted">v{PLATFORM_VERSION}</p>
      </div>
      <ul className="space-y-1 text-sm">
        {DOCS.map((d) => (
          <li key={d.href}>
            <a
              href={d.href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-fg-body underline-offset-2 hover:text-fg hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              {d.label}
              <ExternalLink size={12} aria-hidden />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
