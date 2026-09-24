---
id: TASK-67
title: >-
  TKT-72: BandFooter on every route (S16) + hero.tagline rendered (S18
  regression test) + home FinalCTA removed
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P0
  - 'sp:3'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-64
  - TASK-65
priority: high
type: feature
ordinal: 103000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Replace Footer with BandFooter per Design.md §4.2 (torn edge, terracotta + hatch, eyebrow, h2 with note em + kraft second line, DRAFT hiring line, email row, LinkedIn/GitHub/résumé circles, © bar with hero.tagline as data-hand=quote, 'Bengaluru, India' behind site.showLocation default false). Delete FinalCTA. Regression tests: tagline rendered once in the © bar; exactly one <footer> per route. Spec: tickets.md TKT-72.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Every route (incl. 404 + all slugs) renders exactly one <footer> = the band; FinalCTA deleted
- [ ] #2 Contrast: kraft-on-terracotta h2 line ≥4:1; hiring line/labels ≥4.5:1 (axe + §2.1 table)
- [ ] #3 Social circles 56 px with aria-labels, hover −2 px, kraft focus ring; GitHub absent without a public repo link; résumé = resumeAction() placeholder
- [ ] #4 EVAL-011 crawler: every band link resolves
- [ ] #5 hero.tagline rendered once site-wide (unit + e2e) as data-hand=quote with an sr-only Source
- [ ] #6 'Bengaluru, India' hidden by default; flag covered by a test
- [ ] #7 Band EVAL-018 count = 1 (torn)
- [ ] #8 Forbidden-strings/PII test still green
<!-- AC:END -->
