---
name: Change proposal
about: Propose a new SDD change (e.g. add a microservice, refactor, governance update)
title: "[CHANGE 00X] short name"
labels: ["change", "sdd"]
---

## Goal

<!-- One sentence: what is this change trying to achieve? -->

## Why

<!-- What's the problem? What value does it unlock? -->

## Scope (in / out)

**In scope:**
- <!-- list -->

**Out of scope:**
- <!-- list -->

## Affected components

<!-- Which modules / docs / infra? -->

- [ ] `api-gateway`
- [ ] `auth-service`
- [ ] `telemetry-ingestion-service`
- [ ] `alert-processing-service`
- [ ] `fleet-mapping-service`
- [ ] `iot-simulator-service`
- [ ] `docs/`
- [ ] infra (`docker-compose.yml`, `k8s/`, `init.sql`)
- [ ] other: <!-- specify -->

## Acceptance criteria

<!-- What does "done" mean? Be concrete. -->

- [ ] <!-- e.g. mvn -pl <module> -am test is green -->
- [ ] <!-- e.g. end-to-end smoke test passes -->
- [ ] <!-- e.g. spec is updated -->

## Risk & mitigation

| Risk | Mitigation |
|------|------------|
|      |            |

## Estimate

<!-- Rough size: S / M / L -->

## Willing to drive it?

- [ ] Yes, I will create the `changes/00X-short-name/` folder and PR
- [ ] I need a driver — please pick someone
