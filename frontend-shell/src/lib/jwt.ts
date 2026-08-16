/**
 * Minimal JWT decoder for the front-end. We do NOT verify the
 * signature here — that's the api-gateway's job. We only need
 * the claims (sub, iat, exp, roles) to display the session
 * card and derive the "Membro desde" date.
 */
export interface JwtClaims {
  sub?: string;
  roles?: string;
  iat?: number;
  exp?: number;
}

export function decodeJwt(token: string | null): JwtClaims | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // atob wants length mod 4 === 0; pad with `=`.
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    const json =
      typeof atob === 'function'
        ? atob(padded)
        : Buffer.from(padded, 'base64').toString('binary');
    return JSON.parse(json) as JwtClaims;
  } catch {
    return null;
  }
}

export function formatRemaining(exp: number | undefined, now: number = Date.now()): string {
  if (!exp) return '—';
  const ms = exp * 1000 - now;
  if (ms <= 0) return 'expirado';
  const m = Math.floor(ms / 60_000);
  const h = Math.floor(m / 60);
  if (h > 0) return `${h}h ${m % 60}m`;
  return `${m}m`;
}
