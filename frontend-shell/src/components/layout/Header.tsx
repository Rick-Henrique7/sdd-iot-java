'use client';

import { LogOut, Menu } from 'lucide-react';
import { useState } from 'react';
import { Logo } from '@/components/ui/Logo';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useLogout';

export function Header() {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="flex h-[50px] shrink-0 items-center justify-between border-b border-border bg-bg/60 px-4 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Alternar menu lateral"
          className="grid h-8 w-8 place-items-center rounded-md text-fg-muted hover:bg-card hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand lg:hidden"
        >
          <Menu size={18} />
        </button>
        <Logo size={22} />
        <span className="hidden h-5 w-px bg-border sm:inline-block" />
        <span className="hidden items-center gap-2 text-xs text-fg-muted sm:inline-flex">
          <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-brand" />
          Kafka
          <span className="font-mono text-fg">On</span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-fg-muted md:inline">
          {user?.email}
        </span>
        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-1.5 text-xs text-fg-muted transition-colors hover:border-border hover:bg-card-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <LogOut size={14} />
          Sair
        </button>
      </div>
    </header>
  );
}
