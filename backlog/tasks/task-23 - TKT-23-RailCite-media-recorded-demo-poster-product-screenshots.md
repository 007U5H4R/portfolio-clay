---
id: TASK-23
title: 'TKT-23: RailCite media: recorded demo + poster + product screenshots'
status: To Do
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:14'
labels:
  - P1
  - 'sp:2'
  - media
milestone: m-4
dependencies:
  - TASK-1
priority: high
type: chore
ordinal: 23000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Playwright `recordVideo` (or Chrome MCP) session on `https://railcite.vercel.app`: sign-in path if required (use a demo account only if one exists - never a personal credential in a recording), a real query that answers with citations, a query that refuses (the product's signature behaviour), 20-40 s; encode <=4 MB + poster; capture 4-6 product screenshots at 1440 and 390 (console, answer with citations, refusal state, stats). Record corpus figures shown with the fetch date.

**Objective.** RailCite's first real product imagery - currently only the mascot exists (CONTENT_INVENTORY §8.2 MISSING).
**Product requirement.** S6; CONTENT_INVENTORY §1.4 (RailCite image MISSING), §8.2; DESIGN_DIRECTION §9.
**Definition of Done.** Base DoD + Sec.
**Notes.** Respect the app's rate limits (Voyage 3 RPM); space queries. Soft dependency of TKT-29; hard blocker of TKT-50 (featured-3 video - PB4).
**Related EVAL.** EVAL-014, EVAL-016. **Blockers.** possible - RailCite auth (if it blocks recording, AC 4's poster-only fallback does not satisfy PB4 - escalate to Tushar before TKT-50).
**Target sequence.** Phase 2-5 (filler; must close before TKT-50) · **Owner.** Claude.
Source: tickets.md § TKT-23.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `public/video/railcite.mp4` <=4 MB showing at least one cited answer and one refusal; poster <=120 kB.
- [ ] #2 >=4 screenshots in `content/media/railcite/` + optimised copies; `SOURCES.md` with URL, date, viewport, and the live `/api/stats` numbers at capture time.
- [ ] #3 No JWT/session token, email, or personal data visible in any frame.
- [ ] #4 If auth blocks recording, document the exact blocker and ship poster-only ("Demo coming").
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): Still relevant — RailCite has no recorded demo/poster/screenshots yet (no content/media/railcite directory); only the mascot exists per the ticket's own note. Dependency: Tushar (live product access) or an agent recording session against railcite.vercel.app. Status left as To Do.
<!-- SECTION:NOTES:END -->
