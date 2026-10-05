---
id: TASK-123
title: >-
  Answer suggested and common Ask Tushky questions from a curated, versioned FAQ
  cache
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 09:47'
updated_date: '2026-09-28 11:50'
labels:
  - P2
  - m-009
dependencies: []
priority: medium
type: feature
ordinal: 173000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-28 (spec §44–66): suggested and common questions should answer instantly from a reviewable faq.json, invalidated by a profile-data version, with a Gemini fallback for new questions. Spec: docs/redesign-mockups/m-009/tushar-2026-09-28/tushky-faq-cache-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged 2026-09-28 (d53f964). 21 curated FAQs in data/tushky/faq.json with deterministic matching; each entry is invalidated by a per-group SHA-256 profileVersion. Merged tip: tsc clean, 708 unit tests. Agent e2e: 81 passed; 33 timeouts under load all passed when re-run alone. Offline refresh script (~$0.05 per run). No live Gemini path (awaiting Tushar).
<!-- SECTION:NOTES:END -->
