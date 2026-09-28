---
id: TASK-122
title: Play pitch and demo videos through click-to-load YouTube/Vimeo embeds
status: Done
assignee:
  - '@claude'
created_date: '2026-09-28 08:53'
updated_date: '2026-09-28 09:58'
labels:
  - P1
  - m-009
dependencies: []
priority: high
type: feature
ordinal: 172000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-28: pitch and demo videos will be hosted on YouTube, not in the repo. Add a provider-abstracted, click-to-load, privacy-enhanced player driven by product data, with a minimal CSP. Spec: docs/redesign-mockups/m-009/tushar-2026-09-28/video-embed-spec.md
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Merged 2026-09-28 (15abb00). ProductMediaPlayer: click-to-load youtube-nocookie player; provider logic in lib/video-providers.ts; CSP built from the product data (Vimeo dropped until a product uses it). Gates: 678 unit tests; video e2e 16/16; prod e2e 98 passed; /projects 167.0 kB. Video IDs are empty until Tushar provides links. PB4 proposal not applied.
<!-- SECTION:NOTES:END -->
