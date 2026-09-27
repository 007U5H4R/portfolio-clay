---
id: TASK-114
title: Add scene openers to the Experience and Certifications pages for consistency
status: Done
assignee: []
created_date: '2026-09-27 06:51'
updated_date: '2026-09-27 21:46'
labels:
  - P2
dependencies: []
priority: medium
type: enhancement
ordinal: 164000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-27: include an image scene in the Experience (/work) and Certifications tabs like the other pages so the site looks uniform.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
2026-09-27 Tushar: 'Use existing ones. Just make sure its not repeated. Keep the pixel and image size uniform like other tabs' then 'if you need then you generate new images as well from Higgsfield.' Every existing scene is already used, so two new 21:9 scenes are being generated (Experience: roadmap session at a whiteboard; Certifications: hanging a certificate with the retriever). Spend so far 8.5 cr (round 1 omitted the character references -> wrong face; orchestrator error) + 8.5 cr round 2 edit with references.

2026-09-28: merged (1af129a, c0e006b, a3cdc22). New scenes scene-experience / scene-certifications (3168x1344 q82 + phone WebP), banner heights identical to /projects,/about; no page repeats a scene (e2e guard). Gate: typecheck/lint/tokens/build, unit 632, e2e 542/0, EVAL-021/013 pass. Dev-103/104. Spend 17 cr (8.5 wasted on round 1 without character refs).
<!-- SECTION:NOTES:END -->
