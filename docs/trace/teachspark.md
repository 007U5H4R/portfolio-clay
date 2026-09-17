# Trace — TeachSpark full case study (TKT-28, M-005)

Every number, metric and load-bearing claim in the TeachSpark `Project` record (`data/projects.ts`)
and its 8 chapters / thinking chain traces to a source below. Sources are the `SourceRef.id`s
declared in `teachspark.sources[]`; every source resolves to CONTENT_INVENTORY §8.1 and AUDIT §4.
**No figure is invented.** Canonical pilot metrics use the **Final-PRD snapshot 2026-08-24 (test
handsets excluded)**; the conflicting 2026-08-26 pitch snapshot is deliberately excluded (§8.1
"Choose one date; do not mix"). Metric date default = 2026-08-24.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `TS-README-3` | TeachSpark README | `TS/README.md:3` | §8.1 |
| `CS4-FINAL-PRD` | TeachSpark Final PRD | `CS4/docs/final-prd.docx §0/§7` | §8.1 |
| `TS-DISCOVERY-PRD` | TeachSpark Discovery PRD | `CS4/Case Study 4 - Discovery PRD.docx §0/§1.1/§6` | §8.1 |
| `TS-SOLUTION-PRD` | TeachSpark Solution-Space PRD | `CS4/Case Study 4 - Solution-Space PRD.docx §3/§4` | §8.1 |
| `TS-PITCH` | TeachSpark pitch deck | `CS4/pitch/teachspark-pitch.pdf slides 10, 13` | §8.1 |
| `TS-RUNBOOK` | TeachSpark runbook | `TS/docs/runbook.md:10-65` | §8.1 |
| `TS-ANTHROPIC-PAPER` | TeachSpark question-paper adapter | `TS/src/adapters/anthropic-paper.ts` | §8.1 |
| `TS-LINKEDIN-BUILD` | TeachSpark 9-day build series | `TS/docs/linkedin/9-day-build-series.md (Post 9)` | §8.1 |
| `TS-MENTOR` | TeachSpark mentor feedback | `CS4/MentorFeedback.md (2026-08-29)` | §8.1 |
| `TS-QA-PHASE6` | TeachSpark QA phase-6 gate | `TS/docs/qa/phase-6.md (2026-08-21)` | §8.1 |
| `TS-MIXPANEL` | TeachSpark Mixpanel funnel | `CS4/docs/assets/mixpanel-funnel.png` | §8.1 |
| `TS-LIVE` | TeachSpark live pilot (Railway) | `https://teachspark-production.up.railway.app` (uptime after 2026-09-09 unverified) | §8.1 |

## Metrics (header + inline) → source

| Where | Value | Label | kind | asOf | Source | Inventory basis |
|---|---|---|---|---|---|---|
| header | `17` | Teachers joined | measured | 2026-08-24 | `CS4-FINAL-PRD` | §8.1 canonical funnel "joined WhatsApp 17" |
| header | `8 (47%)` | Activated | measured | 2026-08-24 | `CS4-FINAL-PRD` | §8.1 "activated 8 (47%)", "onboarded 12 (71%)" |
| header | `37.5 min` | Median time saved | self-reported | 2026-08-24 | `CS4-FINAL-PRD` | §8.1 "median 37.5 min saved (self-report)" |
| ch. built | `≈ $0.01` | Cost per generation | self-reported (estimate) | 2026-08-24 | `TS-RUNBOOK` | §8.1 "Cost is roughly $0.01 per generation" (runbook) |
| ch. evaluation | `27→7→4` | Mixpanel 3-step funnel | measured | 2026-08-24 | `TS-MIXPANEL` | §8.1 "landing_view 27 → signup_completed 7 (25.93%) → join_tapped 4" |
| ch. outcome | `3` | Referrals | self-reported | 2026-08-24 | `CS4-FINAL-PRD` | §8.1 canonical funnel "referrals 3" |

## Chapters → source

| Chapter | Key claim | Source | Inventory basis |
|---|---|---|---|
| 01 context | Case Study 4, Cohort 8; group discovery then individual; built entire MVP solo | AUDIT §4 (role/dates) | §8.1 role, AUDIT §4 "Built the entire MVP solo" |
| 01 context | "My best user research was remembering my mother's evenings." | `TS-PITCH` | §8.1 observation (pitch slide 13; linkedin playbook) |
| 02 problem | Problem statement (generic/fragmented/disconnected; never build applied AI skills) | `TS-DISCOVERY-PRD` | §8.1 Problem / AUDIT §4 Discovery PRD §6 |
| 02 problem | Persona "Meera" + JTBD | `TS-DISCOVERY-PRD` | §8.1 Users (quoted), Discovery PRD §1.1 |
| 03 discovery | Insight "not scarcity of content… generic and disconnected" | `TS-DISCOVERY-PRD` | §8.1 Insight (Discovery PRD §0) |
| 03 discovery | Whitespace 2×2 (generic↔classroom-specific, task↔capability) | `TS-DISCOVERY-PRD` | §8.1 Insight; AUDIT §4 `disc-whitespace-quadrant.jpg` |
| 03 discovery | Honesty: 8–12 interviews planned, none recorded; only trace is his mother | `TS-DISCOVERY-PRD` | §8.1 MISSING; AUDIT §4 "Interviews: MISSING" |
| 03 discovery | 8 assumptions A1–A8 with type/risk before code | `TS-DISCOVERY-PRD` | §8.1 Hypothesis; AUDIT §4 discovery evidence |
| 04 bet | "Capability, not dependency"; rejected do-the-task / generic teaching | `TS-SOLUTION-PRD` | §8.1 Product decision (Solution PRD §3) |
| 04 bet | MVP wedge "high frequency, high pain, easy to template and measure"; WhatsApp distribution | `TS-SOLUTION-PRD` | §8.1 Product decision (Solution PRD §4) |
| 05 built | Architecture "WhatsApp → Twilio → Express → pure state machine → Claude → PDF/DOCX" | `TS-RUNBOOK` | §8.1 Architecture (runbook:10-65) |
| 05 built | Pure transition() + ports/adapters; Claude Sonnet 5 default / Haiku 4.5 switchable | `TS-RUNBOOK` | §8.1 Architecture; AUDIT §4 |
| 05 built | Question-paper path: structured outputs + vision + QC pass; "never hallucinate" | `TS-ANTHROPIC-PAPER` | §8.1 Architecture; AUDIT §4 anthropic-paper.ts |
| 06 evaluation | 32 event types; server store + Mixpanel + Clarity | `TS-MIXPANEL` / AUDIT §4 | §8.1 Evaluation ("32 event types"); AUDIT §4 instrumentation |
| 06 evaluation | QA gate 335 passed / 2 skipped (phase-6, 2026-08-21); "625 tests" not used | `TS-QA-PHASE6` | §8.1 Tests; AUDIT §4 phase-6 |
| 06 evaluation | is_test flag: activated 10→8, median 37.5→30, papers 5→2 | `TS-LINKEDIN-BUILD` | §8.1 Show-the-Thinking Evaluate; AUDIT §4 LinkedIn Post 9 |
| 07 outcome | Full funnel 72→17 (23.6%)→17→12 (71%)→8 (47%)→5; 3 referrals; nudge 1 of 4; 17 manual/0 Google | `CS4-FINAL-PRD` | §8.1 canonical metrics |
| 07 outcome | Targets joined 40–50, activation ≥60%, D1 ≥25%; under target | `CS4-FINAL-PRD` | §8.1 canonical metrics "Targets" |
| 07 outcome | D1 "wasn't low; structurally impossible" (window < 24-h definition) | `TS-LINKEDIN-BUILD` | AUDIT §4 "structurally impossible" (9-day build series) |
| 07 outcome | Live pilot on Twilio sandbox; uptime after 2026-09-09 unverified | `TS-LIVE` | §8.1 Status / AUDIT §4 status (hedge preserved) |
| 08 learned | Mentor: "a teacher buys a worksheet good enough for tomorrow, not AI" | `TS-MENTOR` | §8.1 Learnings (MentorFeedback.md) |
| 08 learned | WhatsApp not the entire differentiation; learning-gap note | `TS-MENTOR` | §8.1 Learnings / AUDIT §4 mentor feedback |
| 08 learned | Bangalore/Bengaluru case-sensitive lookup vs 14 cities → zero sign-ups | `TS-LINKEDIN-BUILD` | §8.1 Learnings (pitch slide 10; 9-day series) |
| 08 learned | Redundant WhatsApp-number field = likely top drop-off | `CS4-FINAL-PRD` | §8.1 Learnings (Final PRD §8 retro) |
| 08 learned | Wave 1 "trust & clarity" shipped 2026-08-29 | `TS-MENTOR` | §8.1 Outcome (commit 2026-08-29); AUDIT §4 |

## Thinking chain (8 nodes) → source

| Stage | Source | Inventory basis (§8.1 Show-the-Thinking) |
|---|---|---|
| observation | `TS-PITCH` | "it started with one real teacher: my mother, who teaches Sanskrit" |
| user-problem | `TS-DISCOVERY-PRD` | Discovery PRD §6 problem |
| insight | `TS-DISCOVERY-PRD` | "not scarcity of content… generic and disconnected" (Discovery PRD §0) |
| hypothesis | `TS-DISCOVERY-PRD` | central hypothesis + A1–A8 |
| product-decision | `TS-SOLUTION-PRD` | "Capability, not dependency"; MVP wedge |
| prototype | `TS-RUNBOOK` | shipped bot + landing + admin (stack/architecture) |
| evaluation | `TS-LINKEDIN-BUILD` | 32 event types; is_test flag exclusion |
| outcome | `CS4-FINAL-PRD` | canonical funnel + mentor → Wave 1 |

## Honesty / hedges preserved (not omitted, not softened)

- Live-pilot **uptime after 2026-09-09 unverified** (statusLabel + outcome chapter + `TS-LIVE`).
- **No teacher interviews recorded** (planned 8–12) — stated in the discovery chapter.
- **No LLM output-quality evals exist** — stated in the evaluation chapter/artifact.
- Pitch **"625 tests" not reproduced** → not used; only the phase-6 335-pass gate is cited.
- Cost **≈ $0.01/generation is a runbook estimate**, not independently measured (kind: self-reported).
- Conflicting **2026-08-26 pitch snapshot excluded**; only the 2026-08-24 Final-PRD snapshot is used.

## Excluded (forbidden-strings / PII, EVAL-016)

- TeachSpark **Twilio sandbox join code** (`TS/docs/pilot/pitch.md:15`) — never included.
- Sandbox WhatsApp number and all PII — never included.

## DRAFT flags

**None.** Every chapter body, metric and thinking node is sourced to CONTENT_INVENTORY §8.1 / AUDIT
§4; nothing required omission or a DRAFT placeholder.
