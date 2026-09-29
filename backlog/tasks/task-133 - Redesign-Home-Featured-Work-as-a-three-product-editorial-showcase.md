---
id: TASK-133
title: Redesign Home Featured Work as a three-product editorial showcase
status: Done
assignee:
  - '@claude'
created_date: '2026-09-29 09:43'
updated_date: '2026-09-29 15:00'
labels:
  - P2
  - m-009
dependencies: []
priority: medium
type: feature
ordinal: 183000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-29 (spec + reference image in docs/redesign-mockups/m-009/tushar-2026-09-29/, brief docs/briefs/TASK-133.md): redesign ONLY the Home Featured Work section as an editorial showcase of RailCite (large anchor), Slag City and Campfire Board, using verified copy only (not the mockup's invented lines). Every Explore goes to /projects?product=<id> in the same tab with that product selected. Follow-up the same day: replicate the reference image with very high visual fidelity.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 Featured Work shows exactly RailCite, Slag City, Campfire Board (featured ranks 1/2/3); TeachSpark and Nuptis → Velora stay on Portfolio and /work.
- [x] #2 RailCite is the large left anchor (~60 %); Slag City top-right, Campfire Board bottom-right; tablet and mobile layouts; no horizontal overflow.
- [x] #3 Only verified copy: cover lines, Tushar's RailCite one-liner, proof points 5,760 (measured, as of 15 Sep 2026) and 0 (structural, by construction); none of the mockup's invented lines or note text.
- [x] #4 Each Explore is one same-tab link to /projects?product=<id>; the Portfolio opens with that product selected; an unknown id falls back to the default.
- [x] #5 Hand-authored SVG collages per product (no generation, no JS, ≤ 40 kB each); section matches the reference image's composition and proportions.
- [x] #6 One-time entrance motion, none under reduced motion; CTA hover only.
- [x] #7 Gates: typecheck, lint, tokens, unit, build, bundle ≤ 180 kB, full e2e (failures only environmental or load-only, each verified).
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Part 1 merged 2026-09-29 via PR #3 (a03780b): featured ranks reassigned (RailCite 1 + large, Slag City 2, Campfire Board 3), data/featured.ts, FeaturedWork rebuilt, three cut-paper SVG collages, 11 Ask Tushky FAQ answers re-stamped (only rank fields changed), Design.md Dev-127. Tushar's answers: RailCite accessible name → "Explore case study: RailCite in Portfolio" (label in name); wording, no side kickers, trailing periods OK; remove the now-unused ProjectCard later (after TASK-130).

Fidelity pass on PR #4 (5fe7047..3f07db3): full-card collages redrawn to the reference, wide wrap, 1.55fr/1fr spread from 1200 px, three distinct torn masks, paler section cream, Design.md Dev-128. At 1672 px: RailCite 934×668, side cards 603×322 (reference 945×650, 617×310–320). Kept on purpose: verified cover lines, label-in-name, two short honesty markers, two chairs (brief: no team implied). Checks: 714 unit tests; build; bundle / 161.3 kB, /projects 170.6 kB; home e2e 554 passed / 0 failed; full e2e 1358 passed, 9 failed (7 sandbox-only — video/YouTube, external links 403 — and 2 load-only, pass alone). CI `eval` on 36bd38d: typecheck, lint, unit and build passed; the Evaluate step was cancelled at the 30-min job limit (test 2225 of ~2948; its failures were 30 s timeouts clustered on one route, as on earlier m-009 runs). Tushar approved merging over the timeout; merged 2026-09-29 via PR #4. The CI time limit is fixed in a separate PR. Report: docs/reports/TASK-133.md.
<!-- SECTION:NOTES:END -->
