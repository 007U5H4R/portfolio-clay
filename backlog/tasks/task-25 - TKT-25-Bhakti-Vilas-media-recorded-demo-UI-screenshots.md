---
id: TASK-25
title: 'TKT-25: Bhakti-Vilas media: recorded demo + UI screenshots'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P2
  - 'sp:2'
  - media
milestone: m-4
dependencies:
  - TASK-1
priority: medium
type: chore
ordinal: 25000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Record `https://bhakti-vilas.vercel.app/` verified flow (session booking learn -> date -> circle map -> payment -> QR pass, per §8.6) at 390 and 1440; capture 4-6 UI screenshots; encode <=4 MB + poster. Fake phone+OTP login uses obviously fake numbers.

**Product requirement.** S6; CONTENT_INVENTORY §8.6 Artifacts ("UI screenshots MISSING - capture from live URL").
**Definition of Done.** Base DoD + Sec.
**Notes.** Soft dependency of TKT-33 (hero media placeholder until captured - PB4).
**Related EVAL.** EVAL-014, EVAL-016. **Target sequence.** filler · **Owner.** Claude.
Source: tickets.md § TKT-25.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Video + poster in `public/video/`.
- [ ] #2 Screenshots in `content/media/bhakti-vilas/` + `SOURCES.md`.
- [ ] #3 No real phone number typed or visible.
<!-- AC:END -->
