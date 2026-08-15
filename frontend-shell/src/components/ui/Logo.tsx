import { Tractor } from 'lucide-react';

export function Logo({ size = 28 }: { size?: number }) {
  return (
    <div className="flex items-center gap-2 text-fg">
      <span
        aria-hidden
        className="grid h-9 w-9 place-items-center rounded-md bg-brand text-white"
      >
        <Tractor size={size * 0.7} />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="text-h1 font-semibold">Agro-IoT</span>
        <span className="text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          Enterprise
        </span>
      </span>
    </div>
  );
}
