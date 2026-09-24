---
id: TASK-85
title: >-
  TKT-90: Redesign QA sweep — responsive · a11y · reduced motion ·
  EVAL-018/019/020/021 · contrast · mockup-pair screenshot pack for Stage 8
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:5'
  - m-009
  - phase-d
milestone: m-8
dependencies:
  - TASK-84
priority: high
type: task
ordinal: 121000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Every route at 4 widths: overflow, ≥44 px targets, ≥12 px text, intrinsic sizes, axe, keyboard scripts, reduced-motion run, token-pair contrast, EVAL-018 full sweep, EVAL-019/020/021, manual eval-021 checklist drafted, Stage-8 screenshot pack + mockup pairs; fixes as small commits or QA-### rows. Spec: tickets.md TKT-90.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 0 overflow, 0 sub-44 px controls, 0 sub-12 px text across routes × widths
- [ ] #2 axe 0 critical/serious everywhere incl. 404
- [ ] #3 100 % of keyboard flows completable with visible focus
- [ ] #4 EVAL-018/019/020/021 green in one pnpm eval run
- [ ] #5 Screenshot + mockup-pair packs committed
- [ ] #6 Defects fixed or QA-### logged
- [ ] #7 VoiceOver notes for /, /work/teachspark, /about appended to docs/a11y-pass.md
<!-- AC:END -->
