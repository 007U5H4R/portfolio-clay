---
id: TASK-137
title: Add an "In their words" testimonials section to About from LinkedIn recommendations
status: Done
assignee:
  - '@claude'
created_date: '2026-10-05 14:30'
updated_date: '2026-10-05 15:40'
labels:
  - P2
  - m-009
dependencies:
  - TASK-136
priority: medium
type: feature
ordinal: 186000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-10-05: add his LinkedIn recommendations (screenshots in Recommendations.docx: 17 received, 11 public, 6 switched Off) to the rebuilt About page (TASK-136) as testimonials, without turning About into a wall of text. His decisions: show three — Jay Mundhara (managed him directly, Quantiphi), Shivali Sharma (Rethink Systems Buildathon) and Sumeet Chaurasia (same team, Google Cloud architect); use only recommendations he shows publicly on LinkedIn; link to all of them at https://www.linkedin.com/in/pathaktushar/details/recommendations/?detailScreenTabIndex=0.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [x] #1 A compact "In their words." section on /about between Recognition and the Experience strip, with exactly the three chosen recommendations.
- [x] #2 Excerpts are verbatim fragments of the full recommendation (trimmed with "…", never reworded or spell-corrected); full texts and sources recorded in data/testimonials.ts.
- [x] #3 Only recommendations public on LinkedIn render; no author photos (initials instead), no LinkedIn screenshots, no third-party contact details.
- [x] #4 Each card shows the author's name, a short role from their own headline, and LinkedIn's relationship line + month; one external link to read all recommendations.
- [x] #5 Paper style matches the page (taped, tinted torn cards); 3-up ≥ 900 px, stacked below; one-time entrance, none under reduced motion; EVAL-018 count 1 (torn).
- [x] #6 Gates: typecheck, lint, tokens, unit, build, About e2e (axe, overflow, reduced motion, order, decoration counts); screenshots refreshed.
<!-- AC:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Built on the TASK-136 branch (cloud/task-136, PR #12 into m-009-redesign): data/testimonials.ts, components/about/Testimonials.tsx, TASK-136 CSS block (.tsx-*), unit + e2e tests updated. Skipped on purpose: quotes with typos ("habdle", "Thushar"), Dr. James Raja's letter (hidden on LinkedIn, contains an email address). Checks: typecheck, lint, tokens 13/13, 874 unit tests, build, About e2e 120 passed / 0 failed. Merged into m-009-redesign 2026-10-05 via PR #12 (a8e311b), over a red CI eval at Tushar's direction: the 11 failing w768 tests (/contact load timeouts, certifications, home a11y) touch no file in the PR and pass locally 102/102; EVAL-016 fails on newly published pnpm audit advisories in unchanged dev dependencies (separate fix task). Preview only; production untouched.
<!-- SECTION:NOTES:END -->
