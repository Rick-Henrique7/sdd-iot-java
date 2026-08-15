# frontend-shell

Next.js 14 (App Router, TypeScript, Tailwind CSS) shell for the
Agro-IoT platform. Shipped in **Change 007**.

## What's in here

* `/login` and `/register` — split-screen auth pages that talk to
  `auth-service` through the `api-gateway` (Changes 001 + 002).
* `/dashboard`, `/mapping`, `/fleet`, `/settings` — authenticated
  shell with a collapsible sidebar. Each module is a placeholder
  that ships in its own change (008–010).
* **State plumbing** that subsequent changes reuse as-is:
  `Zustand` for auth/UI, `React Query` for data, `axios` with a
  JWT interceptor, `withAuth` HOC.

## Run

```bash
npm ci
npm test
npm run build
npm start            # production server on :3000
# or:
npm run dev          # hot reload on :3000

# point at a different backend (defaults to http://localhost:8080):
NEXT_PUBLIC_API_BASE_URL=http://api-gateway:8080 npm start
```

## Run with docker compose

```bash
docker compose up -d frontend-shell
open http://localhost:3000
```

## Layout

```
frontend-shell/
├── Dockerfile
├── package.json
├── tsconfig.json
├── next.config.mjs
├── tailwind.config.ts
├── postcss.config.mjs
├── vitest.config.ts
└── src/
    ├── app/
    │   ├── layout.tsx              # Inter font, dark palette
    │   ├── providers.tsx           # QueryClientProvider
    │   ├── globals.css
    │   ├── page.tsx                # redirect to /login
    │   ├── login/page.tsx
    │   ├── register/page.tsx
    │   └── (app)/                  # authenticated area
    │       ├── layout.tsx          # AuthGate + AppShell
    │       ├── dashboard/page.tsx  # placeholder
    │       ├── mapping/page.tsx    # placeholder
    │       ├── fleet/page.tsx      # placeholder
    │       └── settings/page.tsx   # placeholder
    ├── components/
    │   ├── ui/                     # Button, Input, Select, Logo
    │   ├── layout/                 # AppShell, Sidebar, Header, PlaceholderPage
    │   └── auth/                   # BrandPanel, AuthForm
    ├── stores/authStore.ts
    ├── lib/
    │   ├── api.ts                  # axios + JWT interceptor
    │   ├── queryClient.ts
    │   └── routes.ts
    ├── hooks/useLogout.ts
    ├── hoc/                        # (Change 008)
    ├── types/                      # auth + api DTOs
    └── styles/tokens.ts
```

## Configuration

| Env var                    | Default                 | Meaning                          |
|----------------------------|-------------------------|----------------------------------|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:8080` | Base URL for the api-gateway     |
| `PORT`                     | `3000`                  | Production port                  |

## Design tokens

All colours come from `docs/frontend/blueprint.md` and are mirrored
in `tailwind.config.ts` and `src/styles/tokens.ts`. No new colours
should be added without updating both.
