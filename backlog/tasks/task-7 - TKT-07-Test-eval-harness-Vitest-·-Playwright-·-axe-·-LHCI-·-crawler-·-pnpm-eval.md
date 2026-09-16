---
id: TASK-7
title: >-
  TKT-07: Test & eval harness: Vitest · Playwright · axe · LHCI · crawler · pnpm
  eval
status: In Progress
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-16 05:14'
labels:
  - P0
  - 'sp:8'
  - eval-harness
milestone: m-1
dependencies:
  - TASK-1
  - TASK-3
priority: high
type: feature
ordinal: 7000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Turn the minimal tracer runner into the single command every ticket regresses against: `pnpm eval` = Vitest (schema, providers, format, SEO tags) + Playwright at 390/768/1024/1440 (nav, no-overflow, keyboard paths, reduced-motion, VT fallback, video states, recruiter path) + axe on every route at 390 & 1440 + Lighthouse CI mobile+desktop on `/`, `/work`, `/work/teachspark`, `/about` (3-run median, thresholds enforced) + dead-control crawler + `evals/eval-cases.json` (17 EVAL rows as data) + results/provenance writer (`eval-run-<version>.json`) + baseline comparison that fails on Critical regression.

**Objective.** Evidence-first delivery - one reproducible command, results persisted, never hand-entered.
**Product requirement.** evaluation-plan §5, §3 automated cases; COMPONENT_ARCHITECTURE §5; Solution-PRD §8 criteria 2, 4, 5; decision EV2.
**Definition of Done.** Base DoD + First full eval-run-*.json persisted and compared to baseline-v1.json.
**Notes.** Playwright browsers/temp on E Drive; Chromium only; VT fallback tested by stubbing `document.startViewTransition = undefined`. Keep the crawler's external HEAD requests rate-limited and cached per run. Extends TSK-07; sub-tasks TSK-08..TSK-12.
**Dependencies.** TKT-01, TKT-03 (not TKT-02/05 - PB1: no visual surface; crawls whatever routes exist).
**Related EVAL.** EVAL-002, 004, 005, 006, 007, 008, 010, 011, 012 (runner slot), 013, 014, 015, 016, 017 (tag part).
**Target sequence.** Phase 1-2 (starts after TKT-03) · **Owner.** Claude.
Source: tickets.md § TKT-07.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `pnpm eval` runs all layers and writes `evals/results/eval-run-<pkg-version>-<shortsha>.json` with version, commit, branch, timestamp, environment, per-EVAL status (PASS/FAIL/SKIP + measured values), totals, and `regressions[]` vs `baseline-v1.json`.
- [ ] #2 `evals/eval-cases.json` mirrors evaluation-plan §3 (id, category, method, threshold, priority, automated:boolean).
- [ ] #3 Playwright suite skeletons exist for EVAL-002, 006, 007, 008, 010, 011, 014, 015 with the currently-buildable ones passing and the rest marked `test.fixme` per EVAL id (never silently absent); routes not yet built are skipped with reason.
- [ ] #4 Dead-control crawler: visits every route in the sitemap, enumerates visible `a[href]`, `button`, `[role=button]`, `[role=tab]`, asserts each has an href that resolves 200 (internal) / HEAD 200-399 (external, cached) or a click handler that changes DOM/URL/aria-state; reports 0 dead (EVAL-011).
- [ ] #5 Lighthouse CI asserts >= 90/95/95/95 on the four routes mobile + desktop; JS <= 180 kB gz on `/` from `next build` output (EVAL-005).
- [ ] #6 Exit code non-zero on any Critical EVAL failure or regression; CI-friendly (GitHub Actions workflow file included, runs on PR).
- [ ] #7 README section `docs/eval.md` documents how to run, where results go, how to add a case.
<!-- AC:END -->
