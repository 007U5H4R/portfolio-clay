---
id: TASK-3
title: >-
  TKT-03: Content schema + zod build gate + failing fixture + forbidden-string
  test
status: In Progress
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 02:45'
labels:
  - P0
  - 'sp:5'
  - schema
  - security
milestone: m-1
dependencies:
  - TASK-1
priority: high
type: feature
ordinal: 3000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Implement `data/schema.ts` exactly as COMPONENT_ARCHITECTURE §2 (Project, Experience, Skill cluster, Essay, KnowledgeEntry, ThinkingFramework stage, Artifact union incl. `Generic`, Metric with `value/label/context/asOf/source/kind`, SourceRef), a build step that validates every `data/*.ts` export and fails `next build` on violation, a deliberate failing fixture that proves the gate, and a forbidden-string test over data + built bundle.

**Objective.** Make "do not invent" mechanical (EVAL-013) before any content is entered.
**Product requirement.** Solution-PRD §5 cross-cutting, §7, §8 criterion 7; COMPONENT_ARCHITECTURE §2, §5; evaluation-plan EVAL-013; decision EV1.
**Definition of Done.** Base DoD + Sec + Truth + content-gate-proof.txt persisted.
**Notes.** Keep schemas in one file; no runtime schema use on the client. The forbidden list must not itself contain the sandbox code in plain text - read from a local file.
**Dependencies.** TKT-01 (not TKT-02 - PB1: no visual surface, runs while the gate is pending). Feeds TKT-09, TKT-15, TKT-28..33, TKT-54, TKT-40, TKT-43.
**Related EVAL.** EVAL-013 (primary), EVAL-016.
**Target sequence.** Phase 1-2 (may start the moment TKT-01 is merged) · **Owner.** Claude.
Source: tickets.md § TKT-03.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `data/schema.ts` exports zod schemas + inferred TS types for every entity in COMPONENT_ARCHITECTURE §2; `Metric` requires `source`, `asOf` (`YYYY-MM-DD`), `kind in measured|structural|self-reported`; `Project` requires `sources.length >= 1`; `Project.tags.length <= 3`; `chapters` is a tuple of 8 with fixed ids `context|problem|discovery|bet|built|evaluation|outcome|learned`; `thinking` has exactly 8 nodes each with `source`.
- [ ] #2 `scripts/validate-content.ts` runs in `prebuild` and in Vitest; a violation prints entity id + zod path and exits non-zero.
- [ ] #3 `tests/fixtures/invalid-project.fixture.ts` (metric without `asOf`, project without `sources`, forbidden title string) is loaded by a Vitest case that asserts the gate throws; a documented one-off `pnpm build` with the fixture wired in fails - run output saved to `evals/results/content-gate-proof.txt`.
- [ ] #4 Forbidden-string test scans `data/**`, `content/**`, `app/**`, and `.next/` output for: `PMP`, `SAFe Agilist`, DOB pattern, phone patterns, the TeachSpark sandbox join code (value read from a git-ignored `tests/forbidden.local.json`, never committed), `AI Product Manager` used as a title, any `.env` key names - 0 hits.
- [ ] #5 `data/projects.ts` contains the TeachSpark record at card fidelity migrated from TKT-01's literal and passes the gate.
- [ ] #6 `pnpm test` green; `pnpm eval` regressed with no Critical change.
<!-- AC:END -->
