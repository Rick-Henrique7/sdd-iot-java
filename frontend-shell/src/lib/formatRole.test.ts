import { describe, it, expect } from 'vitest';
import { formatRole } from './formatRole';

describe('formatRole', () => {
  it('returns the Portuguese label for ROLE_OPERADOR', () => {
    expect(formatRole('ROLE_OPERADOR')).toBe('Operador');
  });

  it('returns the Portuguese label for ROLE_AGRONOMO', () => {
    expect(formatRole('ROLE_AGRONOMO')).toBe('Agrônomo');
  });

  it('returns the Portuguese label for ROLE_GESTOR', () => {
    expect(formatRole('ROLE_GESTOR')).toBe('Gestor');
  });

  it('returns the em-dash placeholder for null / undefined', () => {
    expect(formatRole(null)).toBe('—');
    expect(formatRole(undefined)).toBe('—');
  });

  it('falls back to the raw value for unknown roles', () => {
    expect(formatRole('ROLE_FUTURO')).toBe('ROLE_FUTURO');
  });
});
