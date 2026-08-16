# Change 013 — spec

## Spec

### A. README

- **Section 3** (Tech stack) grows to 4 columns: `Camada`,
  `Tecnologia`, `Uso`. New rows: `Containerização` →
  `Docker / Docker Compose`, `Registry` → `GitHub Container
  Registry (GHCR)`, `Mensageria` → `Apache Kafka 7.4 +
  Zookeeper 7.4`, `Storage` → `PostgreSQL 15 (schemas: auth,
  fleet, telemetry, alert) + Redis 7.0 (cache de último
  estado)`. Existing rows for Front-end, Edge, Backend, Auth
  stay.
- **Section 7** (How we work — SDD) gains a sub-section 7.1
  **Methodology** with a 5-bullet list naming: Clean Code,
  Clean Architecture, Trunk-based branching, Conventional
  commits, and the per-component `panel` + HOC + Zustand
  pattern.
- **Section 8** (Build & test local) gains a sub-section 8.1
  **How to test** with the Maven Wrapper command for the
  backend (`.\mvnw.cmd -B verify`) and the npm commands for
  the frontend (`npm test`, `npm run build`), plus the
  current test counts (45 backend / 52 frontend).
- **Top badges** gain 3 shields: `Docker 24+`, `Apache Kafka
  7.4`, `PostgreSQL 15`. They are added on the same row as
  the existing 6 shields, separated by line break if the
  window is narrow.

### B. Frontend spelling

- All listed files have their user-facing strings normalised
  to PT-BR with proper accents. Identifiers, log messages, and
  type names are untouched.
- Tests that assert the user-facing strings are updated to
  match (e.g. `authStore.test.ts` does not assert any
  Portuguese; `RegisterModal.test.ts` does — its assertions
  are updated).

### C. Frontend layout

- `Mapping.tsx` legend footer has visible gaps between chips
  and between the last chip and the count, even at the
  smallest column width (>= 360px).
- `Mapping.tsx` map area is never less than 420px tall (with
  scroll inside the map if the column is shorter than 60vh
  on tiny viewports).
- `Mapping.tsx` `OpenMeteoWidget` is never wider than 14rem
  and is always at least 12px from the panel's right edge.

### Non-functional requirements

- `npm test` stays green (52/52) — the test count may grow if
  new assertions are added.
- `npm run build` stays green.
- `git diff` for the README contains only documentation
  changes.

### Acceptance criteria

- Hard-refresh the GitHub `README.md` view; the badges
  include Docker, Apache Kafka and PostgreSQL.
- Open `/mapping` in a 1366×768 window; the legend reads
  `● Operacional    ● Manutenção    ● Inativo` (3 visible
  gaps), the map is visible, the weather widget is inside
  the panel.
- Type any accented string (`Visualização`, `Configurações`)
  in the page; it renders with the accent (no `&#x...;`
  escape).
