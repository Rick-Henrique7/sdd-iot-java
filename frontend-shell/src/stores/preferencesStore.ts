import { create } from 'zustand';
import {
  DEFAULT_THRESHOLDS,
  type Thresholds,
} from '@/lib/thresholdValidation';

/**
 * Operator preferences. In Change 010, the only preference
 * exposed is the alert-threshold set used by the dashboard's
 * KPI tone derivation. Persisted to localStorage so edits
 * survive a refresh; until a future change adds the backend
 * PATCH, "persisted" means "in this browser" — the spec calls
 * this out explicitly.
 *
 * Mirrors the `authStore` `hydrate()` pattern.
 */
const STORAGE_KEY = 'agrio.preferences';

interface PreferencesState {
  thresholds: Thresholds;
  setThresholds: (t: Partial<Thresholds>) => void;
  resetThresholds: () => void;
  hydrate: () => void;
}

function readFromStorage(): Thresholds {
  if (typeof window === 'undefined') return DEFAULT_THRESHOLDS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_THRESHOLDS;
    const parsed = JSON.parse(raw) as Partial<Thresholds>;
    return { ...DEFAULT_THRESHOLDS, ...parsed };
  } catch {
    return DEFAULT_THRESHOLDS;
  }
}

function writeToStorage(t: Thresholds) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  thresholds: DEFAULT_THRESHOLDS,
  setThresholds: (partial) => {
    set((state) => {
      const next = { ...state.thresholds, ...partial };
      writeToStorage(next);
      return { thresholds: next };
    });
  },
  resetThresholds: () => {
    writeToStorage(DEFAULT_THRESHOLDS);
    set({ thresholds: DEFAULT_THRESHOLDS });
  },
  hydrate: () => {
    set({ thresholds: readFromStorage() });
  },
}));

export const useThresholds = () => usePreferencesStore((s) => s.thresholds);
