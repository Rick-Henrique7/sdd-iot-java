# Change 010 — `frontend-settings` — Tasks

## 1. SDD artifacts
- [x] `changes/010-frontend-settings/{proposal,spec,design,tasks}.md`

## 2. Lib / shared pieces
- [x] `src/lib/jwt.ts` — `decodeJwt(token)` returning
      `{ sub, roles, iat, exp }`.
- [x] `src/lib/thresholdValidation.ts` — pure validator
      with the `MIN` / `MAX` constants and the
      `warning < critical` rule.
- [x] `src/lib/version.ts` — re-export the `1.0.0` from
      `package.json`.
- [x] `src/components/ui/Toast.tsx` — small bottom-right
      pill driven by `setTimeout`.

## 3. Stores / hooks
- [x] `src/stores/preferencesStore.ts` — Zustand store with
      `thresholds`, `setThresholds`, `resetThresholds`,
      `hydrate`, mirrored to `localStorage`.
- [x] Update `src/hooks/useKpis.ts` to read the thresholds
      from `usePreferencesStore` instead of the hard-coded
      95 / 100.

## 4. UI components
- [x] `src/modules/settings/ProfileCard.tsx` — read-only
      name, email, role, "membro desde" derived from
      `authStore.user` and the JWT.
- [x] `src/modules/settings/ThresholdForm.tsx` — 4 numeric
      inputs, validation, "Aplicar" / "Restaurar padrões",
      success toast.
- [x] `src/modules/settings/SessionCard.tsx` — JWT exp
      countdown, "Copiar token", "Encerrar sessao".
- [x] `src/modules/settings/AboutCard.tsx` — platform name,
      version, doc links.

## 5. Page
- [x] `src/modules/settings/Settings.tsx` — composes the
      four cards and owns the toast state.
- [x] `src/app/(app)/settings/page.tsx` — replace placeholder.

## 6. Tests
- [x] `src/stores/preferencesStore.test.ts` — push, reset,
      hydrate from localStorage.
- [x] `src/lib/thresholdValidation.test.ts` — happy path +
      edge cases.
- [x] `src/lib/jwt.test.ts` — fixture token round-trip.
- [x] `npm test` → 0 failures.

## 7. Local validation
- [x] `npm run build` → 0 errors. Settings chunk < 50 KB
      First Load JS.
- [x] `docker compose up -d frontend-shell` (with the rest
      of the stack up) renders `/settings` and:
      - Profile shows the signed-in user.
      - Threshold form validates `warning < critical`,
        persists across refresh.
      - Session card shows JWT expiry, copy works, logout
        signs out.
      - About card shows the platform name and version.
      - The dashboard's `Temp. Media` KPI tone updates
        live when the threshold is changed.
- [x] 0 browser console errors at idle.

## 8. Git
- [x] Single commit:
      `feat(fe): ship Change 010 - frontend-settings`.
- [x] Push to `origin/010-frontend-settings`.
- [x] Open PR, wait for CI green, squash-merge into `main`.
- [x] Archive Change 010 in
      `changes/archive/2026-08-15-010-frontend-settings/`.
