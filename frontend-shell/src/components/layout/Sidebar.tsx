'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Map,
  Truck,
  Settings as SettingsIcon,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { routes, type RoutePath } from '@/lib/routes';
import { useAuthStore } from '@/stores/authStore';
import { useLogout } from '@/hooks/useLogout';
import { formatRole } from '@/lib/formatRole';

interface NavItem {
  href: RoutePath;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { href: routes.dashboard, label: 'Dashboard',  icon: LayoutDashboard },
  { href: routes.mapping,   label: 'Mapeamento', icon: Map },
  { href: routes.fleet,     label: 'Frota',      icon: Truck },
  { href: routes.settings,  label: 'Configuracoes', icon: SettingsIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expanded, setExpanded] = useState(false);
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  const width = expanded ? 'w-60' : 'w-[60px]';

  return (
    <aside
      data-testid="sidebar"
      data-expanded={expanded}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={`${width} group/sidebar relative z-20 flex shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out`}
    >
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-1">
          {NAV.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  title={item.label}
                  className={`relative flex h-10 items-center gap-3 rounded-md px-2.5 text-sm transition-colors ${
                    active
                      ? 'bg-brand/15 text-fg'
                      : 'text-fg-muted hover:bg-card-2 hover:text-fg'
                  }`}
                >
                  {active && (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand"
                    />
                  )}
                  <Icon size={18} className="shrink-0" aria-hidden />
                  <span
                    className={`truncate ${
                      expanded ? 'opacity-100' : 'opacity-0'
                    } transition-opacity duration-150`}
                  >
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-border p-2">
        <div
          className={`flex items-center gap-3 rounded-md px-2.5 py-2 text-sm ${
            expanded ? '' : 'justify-center'
          }`}
        >
          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-card-2 text-xs font-semibold text-fg">
            {(user?.email ?? '?').slice(0, 1).toUpperCase()}
          </div>
          {expanded && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs text-fg">{user?.email}</p>
              <p className="truncate text-[0.6875rem] uppercase tracking-wider text-fg-muted">
                {formatRole(user?.role)}
              </p>
            </div>
          )}
          {expanded && (
            <button
              type="button"
              onClick={logout}
              aria-label="Sair"
              className="rounded p-1.5 text-fg-muted hover:bg-card-2 hover:text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
