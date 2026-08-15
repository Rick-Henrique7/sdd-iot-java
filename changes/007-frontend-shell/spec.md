# Change 007 — `frontend-shell` — Spec

## Functional requirements

### F1. Login page (`/login`)

* Split-screen layout, **60% left** (brand panel with the Agro-IoT
  logotype, version chip, dark image overlay) and **40% right** (form).
* Two tabs at the top: **Entrar** (default) and **Cadastrar**.
* Form fields:
  * `E-mail` — text, required, valid email.
  * `Senha` — password, required, with eye toggle.
  * `Perfil de Acesso` — select with `Operador` / `Agrônomo` (UI only
    for now; backend already stores `UserRole`).
* Submit button is the brand green `#367C2B`.
* On success: store the JWT in `localStorage` and in the Zustand
  store, then `router.push('/dashboard')`.
* On failure: show the backend's error message (e.g. `Invalid
  credentials`) under the form, in `#EF4444`.
* Loading state disables the button and shows a small spinner.

### F2. Register page (`/register`)

* Same split-screen layout as Login.
* Fields: `Nome completo`, `E-mail`, `Senha`, `Confirmar senha`,
  `Perfil de Acesso`.
* Client-side validation: password match, ≥ 8 chars, email format.
* On success: same flow as login (auto-store JWT and redirect).
* On failure: show the backend's `email already in use` message.

### F3. Authenticated shell

* All routes under `/dashboard`, `/mapping`, `/fleet`, `/settings`
  require a valid JWT. If missing, redirect to `/login`.
* **Sidebar** (`Sidebar.tsx`) — collapsible:
  * Retracted: 60 px wide, icons only.
  * Expanded: 240 px, icons + labels + user email + Logout button.
  * Transition: `width 0.2s ease-in-out`.
* **Header** (`Header.tsx`) — 50 px tall:
  * Hamburger button (top-left, `top: 12 px; left: 16 px`).
  * "Agro-IoT" wordmark.
  * Connection status pill (`Kafka: On` for now; live status lands
    in Change 008).
  * User email and a "Sair" button on the right.
* **Content area** — padding 16 px, fills the rest of the viewport.

### F4. Placeholder modules

* `/dashboard` — header `Dashboard`, a one-line description, and a
  card "Implementado na Change 008".
* `/mapping` — same shape ("Change 009").
* `/fleet` — same shape ("Change 009").
* `/settings` — same shape ("Change 010").

These pages exist so the sidebar links work and the navigation is
testable end-to-end today.

### F5. API contract

* The frontend talks to `process.env.NEXT_PUBLIC_API_BASE_URL`
  (default `http://localhost:8080`).
* Endpoints used:
  * `POST /auth/login` → `{ token, user: { id, email, role } }`
  * `POST /auth/register` → same shape
  * All later endpoints (Change 008+) reuse the same axios client
    with the JWT attached by the interceptor.

### F6. State & security

* JWT is stored in `localStorage` under the key `agrio.token` and
  also mirrored in the Zustand store on app boot.
* The axios client reads from the store (single source of truth) and
  attaches `Authorization: Bearer <token>` to every request.
* Logout clears the store, the localStorage entry, and the
  React Query cache, then redirects to `/login`.

## Non-functional requirements

1. **Dark mode only.** No light theme for now — the spec and the
   brand palette are dark.
2. **Bundle size** — first-load JS for `/login` ≤ 200 KB gzipped
   (no MUI, no Leaflet, no chart libs in this change).
3. **Accessibility** — every form input has a `<label>`, the
   hamburger button has `aria-label`, focus rings are visible
   against the dark background.
4. **No emojis anywhere** — `lucide-react` only.
5. **Brand palette** is the one in `blueprint.md`:
   * `#0F172A` (bg), `#1E293B` (cards), `#334155` (border)
   * `#367C2B` (primary), `#FFDE00` (warning)
   * `#EF4444` (critical), `#3B82F6` (info)
   * `#F8FAFC` (H1), `#94A3B8` (H2), `#CBD5E1` (body)
6. **Container** — multi-stage `node:20-alpine`, non-root
   (`nextjs` UID 1001), `CMD ["node", "server.js"]`, `EXPOSE 3000`.

## Acceptance criteria

1. `npm test` exits 0 with at least the following cases:
   * Auth store: `setSession(token, user)` populates state; `clear()`
     resets it; `isAuthenticated` reflects token presence.
   * Axios interceptor: attaches `Authorization: Bearer <token>`
     when a token is in the store; skips it when cleared.
2. `npm run build` produces a `.next/` with `/login`, `/register`,
   and the four shell routes in the build manifest.
3. `docker compose up -d frontend-shell` (with the backend already
   running) starts a healthy container; `curl localhost:3000/login`
   returns 200 with the brand panel.
4. End-to-end:
   * Open `http://localhost:3000` → redirects to `/login`.
   * Click **Cadastrar**, fill the form, submit → success → land on
     `/dashboard` (placeholder page).
   * Refresh → still authenticated (token persisted).
   * Click **Sair** → back to `/login`.
5. The placeholder pages render without console errors and the
   sidebar highlights the active route.
