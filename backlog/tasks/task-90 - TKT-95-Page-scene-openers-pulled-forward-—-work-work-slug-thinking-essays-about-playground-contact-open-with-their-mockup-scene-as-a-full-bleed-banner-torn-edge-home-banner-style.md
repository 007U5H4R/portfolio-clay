---
id: TASK-90
title: >-
  TKT-95: Page scene openers pulled forward — /work, /work/[slug], /thinking
  (+essays), /about, /playground, /contact open with their mockup scene as a
  full-bleed banner + torn edge (home banner style)
status: In Progress
assignee: []
created_date: '2026-09-25 06:01'
updated_date: '2026-09-25 06:45'
labels:
  - P1
  - 'sp:3'
  - m-009
  - phase-0
milestone: m-8
dependencies:
  - TASK-87
priority: high
type: feature
ordinal: 105150
---

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Each route opens with its manifest scene (scene-work, scene-casestudy, scene-thinking, scene-about, scene-playground, scene-contact) via the TKT-93 banner component: full-bleed, torn bottom edge, per-scene focal point, title below; alt = manifest §6.3 string
- [ ] #2 Rest of each page unchanged until its Phase B/C ticket; no layout overflow at 390/768/1024/1440; EVAL-018 opener unit <= 4; EVAL-021 usedOn matches
- [ ] #3 Opener image is each route's LCP candidate with correct sizes/priority; full e2e green
<!-- AC:END -->
