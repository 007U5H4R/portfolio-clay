---
id: TASK-19.1
title: >-
  TSK-16: CaseStudyHeader + MetricCard-inline + hero media +
  generateStaticParams + OG
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:13'
labels:
  - P0
  - 'sp:2'
milestone: m-3
dependencies:
  - TASK-15
  - TASK-18
parent_task_id: TASK-19
priority: high
type: task
ordinal: 65000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
**Files.** `app/work/[slug]/page.tsx`, `app/work/[slug]/opengraph-image.tsx`, `components/case-study/CaseStudyHeader.tsx`, `components/case-study/artifacts/MetricCard.tsx` (inline variant), `lib/seo.ts`.
**Related EVAL.** EVAL-013, EVAL-015, EVAL-017. Source: tickets.md § TSK-16.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 TKT-19 AC 1-3, 7.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): No longer needed — delivered under parent TKT-19 (Done). CaseStudyHeader/hero media/generateStaticParams/OG exist; the one named piece that no longer applies is the inline mini-metric — its own code comment in components/case-study/artifacts/MetricCard.tsx records 'the legacy inline header mini-metric was removed in TKT-97 once MetricStrip (TKT-81) replaced it in the case-study header'. This sub-task was never closed.
<!-- SECTION:NOTES:END -->
