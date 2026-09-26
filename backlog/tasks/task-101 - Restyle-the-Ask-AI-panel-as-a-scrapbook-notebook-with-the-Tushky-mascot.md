---
id: TASK-101
title: Restyle the Ask AI panel as a scrapbook notebook with the Tushky mascot
status: Done
assignee: []
created_date: '2026-09-26 05:38'
updated_date: '2026-09-26 14:34'
labels:
  - P1
  - M-009
dependencies: []
priority: high
type: enhancement
ordinal: 151000
---

## Description

<!-- SECTION:DESCRIPTION:BEGIN -->
Tushar 2026-09-26 supplied a target: torn notebook panel, 'Ask AI — Meet Tushky' mascot intro, tinted icon question cards in a 2-col grid, torn Ask button, quick-action chips.
<!-- SECTION:DESCRIPTION:END -->

## Implementation Notes

<!-- SECTION:NOTES:BEGIN -->
Tushar 2026-09-26: Tushky = the hero banner's golden retriever (generated badge job 6932218c…).

TKT-104 merged (6e93630) + pushed (c352abd); ask-panel 16/16; unit 586 passed. Chip 'Compare experiences' relabelled 'Show my impact' (Dev-49) — pending Tushar's wording call.

2026-09-26 round 2 (Tushar): redesign as a right-side 'Ask Tushky' drawer — full spec + reference in docs/redesign-mockups/m-009/tushar-2026-09-26/ask-tushky-drawer-{spec.md,target.png} on m009/tkt-104r2.

Verified on integration 801bd61: unit 623, 15 static routes, full e2e 1201 passed / 0 failed, bundles within budget; drawer opens/closes RIGHT at 768/1024/1440, full-screen at 390. Pushed to m-009-redesign.
<!-- SECTION:NOTES:END -->
