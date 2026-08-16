import { describe, it, expect, beforeEach } from 'vitest';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { api } from './api';

describe('api axios interceptor', () => {
  beforeEach(() => {
    localStorage.clear();
    useAuthStore.setState({ token: null, user: null });
  });

  it('omits Authorization when no token is in the store', async () => {
    let captured: Record<string, unknown> | undefined;
    const stub = axios.create();
    stub.interceptors.request.use((c) => {
      captured = c.headers as unknown as Record<string, unknown>;
      return c;
    });
    // Pull the same request-config through our instance to compare.
    const cfg = { headers: new axios.AxiosHeaders() } as any;
    await api.interceptors.request.handlers?.[0]?.fulfilled?.(cfg);
    expect((cfg.headers as Record<string, unknown>).Authorization).toBeUndefined();
  });

  it('attaches Bearer token from the store', async () => {
    useAuthStore.getState().setSession('jwt-abc', {
      id: 'u1', email: 'a@b.com', role: 'ROLE_OPERADOR',
    });
    const cfg = { headers: new axios.AxiosHeaders() } as any;
    await api.interceptors.request.handlers?.[0]?.fulfilled?.(cfg);
    expect(cfg.headers.Authorization).toBe('Bearer jwt-abc');
  });

  it('drops the header after clear()', async () => {
    useAuthStore.getState().setSession('jwt-abc', {
      id: 'u1', email: 'a@b.com', role: 'ROLE_OPERADOR',
    });
    useAuthStore.getState().clear();
    const cfg = { headers: new axios.AxiosHeaders() } as any;
    await api.interceptors.request.handlers?.[0]?.fulfilled?.(cfg);
    expect(cfg.headers.Authorization).toBeUndefined();
  });
});
