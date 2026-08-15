import { Settings as SettingsIcon } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export default function SettingsPage() {
  return (
    <PlaceholderPage
      icon={SettingsIcon}
      title="Configuracoes"
      description="Limites de alerta, perfis de acesso e preferencias de notificacao."
      changeBadge="Change 010"
    />
  );
}
