'use client';

import { useEffect, useState } from 'react';
import { Settings as SettingsIcon } from 'lucide-react';
import { usePreferencesStore } from '@/stores/preferencesStore';
import { Toast } from '@/components/ui/Toast';
import { ProfileCard } from './ProfileCard';
import { ThresholdForm } from './ThresholdForm';
import { SessionCard } from './SessionCard';
import { AboutCard } from './AboutCard';

export function Settings() {
  const hydrate = usePreferencesStore((s) => s.hydrate);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <section className="animate-fade-in space-y-4">
      <header className="space-y-1">
        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-[0.6875rem] uppercase tracking-widest text-fg-muted">
          <SettingsIcon size={12} aria-hidden />
          Change 010
        </span>
        <h1 className="text-h1 font-semibold text-fg">Configuracoes</h1>
        <p className="text-sm text-fg-muted">
          Perfil, limites de alerta, sessao e informacoes da plataforma.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ProfileCard />
        <ThresholdForm onApplied={(m) => setToast(m)} />
        <SessionCard onCopied={(m) => setToast(m)} />
        <AboutCard onCopied={(m) => setToast(m)} />
      </div>

      <Toast message={toast} onDismiss={() => setToast(null)} />
    </section>
  );
}
