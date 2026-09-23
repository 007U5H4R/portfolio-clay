---
id: TASK-46
title: >-
  TKT-50: Vercel project - preview deploy, security headers, Analytics, deploy
  guard
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-22 12:19'
labels:
  - P0
  - 'sp:2'
  - deploy
  - security
milestone: m-6
dependencies:
  - TASK-43
  - TASK-44
  - TASK-45
  - TASK-22
  - TASK-23
  - TASK-24
priority: high
type: chore
ordinal: 46000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Create the new Vercel project `portfolio-clay` (S1 - never the cinematic site's project), connect the repo, static output, `NEXT_PUBLIC_SITE_URL`, security headers in `next.config` (CSP appropriate for a static site with no third-party scripts, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS), Vercel Analytics + Speed Insights (basic), `pnpm audit` gate, and a pre-deploy check script (PB5) that fails the build if: a `public/resume.pdf` exists and the PII/patent test fails · `resumeAvailable` is `true` without a passing PDF · any PII pattern appears in the output bundle · any of `public/video/{teachspark,railcite,velora}.mp4` is missing or >4 MB (PB4). Deploy a preview; run the full `pnpm eval` against the preview URL.

**Definition of Done.** Base DoD + Sec.
**Notes.** Domain not needed for preview; production domain in TKT-53. Blast radius: new project only - verify the Vercel team/project before linking.
**Dependencies.** TKT-47, TKT-48, TKT-49, TKT-22, TKT-23, TKT-24 (featured-3 demo videos - hard, PB4). TKT-08 is not a blocker of the preview (PB5); it hard-blocks TKT-53.
**Related EVAL.** EVAL-002, EVAL-014, EVAL-016. **Blockers.** TKT-22/23/24 (videos). **Target sequence.** Phase 7 · **Owner.** Claude (Tushar approves the Vercel project creation).
Source: tickets.md § TKT-50.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Preview URL serves every route + `/sitemap.xml` + `/robots.txt` 200, and either `/resume.pdf` 200 (flag true) or the placeholder state on every resume control (flag false).
- [ ] #2 Headers present (curl check persisted).
- [ ] #3 `pnpm audit` 0 high/critical.
- [ ] #4 Secret/PII grep on the deployed bundle 0 hits.
- [ ] #5 The three featured videos play from the preview URL with posters.
- [ ] #6 `pnpm eval` against the preview persisted as `eval-run-preview-<sha>.json`.
- [ ] #7 Rollback path documented in `docs/deploy.md`.
- [ ] #8 Pre-deploy check script has a unit test for each failure mode.
<!-- AC:END -->
