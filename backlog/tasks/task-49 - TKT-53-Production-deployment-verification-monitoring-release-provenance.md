---
id: TASK-49
title: 'TKT-53: Production deployment + verification + monitoring + release provenance'
status: Blocked
assignee: []
created_date: '2026-09-15 13:23'
updated_date: '2026-09-26 09:13'
labels:
  - P0
  - 'sp:3'
  - deploy
  - tushar
milestone: m-6
dependencies:
  - TASK-48
  - TASK-8
priority: high
type: chore
ordinal: 49000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Attach Tushar's domain to the Vercel project, set `NEXT_PUBLIC_SITE_URL`, promote to production, then verify evidence-first: open every route on the production domain, recruiter path end-to-end (EVAL-002), resume 200, sitemap/robots, headers, OG re-validation (TKT-51 checklist), Lighthouse record run on production, Analytics receiving events; record release provenance (commit, build id, domain, date) in `HANDOFF.md` and `decisions.md` (EXE-n); confirm the cinematic site and `portfolio/index.html` are untouched.

**Definition of Done.** Base DoD + Perf + Sec + Release provenance recorded.
**Notes.** Externally visible - confirm scope with Tushar before promotion; never touch the existing cinematic Vercel project.
**Dependencies.** TKT-52, TKT-08 (sanitised resume - hard; EVAL-002 requires `/resume.pdf` 200 on production, PB5) and Stage 8-10 approval with `QA-report.md` gate = READY (workflow rule - not started before).
**Related EVAL.** EVAL-002, EVAL-004, EVAL-016, EVAL-017. **Blockers.** Tushar - domain; sanitised resume (TKT-08); Stage 8-10 sign-off. **Target sequence.** Phase 7 (last) · **Owner.** Claude (Tushar approves promotion).
Source: tickets.md § TKT-53.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 Production URL passes `pnpm eval` (persisted as `eval-run-v1.0.0.json`).
- [ ] #2 EVAL-002 journey <=6 clicks green on production.
- [ ] #3 OG previews re-validated on the final domain.
- [ ] #4 Vercel Analytics dashboard shows traffic from the verification run.
- [ ] #5 Rollback tested once (redeploy previous build) or documented as one-click.
- [ ] #6 Release provenance recorded.
- [ ] #7 Monitoring note answers "how would we know at 3 AM": Vercel error/latency dashboards + a weekly `pnpm eval` cron against production (GitHub Actions) proposed and either enabled or explicitly deferred.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): Still relevant — production deployment/verification/monitoring/release provenance has not happened (no live production Vercel deployment found). Blocked on TASK-8 (resume PDF) and TASK-46 (Vercel setup), both themselves waiting on Tushar. Dependency: Tushar (release call). Moved to Blocked to match its blocking dependencies.
<!-- SECTION:NOTES:END -->
