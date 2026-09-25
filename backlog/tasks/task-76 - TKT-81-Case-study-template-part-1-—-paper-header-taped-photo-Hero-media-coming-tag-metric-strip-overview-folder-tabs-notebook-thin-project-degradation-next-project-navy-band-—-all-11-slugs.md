---
id: TASK-76
title: >-
  TKT-81: Case-study template part 1 — paper header (taped photo + 'Hero media
  coming' tag), metric strip, overview folder tabs + notebook, thin-project
  degradation, next-project navy band — all 11 slugs
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P0
  - 'sp:5'
  - m-009
  - phase-b
milestone: m-8
dependencies:
  - TASK-74
priority: high
type: feature
ordinal: 112000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Rebuild CaseStudyHeader, metric strip, OverviewToggle, NextProject per Design.md §7.3 with honest degradation for thin projects ('Deep dive coming' kraft tag, metric section omitted for 0–1 metrics); DemoVideo states inside the photo frame; generateStaticParams/OG untouched. Spec: tickets.md TKT-81.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 All 11 slugs build and render at 390 & 1440 with no invented content (sweep over generateStaticParams)
- [ ] #2 teachspark shows 3 metric cards + annotation; a thin slug shows no metric section and the 'Deep dive coming' tag
- [ ] #3 DemoVideo four states still pass eval-014.spec.ts inside the frame
- [ ] #4 Overview tabs keyboard-operable; #deep and #01-context… anchors unchanged (TP8)
- [ ] #5 EVAL-018: header 2 · metric strip 2 (or absent) · overview 2 · next 2; kind badges Inter
- [ ] #6 'Hero media coming' tag navy on kraft ≥4.5:1
- [ ] #7 case-study.spec.ts updated; EVAL-002 hop /work → /work/[slug] green
<!-- AC:END -->
