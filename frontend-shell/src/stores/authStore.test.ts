import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';

describe('authStore', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null });
  });

  it('starts unauthenticated', () => {
    expect(useAuthStore.getState().isAuthenticated()).toBe(false);
    expect(useAuthStore.getState().user).toBeNull();
    expect(useAuthStore.getState().token).toBeNull();
  });

  it('setSession populates state and persists', () => {
    useAuthStore.getState().setSession('jwt-123', {
      id: 'u1',
      email: 'a@b.com',
      role: 'OPERATOR',
    });
    const s = useAuthStore.getState();
    expect(s.token).toBe('jwt-123');
    expect(s.user?.email).toBe('a@b.com');
    expect(s.isAuthenticated()).toBe(true);
    expect(localStorage.getItem('agrio.token')).toBe('jwt-123');
  });

  it('clear drops state and storage', () => {
    useAuthStore.getState().setSession('jwt-123', {
      id: 'u1', email: 'a@b.com', role: 'OPERATOR',
    });
    useAuthStore.getState().clear();
    const s = useAuthStore.getState();
    expect(s.token).toBeNull();
    expect(s.user).toBeNull();
    expect(s.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('agrio.token')).toBeNull();
  });

  it('hydrate re-populates from localStorage', () => {
    localStorage.setItem('agrio.token', 'jwt-xyz');
    localStorage.setItem('agrio.user', JSON.stringify({
      id: 'u2', email: 'x@y.com', role: 'AGRONOMIST',
    }));
    useAuthStore.getState().hydrate();
    const s = useAuthStore.getState();
    expect(s.token).toBe('jwt-xyz');
    expect(s.user?.role).toBe('AGRONOMIST');
  });

  it('hydrate drops the storage entry if user JSON is corrupt', () => {
    localStorage.setItem('agrio.token', 'jwt-xyz');
    localStorage.setItem('agrio.user', '{ not-json');
    useAuthStore.getState().hydrate();
    expect(useAuthStore.getState().token).toBeNull();
    expect(localStorage.getItem('agrio.token')).toBeNull();
  });
});
