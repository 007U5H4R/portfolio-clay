---
id: TASK-84
title: >-
  TKT-89: Dead-code removal (S11) — clay primitives + tiers, aurora/glow, avatar
  system + assets + scripts, Manrope, Footer, codemod script
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-d
milestone: m-8
dependencies:
  - TASK-73
  - TASK-82
  - TASK-83
priority: high
type: chore
ordinal: 120000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Delete-only diff: components/clay/* + tiers + their tests, aurora/glow layer, public/avatar/*, content/media/avatar/, scripts/avatar*.ts + package scripts, Footer, NavPill, hero/Annotation, codemod-tokens.ts; DESIGN_DIRECTION.md stub; COMPONENT_ARCHITECTURE.md §1 + docs/eval.md updated. Spec: tickets.md TKT-89.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 grep -ri 'clay|aurora|avatar|manrope' over app/ components/ lib/ hooks/ public/ content/ scripts/ package.json returns only historical doc mentions + the OG allow-list comment
- [ ] #2 pnpm build output lists no public/avatar asset
- [ ] #3 EVAL-020 13/13 · 0 · 0 and EVAL-016 PII grep green
- [ ] #4 bundle-budget --json ≤180 kB gz recorded
- [ ] #5 Every deleted test is replaced or its behaviour no longer exists (listed in the PR description)
- [ ] #6 git diff --stat shows deletions + the two doc updates only
<!-- AC:END -->
