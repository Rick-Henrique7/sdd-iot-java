import { describe, it, expect, beforeEach } from 'vitest';
import { usePreferencesStore } from './preferencesStore';
import { DEFAULT_THRESHOLDS } from '@/lib/thresholdValidation';

const STORAGE_KEY = 'agrio.preferences';

describe('preferencesStore', () => {
  beforeEach(() => {
    localStorage.clear();
    usePreferencesStore.setState({
      thresholds: { ...DEFAULT_THRESHOLDS },
    });
  });

  it('starts with the default thresholds', () => {
    expect(usePreferencesStore.getState().thresholds).toEqual(DEFAULT_THRESHOLDS);
  });

  it('setThresholds merges and persists to localStorage', () => {
    usePreferencesStore.getState().setThresholds({ engineTempCritical: 100 });
    const s = usePreferencesStore.getState();
    expect(s.thresholds.engineTempCritical).toBe(100);
    expect(s.thresholds.engineTempWarning).toBe(DEFAULT_THRESHOLDS.engineTempWarning);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored.engineTempCritical).toBe(100);
  });

  it('resetThresholds returns to defaults and clears storage', () => {
    usePreferencesStore.getState().setThresholds({ rpmCritical: 9999 });
    expect(usePreferencesStore.getState().thresholds.rpmCritical).toBe(9999);
    usePreferencesStore.getState().resetThresholds();
    expect(usePreferencesStore.getState().thresholds).toEqual(DEFAULT_THRESHOLDS);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    expect(stored).toEqual(DEFAULT_THRESHOLDS);
  });

  it('hydrate reads from localStorage when present', () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ engineTempWarning: 80, engineTempCritical: 85, rpmWarning: 2000, rpmCritical: 2400 }),
    );
    usePreferencesStore.getState().hydrate();
    expect(usePreferencesStore.getState().thresholds).toEqual({
      engineTempWarning: 80,
      engineTempCritical: 85,
      rpmWarning: 2000,
      rpmCritical: 2400,
    });
  });

  it('hydrate is a no-op when storage is empty', () => {
    usePreferencesStore.getState().hydrate();
    expect(usePreferencesStore.getState().thresholds).toEqual(DEFAULT_THRESHOLDS);
  });
});
