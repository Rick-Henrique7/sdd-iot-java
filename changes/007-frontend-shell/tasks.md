# Change 007 — `frontend-shell` — Tasks

## 1. SDD artifacts
- [x] `changes/007-frontend-shell/proposal.md`
- [x] `changes/007-frontend-shell/spec.md`
- [x] `changes/007-frontend-shell/design.md`
- [x] `changes/007-frontend-shell/tasks.md`

## 2. Project scaffold
- [x] `frontend-shell/package.json` — Next 14, TS, Tailwind, Zustand,
      React Query, axios, lucide-react, Vitest.
- [x] `frontend-shell/tsconfig.json` (strict, `paths: { "@/*": ["./src/*"] }`).
- [x] `frontend-shell/next.config.mjs` (`output: 'standalone'`).
- [x] `frontend-shell/tailwind.config.ts` with the brand palette.
- [x] `frontend-shell/postcss.config.mjs`.
- [x] `frontend-shell/vitest.config.ts`.
- [x] `frontend-shell/.eslintrc.json` (Next defaults).
- [x] `frontend-shell/.dockerignore` and `frontend-shell/.gitignore`.

## 3. Source code
- [x] `src/app/layout.tsx` — Inter font, dark palette, providers.
- [x] `src/app/globals.css` — Tailwind imports + base body colour.
- [x] `src/app/page.tsx` — `redirect('/dashboard')` or `/login`.
- [x] `src/app/login/page.tsx` + `src/components/auth/LoginForm.tsx`.
- [x] `src/app/register/page.tsx` + `src/components/auth/RegisterForm.tsx`.
- [x] `src/app/(app)/layout.tsx` — wraps the shell + AuthGate.
- [x] `src/components/layout/{AppShell,Sidebar,Header}.tsx`.
- [x] `src/components/auth/BrandPanel.tsx`.
- [x] `src/components/ui/{Button,Input,Select,Logo}.tsx`.
- [x] `src/stores/authStore.ts` — Zustand.
- [x] `src/lib/api.ts` — axios + JWT interceptor.
- [x] `src/lib/queryClient.ts`.
- [x] `src/hoc/withAuth.tsx` — client guard.
- [x] `src/hooks/useLogout.ts`.
- [x] `src/types/{auth,api}.ts` — DTOs.
- [x] `src/styles/tokens.ts` — TS constants matching the CSS.

## 4. Placeholder modules
- [x] `src/app/(app)/dashboard/page.tsx` — "Change 008" card.
- [x] `src/app/(app)/mapping/page.tsx`   — "Change 009" card.
- [x] `src/app/(app)/fleet/page.tsx`     — "Change 009" card.
- [x] `src/app/(app)/settings/page.tsx`  — "Change 010" card.

## 5. Tests
- [x] `src/stores/authStore.test.ts` — set / clear / isAuthenticated.
- [x] `src/lib/api.test.ts` — interceptor attaches / omits bearer.
- [x] `npm test` exits 0.

## 6. Container
- [x] `frontend-shell/Dockerfile` — multi-stage node:20-alpine,
      non-root, `CMD ["node", "server.js"]`, `EXPOSE 3000`.
- [x] `docker-compose.yml` — enable `frontend-shell` block.
- [x] `.github/workflows/docker-image.yml` — add
      `frontend-shell` to the matrix (Dockerfile path
      `frontend-shell/Dockerfile`).
- [x] `.github/workflows/ci.yml` — add a `Build & test (frontend)`
      step that runs `npm ci && npm test && npm run build`.

## 7. Local validation
- [x] `npm ci && npm test && npm run build` exits 0.
- [x] `docker compose up -d frontend-shell` — container healthy.
- [x] `curl localhost:3000/login` returns 200 with the brand panel.
- [x] End-to-end: register a new user, land on `/dashboard`,
      refresh, click Sair, redirected to `/login`.

## 8. Git
- [x] Single commit: `feat(fe): ship Change 007 - frontend-shell`.
- [x] Push to `origin/main`.
- [x] CI green.
- [x] Docker Image green; new `agrio-frontend-shell` image in GHCR.
