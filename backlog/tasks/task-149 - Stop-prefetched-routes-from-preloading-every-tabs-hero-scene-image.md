---
id: TASK-149
title: Stop prefetched routes from preloading every tab's hero scene image
status: To Do
assignee: []
created_date: '2026-10-06 02:59'
labels:
  - P2
dependencies: []
priority: medium
type: bug
ordinal: 232000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
A /lab visit preloads 6 unused 1440w scene images (hero, about, experience, certifications, contact, work): likely Link prefetch applying each route's SceneBanner react-dom preload() hints (ecad101, M-009). ~1.5-2 MB wasted per page view; probably on production too. Found 2026-10-06 by the /lab probe; outside M-010, fix after release.
<!-- SECTION:DESCRIPTION:END -->

## Acceptance Criteria
<!-- AC:BEGIN -->
- [ ] #1 A page view preloads only its own LCP banner; verified via network log on / and /lab at 390 and 1440
<!-- AC:END -->
