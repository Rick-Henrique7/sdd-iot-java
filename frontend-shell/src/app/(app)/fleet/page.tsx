import { Truck } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export default function FleetPage() {
  return (
    <PlaceholderPage
      icon={Truck}
      title="Gestao de Frota"
      description="Cadastro, edicao e remocao de equipamentos e talhoes. O CRUD completo fala com o fleet-mapping-service."
      changeBadge="Change 009"
    />
  );
}
