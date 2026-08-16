# Change 010 — `frontend-settings` — Proposal

## Why
The platform is end-to-end functional: the operator can see the
fleet, the live dashboard, the heatmap, and the field-plot seed
on a map. But the `/settings` page is still a placeholder. The
operator has no place to see **who is signed in**, **what the
alert thresholds are**, or to **log out cleanly** (today the
only logout is the small button in the header — fine for power
users, surprising for first-time visitors).

This change fills the gap with a small settings surface that
focuses on **transparency** (profile, session, about) and on
**preferences the operator already cares about** (alert
thresholds), without forcing a backend change in the same
release.

## What

### `/settings` page
- **Profile card** — read-only display of the signed-in
  `authStore.user`: name, email, role, last sign-in (derived
  from the JWT `iat` claim). No editing in this change.
- **Alert thresholds** — a form for the four values the
  `AlertEvaluatorService` already evaluates (warning /
  critical for `engineTemp` and `rpm`). The form is **editable
  in-session** (the operator can experiment and see the
  results in the dashboard's KPI tones) but is **not yet
  persisted** to the backend. We show a small "applied for
  this session" hint and a TODO for a future change that
  adds the backend PATCH endpoint.
- **Session card** — JWT expiry, copy-token-to-clipboard,
  sign out. The sign-out button is the same as the one in
  the header (it just lives here too, for discoverability).
- **About card** — platform name, version, a link to the
  `blueprint.md` and `struct-frontend.md` docs.

## Non-goals

- **No PATCH `/api/v1/auth/me`** — the auth-service doesn't
  expose a user-update endpoint yet. Profile stays read-only
  until a backend change adds it.
- **No PATCH for thresholds** — the alert thresholds are
  read in-process only in this change. A future change
  extends `alert-processing-service` with a config endpoint
  and wires the front-end to it.
- **No theme switcher** — the spec is dark-only for now.
- **No real-time alerting preferences** — the operator can
  edit thresholds but cannot subscribe to per-equipment
  webhooks; that's a separate "notification channel" change.

## Affected layers

- **Frontend only** — `frontend-shell/` gains
  `src/modules/settings/` (page + components), a small
  `src/stores/preferencesStore.ts` (Zustand, in-memory +
  localStorage so the operator's edits survive a refresh),
  and replaces the placeholder at
  `src/app/(app)/settings/page.tsx`.
- **No backend change.**

## Out of scope (future changes)

- **PATCH /api/v1/auth/me** for editable profile fields.
- **PATCH /api/v1/alerts/thresholds** + persistence on the
  alert-processing-service.
- **Notification channels** (webhook / email / push).
- **Audit log of preference changes**.
