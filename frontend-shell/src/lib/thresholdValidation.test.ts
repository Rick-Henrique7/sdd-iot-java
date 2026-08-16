import { describe, it, expect } from 'vitest';
import {
  DEFAULT_THRESHOLDS,
  MAX,
  MIN,
  validateThresholds,
} from './thresholdValidation';

describe('validateThresholds', () => {
  it('returns no errors for the defaults', () => {
    expect(validateThresholds(DEFAULT_THRESHOLDS)).toEqual({});
  });

  it('flags engineTempCritical when it is <= warning', () => {
    const errors = validateThresholds({
      ...DEFAULT_THRESHOLDS,
      engineTempWarning: 95,
      engineTempCritical: 90,
    });
    expect(errors.engineTempCritical).toMatch(/menor/);
  });

  it('flags rpmCritical when it is <= warning', () => {
    const errors = validateThresholds({
      ...DEFAULT_THRESHOLDS,
      rpmWarning: 2500,
      rpmCritical: 2500,
    });
    expect(errors.rpmCritical).toMatch(/menor/);
  });

  it('flags values below MIN or above MAX', () => {
    const errors = validateThresholds({
      engineTempWarning: MIN.engineTempWarning - 1,
      engineTempCritical: MAX.engineTempCritical + 1,
      rpmWarning: MIN.rpmWarning,
      rpmCritical: MAX.rpmCritical,
    });
    expect(errors.engineTempWarning).toMatch(/faixa/);
    expect(errors.engineTempCritical).toMatch(/faixa/);
  });

  it('flags NaN values', () => {
    const errors = validateThresholds({
      engineTempWarning: Number.NaN,
      engineTempCritical: 95,
      rpmWarning: 2000,
      rpmCritical: 2500,
    });
    expect(errors.engineTempWarning).toMatch(/obrigatorio/);
  });
});
