---
id: TASK-8
title: 'TKT-08: Sanitised resume PDF + PII gate'
status: Blocked
assignee: []
created_date: '2026-09-15 13:22'
updated_date: '2026-09-26 09:13'
labels:
  - P0
  - 'sp:1'
  - security
  - tushar
milestone: m-1
dependencies:
  - TASK-3
priority: high
type: chore
ordinal: 8000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar re-exports `resume.pdf` without DOB, phone numbers, and street address; corrects "Patent No. 044152784" -> IN 429867; either aligns the title with "Senior Product Manager" (S8) or accepts the mismatch in writing. Claude adds a `pdftotext`-based test that fails if any PII pattern or the wrong patent number is present in `public/resume.pdf`, commits the sanitised file, removes the `.gitignore` guard, and flips `resumeAvailable` to `true` in `lib/site.ts` so every control switches from "Resume - updating" to "Download Resume".

**Objective.** The resume can be published and downloaded (recruiter path, EVAL-002) without leaking PII (EVAL-013/016).
**Product requirement.** Solution-PRD §7, §10, §8 criterion 2; CONTENT_INVENTORY §1.1, §7, §10; decision S8.
**Definition of Done.** Base DoD + Sec.
**Notes (security).** Until AC 1 is met no resume file exists in the repo or any build (PB5); TKT-50's pre-deploy check fails if a PDF is present while the PII test fails, or if `resumeAvailable` is `true` without a passing PDF. Hard-blocks TKT-53 (production) only.
**Related EVAL.** EVAL-002, EVAL-013, EVAL-016. **Blockers.** Tushar - sanitised export + title decision.
**Target sequence.** Phase 2 (any time; hard-blocks production in Phase 7) · **Owner.** Tushar (file) / Claude (test).
Source: tickets.md § TKT-08.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 `public/resume.pdf` present, committed, <=2 MB; `pdftotext` output contains no DOB, phone, or address pattern; contains "429867"; does not contain "044152784" labelled as patent number.
- [ ] #2 Vitest case `resume-pii.test.ts` enforces AC 1 and runs in `pnpm eval` (EVAL-013 extension).
- [ ] #3 Title decision recorded in `decisions.md` (EXE-n) - updated PDF or accepted mismatch.
- [ ] #4 `resumeAvailable: true`; every resume control on the site links to `/resume.pdf` (`download` attribute) and returns 200; the placeholder state no longer renders anywhere (Playwright asserts both).
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-26 triage (orchestrator for Tushar): Still relevant — needs a sanitised resume PDF and the PII gate; public/resume.pdf does not exist and lib/site.ts still has resumeAvailable: false. Dependency: Tushar (must supply/approve the sanitised PDF). Status left as Blocked (already).
<!-- SECTION:NOTES:END -->
