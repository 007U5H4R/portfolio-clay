# Trace — Cubicle full case study (TKT-32, M-005)

Every chapter body, artifact, thinking node, learning and header metric in the Cubicle `Project`
record (`data/projects.ts`, slug `cubicle`) traces to a source below. Sources are the `SourceRef.id`s
declared in `cubicle.sources[]`; every source resolves to CONTENT_INVENTORY §8.3 + AUDIT §6. **No
figure is invented; no live product, usage, or solo-authorship claim is made.**

## Depth decision: full deep dive, not a card

CONTENT_INVENTORY §8.3 carries the deepest documentation of any personal build on the site — a
46-source discovery pack, a full multi-agent architecture, 326 automated tests, 97 tracked TC rows,
formal QA gates, and three numbered lessons — none of it duplicated elsewhere. Per `tickets.md`
TKT-32 ("full chapters, honest 'built, not launched'") and `technical-plan.md` §B TKT-32, this went to
a **full deep dive** (`overview.deepDive: true`), not a card, with the honesty framing carried through
every chapter rather than confined to the status badge.

## CRITICAL honesty framing (highest overclaim-risk record)

Cubicle is the highest-risk record on the site for overclaiming: a genuinely rigorous, fully-tested
build that was **never deployed and never run against a live model or database**. Every guard below
is enforced in the data, not just asserted in prose:

- **No live link.** `links` carries no `live` and no `demoVideo` — only a private `github` URL
  (`repoPublic:false`, matching decision S5 — the repo 404s for the public).
- **Status.** `status:"prototype"`, `statusLabel:"Built, not launched"` (unchanged from the card
  record), `statusAsOf:"2026-09-15"` (the date AUDIT verified via `gh repo view` that the repo has no
  homepage set).
- **No usage/activation numbers.** `metrics: []` carries only two **build-quality** figures (test
  count, WCAG contrast) — both `kind:'measured'`, both dated to the QA report, neither a product
  metric. Cost (~$0.04/run) and latency (50–75 s) are Solution-PRD *estimates* and appear only as
  prose in the evaluation chapter, explicitly labelled unmeasured — never as a `Metric`/`MetricCard`.
- **No solo claim.** `role:"Team build"` — the brief is a team of six; neither teammates' names nor
  Tushar's own named role inside that team were ever recorded in the PRDs, technical plan or QA
  report. The context chapter states this gap plainly instead of omitting it.
- **Featured swap not triggered.** §8.3's own "Swap rule" (Cubicle replaces the featured slot 3 only
  if deployed) does not fire — `featured` is not set; the existing featured trio (`teachspark`,
  `railcite`, `velora`) is untouched.
- **No screenshots / no `PrototypeFrame`.** AUDIT §6 "Visuals": "No PNG/JPG under Case Study 6
  anywhere; only Next.js template SVGs." No `PrototypeArtifact` is used anywhere in this record — a
  placeholder with invented dimensions would be worse than omitting the artifact type entirely; the
  two real, sourced pitch decks are cited instead as a `GenericArtifact` (`kind:'deck'`).

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `CUB-DISCOVERY-PRD` | Cubicle Discovery PRD | `CS6/Discovery-PRD.md:3,48,146,196,260,338,359` | §8.3 |
| `CUB-QA-REPORT` | Cubicle QA report | `CS6/QA-report.md:13,14,20,51,88-93,114-120,122` | §8.3 |
| `CUB-BUILDATHON-BRIEF` | Rethink Buildathon brief | `CS6/Rethink Buildathon - 10 Days.pdf` p.2 | §8.3 |
| `CUB-TECHNICAL-PLAN` | Cubicle technical-plan.md | `CS6/technical-plan.md:14` | §8.3 |
| `CUB-RESEARCH-NOTES` | Cubicle research-notes.md | `CS6/research-notes.md` (46 sources, High/Medium/Low tagged) | §8.3 |
| `CUB-DECISIONS` | Cubicle decisions.md | `CS6/decisions.md` (S1-S6, EXE-1, EXE-2) | §8.3 |
| `CUB-HANDOFF` | Cubicle HANDOFF.md | `CS6/HANDOFF.md:3` | §8.3 |
| `CUB-LESSON-LEARNT` | Cubicle lesson-learnt.md | `CS6/lesson-learnt.md` (L1, L2, L8, L61) | §8.3 |
| `CUB-PACKAGE-JSON` | Cubicle package.json | `CS6/cubicle/package.json` | §8.3 |
| `CUB-DECKS` | Cubicle pitch decks | `CS6/decks/{discovery,solution}/Cubicle-{Discovery,Solution}-Pitch.pdf` (13 pp each) | §8.3 |

`CUB-DECISIONS` is declared for traceability (referenced in the bet chapter's prose — "Six numbered
decisions (S1–S6)…") but is not cited as an artifact/metric `source` field, the same pattern as
`NUP-LAUNCH-POST` in the Nuptis record (TKT-31) — a real, sourced document without its own dedicated
artifact.

## Metrics (header) → source

| Value | Label | kind | asOf | source |
|---|---|---|---|---|
| 326 | Automated tests passing | measured | 2026-09-12 | `CUB-QA-REPORT` |
| ≥5.18:1 / ≥6.14:1 | WCAG AA text contrast (light / dark) | measured | 2026-09-12 | `CUB-QA-REPORT` |

Both are **build-quality** figures (tests, contrast) per TKT-32's explicit scope ("MetricCards
build-quality only") — never a product/usage number. Cost and latency stay in prose, unmeasured.

## Chapters → source (EVAL-003 / EVAL-011 anchor mapping)

| Chapter (anchor) | Key claim | Artifact(s) | Source | Inventory basis |
|---|---|---|---|---|
| 01 context (`#01-context`) | Buildathon team-of-6 framing, named role unrecorded; tagline + one-liner; pitch decks | `cub-a-tagline` (insight), `cub-a-team-of-6` (generic), `cub-a-decks` (generic) | `CUB-DISCOVERY-PRD`, `CUB-BUILDATHON-BRIEF`, `CUB-DECKS` | §8.3 Role, dates; AUDIT §6 "Role, dates, status" |
| 02 problem (`#02-problem`) | Exact problem quote; Aarav Mehta persona; 3 secondary personas | `cub-a-aarav` (insight), `cub-a-secondary-personas` (generic) | `CUB-DISCOVERY-PRD` | §8.3 Problem, Users |
| 03 discovery (`#03-discovery`) | Double-diamond method, 6 scored problem spaces, 46-source research; "Nobody makes the collaboration visible" insight; no primary interviews | `cub-a-gap-insight` (insight), `cub-a-research` (generic) | `CUB-DISCOVERY-PRD`, `CUB-RESEARCH-NOTES` | §8.3 Show-the-Thinking "Insight"; AUDIT §6 Discovery evidence |
| 04 bet (`#04-product-bet`) | 8 pre-launch targets (unmeasured); "Trust first, ownership second, autonomy last" sequencing decision | `cub-a-targets` (hypothesis), `cub-a-sequencing` (decision) | `CUB-DISCOVERY-PRD` | §8.3 Show-the-Thinking "Hypothesis"/"Product decision" |
| 05 built (`#05-what-i-built`) | One streaming route, fixed debate protocol + stop rules; four-artifact architecture decision; Gemini-only gateway | `cub-a-architecture` (generic), `cub-a-four-artifacts` (decision), `cub-a-gateway` (generic) | `CUB-TECHNICAL-PLAN`, `CUB-PACKAGE-JSON` | §8.3 Architecture, Stack; AUDIT §6 "Stack / architecture / AI" |
| 06 evaluation (`#06-evaluation`) | 326 tests / 97 TC rows / QA gates; "verified by construction, not against reality"; cost/latency unmeasured (prose only) | `cub-a-qa-gates` (evaluation) | `CUB-QA-REPORT` | §8.3 Metrics; AUDIT §6 "Evaluation / metrics" |
| 07 outcome (`#07-outcome`) | No live run, no users; deployment recommendation "CONDITIONALLY READY — STEPS REQUIRED" | `cub-a-recommendation` (generic), `cub-a-no-live-run` (generic) | `CUB-QA-REPORT`, `CUB-HANDOFF` | §8.3 Show-the-Thinking "Outcome"; AUDIT §6 "Role, dates, status" |
| 08 learned (`#08-what-i-learned`) | L1 (jsdom positional testing), L2 (dev harness against fixtures), L8 (read-the-diff review) | `cub-a-l1` (insight), `cub-a-l2` (generic), `cub-a-l8` (insight) | `CUB-LESSON-LEARNT` | §8.3 Learnings |

## Thinking chain (8 nodes) → source

This mirrors CONTENT_INVENTORY §8.3's own pre-mapped Show-the-Thinking chain almost verbatim
(Observation → six problem spaces scored; User problem; Insight; Hypothesis; Product decision;
Prototype; Evaluation; Outcome).

| Stage | Source | href | Inventory basis (§8.3 Show-the-Thinking) |
|---|---|---|---|
| observation | `CUB-DISCOVERY-PRD` | `#03-discovery` | "six candidate problem spaces scored (§4.1)" |
| user-problem | `CUB-DISCOVERY-PRD` | `#02-problem` | `Discovery-PRD.md:146` problem line |
| insight | `CUB-DISCOVERY-PRD` | `#03-discovery` | "Nobody makes the collaboration visible…" (`:196`) |
| hypothesis | `CUB-DISCOVERY-PRD` | `#04-product-bet` | activation/return/share/reliability/cost targets (§9) |
| product-decision | `CUB-DISCOVERY-PRD` | `#04-product-bet` | "Trust first, ownership second, autonomy last…" (`:338`) |
| prototype | `CUB-TECHNICAL-PLAN` | `#05-what-i-built` | offline build + dev harness `/dev/office` |
| evaluation | `CUB-QA-REPORT` | `#06-evaluation` | 326 tests / 97 TC rows; QA gates |
| outcome | `CUB-QA-REPORT` | `#07-outcome` | no live run, no users |

## Honesty / hedges preserved (not omitted, not softened)

- **No live run, no deployment**: stated in the context, bet, evaluation and outcome chapters, in the
  outcome-chapter artifacts, and in the hypothesis artifact's `knowWhen` — `QA-report.md:13` "The real
  4-agent end-to-end run has never been executed (no live model/DB)."
- **No usage/activation numbers**: every one of the 8 pre-launch targets (§9) is rendered as a
  `HypothesisArtifact` with `status:'unmeasured'`, never a `Metric`. Header `metrics` carry only the
  two build-quality figures (tests, contrast).
- **Cost/latency never shown as numbers**: "≈ $0.04" and "50–75 s" appear only in the evaluation
  chapter's prose, explicitly labelled as Solution-PRD estimates — never as a `Metric` object.
- **No solo claim**: `role:"Team build"`; the context chapter states outright that team member names
  and Tushar's own named role were never recorded.
- **No primary interviews**: the discovery chapter states plainly that the Discovery PRD's interview
  section is a placeholder ("to be filled during the build") and that none were ever conducted —
  unlike Token Toli's team-attributed "44 interviews," no interview count is claimed here at all.
- **Featured swap not triggered**: `featured` is unset; §8.3's conditional swap rule requires
  deployment, which never happened.
- **No screenshots fabricated**: no `PrototypeArtifact` anywhere in the record; the two real pitch
  decks are cited as a `GenericArtifact` (`kind:'deck'`) instead of inventing a placeholder image.
- **Status "Built, not launched"** (unchanged from the card record), `statusAsOf:"2026-09-15"` — the
  date AUDIT verified via `gh repo view` that the repo carries no homepage.

## Excluded (forbidden-strings / PII, EVAL-013)

- No `.env` key names, phone numbers, DOB, or local paths. Repo is private (AUDIT §6; decision S5) →
  `repoPublic:false`, `github` populated but not `repoPublic:true`. `forbidden-strings.ts --bundle`
  reports 0 hits.

## DRAFT flags

**None.** Every chapter body, artifact, metric and thinking node is sourced to CONTENT_INVENTORY
§8.3 / AUDIT §6. `metrics` carrying only 2 build-quality entries (never a product number) is
deliberate, not a gap — see "CRITICAL honesty framing" above.
