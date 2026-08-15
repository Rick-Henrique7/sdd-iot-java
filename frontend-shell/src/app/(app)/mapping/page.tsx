import { Map } from 'lucide-react';
import { PlaceholderPage } from '@/components/layout/PlaceholderPage';

export default function MappingPage() {
  return (
    <PlaceholderPage
      icon={Map}
      title="Mapeamento de Campo"
      description="Visualizacao geografica em tempo real com Leaflet, heatmap de pulverizacao e widget de clima Open-Meteo."
      changeBadge="Change 009"
    />
  );
}
