'use client';

import { Select } from '@/components/ui/Select';
import { FIELD_PLOTS } from '@/lib/fieldPlots';

interface FieldPickerProps {
  value: string;
  onChange: (id: string) => void;
  label?: string;
}

/**
 * Field picker for the mapping page. Renders the static list
 * of `FieldPlot` ids as a `<Select>`. The MVP only exposes
 * heatmaps for the three seeded fields, so this is the source
 * of truth on the client.
 */
export function FieldPicker({
  value,
  onChange,
  label = 'Talhão',
}: FieldPickerProps) {
  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {FIELD_PLOTS.map((p) => (
        <option key={p.id} value={p.id}>
          {p.name}
        </option>
      ))}
    </Select>
  );
}
