/**
 * Pure validation for the alert threshold form. Lives next to
 * the form so the input ranges and the rules can't drift.
 */

export interface Thresholds {
  engineTempWarning: number;
  engineTempCritical: number;
  rpmWarning: number;
  rpmCritical: number;
}

export const DEFAULT_THRESHOLDS: Thresholds = {
  engineTempWarning: 90,
  engineTempCritical: 95,
  rpmWarning: 2300,
  rpmCritical: 2500,
};

export const MIN: Record<keyof Thresholds, number> = {
  engineTempWarning: 60,
  engineTempCritical: 60,
  rpmWarning: 1000,
  rpmCritical: 1000,
};

export const MAX: Record<keyof Thresholds, number> = {
  engineTempWarning: 110,
  engineTempCritical: 110,
  rpmWarning: 4000,
  rpmCritical: 4000,
};

export type ThresholdErrors = Partial<Record<keyof Thresholds, string>>;

/**
 * Returns a map of field -> error message. Empty object means
 * the form is valid.
 */
export function validateThresholds(t: Thresholds): ThresholdErrors {
  const errors: ThresholdErrors = {};
  for (const [k, raw] of Object.entries(t) as [keyof Thresholds, number][]) {
    if (typeof raw !== 'number' || Number.isNaN(raw)) {
      errors[k] = 'Valor obrigatorio.';
      continue;
    }
    if (raw < MIN[k] || raw > MAX[k]) {
      errors[k] = `Fora da faixa [${MIN[k]}, ${MAX[k]}].`;
    }
  }
  if (
    !errors.engineTempWarning &&
    !errors.engineTempCritical &&
    t.engineTempWarning >= t.engineTempCritical
  ) {
    errors.engineTempCritical = 'Alerta deve ser menor que o critico.';
  }
  if (
    !errors.rpmWarning &&
    !errors.rpmCritical &&
    t.rpmWarning >= t.rpmCritical
  ) {
    errors.rpmCritical = 'Alerta deve ser menor que o critico.';
  }
  return errors;
}
