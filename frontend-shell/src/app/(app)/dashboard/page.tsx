import { LayoutDashboard } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export default function DashboardPage() {
  return (
    <PlaceholderPage
      icon={LayoutDashboard}
      title="Dashboard"
      description="Saude geral da frota, telemetria em tempo real e feed de alertas. Aqui chega o resumo executivo do turno."
      changeBadge="Change 008"
    />
  );
}
