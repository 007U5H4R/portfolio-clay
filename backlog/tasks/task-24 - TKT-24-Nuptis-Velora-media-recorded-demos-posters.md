---
id: TASK-24
title: 'TKT-24: Nuptis + Velora media: recorded demos + posters'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
labels:
  - P1
  - 'sp:2'
  - media
milestone: m-4
dependencies:
  - TASK-1
priority: high
type: chore
ordinal: 24000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Record `https://nuptis.vercel.app/` (dashboard -> onboarding -> contingency drawer -> payments) and `https://velora-nu-eight.vercel.app/` (role select -> discover swipe -> trust profile -> bids) 20-40 s each; encode <=4 MB; posters. Screenshots already exist in the packs (§8.4/§8.5) - reuse, don't recapture, unless the live UI diverges.

**Product requirement.** S6; CONTENT_INVENTORY §8.4, §8.5 Video MISSING.
**Definition of Done.** Base DoD.
**Notes.** Soft dependency of TKT-30/31; hard blocker of TKT-50 because Velora is featured (PB4) - Nuptis rides along in the same session.
**Related EVAL.** EVAL-014. **Target sequence.** filler · **Owner.** Claude.
Source: tickets.md § TKT-24.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `public/video/{nuptis,velora}.mp4` <=4 MB + posters.
- [ ] #2 `SOURCES.md` per slug with URL + date.
- [ ] #3 Mock-data nature stated in the caption data (status "Live (mock data)").
<!-- AC:END -->
