# Change 013 — Frontend polish + README expansion

## Why

Three loose ends accumulated during the 11 changes:

1. **README still doesn't list the infrastructure the platform runs
   on.** The current Section 3 mentions Spring Cloud Gateway, Spring
   Boot, Apache Kafka, PostgreSQL and Redis at a high level, but
   misses the explicit `Docker` / `Docker Compose` / `GitHub Container
   Registry` pillars (the platform is fully containerised and the
   CI ships images to GHCR). It also never names the **Clean Code**
   discipline even though every service and component follows it
   (small functions, meaningful names, no comments narrating obvious
   code, SRP).
2. **The frontend has dozens of Portuguese strings without
   accents** (e.g. `Mapeamento de Campo` → `Visualizacao geografica`,
   `Saude geral`, `Temp. Media`, `Gestao de Frota`, `Limites de
   alerta` → `padroes` → `padrao`, `decisao`, `sessao`, etc.). This
   is a UX bug — the page reads as machine-translated instead of
   as a native Brazilian product.
3. **The `/mapping` page has visible layout issues** when the map
   area is short:
   - the legend chips (`Operacional / Manutenção / Inativo`)
     appear glued together because `gap-4` is being collapsed by
     the flex container width;
   - the `OpenMeteoWidget` floats at the right edge of the map
     div and clips past the viewport when the panel column is
     narrow;
   - the `MapContainer` can render at `height: 0` on viewports
     smaller than the panel's `h-[60vh]` minimum, leaving the
     map blank.

The login screen and the login form's outer chrome are deliberately
**out of scope** — the user said "a tela inicial esta perfeita".

## What

### A. README expansion

- Add explicit `Docker` / `Docker Compose` / `GHCR` rows to the
  Section 3 tech stack.
- Add a 1-line mention of `Clean Code` (Clean Architecture, SRP,
  small functions, no comments narrating code) in the Section 9
  Governance summary and surface the same idea in a new
  Section 7.1 "Methodology".
- Add 3 new shields: `Docker`, `Apache Kafka`, `PostgreSQL`.
- Add a new Section 8.1 "How to test" with the exact PowerShell
  commands for the 45 backend tests and 52 frontend tests.

### B. Frontend spelling (PT-BR)

Touch every accented term that is currently unaccented across:

- `app/login/page.tsx` — text only, layout untouched.
- `app/register/page.tsx`.
- `components/auth/AuthForm.tsx` — error messages and hints only.
- `components/auth/BrandPanel.tsx` — text only.
- `components/layout/PlaceholderPage.tsx`.
- `components/dashboard/RelativeTime.tsx` — drop the Spanish
  `hace` and use Portuguese `há` / `agora`.
- `modules/dashboard/{Dashboard,KpiRow,FleetTable,AlertPanel}.tsx`.
- `modules/fleet/{Fleet,FleetTable,RegisterModal}.tsx`.
- `modules/mapping/{Mapping,OpenMeteoWidget}.tsx`.
- `modules/settings/{Settings,ProfileCard,SessionCard,AboutCard,ThresholdForm}.tsx`.

Concrete list (excerpt): `Visualização`, `geográfica`, `pulverização`,
`Saúde`, `Média`, `Críticos`, `Gestão`, `edição`, `Número`, `série`,
`Última`, `Ações`, `vértices`, `indisponível`, `técnica`, `Edição`,
`sessão`, `padrão`, `padrões`, `serão`, `operação`, `Já`, `inválidas`,
`Não`, `mínimo`, `agrícola`, `decisões`, `único`, `só`, `construção`,
`próxima`, `será`, `está`, `há`, `últimos`.

### C. Frontend padding/margin audit

- `Mapping.tsx`:
  - Legend `<footer>` gets `flex-wrap gap-x-6 gap-y-2` and
    `whitespace-nowrap` on each chip so the chips read with clear
    separation and don't wrap awkwardly on narrow viewports.
  - Map container gets `min-h-[420px]` to guarantee a visible
    map area even when the column is short.
  - `OpenMeteoWidget` wrapper gets `z-10` and `max-w-[14rem]` so
    it never overflows the panel.
  - Status summary badge gets `mr-2` margin between the legend
    chips and the "N equipamentos" count.

## Out of scope

- Login / register screen layout (the user said "esta perfeita").
- No new dependency.
- No backend change.
- `docs/` directory is unchanged — the per-module specs are
  still authoritative.
