'use client';

import { useState, type FormEvent } from 'react';
import { Bell, RotateCcw, Save } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { usePreferencesStore } from '@/stores/preferencesStore';
import {
  DEFAULT_THRESHOLDS,
  MAX,
  MIN,
  validateThresholds,
  type Thresholds,
} from '@/lib/thresholdValidation';

interface ThresholdFormProps {
  onApplied: (message: string) => void;
}

export function ThresholdForm({ onApplied }: ThresholdFormProps) {
  const thresholds = usePreferencesStore((s) => s.thresholds);
  const setThresholds = usePreferencesStore((s) => s.setThresholds);
  const resetThresholds = usePreferencesStore((s) => s.resetThresholds);

  const [form, setForm] = useState<Thresholds>(thresholds);
  const [touched, setTouched] = useState(false);

  const errors = validateThresholds(form);
  const isValid = Object.keys(errors).length === 0;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setTouched(true);
    if (!isValid) return;
    setThresholds(form);
    onApplied('Limites aplicados nesta sessão.');
  }

  function handleReset() {
    resetThresholds();
    setForm(DEFAULT_THRESHOLDS);
    setTouched(false);
    onApplied('Limites restaurados para o padrão.');
  }

  function bind<K extends keyof Thresholds>(key: K) {
    return {
      value: String(form[key]),
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value === '' ? Number.NaN : Number(e.target.value);
        setForm((f) => ({ ...f, [key]: v }));
      },
    };
  }

  return (
    <form onSubmit={handleSubmit} className="panel space-y-3 p-4">
      <header className="flex items-center gap-2">
        <Bell size={14} className="text-fg-muted" aria-hidden />
        <h2 className="text-h2 uppercase tracking-wider text-fg-muted">
          Limites de alerta
        </h2>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input
          label="Temp. motor — alerta (°C)"
          type="number"
          min={MIN.engineTempWarning}
          max={MAX.engineTempWarning}
          step={0.5}
          error={touched ? errors.engineTempWarning : undefined}
          {...bind('engineTempWarning')}
        />
        <Input
          label="Temp. motor — critico (°C)"
          type="number"
          min={MIN.engineTempCritical}
          max={MAX.engineTempCritical}
          step={0.5}
          error={touched ? errors.engineTempCritical : undefined}
          {...bind('engineTempCritical')}
        />
        <Input
          label="RPM — alerta"
          type="number"
          min={MIN.rpmWarning}
          max={MAX.rpmWarning}
          step={50}
          error={touched ? errors.rpmWarning : undefined}
          {...bind('rpmWarning')}
        />
        <Input
          label="RPM — critico"
          type="number"
          min={MIN.rpmCritical}
          max={MAX.rpmCritical}
          step={50}
          error={touched ? errors.rpmCritical : undefined}
          {...bind('rpmCritical')}
        />
      </div>

      <p className="text-[0.6875rem] text-fg-muted">
        Limites serão persistidos no backend em uma change futura.
        Por enquanto, ficam ativos apenas nesta sessão.
      </p>

      <div className="flex items-center gap-2">
        <Button type="submit" size="sm" disabled={touched && !isValid}>
          <Save size={14} /> Aplicar
        </Button>
        <Button type="button" variant="secondary" size="sm" onClick={handleReset}>
          <RotateCcw size={14} /> Restaurar padrões
        </Button>
      </div>
    </form>
  );
}
