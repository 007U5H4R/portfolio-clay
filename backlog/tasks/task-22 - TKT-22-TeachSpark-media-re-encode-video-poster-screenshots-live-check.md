---
id: TASK-22
title: 'TKT-22: TeachSpark media: re-encode video + poster + screenshots + live check'
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
ordinal: 22000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Source `/Volumes/E Drive/Dev/Code/Claude/Case Study 4/teachspark/TeachSpark.mp4` (42.85 MB, 2026-08-23). Trim to a 20-40 s highlight, encode H.264 (yuv420p, faststart) <=4 MB, extract WebP poster (first meaningful frame), optional AV1/WebM secondary source. Pull product screenshots from the teachspark repo's `origin/main` `docs/screenshots/` (git fetch + `git show`, no checkout into the portfolio tree). Re-verify `https://teachspark-production.up.railway.app` returns 200 and record the date; if down, record that and set the status copy accordingly.

**Objective.** Web-ready TeachSpark demo + hero media, and a dated live-status fact.
**Product requirement.** Solution-PRD §4 S6, §9 video weight; DESIGN_DIRECTION §9; CONTENT_INVENTORY §8.1 Video/Artifacts/MISSING; decision S6.
**Definition of Done.** Base DoD (eval: EVAL-014 fixture swap to real file) + Sec (frame check).
**Notes.** ffmpeg on E Drive scratch; keep the 42.85 MB original out of the repo. Feeds TKT-28 (soft), TKT-12 badge copy; hard blocker of TKT-50 (featured-3 video - PB4).
**Related EVAL.** EVAL-004 (`/work/teachspark` weight), EVAL-014, EVAL-016.
**Target sequence.** Phase 2-5 (filler) · **Owner.** Claude.
Source: tickets.md § TKT-22.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `public/video/teachspark.mp4` <=4 MB, 20-40 s, 1280px wide max, plays in Chromium/Safari; `public/video/teachspark-poster.webp` <=120 kB.
- [ ] #2 >=3 product screenshots saved to `content/media/teachspark/` with a `SOURCES.md` line each (commit sha on `origin/main`); web-optimised copies in `public/media/teachspark/`.
- [ ] #3 Live status checked with date; result written to `content/media/teachspark/SOURCES.md` and reflected in `data/projects.ts` status copy (TKT-28 consumes).
- [ ] #4 No sandbox join code visible in any frame or screenshot (manual frame check; note the manual step in SOURCES.md).
<!-- AC:END -->
