import { create } from 'zustand';
import type { UserSummary } from '@/types/auth';

const STORAGE_KEY = 'agrio.token';
const USER_KEY = 'agrio.user';

interface AuthState {
  token: string | null;
  user: UserSummary | null;
  setSession: (token: string, user: UserSummary) => void;
  clear: () => void;
  hydrate: () => void;
  isAuthenticated: () => boolean;
}

/**
 * Single source of truth for the JWT + current user.
 *
 * - On `setSession`, mirrors to localStorage so a page refresh
 *   keeps the user signed in.
 * - On `clear`, drops both. The axios interceptor reads from this
 *   store on every request, so a logout in one tab is reflected
 *   immediately in the next request.
 * - On boot, call `hydrate()` once (from the root layout) to
 *   re-populate from localStorage.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  token: null,
  user: null,

  setSession: (token, user) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, token);
      window.localStorage.setItem(USER_KEY, JSON.stringify(user));
    }
    set({ token, user });
  },

  clear: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
    set({ token: null, user: null });
  },

  hydrate: () => {
    if (typeof window === 'undefined') return;
    const token = window.localStorage.getItem(STORAGE_KEY);
    const raw = window.localStorage.getItem(USER_KEY);
    if (!token || !raw) return;
    try {
      const user = JSON.parse(raw) as UserSummary;
      set({ token, user });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(USER_KEY);
    }
  },

  isAuthenticated: () => Boolean(get().token),
}));
