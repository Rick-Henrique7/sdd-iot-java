import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRoleGuard } from './useRoleGuard';

describe('useRoleGuard', () => {
  it('ROLE_OPERADOR lands on /operator/workspace', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_OPERADOR')).toBe('/operator/workspace');
  });

  it('ROLE_AGRONOMO lands on /dashboard', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_AGRONOMO')).toBe('/dashboard');
  });

  it('ROLE_GESTOR lands on /dashboard', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.landingPath('ROLE_GESTOR')).toBe('/dashboard');
  });

  it('ROLE_OPERADOR is locked to /operator/**', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.hasAccess('ROLE_OPERADOR', '/operator/workspace')).toBe(true);
    expect(result.current.hasAccess('ROLE_OPERADOR', '/dashboard')).toBe(false);
    expect(result.current.hasAccess('ROLE_OPERADOR', '/mapping')).toBe(false);
  });

  it('public paths are always accessible', () => {
    const { result } = renderHook(() => useRoleGuard());
    expect(result.current.hasAccess('ROLE_OPERADOR', '/login')).toBe(true);
    expect(result.current.hasAccess('ROLE_GESTOR', '/register')).toBe(true);
    expect(result.current.hasAccess('ROLE_AGRONOMO', '/')).toBe(true);
  });

  it('Agrônomo and Gestor can access all /gestor paths', () => {
    const { result } = renderHook(() => useRoleGuard());
    for (const path of ['/dashboard', '/mapping', '/operations', '/fleet', '/maintenance', '/settings']) {
      expect(result.current.hasAccess('ROLE_AGRONOMO', path)).toBe(true);
      expect(result.current.hasAccess('ROLE_GESTOR', path)).toBe(true);
    }
  });
});
