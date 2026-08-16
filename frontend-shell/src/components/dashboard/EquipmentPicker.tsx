'use client';

import { Select } from '@/components/ui/Select';

interface EquipmentPickerProps {
  equipmentIds: string[];
  value: string | null;
  onChange: (id: string) => void;
  /** Optional label rendered above the field. */
  label?: string;
}

/**
 * Dropdown that lets the user pick which equipment's live
 * telemetry to chart. When the live store has no events yet
 * the list is empty and we render a disabled "— Aguardando
 * telemetria —" placeholder.
 */
export function EquipmentPicker({
  equipmentIds,
  value,
  onChange,
  label = 'Equipamento',
}: EquipmentPickerProps) {
  if (equipmentIds.length === 0) {
    return (
      <Select label={label} disabled>
        <option>— Aguardando telemetria —</option>
      </Select>
    );
  }
  return (
    <Select
      label={label}
      value={value ?? equipmentIds[0]}
      onChange={(e) => onChange(e.target.value)}
    >
      {equipmentIds.map((id) => (
        <option key={id} value={id}>
          {id}
        </option>
      ))}
    </Select>
  );
}
