# Change 012 — README consolidation (design)

## Approach

Single-shot rewrite. No new file, no new section, no template.

### Section order

1. **Acessar a aplicacao (localhost)** — table of live URLs,
   Quickstart (PowerShell), how to tear down, test credentials.
2. **High-level architecture** — ASCII diagram, 1:1 with the live
   stack (Spring Cloud Gateway, 5 microservices, IoT simulator,
   Next.js shell).
3. **Tech stack** — corrected table with what's actually in the
   repo today (Tailwind only, plain WebSocket, `@EmbeddedKafka` in
   tests, direct `http://` URIs in `application.yml`).
4. **As 11 changes entregues** — 11-row table grouped by backend
   (001–006) and frontend (007–011), with status, summary, test
   count, and the URL the change touches. Plus a cross-reference
   table of URL → change.
5. **Onde encontrar mais detalhes** — direct links to the `docs/`
   tree, grouped by `docs/general-vision`, `docs/backend`, and
   `docs/frontend`. Mentions the `changes/` + `changes/archive/`
   structure.
6. **Repository layout** — updated tree (the legacy tree was
   missing `iot-simulator-service`, `frontend-shell`, and the
   `changes/archive/2026-08-15-*` entries).
7. **How we work — SDD** — unchanged from the legacy README
   (still accurate).
8. **Build & test local** — PowerShell-friendly commands using the
   Maven Wrapper.
9. **Governance** — unchanged from the legacy README.
10. **Contribuindo** — unchanged.
11. **License** — unchanged.

### Voice and language

- Section 1, 4, 5 are in Portuguese (operator-facing).
- Sections 2, 3, 7, 8, 9 stay in English (technical / governance
  material is shared with the rest of the org and was already in
  English).
- Code blocks, file paths, CLI commands, and identifiers always
  stay in their native form regardless of the surrounding prose
  language.

### Link audit

Every relative link is verified before commit:

- `docs/general-vision/system-overview.md` ✓
- `docs/backend/backend-overview.md` ✓
- `docs/backend/microservices-specification/{api-gateway,auth-service,telemetry-ingestion-service,alert-processing-service,fleet-mapping-service,iot-flet-simulator}.md` ✓
- `docs/backend/guidelines-and-governance/` ✓ (directory)
- `docs/frontend/struct-frontend.md` ✓
- `docs/frontend/blueprint.md` ✓
- `changes/001-api-gateway/` … `changes/007-frontend-shell/` ✓
- `changes/archive/2026-08-15-{008,009,010,011}-*` ✓
- `CONTRIBUTING.md` ✓
- `LICENSE` ✓
- `.github/workflows/ci.yml` ✓
