import { describe, it, expect } from 'vitest';
import { decodeJwt, formatRemaining } from './jwt';

/** Build a JWT with the given payload, base64url-encoded. */
function makeToken(payload: Record<string, unknown>): string {
  const enc = (s: string) =>
    Buffer.from(s, 'utf-8')
      .toString('base64')
      .replace(/=+$/, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  return `hdr.${enc(JSON.stringify(payload))}.sig`;
}

describe('decodeJwt', () => {
  it('returns null for an empty / null token', () => {
    expect(decodeJwt(null)).toBeNull();
    expect(decodeJwt('')).toBeNull();
  });

  it('returns null for a malformed token', () => {
    expect(decodeJwt('not-a-jwt')).toBeNull();
    expect(decodeJwt('only.two')).toBeNull();
  });

  it('returns the parsed claims for a valid token', () => {
    const token = makeToken({
      sub: 'a@b.com',
      roles: 'ROLE_AGRONOMO',
      iat: 1700000000,
      exp: 1700086400,
    });
    const claims = decodeJwt(token);
    expect(claims).toEqual({
      sub: 'a@b.com',
      roles: 'ROLE_AGRONOMO',
      iat: 1700000000,
      exp: 1700086400,
    });
  });
});

describe('formatRemaining', () => {
  it('returns a dash for undefined', () => {
    expect(formatRemaining(undefined)).toBe('—');
  });

  it('returns "expirado" for a past exp', () => {
    expect(formatRemaining(1)).toBe('expirado');
  });

  it('formats in minutes when < 1 h', () => {
    // Allow a one-minute tolerance: the test's `Date.now()` and
    // the call inside `formatRemaining` are not the same tick.
    const exp = Math.floor((Date.now() + 30 * 60_000) / 1000);
    const out = formatRemaining(exp);
    expect(out).toMatch(/^(29|30)m$/);
  });

  it('formats in hours + minutes when >= 1 h', () => {
    const exp = Math.floor((Date.now() + 2 * 60 * 60_000 + 15 * 60_000) / 1000);
    const out = formatRemaining(exp);
    expect(out).toMatch(/^2h (14|15)m$/);
  });
});
