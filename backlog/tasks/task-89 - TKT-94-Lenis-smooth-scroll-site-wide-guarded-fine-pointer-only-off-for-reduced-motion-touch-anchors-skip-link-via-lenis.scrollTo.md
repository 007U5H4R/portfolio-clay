---
id: TASK-89
title: >-
  TKT-94: Lenis smooth scroll site-wide, guarded (fine pointer only; off for
  reduced motion + touch; anchors/skip link via lenis.scrollTo)
status: Done
assignee: []
created_date: '2026-09-25 05:59'
updated_date: '2026-09-25 07:38'
labels:
  - P2
  - 'sp:2'
  - m-009
  - phase-0
milestone: m-8
dependencies: []
priority: medium
type: feature
ordinal: 105300
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 One Lenis instance in the root layout, mounted only when (pointer: fine) and not prefers-reduced-motion; native scroll otherwise
- [ ] #2 Hash links, the skip link and header CTAs scroll via lenis.scrollTo with the sticky-header offset; focus lands on the target
- [ ] #3 MobileMenu dialog and any scroll containers (Ask panel) are unaffected (lenis.stop / data-lenis-prevent); keyboard scrolling works
- [ ] #4 First-load JS on / stays <= 180 kB gz; EVAL-007/010/015 and the full e2e suite stay green
<!-- AC:END -->
