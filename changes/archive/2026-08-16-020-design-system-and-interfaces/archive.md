# Change 020 — design-system-and-interfaces (archived 2026-08-16)

## Status

✅ **Shipped to `main` via PR #18** (squash-merge commit `6d0387ec`).
✅ All 3 CI jobs green: `Validate SDD artifacts`, `Build & test (Maven)`,
`Build & test (frontend-shell)`.

## What was in the PR

PR #18 implemented the Design System foundation and the 3 Operator
components that Change 021 will compose into the dedicated
`/operator/workspace` route. Detailed blueprint in
`docs/frontend/design-system-and-interfaces.md`.

### 1 commit (squashed from `c46c30f`)

- 3 new components in `frontend-shell/src/modules/operator/`:
  `OperatorHeader`, `OrderActionDock`, `DowntimeModal`
- 2 new TanStack Query hooks: `useDowntimeMutation` (POST),
  `useOrderStatusMutation` (PATCH)
- 1 new route group: `app/operator/{layout.tsx, workspace/page.tsx}`
- 1 new ESLint plugin: `.eslint-plugin/eslint-plugin-local/` (custom
  `no-emoji` rule, registered as `error`)
- 1 new ESLint config: `.eslintrc.js` (replaces legacy `.eslintrc.json`)
- 1 barrel export: `src/modules/operator/index.ts`
- 5 new vitest tests for `DowntimeModal`
- 1 entry in `tailwind.config.ts` (formalizing `warning: #F59E0B`)
- 1 new entry in `src/lib/routes.ts` (`operatorWorkspace`)
- 4 SDD artifacts (the placeholder `tasks.md` was promoted to a real
  change, plus `proposal.md` + `spec.md` + `design.md`)
- README updated (badges, table, new §1.4 Personas + §1.5 Design System,
  diagram arrow fix, test counts)

**25 files changed (17 new, 7 modified, 1 promoted folder).**

## Design System

| Token        | Hex       | Role                                             |
|--------------|-----------|--------------------------------------------------|
| `bg`         | `#0F172A` | Canvas (slate-900). **No pure black anywhere.**  |
| `card`       | `#1E293B` | Cards / panels.                                  |
| `card-2`     | `#172033` | Sub-areas inside cards.                          |
| `border`     | `#334155` | 1px hairline.                                    |
| `fg`         | `#F8FAFC` | Primary text.                                    |
| `fg-muted`   | `#94A3B8` | Secondary text.                                  |
| `fg-body`    | `#CBD5E1` | Body copy.                                       |
| `brand`      | `#367C2B` | John Deere green (DEFAULT / hover / soft).       |
| `accent`     | `#FFDE00` | Agricultural yellow (brand).                      |
| `warning`    | `#F59E0B` | **NEW** — Mid-severity attention (amber-500).    |
| `critical`   | `#EF4444` | Critical alert.                                  |
| `info`       | `#3B82F6` | Informational.                                   |

### Inviolable anti-patterns

1. **Zero emojis** in any `.tsx` (lint-enforced via `local/no-emoji`).
2. **`font-mono`** for all numeric telemetry (RPM, temp, GPS, etc.).
3. **No color/weight variation** on the last word of a title.
4. **No pure black `#000000`** anywhere in the palette.

### `local/no-emoji` lint rule

- File: `frontend-shell/.eslint-plugin/no-emoji.js`
- Plugin wrapper: `frontend-shell/.eslint-plugin/eslint-plugin-local/index.js`
- Installed as a `file:` dependency in `frontend-shell/package.json`
- Registered as `error` in `.eslintrc.js`
- Covers Unicode ranges U+1F300–U+1FAFF and U+2600–U+27BF
- Visits: `Literal`, `TemplateElement`, `JSXText`, `JSXAttribute`

## Route structure

```
src/app/
├── (app)/                     # Gestor shell (existing)
│   ├── dashboard/             # ROLE_GESTOR / ROLE_AGRONOMO
│   ├── mapping/
│   ├── fleet/
│   └── settings/
├── login/                     # public
├── register/                  # public
└── operator/                  # NEW — Operator profile (Change 020)
    ├── layout.tsx             # AuthGate role=ROLE_OPERADOR
    └── workspace/
        └── page.tsx           # touch-friendly, no Sidebar
```

`AuthGate` in `app/operator/layout.tsx` redirects:
- No token → `/login`
- Wrong role (anything ≠ `ROLE_OPERADOR`) → `/dashboard`

## Verification

| Check                                       | Result                    |
| ------------------------------------------- | ------------------------- |
| `npm run lint`                              | 0 errors, 0 warnings      |
| `npm test` (vitest)                         | **57/57** across 12 files |
| `npm run build`                             | **11/11** static pages    |
| `docker compose build frontend-shell`       | image rebuilt             |
| `GET /operator/workspace` (live container)  | 200, 13.4 KB              |
| CI `Validate SDD artifacts`                 | success                   |
| CI `Build & test (Maven)`                   | success (56/56)           |
| CI `Build & test (frontend-shell)`          | success                   |

## Test breakdown (new tests)

| Test class                                  | Type               | Count |
| ------------------------------------------- | ------------------ | ----- |
| `DowntimeModal.test.tsx`                    | RTL + vitest       | 5     |
| **Total**                                   |                    | **5** |

## CSS / Docker rebuild note

The frontend-shell Docker image used by the running container was
originally built on **2026-08-16 11:52**, BEFORE the Tailwind content
paths fix landed in `main` (Change 013 + 017). That stale image served
a CSS bundle missing every `gap-*` / `min-h-0` / `flex-wrap` class used
by `src/modules/`. The new image (this PR) was rebuilt via
`docker compose build frontend-shell` after the SDD artifacts landed.

> **Operational rule for future frontend changes:** after any
> `frontend-shell/src/**` change that affects Tailwind class usage,
> run `docker compose build frontend-shell && docker compose up -d
> frontend-shell` before testing in the browser. The Next.js dev
> server is NOT used in the docker stack — only the production
> multi-stage build.

## Related

- Blueprint: `docs/frontend/design-system-and-interfaces.md`
- Companion spec: `docs/frontend/operator-profile-and-gestor-sidebar.md`
- PR: #18
- Commit: `6d0387ece0c3b2234f8e8f91b7f5314273e67ca5`
- Predecessor: Change 019 (field-operation-service, the API consumer
  of the new components)
- Successor: Change 021 (route groups paralelos + Sidebar 6-abas
  + `useRoleGuard` redirect)
