# Change 010 — `frontend-settings` — Spec

> **Behavioural contract. The settings page, end to end.**

---

## 1. Page: `/settings`

### F1.1 — Profile card
- Renders the signed-in `authStore.user`:
  - `name` (from `user.name` or `user.email.split('@')[0]`)
  - `email`
  - `role` (uppercased, in a `<Badge />`)
  - "Membro desde" (formatted from the JWT `iat` claim)
- All four fields are **read-only** in this change. No edit
  button. A small footer line notes "Profile editing arrives
  in a future change".

### F1.2 — Alert thresholds
- Four numeric inputs:
  - `Temperatura do motor — alerta (°C)` (default 90, range
    60–110)
  - `Temperatura do motor — crítico (°C)` (default 95, range
    60–110)
  - `Rotação (RPM) — alerta` (default 2300, range 1000–4000)
  - `Rotação (RPM) — crítico` (default 2500, range 1000–4000)
- Two form-level validations:
  - warning < critical for the same metric
  - values within the documented range
- "Aplicar" button: persists to the in-session
  `preferencesStore` (which the dashboard already reads via
  `useKpis`), and shows a green "Aplicado nesta sessão" toast
  for 3 s.
- "Restaurar padrões" button: resets to the values above.
- Footer note: "Limites serao persistidos no backend em uma
  change futura. Por enquanto, ficam ativos apenas nesta
  sessao."

### F1.3 — Session card
- Shows the JWT issued-at, expires-at, and a countdown.
- "Copiar token" button: copies the raw JWT to the clipboard
  with a "Copiado" toast for 2 s.
- "Encerrar sessao" button: triggers `useLogout()`.

### F1.4 — About card
- Platform name: **Agro-IoT Enterprise**.
- Version: `1.0.0` (read from `package.json`).
- Three doc links (`blueprint.md`, `struct-frontend.md`,
  `CHANGELOG.md`) — placeholder, opened in a new tab via
  `target="_blank" rel="noreferrer"`.

### F1.5 — Layout
```
+----------------------------------------------------------+
|  Configuracoes                                            |
|                                                          |
|  +-- Perfil -----------+  +-- Limites de alerta -------+  |
|  | name                |  | Temp alerta  [ 90 ] °C    |  |
|  | email               |  | Temp critico [ 95 ] °C    |  |
|  | role      [AGRONOMO]|  | RPM alerta   [ 2300 ]      |  |
|  | membro desde 2026-08|  | RPM critico  [ 2500 ]      |  |
|  +--------------------+  |  [Aplicar] [Restaurar]     |  |
|                          +----------------------------+  |
|                                                          |
|  +-- Sessao -----------+  +-- Sobre -------------------+  |
|  | expira em 11h 54m  |  | Agro-IoT Enterprise        |  |
|  | [Copiar token]     |  | v1.0.0                     |  |
|  | [Encerrar sessao]  |  | docs / changelog           |  |
|  +--------------------+  +----------------------------+  |
+----------------------------------------------------------+
```

## 2. Data sources

| Surface               | Source                                       | Cadence |
|-----------------------|----------------------------------------------|---------|
| Profile fields        | `useAuthStore((s) => s.user)`                 | live    |
| JWT iat / exp         | decoded from `useAuthStore((s) => s.token)`  | live    |
| Alert thresholds      | `usePreferencesStore` (Zustand, localStorage)| per change |
| Platform version      | build-time constant from `package.json`      | —       |

The dashboard's `useKpis` already reads from
`usePreferencesStore` (this change extends the store; the
dashboard's `avgTemp` and `alertTone` derivation gains the
user's thresholds instead of using the hard-coded 95/100).

## 3. Non-functional requirements

1. **No backend change.** All editing is in-session.
2. **Persisted across refresh** via `localStorage` (the
   `preferencesStore` hydrates on boot).
3. **Form validation is synchronous** — no async calls.
4. **Tests** — vitest covers the `preferencesStore` (push /
   reset / hydrate) and the threshold validation rules.

## 4. Acceptance criteria

1. `npm test` exits 0 with the new `preferencesStore` and
   threshold-validation cases.
2. `npm run build` succeeds. Settings chunk < 50 KB First
   Load JS.
3. `docker compose up -d frontend-shell` renders
   `http://localhost:3000/settings`:
   - Profile shows the signed-in user.
   - Alert thresholds form accepts the four values, validates
     `warning < critical`, and persists across refresh.
   - Session card shows the JWT expiry, the copy button
     works, the logout button signs out.
   - About card shows the platform name and version.
4. The dashboard's `Temp. Media` KPI tone updates live when
   the threshold is changed.
5. 0 browser console errors at idle.
