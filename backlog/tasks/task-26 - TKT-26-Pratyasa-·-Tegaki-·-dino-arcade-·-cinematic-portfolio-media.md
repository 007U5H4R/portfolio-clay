---
id: TASK-26
title: 'TKT-26: Pratyasa · Tegaki · dino-arcade · cinematic-portfolio media'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:14'
labels:
  - P2
  - 'sp:3'
  - media
milestone: m-4
dependencies:
  - TASK-1
priority: medium
type: chore
ordinal: 26000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Pratyasa: re-encode `PT/pratyasa-site/assets/demo.mp4` (device footage - a product screen-recording is not needed, §8.8) <=4 MB + poster. Tegaki: record `https://tegaki-one.vercel.app` landing -> how it works -> pricing -> sign-in screen (do not complete checkout; do not sign in with a personal Google account) <=4 MB. dino-arcade: record `https://007u5h4r.github.io/dino-arcade-pwa/` cabinet UI without loading any ROM (BYO-ROM framing, §8.10; nothing under `Game/neogeo/` is ever used) + take the MISSING screenshot. cinematic-portfolio: record a 20-30 s scroll of `https://tushar-pathak.vercel.app/` <=4 MB.

**Product requirement.** S6; CONTENT_INVENTORY §8.8-8.11 Video/MISSING rows; AUDIT §7 exclusions.
**Definition of Done.** Base DoD + Sec.
**Notes.** Soft dependency of TKT-54 (PB4).
**Related EVAL.** EVAL-014, EVAL-016. **Target sequence.** filler · **Owner.** Claude.
Source: tickets.md § TKT-26.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Four `public/video/<slug>.mp4` <=4 MB + posters.
- [ ] #2 dino-arcade screenshot in `content/media/dino-arcade/`.
- [ ] #3 `SOURCES.md` per slug.
- [ ] #4 No ROM/BIOS content, no personal account, no payment step recorded.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): Still relevant — Pratyasa/Tegaki/dino-arcade/cinematic-portfolio media directories exist but only contain SOURCES.md placeholders; no actual video/poster/screenshot files have been captured yet. Dependency: Tushar (approve automated capture) or an agent recording session against the live URLs/device footage. Status left as To Do.
<!-- SECTION:NOTES:END -->
