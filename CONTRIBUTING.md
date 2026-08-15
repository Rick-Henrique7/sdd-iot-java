# Contributing to the Agro-IoT Platform

Welcome! This project follows a **Spec-Driven Development (SDD)**
workflow. Every change — no matter how small — is first described
in writing, then implemented, then validated. This is the single
most important rule of the project; please read it carefully.

---

## 1. The SDD lifecycle of a change

```
            proposal
               |
               v
   +----------------------+
   |  Open an issue with  |
   |  the change-proposal |
   |  template            |
   +----------+-----------+
              |
              v
   +----------------------+
   |  Write the 4         |
   |  artifacts:          |
   |  - proposal.md       |
   |  - spec.md           |
   |  - design.md         |
   |  - tasks.md          |
   +----------+-----------+
              |
              v
   +----------------------+
   |  Branch              |
   |  00X-short-name      |
   +----------+-----------+
              |
              v
   +----------------------+
   |  Implement + test,   |
   |  ticking tasks.md    |
   +----------+-----------+
              |
              v
   +----------------------+
   |  Open PR; CI must    |
   |  be green; at least  |
   |  1 reviewer approves |
   +----------+-----------+
              |
              v
   +----------------------+
   |  Merge to main,      |
   |  move folder to      |
   |  changes/archive/    |
   +----------------------+
```

A change is **not** "ready" until the 4 artifacts exist in its folder.
A PR is **not mergeable** until the tasks in `tasks.md` are all
checked off and the CI is green.

## 2. Branch naming

Use the same name as the change folder:

```
changes/003-telemetry-ingestion-service/  ->  branch: 003-telemetry-ingestion-service
changes/004-alert-processing-service/     ->  branch: 004-alert-processing-service
```

Short, all-lower-case, hyphen-separated, zero-padded.

## 3. Commits

- We squash-merge to `main`, so individual commit messages do not
  need to be polished. The PR title is what gets recorded.
- Conventional Commit style is recommended in the PR title:
  `feat(api-gateway): add Resilience4j circuit breakers`.

## 4. The 4 SDD artifacts

| File           | Purpose                                                           |
|----------------|-------------------------------------------------------------------|
| `proposal.md`  | The *why*: problem, value, success criteria, risks, stakeholders. |
| `spec.md`      | The *what*: contracts, behavior, NFRs, acceptance criteria.      |
| `design.md`    | The *how*: technical decisions, trade-offs, build system.        |
| `tasks.md`     | The *checklist*: every task with an end-state.                    |

The `validate-sdd` GitHub Action fails the PR if any of these files
is missing.

## 5. Governance reminders

From `docs/backend/guidelines-and-governance`:

- **No hardcoded secrets.** Use `JWT_SECRET` env var. `.env*` is in `.gitignore`.
- **No emojis in UI or code.** Use `lucide-react` on the front-end.
- **No pure black (`#000000`)** in CSS — use the Slate palette.
- **Clean Architecture is inviolable.** `domain/` MUST NOT import
  Spring, JPA, Kafka, or JJWT.
- **DTOs and Kafka schemas are contracts** — never rename a field
  without updating the spec first.
- **Human-in-the-Loop**: no service may issue autonomous actuator
  commands.

## 6. Local development

```powershell
# 1. Clone
git clone <repo-url>
cd sdd-iot-java

# 2. Build & test everything
./mvnw.cmd -B verify

# 3. Bring up the local stack
docker compose up -d postgres redis zookeeper kafka auth-service api-gateway

# 4. Smoke test
curl http://localhost:8080/actuator/health
curl http://localhost:8083/actuator/health
```

## 7. Reviewing a PR

1. **Read `changes/00X-.../proposal.md` first.** It is the *why*.
2. Skim `spec.md` and confirm the contracts are clear.
3. Skim `design.md` and confirm the technical choices are justified.
4. Open the code: enforce Clean Architecture, no hardcoded secrets,
   no scope creep.
5. Run the tests locally if the change is non-trivial.
6. Approve with a short, concrete summary.

## 8. Versioning & releases

This project does **not** use semver tags. Each change is its own
atomic unit. The "history" lives in `changes/archive/`.

## 9. License

By contributing, you agree that your contributions will be licensed
under the Apache License 2.0 (see [LICENSE](./LICENSE)).
