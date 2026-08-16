# Change 013 — design

## Approach

Three independent patches, all in the same branch so they
land as a single PR.

### A. README

- Section 3 is reshaped as a 3-column table. Existing rows
  for Front-end / Edge / Backend / Auth are kept verbatim;
  4 new rows are inserted between the existing ones.
- 3 new shields are added after the existing `Next.js 14`
  shield:

  ```md
  [![Docker](https://img.shields.io/badge/Docker-24%2B-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
  [![Apache Kafka](https://img.shields.io/badge/Apache%20Kafka-7.4-231F20?logo=apachekafka&logoColor=white)](https://kafka.apache.org/)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
  ```

- The new Section 7.1 **Methodology** lives between the
  existing SDD section and Section 8 (Build & test). It
  surfaces Clean Code, Clean Architecture, Trunk-based
  branching, Conventional commits and the per-component
  `panel` + HOC + Zustand pattern in 5 bullets.
- The new Section 8.1 **How to test** is a 3-paragraph
  block listing the Maven Wrapper command, the npm
  commands, and the test counts.

### B. Frontend spelling

A single commit touching ~20 files. For each file:

- `Mapping.tsx` — Visualização / geográfica / pulverização,
  Manutenção, vértices.
- `OpenMeteoWidget.tsx` — indisponível.
- `Dashboard.tsx` — Saúde.
- `KpiRow.tsx` — Média / Média móvel / últimos / Críticos /
  sessão.
- `FleetTable.tsx` (dashboard) — Manutenção / Combustível /
  Último sinal.
- `AlertPanel.tsx` — sessão.
- `Fleet.tsx` — Gestão / edição.
- `FleetTable.tsx` (fleet) — Manutenção / Última manutenção
  / Ações.
- `RegisterModal.tsx` — é obrigatório (×2) / Número de
  série / Última manutenção.
- `AuthForm.tsx` — Não foi possível / inválidas / não
  conferem / Mínimo.
- `BrandPanel.tsx` — agrícola / decisões / único / só.
- `PlaceholderPage.tsx` — construção / será / próxima /
  está.
- `RelativeTime.tsx` — `hace X s` → `há X s` (drop Spanish,
  use Portuguese).
- `Settings.tsx` — sessão.
- `ProfileCard.tsx` — Edição.
- `SessionCard.tsx` — sessão.
- `AboutCard.tsx` — técnica.
- `ThresholdForm.tsx` — nesta sessão / padrão / padrões /
  serão.
- `app/login/page.tsx` — operação.
- `app/register/page.tsx` — operação / Já.

### C. Frontend layout

Three surgical edits in `Mapping.tsx`:

1. **Legend footer**:
   ```diff
   - <footer className="flex items-center gap-4 border-t border-border px-3 py-2 text-[0.6875rem] uppercase tracking-wider text-fg-muted">
   -   <span className="inline-flex items-center gap-1.5">
   -     <span className="h-2 w-2 rounded-full bg-brand" /> Operacional
   -   </span>
   -   <span className="inline-flex items-center gap-1.5">
   -     <span className="h-2 w-2 rounded-full bg-accent" /> Manutencao
   -   </span>
   -   <span className="inline-flex items-center gap-1.5">
   -     <span className="h-2 w-2 rounded-full bg-fg-muted/50" /> Inativo
   -   </span>
   -   <span className="ml-auto">{enriched.length} equipamentos</span>
   - </footer>
   + <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border px-4 py-2.5 text-[0.6875rem] uppercase tracking-wider text-fg-muted">
   +   <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
   +     <span className="h-2 w-2 rounded-full bg-brand" /> Operacional
   +   </span>
   +   <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
   +     <span className="h-2 w-2 rounded-full bg-accent" /> Manutenção
   +   </span>
   +   <span className="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap">
   +     <span className="h-2 w-2 rounded-full bg-fg-muted/50" /> Inativo
   +   </span>
   +   <span className="ml-auto whitespace-nowrap">{enriched.length} equipamentos</span>
   + </footer>
   ```

2. **Map container**:
   ```diff
   - <div className="relative flex-1">
   + <div className="relative min-h-[420px] flex-1">
       <MapShellDynamic ... />
       <div className="pointer-events-none absolute right-3 top-3 z-10">
         <OpenMeteoWidget ... />
       </div>
     </div>
   ```

3. **OpenMeteoWidget**:
   - Inside the widget itself, change `w-64` (256px) to
     `w-56` (224px = 14rem) so it fits even on narrow
     panels.
   - The wrapper already has `right-3 top-3`; the change
     above is enough.

### Test impact

- `RegisterModal.test.tsx` already asserts no Portuguese
  strings (it tests the form submission, not the labels).
  No test update needed.
- The other 51 tests do not assert user-facing strings.
  No test update needed.
- A new `formatRelative` test for `RelativeTime` may be
  added if the user wants coverage, but it's not required
  by the spec.

### Link audit

No README link changes in Section 3, 7, 8. The new badges
point to docker.com, kafka.apache.org, postgresql.org —
all external.

### File list (estimated)

- 1 README.md edit
- 1 Mapping.tsx layout edit
- 1 OpenMeteoWidget.tsx (width + text)
- 1 RelativeTime.tsx (function body)
- ~17 other frontend files (text-only)

Total: ~22 files, single commit, single PR.
