<!--
Thanks for contributing to the Agro-IoT Platform!
Please fill in the sections below. SDD rule of thumb:
if your change touches code, it MUST have a folder under
changes/ with proposal.md + spec.md + design.md + tasks.md
before this PR is reviewed.
-->

## Change

- **Change folder:** `changes/00X-short-name/`
- **Related issue / spec:** <!-- link or N/A -->

## What & Why

<!-- 1–3 paragraphs. What does this change do and why is it needed? -->

## How to test

<!-- Concrete steps a reviewer can run locally. -->
<!-- Example: -->
<!-- 1. `docker compose up -d postgres redis zookeeper kafka` -->
<!-- 2. `mvnw -pl api-gateway -am test` -->
<!-- 3. `curl http://localhost:8080/actuator/health` -->

## Acceptance criteria

<!-- Copy-paste from changes/00X-.../tasks.md. Tick what you verified. -->
- [ ] `mvnw -pl <module> -am verify` is green
- [ ] All tasks in `changes/00X-.../tasks.md` are checked off
- [ ] No code under `domain/` references Spring, JPA, or Kafka
- [ ] No hardcoded secrets; only `JWT_SECRET` env var
- [ ] Docker image builds (`docker build -f <module>/Dockerfile .`)
- [ ] Runtime contracts verified end-to-end (paste output below)

## Risk & rollback

<!-- What can go wrong? How do we revert? -->

## Checklist

- [ ] I followed the SDD workflow (proposal → spec → design → tasks → code)
- [ ] I added/updated unit + integration tests
- [ ] I updated the README or module docs if needed
- [ ] I did not change unrelated DTOs, Kafka schemas, or contracts
