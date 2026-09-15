---
id: TASK-1.7
title: 'TSK-07: Screenshots at four widths + minimal pnpm eval + baseline-v1.json'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P0
  - 'sp:1'
milestone: m-0
dependencies:
  - TASK-1.4
  - TASK-1.5
  - TASK-1.6
parent_task_id: TASK-1
priority: high
type: task
ordinal: 56000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Implementation notes.** Playwright Chromium only; `@axe-core/playwright`; `@lhci/cli` with `collect.numberOfRuns=3`; Playwright temp + browsers on E Drive (CLAUDE.md scar). Script: `scripts/eval.ts` orchestrates and writes `evals/results/`.
**Files.** `scripts/eval.ts`, `playwright.config.ts`, `lighthouserc.json`, `tests/e2e/tracer.spec.ts`, `docs/screenshots/tracer/`, `evals/results/baseline-v1.json`.
**Related EVAL.** EVAL-004, EVAL-005, EVAL-006, EVAL-008 (baseline). Source: tickets.md § TSK-07.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-01 AC 7 and 8 in full; runner exits non-zero on axe critical/serious or horizontal overflow.
- [ ] #2 JSON schema of the result file is the one TKT-07 will extend (version, commit, branch, timestamp, cases[], totals).
<!-- AC:END -->
