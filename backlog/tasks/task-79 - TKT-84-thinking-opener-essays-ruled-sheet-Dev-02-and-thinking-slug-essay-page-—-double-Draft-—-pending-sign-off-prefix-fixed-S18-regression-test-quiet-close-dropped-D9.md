---
id: TASK-79
title: >-
  TKT-84: /thinking opener + essays ruled sheet (Dev-02) and /thinking/[slug]
  essay page — double 'Draft — pending sign-off:' prefix fixed (S18, regression
  test); quiet-close dropped (D9)
status: In Progress
assignee: []
created_date: '2026-09-24 05:49'
updated_date: '2026-09-25 09:50'
labels:
  - P1
  - 'sp:5'
  - m-009
  - phase-b
milestone: m-8
dependencies:
  - TASK-74
priority: high
type: feature
ordinal: 115000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Per Design.md §7.5–7.6: ThinkingHero with taped scene-thinking photo, essays section with visible h2 'Essays', empty-state line, sticky, margin annotation only ≥1320, notebook Sheet with 5 entries; essay page with data-flat .prose, pull quotes, one DraftTag, EssayBody no longer prefixing the DRAFT string; margin aside; quiet-close not built (D9). Regression: prefix occurs exactly once per essay page. Spec: tickets.md TKT-84.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 5 entries from data/writing.ts in order; empty-state line present while published count is 0 (fixture)
- [ ] #2 Essay page: DraftTag once in the meta, prefix once in the paragraph (regression tests green); pull quotes ≤240 chars with cites
- [ ] #3 EVAL-018: opener 3, essays 4 at 1440 / 3 at 390, essay 2; .prose flat
- [ ] #4 Pager prev/next resolve (crawler)
- [ ] #5 No overflow at 390; margin moves under the header <900
- [ ] #6 Reduced motion: underline drawn complete
<!-- AC:END -->
