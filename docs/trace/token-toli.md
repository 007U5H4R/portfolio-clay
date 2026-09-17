# Trace — Token Toli (TKT-54 / TSK-25, M-005)

Every field in the Token Toli `Project` record (`data/projects.ts`, slug `token-toli`) traces to a
source below. Sources are the `SourceRef.id`s declared in `token-toli.sources[]`; every source
resolves to CONTENT_INVENTORY §8.7. **No figure is invented; no hypothesis count is overstated.**

**Depth decision.** Token Toli stays a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`) — permanently, not pending a later ticket. It is the
JS-off e2e fixture slug (`tests/e2e/case-study.spec.ts` "JS off: static HTML carries content and
NextProject") specifically because it is expected to render the "Deep dive coming" note forever: a
discovery-only research artifact with no product, no code, and no deployed artifact has nothing to
put behind a "Deep dive" toggle. All of this ticket's real content lives in `overview.thirtySecond`
(3 short paragraphs, always visible regardless of the toggle) plus `learnings` and `sources` — never
in `chapters`, which would flip `hasChapters` to `true` and break the locked e2e contract.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `TT-DISCOVERY-PRD` | Token Toli Discovery PRD (Guru pod) | `CS1/Discovery PRD-2.pdf` pp.24-31 | §8.7 |
| `TT-TEAM-PRD` | Token Toli team discovery PRD (44 interviews) | `CS1/Final Submission/Week1_Token_Toli_Discovery_PRD.pdf` p.7 | §8.7 |
| `TT-XLSX-SELFCRITIQUE` | Token Toli research tracker — self-critique (tab "Tushar") | `CS1/Token Toli -W2- C8.xlsx` tab "Tushar" | §8.7 |
| `TT-LINKEDIN` | Token Toli 7-day LinkedIn series | `CS1/LinkedIn Posts - 7 Day Series.docx` (Day 6, Day 7) | §8.7 |

## Fields → source

| Field | Rendered claim | Source | Inventory basis |
|---|---|---|---|
| `tagline` | "a team discovery PRD with 11 named respondents and three tested hypotheses" | `TT-DISCOVERY-PRD` | §8.7 Users (11 named respondents, pp.25-27); Show-the-Thinking "Hypothesis" (H1.1/H1.2/H1.3, p.30) |
| `role` | "Team discovery" | `TT-DISCOVERY-PRD` | §8.7 Role: "co-author of the Guru-pod PRD (3 names)" |
| `overview.thirtySecond[0]` | Problem statement (who/problem/why) | `TT-DISCOVERY-PRD` | §8.7 Problem, p.30 |
| `overview.thirtySecond[1]` | 11 named respondents; 44 interviews attributed to the team PRD, not this pod | `TT-DISCOVERY-PRD`, `TT-TEAM-PRD` | §8.7 Users; Metrics ("team work, not Tushar's own") |
| `overview.thirtySecond[2]` | Product bet not selected by the cohort; self-critique on interview count | `TT-XLSX-SELFCRITIQUE` | §8.7 Show-the-Thinking "Product decision", "Evaluation", "Outcome" |
| `learnings[0]` | "Performing the problem instead of presenting it" | `TT-LINKEDIN` | §8.7 Learnings (Day 7) |

## Corrected from the prior card

The record's tagline previously read "four tested hypotheses." The pack names exactly three —
H1.1 (validated), H1.2 (partially validated), H1.3 (validated), p.30 — so this ticket corrected the
count to "three" rather than carrying the unsupported figure forward (EVAL-013 content integrity).

## Honesty / hedges preserved (not omitted, not softened)

- **"44 interviews" is team data, not Tushar's own fieldwork** — stated explicitly in
  `overview.thirtySecond[1]`, matching the ticket's specific AC (TSK-25 AC 2).
- **"11 named respondents" is the only respondent total ever shown** — the pack marks any broader
  count as MISSING; none is stated or implied elsewhere on the page.
- **Not selected**: the bet chapter's would-be content states plainly, in the 30-second overview,
  that the cohort moved forward with a teammate's concept — never implied as a success.
- **No `MetricCard`**: `metrics: []`, per the ticket's explicit instruction (no MetricCard unless
  Tushar confirms an explicit interview count for this pod, which he has not).
- **No live/repo/demo links**: `links: { repoPublic: false }` only — no `live` or `demoVideo` key
  exists on the record, matching "no product, no code, no deployed artifact."

## Media

None — see `content/media/token-toli/SOURCES.md` (no standalone images exist in the source pack;
none are planned).

## Excluded (forbidden-strings / PII, EVAL-013)

No `.env` key names, phone numbers, DOB, or local paths. `forbidden-strings.ts --bundle` reports 0
hits.

## DRAFT flags

**None.** Every sentence in `overview.thirtySecond` and every `learnings` entry traces to a source
declared in `sources[]`.
