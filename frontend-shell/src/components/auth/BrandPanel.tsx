import { Logo } from '@/components/ui/Logo';

/**
 * The "image" half of the auth split-screen.
 *
 * Per the spec we used to render a high-res photo of farm equipment
 * here. We don't ship that asset in this repo, so instead we draw
 * a clean, modern visual in pure CSS: a layered radial + linear
 * gradient, a faint geometric grid, and a couple of accent shapes
 * that nod to crop rows and telemetry traces without being a
 * literal photo.
 */
export function BrandPanel() {
  return (
    <aside
      aria-hidden
      className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10"
      style={{
        background:
          'radial-gradient(ellipse at 20% 0%, #1F4A19 0%, transparent 55%),' +
          'radial-gradient(ellipse at 100% 100%, #1E3A8A 0%, transparent 60%),' +
          'linear-gradient(135deg, #0F172A 0%, #0B1220 100%)',
      }}
    >
      {/* Faint grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px),' +
            'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      {/* Stylised "field rows" — three diagonal bands that imply
          a cultivated plot, with a low-opacity pulse. */}
      <svg
        viewBox="0 0 600 800"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden
      >
        <defs>
          <linearGradient id="row" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#367C2B" stopOpacity="0.0" />
            <stop offset="0.5" stopColor="#367C2B" stopOpacity="0.35" />
            <stop offset="1" stopColor="#367C2B" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="trace" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#FFDE00" stopOpacity="0.0" />
            <stop offset="0.5" stopColor="#FFDE00" stopOpacity="0.9" />
            <stop offset="1" stopColor="#FFDE00" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g transform="translate(-100 200) rotate(-18 300 300)">
          <rect x="0"   y="40"  width="900" height="6" fill="url(#row)" />
          <rect x="0"   y="120" width="900" height="6" fill="url(#row)" />
          <rect x="0"   y="200" width="900" height="6" fill="url(#row)" />
          <rect x="0"   y="280" width="900" height="6" fill="url(#row)" />
          <rect x="0"   y="360" width="900" height="6" fill="url(#row)" />
        </g>
        <path
          d="M-20 640 Q 150 560 300 620 T 620 600 L 620 660 L -20 660 Z"
          fill="url(#trace)"
          opacity="0.5"
        />
      </svg>

      {/* Top: logo + version chip */}
      <header className="relative z-10 flex items-center justify-between">
        <Logo />
        <span className="rounded-full border border-border bg-card/40 px-3 py-1 text-xs uppercase tracking-widest text-fg-muted backdrop-blur">
          v1.0.0 Enterprise
        </span>
      </header>

      {/* Middle: tagline + value prop */}
      <div className="relative z-10 max-w-md">
        <h1 className="text-balance text-3xl font-semibold leading-tight text-fg">
          Telemetria agrícola
          <br />
          em tempo real.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-fg-body">
          Monitore a frota, identifique anomalias e tome decisões de
          campo a partir de um único painel. Sem promessas, sem
          dashboards vazios: só dados vivos dos seus equipamentos.
        </p>
      </div>

      {/* Bottom: meta strip */}
      <footer className="relative z-10 flex items-center gap-3 text-xs text-fg-muted">
        <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-brand" />
        <span>API Gateway</span>
        <span className="h-3 w-px bg-border" />
        <span>Kafka</span>
        <span className="h-3 w-px bg-border" />
        <span>Postgres</span>
        <span className="h-3 w-px bg-border" />
        <span>Redis</span>
      </footer>
    </aside>
  );
}
