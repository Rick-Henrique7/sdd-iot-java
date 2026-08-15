# Change 007 — `frontend-shell` — Design

## Tech stack

* **Next.js 14** (App Router, Server Components for the brand panel,
  Client Components for the forms and shell).
* **TypeScript** (strict).
* **Tailwind CSS** — single source of design tokens, the brand
  palette is in `tailwind.config.ts`.
* **Zustand** — auth + UI state (`useAuthStore`).
* **TanStack Query v5** — server cache and retries
  (`<QueryClientProvider>` at the root).
* **axios** — single instance in `src/lib/api.ts` with an
  interceptor that reads the token from the Zustand store.
* **lucide-react** — icons (no emojis, ever).
* **Vitest** + **@testing-library/react** — for the auth store
  and a couple of pure utilities. No integration tests in this
  change (the live smoke is the docker compose end-to-end).

## Component layout

```
frontend-shell/
├── Dockerfile
├── .dockerignore
├── package.json
├── tsconfig.json
├── next.config.mjs          # output: 'standalone' for the multi-stage build
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
├── README.md
├── public/
└── src/
    ├── app/
    │   ├── layout.tsx              # Inter font, dark palette, providers
    │   ├── globals.css             # @tailwind base/components/utilities
    │   ├── page.tsx                # redirects to /login or /dashboard
    │   ├── login/
    │   │   └── page.tsx
    │   ├── register/
    │   │   └── page.tsx
    │   └── (app)/
    │       ├── layout.tsx          # shell (sidebar + header) + AuthGate
    │       ├── dashboard/page.tsx  # placeholder
    │       ├── mapping/page.tsx    # placeholder
    │       ├── fleet/page.tsx      # placeholder
    │       └── settings/page.tsx   # placeholder
    ├── components/
    │   ├── ui/
    │   │   ├── Button.tsx
    │   │   ├── Input.tsx
    │   │   ├── Select.tsx
    │   │   └── Logo.tsx
    │   ├── layout/
    │   │   ├── Sidebar.tsx
    │   │   ├── Header.tsx
    │   │   └── AppShell.tsx        # composes the two above
    │   └── auth/
    │       ├── LoginForm.tsx
    │       ├── RegisterForm.tsx
    │       └── BrandPanel.tsx
    ├── lib/
    │   ├── api.ts                  # axios instance + JWT interceptor
    │   ├── queryClient.ts          # QueryClient factory
    │   └── routes.ts               # path constants (single source of truth)
    ├── stores/
    │   └── authStore.ts            # zustand
    ├── hoc/
    │   └── withAuth.tsx            # client-side guard
    ├── hooks/
    │   └── useLogout.ts
    ├── types/
    │   ├── auth.ts
    │   └── api.ts
    └── styles/
        └── tokens.ts               # exported TS constants matching the CSS
```

## State & data flow

```
       +----------------------+
       |   Zustand (authStore)|
       |  token, user,        |
       |  isAuthenticated     |
       +----------+-----------+
                  |
                  v
   +--------------+--------------+
   |  axios interceptor           |
   |  Authorization: Bearer ...   |
   +--------------+--------------+
                  |
                  v
       +----------+-----------+
       |   api-gateway:8080    |
       |  (Spring Cloud GW)    |
       +----------------------+

       React Query sits on top
       of axios for everything
       that isn't auth (auth uses
       plain axios because we
       need the raw token).
```

* The **auth store** is the single source of truth for the token.
* The **axios interceptor** reads from the store on every request,
  not from `localStorage` (so a logout in one tab is reflected
  immediately).
* `localStorage` is only used to **hydrate** the store on app boot
  (handles the page-refresh case).
* The `(app)/layout.tsx` calls `useAuthStore.getState()` on mount
  to decide whether to render the shell or redirect to `/login`.

## Theming

Tailwind config:

```ts
theme: {
  extend: {
    colors: {
      bg:    '#0F172A',  // slate-900
      card:  '#1E293B',  // slate-800
      border:'#334155',  // slate-700
      brand: {
        DEFAULT: '#367C2B',
        hover:   '#2D6824',
      },
      accent:  '#FFDE00',  // amarelo agricola
      critical:'#EF4444',
      info:    '#3B82F6',
      fg: {
        DEFAULT: '#F8FAFC',  // H1
        muted:   '#94A3B8',  // H2
        body:    '#CBD5E1',  // body
      },
    },
    fontFamily: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
    },
  },
}
```

These are the only colors used. Anything else is a code review red
flag.

## Auth flow

1. `LoginForm` / `RegisterForm` do `axios.post('/auth/login', ...)`
   directly (no React Query — we need the raw token).
2. On 200: `useAuthStore.getState().setSession(token, user)` and
   `localStorage.setItem('agrio.token', token)`, then
   `router.push('/dashboard')`.
3. On 4xx: surface the backend's message in the form footer.
4. Logout: `useAuthStore.getState().clear()`,
   `localStorage.removeItem('agrio.token')`,
   `queryClient.clear()`, `router.push('/login')`.

## Docker

Multi-stage `node:20-alpine`:

* **Builder** — `npm ci`, `npm run build` (Next standalone output).
* **Runner** — non-root `nextjs` user, copies `.next/standalone`
  and `.next/static` plus `public/`, exposes 3000.

`docker-compose.yml` entry:

```yaml
frontend-shell:
  build:
    context: .
    dockerfile: frontend-shell/Dockerfile
  container_name: agrio-frontend-shell
  ports:
    - "3000:3000"
  environment:
    - NEXT_PUBLIC_API_BASE_URL=http://api-gateway:8080
  depends_on:
    - api-gateway
  networks:
    - agrio-network
```

## CI

* The existing `ci.yml` runs `./mvnw -B -fae verify` on the
  Maven reactor. This change adds an `npm` step in parallel
  for the frontend:

  ```yaml
  - name: Build & test (frontend)
    if: hashFiles('frontend-shell/package.json') != ''
    working-directory: frontend-shell
    run: |
      npm ci
      npm test
      npm run build
  ```

* `.github/workflows/docker-image.yml` matrix gets a new entry
  for `frontend-shell` (alongside the five backend services).

## What is **not** changed
- `init.sql` — no schema change.
- Any backend service — the frontend talks to `api-gateway` and
  `auth-service` exactly as the smoke tests already do.
- The existing `k8s/` manifests — out of scope.
