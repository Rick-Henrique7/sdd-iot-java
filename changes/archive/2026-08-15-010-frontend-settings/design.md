# Change 010 — `frontend-settings` — Design

> **Technical decisions, trade-offs, and how the spec is realized in code.**

---

## 1. Module layout

```
frontend-shell/src/
├── modules/
│   └── settings/                       # NEW
│       ├── Settings.tsx                # page composition
│       ├── ProfileCard.tsx             # read-only user info
│       ├── ThresholdForm.tsx           # 4 inputs + validation
│       ├── SessionCard.tsx             # JWT countdown + logout
│       └── AboutCard.tsx               # platform + docs
├── stores/
│   ├── authStore.ts                    # existing
│   └── preferencesStore.ts             # NEW (Zustand + localStorage)
├── hooks/
│   ├── useAuthStore.ts                  # re-export for convenience
│   └── usePreferences.ts               # NEW: typed read/write
├── lib/
│   ├── jwt.ts                           # NEW: tiny base64url decode
│   └── version.ts                       # NEW: re-export package.json
├── components/ui/
│   └── Toast.tsx                        # NEW: tiny ephemeral toast
└── app/
    └── (app)/settings/page.tsx          # replace placeholder
```

## 2. The `preferencesStore`

The alert thresholds are **frontend-only state** in this
change — the backend has no PATCH endpoint for them. We
still want the operator's edits to survive a refresh, so:

```ts
interface PreferencesState {
  thresholds: {
    engineTempWarning: number;
    engineTempCritical: number;
    rpmWarning: number;
    rpmCritical: number;
  };
  setThresholds: (t: Partial<Thresholds>) => void;
  resetThresholds: () => void;
  hydrate: () => void;
}
```

The store mirrors `authStore`'s `hydrate()` pattern: on boot,
read from `localStorage` (`agrio.preferences`); on write,
mirror back. The dashboard's `useKpis` swaps its hard-coded
`95/100` for `usePreferences((s) => s.thresholds)`.

`resetThresholds()` returns to the defaults the spec calls
out: `{ engineTempWarning: 90, engineTempCritical: 95,
rpmWarning: 2300, rpmCritical: 2500 }`.

## 3. JWT decode

We need the `iat` and `exp` claims for the session card.
JJWT is a Java library; on the client we only need a tiny
base64url decoder. `src/lib/jwt.ts`:

```ts
export interface JwtClaims {
  sub?: string;
  roles?: string;
  iat?: number;
  exp?: number;
}

export function decodeJwt(token: string): JwtClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  try {
    const payload = parts[1]
      .replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload + '==='.slice((payload.length + 3) % 4);
    return JSON.parse(atob(padded)) as JwtClaims;
  } catch {
    return null;
  }
}
```

We don't verify the signature on the client (the gateway
already does); we just need the claims for display.

## 4. Threshold validation

A tiny pure function (`src/lib/thresholdValidation.ts`) keeps
the rules out of the JSX:

```ts
export type ThresholdErrors = Partial<Record<keyof Thresholds, string>>;

export function validateThresholds(t: Thresholds): ThresholdErrors {
  const errors: ThresholdErrors = {};
  if (t.engineTempWarning >= t.engineTempCritical) {
    errors.engineTempCritical = 'Alerta deve ser menor que o critico.';
  }
  if (t.rpmWarning >= t.rpmCritical) {
    errors.rpmCritical = 'Alerta deve ser menor que o critico.';
  }
  for (const [k, v] of Object.entries(t) as [keyof Thresholds, number][]) {
    if (Number.isNaN(v) || v < MIN[k] || v > MAX[k]) {
      errors[k] = `Valor fora da faixa [${MIN[k]}, ${MAX[k]}].`;
    }
  }
  return errors;
}
```

`MIN` and `MAX` are the same constants used by the form to
declare the input ranges — they live next to the validation
function so the two can never drift.

## 5. Toast

The two settings actions ("Aplicado nesta sessão" and
"Copiado") need ephemeral feedback. A global toast system
is overkill for two calls; we lift a small `Toast` state
into the `<Settings />` page and pass `pushToast(msg)` down
to the children. The toast is a small absolutely-positioned
pill at the bottom-right of the page; CSS animation handles
the entrance / exit; `setTimeout` clears it after 2–3 s.

## 6. State & data flow

```
       +---------------------+
       |  authStore.user      | <-- hydration
       |  authStore.token     |
       +----------+----------+
                  |
       +----------v----------+        +---------------------+
       |  <ProfileCard />     |        |  preferencesStore    |
       |  <SessionCard />     |        |  (localStorage)      |
       +----------+----------+        +----------+------------+
                  |                               |
       +----------v----------+        +----------v------------+
       |  <Settings />       |<------>|  <ThresholdForm />    |
       |   (page)            |        |  validate + persist   |
       +---------------------+        +-----------------------+
                                                |
                                                v
                                       +---------------------+
                                       |  <Dashboard />       |
                                       |  useKpis reads store |
                                       |  -> temp tone        |
                                       +---------------------+
```

## 7. Tests

1. `src/stores/preferencesStore.test.ts` — set / reset / hydrate,
   localStorage round-trip.
2. `src/lib/thresholdValidation.test.ts` — happy path, the
   `warning >= critical` rule, range errors.
3. `src/lib/jwt.test.ts` — round-trip of a fixture token, invalid
   token returns null.
4. `npm test` exits 0.

## 8. What is **not** changed

- **No backend change.** The thresholds don't round-trip to
  the server; the spec's "applied for this session" is
  literal. A future change adds `PATCH /api/v1/alerts/thresholds`
  and a `thresholdRepository` on `alert-processing-service`.
- **No auth PATCH.** Profile stays read-only.
- **No theme switcher, no notification channels.** All out of
  scope.
- **No new container, no new env var.**
