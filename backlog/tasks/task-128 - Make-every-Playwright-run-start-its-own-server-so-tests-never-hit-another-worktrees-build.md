---
id: TASK-128
title: >-
  Make every Playwright run start its own server so tests never hit another
  worktree's build
status: Done
assignee: []
created_date: '2026-09-28 17:07'
updated_date: '2026-09-28 17:09'
labels:
  - P2
  - m-009
dependencies: []
priority: medium
type: bug
ordinal: 178000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
2026-09-28: the full gate on c448cc5 showed ~30 false e2e failures and ~24 KB blank screenshots because reuseExistingServer:true tested other sessions' next-server on :3000. The written lesson (restart pnpm start after each build) kept recurring, so make it mechanical: server on PW_BASE_URL's port, never reused, unit-tested.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
playwright.config.ts: webServer now runs 'pnpm exec next start -p <PW_BASE_URL port>' with reuseExistingServer:false. tests/unit/playwright-config.test.ts (3 tests) passes; lint and tsc clean. Live proof: with another session's next-server on :3000, 'pnpm test:e2e' now fails loudly ('http://127.0.0.1:3000 is already used') instead of silently testing that build, and the other server kept running.
<!-- SECTION:NOTES:END -->
