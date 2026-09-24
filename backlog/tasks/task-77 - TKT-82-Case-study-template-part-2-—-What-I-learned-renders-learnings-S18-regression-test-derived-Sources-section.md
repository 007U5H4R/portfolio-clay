---
id: TASK-77
title: >-
  TKT-82: Case-study template part 2 — 'What I learned' renders learnings[]
  (S18, regression test) + derived 'Sources' section
status: To Do
assignee: []
created_date: '2026-09-24 05:49'
labels:
  - P1
  - 'sp:3'
  - m-009
  - phase-b
milestone: m-8
dependencies:
  - TASK-76
priority: high
type: feature
ordinal: 113000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Two new sections per Design.md §7.3: Learnings notebook (omitted when learnings is empty) and Sources (unique labels derived from metrics[].source + artifact sources, public URL where one exists; no new content). Regression tests: case-study-learnings.test.tsx, case-study-sources.test.ts. Spec: tickets.md TKT-82.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 teachspark shows learnings[] verbatim; a thin slug with [] shows no section
- [ ] #2 Sources lists each unique label once, links only where the data has a public URL; labels byte-equal to data
- [ ] #3 EVAL-018: learned 1 (torn), sources 0
- [ ] #4 Crawler: source links resolve or are allow-listed
- [ ] #5 The two regression tests are named TCs and green
<!-- AC:END -->
