# Trace — Bhakti-Vilas shorter deep dive (TKT-33, M-005)

Every chapter body, artifact, thinking node, learning and header field in the Bhakti Vilas `Project`
record (`data/projects.ts`, slug `bhakti-vilas`) traces to a source below. Sources are the
`SourceRef.id`s declared in `bhaktiVilas.sources[]`; every source resolves to CONTENT_INVENTORY §8.6 +
AUDIT §2. **No figure is invented; no product-usage, mentor-grade, or solo-authorship claim is made.**

## Depth decision: shorter full deep dive, not a card

CONTENT_INVENTORY §8.6 pre-maps a genuinely sourced 8-stage Show-the-Thinking chain (observation →
user problem → insight → hypothesis → product decision → prototype → evaluation → outcome), each
carrying a real quote, plus named artifacts (Tushar's refined hypothesis, the Madhu Mukti decision, the
mentor Q&A). That is enough sourced material for real chapters and a real 8-node thinking chain — so per
`tickets.md` TKT-33 ("Shorter chapter set... Evaluation/Outcome brief") and `technical-plan.md` §B TKT-33,
this went to a **shorter full deep dive** (`overview.deepDive: true`), not a card. It stays deliberately
narrower than TeachSpark/Cubicle: the evaluation and outcome chapters are one paragraph each with a
single artifact, there are zero header `Metric`s, and no `PrototypeFrame` anywhere.

## CRITICAL honesty framing

- **No product metrics.** `metrics: []`. CONTENT_INVENTORY §8.6 states plainly: "product metrics
  MISSING." The team's own market-research survey numbers (n=23/47/12, 9 personas, 3 expert interviews)
  are reported in the problem chapter as **team data**, explicitly labelled "not Tushar's own
  fieldwork" — never folded into a `Metric`/`MetricCard` as if they were this product's usage.
- **Staged-reveal funnel is an estimate, not data.** The Madhu Mukti 100%→~60%→~25%→~10% funnel is
  reported only in prose, quoting the solution doc's own label — "directional estimates, not measured
  data" — never as a `Metric`.
- **No solo claim.** `role:"Team build"`; the context chapter states the exact commit split (8 commits,
  all 2026-08-01, 5× Tushar / 3× Shivali) rather than leaving the build's authorship ambiguous.
- **No screenshots fabricated.** AUDIT §2 "Visuals": "UI screenshots of Bhakti Vilas: MISSING (capture
  from live URL)." Unlike Nuptis (TKT-31), where real, dimensioned screenshots exist in the source repo
  and a sourced-dimension placeholder was used, Bhakti Vilas has **no screenshot file anywhere** to
  source a placeholder from — so no `PrototypeArtifact` is used anywhere in this record, and `hero`
  stays `{}` (renders the labelled "Hero media coming" state) until TKT-25 lands real captures.
- **No mentor grade.** The mentor's three questions are answered (11 sources) but no numeric grade was
  ever recorded — the evaluation chapter states this explicitly rather than omitting it silently.
- **No interviews fielded by Tushar himself.** The problem-chapter team-survey artifact discloses that
  Tushar's own interview guides exist but "were never run with outside families" — guides only.
- **Repo visibility unverified.** `links.github` is populated but `repoPublic:false` — the repo sits on
  an org account (`teenytinybot/Bhakti-Vilas`) whose visibility was never confirmed.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `BV-README` | Bhakti Vilas README | `CS2/Bhakti-Vilas/README.md` | §8.6 |
| `BV-AUDIT` | Portfolio audit — Case Study 2 (git, stack, live check) | `AUDIT.md §2 "Bhakti-Vilas (code)"` (git authorship, live verification 2026-09-15) | §8.6 |
| `BV-BRIEF` | Case Study 2 brief | `CS2/Case Study 2 - C8_ Building for India_s Elder Care Market.docx` | §8.6 |
| `BV-CASE-STUDY` | India-Elder-Care-Case-Study.md | `CS2/India-Elder-Care-Case-Study.md` | §8.6 |
| `BV-TUSHAR-HYPOTHESIS` | Tushar's refined hypothesis (Week 3 tracker) | `CS2/Week 3 C8 Token Toli.xlsx` tab "Tushar" | §8.6 |
| `BV-TEAM-SYNTHESIS` | Team-Research-Synthesis.md | `CS2/Team-Research-Synthesis.md` | §8.6 |
| `BV-TEAM-PRIMARY-RESEARCH` | Primary research — Prashant's pod | `CS2/Primary Research - Prashant_s POD/Elder_Care_Problem_Hypotheses.md.pdf` | §8.6 |
| `BV-CATEGORY-HYPOTHESES` | Category-Hypotheses.md | `CS2/Category-Hypotheses.md` | §8.6 |
| `BV-REFINED-HYPOTHESIS` | Refined-Hypothesis-and-Lateral-Solution.md | `CS2/Refined-Hypothesis-and-Lateral-Solution.md` | §8.6 |
| `BV-MADHU-MUKTI-SOLUTION` | Madhu Mukti solution doc (Tushar) | `CS2/Converging Results/[Tushar] 3-4 pager solution.docx` | §8.6 |
| `BV-TEAM-PRD` | Case Study 2 team PRD | `CS2/Case Study 2 PRD.pdf` (23pp, 2026-08-03, no author names) | §8.6 |
| `BV-MEMORY` | Bhakti-Vilas memory.md | `CS2/Bhakti-Vilas/memory.md` | §8.6 |
| `BV-MENTOR-QA` | Why-Bhakti-Mentor-QA.md | `CS2/Bhakti-Vilas/Why-Bhakti-Mentor-QA.md` | §8.6 |
| `BV-LINKEDIN` | LinkedIn 7-Day Journey Series | `CS2/LinkedIn-7-Day-Journey-Series.md` (Day 3, Day 7) | §8.6 |

## Metrics (header) → source

None. `metrics: []` — CONTENT_INVENTORY §8.6 states "product metrics MISSING"; the team's survey
numbers describe market research, not this prototype's own usage, so they stay in chapter prose/
artifacts rather than becoming header `Metric`s.

## Chapters → source (EVAL-003 / EVAL-011 anchor mapping)

| Chapter (anchor) | Key claim | Artifact(s) | Source | Inventory basis |
|---|---|---|---|---|
| 01 context (`#01-context`) | Buildathon framing; 5 contributors converged independently; team build, commit split 5 Tushar/3 Shivali | `bv-a-brief` (insight), `bv-a-team-synthesis` (generic), `bv-a-commit-split` (generic) | `BV-BRIEF`, `BV-TEAM-SYNTHESIS`, `BV-AUDIT` | §8.6 Name/tagline, Role; AUDIT §2 "Git" |
| 02 problem (`#02-problem`) | Ecosystem accountability-gap quote; Tushar's refined hypothesis; team survey numbers (not Tushar's fieldwork) | `bv-a-ecosystem-quote` (insight), `bv-a-refined-hypothesis` (insight), `bv-a-team-survey` (generic) | `BV-CASE-STUDY`, `BV-TUSHAR-HYPOTHESIS`, `BV-TEAM-PRIMARY-RESEARCH` | §8.6 Problem, Users; AUDIT §2 "Tushar's explicit artifacts", "Team artifacts" |
| 03 discovery (`#03-discovery`) | "Distance was never the variable" insight; 5 categories/10 hypotheses; "Insure the visit, don't vet the person" hypothesis | `bv-a-distance-insight` (insight), `bv-a-categories` (generic), `bv-a-insure-the-visit` (hypothesis) | `BV-LINKEDIN`, `BV-CATEGORY-HYPOTHESES`, `BV-REFINED-HYPOTHESIS` | §8.6 Show-the-Thinking "Insight"/"Hypothesis" |
| 04 bet (`#04-product-bet`) | Madhu Mukti decision (health meaning coded, not front-loaded); staged-reveal funnel as estimate; team PRD echoes Tushar's principles | `bv-a-madhu-mukti-decision` (decision), `bv-a-staged-reveal` (generic), `bv-a-prd-echo` (generic) | `BV-MADHU-MUKTI-SOLUTION`, `BV-TEAM-PRD` | §8.6 Show-the-Thinking "Product decision"; AUDIT §2 "Team artifacts" |
| 05 built (`#05-what-i-built`) | Static 4-page/vanilla-JS stack, no AI/tests/CI; verified session-booking flow, no console errors; live since 2026-08-01, repo visibility unverified | `bv-a-stack` (generic), `bv-a-verified-flow` (generic), `bv-a-live-link` (generic/link) | `BV-README`, `BV-MEMORY`, `BV-AUDIT` | §8.6 Stack; AUDIT §2 "Bhakti-Vilas (code)" |
| 06 evaluation (`#06-evaluation`) | Mentor Q&A (11 sources), caveated as a well-evidenced hypothesis not a proven guarantee; no mentor grade recorded | `bv-a-mentor-qa` (evaluation) | `BV-MENTOR-QA` | §8.6 Show-the-Thinking "Evaluation"; AUDIT §2 "Metrics / learnings" |
| 07 outcome (`#07-outcome`) | "Shipped... live and deployed, not a deck"; no users/usage/product metrics | `bv-a-shipped-quote` (generic) | `BV-LINKEDIN` | §8.6 Show-the-Thinking "Outcome" |
| 08 learned (`#08-what-i-learned`) | README-disclosed gaps: translation ~90/500 strings, medical copy unreviewed | `bv-a-readme-gaps` (generic) | `BV-README` | §8.6 Learnings |

## Thinking chain (8 nodes) → source

This mirrors CONTENT_INVENTORY §8.6's own pre-mapped Show-the-Thinking chain closely (Observation →
User problem → Insight → Hypothesis → Product decision → Prototype → Evaluation → Outcome).

| Stage | Source | href | Inventory basis (§8.6 Show-the-Thinking) |
|---|---|---|---|
| observation | `BV-BRIEF` | `#01-context` | brief: "shortage of clarity" |
| user-problem | `BV-CASE-STUDY` | `#02-problem` | ecosystem accountability-gap quote |
| insight | `BV-LINKEDIN` | `#03-discovery` | "Distance was never the variable. Availability was." + financial burden ranked dead last |
| hypothesis | `BV-REFINED-HYPOTHESIS` | `#03-discovery` | "Insure the visit, don't vet the person." |
| product-decision | `BV-MADHU-MUKTI-SOLUTION` | `#04-product-bet` | Madhu Mukti: health meaning coded, not front-loaded |
| prototype | `BV-README` | `#05-what-i-built` | live, verified flows, no console errors |
| evaluation | `BV-MENTOR-QA` | `#06-evaluation` | mentor's 3 questions, 11 sources |
| outcome | `BV-LINKEDIN` | `#07-outcome` | "Shipped Bhakti Vilas... not a deck" (Day 7); no users/metrics |

## Honesty / hedges preserved (not omitted, not softened)

- **No product metrics anywhere**: header `metrics: []`; the team survey numbers are explicitly
  attributed to the team ("not Tushar's own fieldwork") in the problem chapter's `bv-a-team-survey`
  artifact, never rendered as a `Metric`.
- **Staged-reveal funnel never shown as data**: `bv-a-staged-reveal` states the "directional estimates,
  not measured data" caveat verbatim; no `Metric` object is created for it.
- **No solo claim**: `role:"Team build"`; the context chapter states the 8-commit, 5/3 split outright.
- **No screenshots fabricated**: no `PrototypeArtifact` anywhere in the record — AUDIT §2 confirms zero
  UI screenshot files exist anywhere in the source project (unlike Nuptis, which had real dimensioned
  screenshots to source a placeholder from); `hero: {}` renders the labelled placeholder instead.
- **No mentor grade claimed**: `bv-a-mentor-qa`'s `result` field states outright that no numeric grade
  was ever recorded, alongside the document's own "not a proven guarantee" caveat as `limitation`.
- **No primary interviews by Tushar**: `bv-a-team-survey` discloses his interview guides were never run
  with outside families.
- **Repo visibility unverified**: `repoPublic:false` even though `github` is populated.

## Excluded (forbidden-strings / PII, EVAL-013)

- No `.env` key names, phone numbers, DOB, or local paths. No 10-digit numbers appear (survey sizes are
  small integers — n=23, n=47, n=12 — well under the phone-number pattern). Repo visibility unverified
  → `repoPublic:false`, `github` populated but not marked public. `forbidden-strings.ts --bundle`
  reports 0 hits.

## Test-suite change (JS-off thin-slug assertion moved)

Bhakti-Vilas moving to a full deep dive (`overview.deepDive: true`) means its page no longer renders the
"Deep dive coming" note, so the JS-off static-content test in `tests/e2e/case-study.spec.ts`
("case-study · JS off: static HTML carries content and NextProject") was repointed from `bhakti-vilas`
to `token-toli` — a slug TKT-54 will always keep thin (`deepDive:false`, "Discovery only" page) — mirroring
how TKT-31/TKT-32 previously moved the same assertion off `nuptis`/`cubicle` onto `bhakti-vilas`. The
shared `DEEP_DIVE` set in that spec also gained `"bhakti-vilas"`.

## DRAFT flags

**None.** Every chapter body, artifact, and thinking node is sourced to CONTENT_INVENTORY §8.6 / AUDIT
§2. `metrics: []` and the absence of any `PrototypeArtifact` are deliberate, not gaps — see "CRITICAL
honesty framing" above.
