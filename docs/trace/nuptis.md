# Trace — Nuptis full case study (TKT-31, M-005)

Every chapter body, artifact, thinking node and learning in the Nuptis `Project` record
(`data/projects.ts`, slug `nuptis`) traces to a source below. Sources are the `SourceRef.id`s
declared in `nuptis.sources[]`; every source resolves to CONTENT_INVENTORY §8.4 + AUDIT §3. **No
figure is invented; no metric is claimed.**

**Depth decision.** Nuptis went to a **full deep dive** (`overview.deepDive: true`), not a card. §8.4
carries substantial, distinct sourced content — its own problem framing, personas, a risk-tier
verification insight, a North Star metric definition, an explicit cut list, a mobile-QA sweep, and a
self-feedback learning — none of it duplicated from Velora's own page. The two pages share only the
Case Study 3 sprint context and the Day 7/Day 9 kill-decision quotes (`CS3-9DAY-SERIES`), and each
page attributes those quotes independently rather than copying the other's prose. The outcome chapter
cross-links to `/work/velora` for the fuller pivot account instead of restating it.

**No `MetricCard`s (by design, not by gap).** The PRD defines a North Star ("% of high-risk work
orders with a named backup assigned before the event date") and two other §11 success metrics, but
`Nuptis-PRD.md:201` states all three "are defined but unmeasured" — no pilot ever ran. Per the ticket
(TKT-31), this is stated as a `HypothesisArtifact` (`status: 'unmeasured'`) and in prose ("none
measured"), never backed into a `MetricCard`. `nuptis.metrics` is `[]`.

**Media (TKT-24, soft, not yet landed).** Eight screenshots exist in the source repo
(`CS3/Nuptis/docs/screenshots/*.jpg`, 1568×661) but have not been copied into this repo yet. The two
`PrototypeFrame` artifacts (dashboard, contingency) use `kind: 'placeholder'` with the real, sourced
dimensions — `PrototypeFrame.tsx` renders a labelled placeholder for this kind, never a broken
`<img>` — so nothing unsourced is shown as a real screenshot. `hero: {}` (same as every other project
in this repo pre-M-005 media tickets), which renders the existing "Hero media coming" placeholder.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `NUP-WEEK4-BRIEF` | Case Study 3 Week 4 brief | `CS3/Case study __ Week 4 __ C8 - Our file.pdf` | §8.4 |
| `NUP-PRD` | Nuptis PRD | `CS3/Nuptis-PRD.md:3,4,6,18,39-44,175,201` | §8.4 |
| `NUP-README` | Nuptis README | `CS3/Nuptis/README.md:83-88,98` | §8.4 |
| `NUP-PROCUREMENT` | Wedding vendor onboarding — procurement process notes | `CS3/Wedding-Vendor-Onboarding-Procurement-Process.md:19-27` | §8.4 |
| `NUP-DESIGN` | Nuptis DESIGN.md | `CS3/DESIGN.md` | §8.4 |
| `NUP-PM-PLAN` | PM Strategy Plan | `CS3/PM Strategy Plan.md:11,48-52` | §8.4 |
| `CS3-9DAY-SERIES` | Case Study 3 — nine-day LinkedIn series | `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx` (Day 7, Day 9) | §8.4 |
| `NUP-SCREENSHOTS` | Nuptis app screenshots | `CS3/Nuptis/docs/screenshots/{dashboard,contingency}.jpg` (1568×661) | §8.4 |
| `NUP-LEDGER` | Nuptis mobile-sweep ledger note | exact file not identified in audit; quoted verbatim in `CONTENT_INVENTORY.md:376` / `AUDIT.md:123` | §8.4 |
| `NUP-FEEDBACK` | Nuptis self-feedback (cohort spreadsheet) | `CS3/Week 4 __ Toliyooo.xlsx` "Feedbacks for yourself" row 9 | §8.4 |
| `NUP-MEMORY` | Nuptis project memory log | `CS3/memory.md:4,135-139` | §8.4 |
| `NUP-LAUNCH-POST` | Nuptis LinkedIn launch post | `CS3/Nuptis-LinkedIn-Launch-Post.docx` | §8.4 |
| `NUP-LIVE` | Nuptis live app | `https://nuptis.vercel.app/` (HTTP 200, 2026-09-15) | §8.4 |

## Metrics (header) → source

**None.** `nuptis.metrics = []`. All three PRD §11 success metrics — including the North Star — were
defined but never measured against a real wedding (`NUP-PRD:201`). This is stated in the evaluation
chapter's prose and in the North Star `HypothesisArtifact` (`status: 'unmeasured'`), not as a
`MetricCard` (AC per TKT-31: "metrics: 'none measured' stated explicitly — no `MetricCard`s").

## Chapters → source (EVAL-003 / EVAL-011 anchor mapping)

| Chapter (anchor) | Key claim | Artifact(s) | Source | Inventory basis |
|---|---|---|---|---|
| 01 context (`#01-context`) | Week 4 brief framing; "a grounding/exploration project"; solo, first commit 8 Aug, 21 commits, separate product from Velora | `nup-a-brief` (insight) | `NUP-WEEK4-BRIEF` | §8.4 Context, Role, Dates |
| 02 problem (`#02-problem`) | Exact PRD problem line ("Wedding planning agencies run 15–30+ vendors…"); 4 personas | `nup-a-personas` (generic) | `NUP-PRD` | §8.4 Problem (`Nuptis-PRD.md:18`), Users (`:39-44`) |
| 03 discovery (`#03-discovery`) | Risk-tier verification insight ("three weeks vetting a card printer…"); honesty note on interview provenance | `nup-a-risk-tier` (insight), `nup-a-contingency-shot` (prototype, placeholder) | `NUP-PROCUREMENT`, `NUP-SCREENSHOTS` | §8.4 Show-the-Thinking "Insight"; `Wedding-Vendor-Onboarding-Procurement-Process.md:19-27` |
| 04 bet (`#04-product-bet`) | North Star metric definition (unmeasured); explicit §7 cut list, effort-tracks-points sizing | `nup-a-north-star` (hypothesis), `nup-a-cut-list` (decision) | `NUP-PRD`, `NUP-PM-PLAN` | §8.4 Metrics (`Nuptis-PRD.md:175,201`); AUDIT §3 "explicit cut list … effort-tracks-points" |
| 05 built (`#05-what-i-built`) | React 18.3 + Supabase mirror + reducer architecture; no AI (keyword-matching Assistant); no automated tests | `nup-a-stack` (generic), `nup-a-no-ai` (decision), `nup-a-dashboard-shot` (prototype, placeholder) | `NUP-README`, `NUP-SCREENSHOTS` | §8.4 Stack, Architecture; AUDIT §3 "AI: none"; `README.md:98` |
| 06 evaluation (`#06-evaluation`) | Mobile sweep (9 routes @414/768, 1 bug fixed); Figma design rigor (168 frames, AA audit); no tests / no pilot / metrics none measured | `nup-a-mobile-sweep` (evaluation), `nup-a-design-rigor` (generic) | `NUP-LEDGER`, `NUP-DESIGN` | §8.4 Show-the-Thinking "Evaluation"; AUDIT §3 Design rigor |
| 07 outcome (`#07-outcome`) | Still live (mock data) at nuptis.vercel.app; killed as a product bet on day 7 in favour of Velora; cross-link to `/work/velora` | `nup-a-velora-link` (generic link) | `CS3-9DAY-SERIES` | §8.4 Show-the-Thinking "Outcome" (Day 7/9); Status "Live (mock data)" |
| 08 learned (`#08-what-i-learned`) | Self-feedback quote (prompt engineering, Claude Code usage); process lessons (Vercel subfolder deploy, OG tags) | `nup-a-self-feedback` (insight), `nup-a-process` (generic) | `NUP-FEEDBACK`, `NUP-MEMORY` | §8.4 Learnings ("Feedbacks for yourself" row 9); AUDIT §3 `memory.md:135-139` |

## Thinking chain (8 nodes) → source

This mirrors CONTENT_INVENTORY §8.4's own pre-mapped Show-the-Thinking chain almost verbatim.

| Stage | Source | href | Inventory basis (§8.4 Show-the-Thinking) |
|---|---|---|---|
| observation | `NUP-WEEK4-BRIEF` | `#01-context` | "vendor onboarding continues to remain slow, fragmented, and difficult to manage across teams" |
| user-problem | `NUP-PRD` | `#02-problem` | `Nuptis-PRD.md:18` problem line |
| insight | `NUP-PROCUREMENT` | `#03-discovery` | risk-tier verification ("three weeks vetting a card printer…") |
| hypothesis | `NUP-PRD` | `#04-product-bet` | North Star (`:175`), unmeasured (`:201`) |
| product-decision | `NUP-PM-PLAN` | `#04-product-bet` | PRD §7 explicit cut list; "effort-tracks-points" reasoning (`PM Strategy Plan.md:11`) |
| prototype | `NUP-DESIGN` | `#05-what-i-built` | live app; Figma 168 frames, 283 prototype reactions, 62 dual-mode tokens, AA audit |
| evaluation | `NUP-LEDGER` | `#06-evaluation` | mobile sweep "9 routes swept @414px + 768px; 1 bug found+fixed"; no automated tests, no pilot |
| outcome | `CS3-9DAY-SERIES` | `#07-outcome` | "No real pilot data yet… defined but unmeasured" (`:201`) → killed in favour of Velora (Day 7) |

## Honesty / hedges preserved (not omitted, not softened)

- **No pilot, no usage data**: stated in the bet, evaluation and outcome chapters and in the North
  Star `HypothesisArtifact` (`status: 'unmeasured'`) — `Nuptis-PRD.md:201` "No real pilot data yet.
  All three success metrics in §11 are defined but unmeasured."
- **No AI**: the in-app Assistant is a keyword-matching canned-response widget
  (`Nuptis/src/components/Assistant.tsx`), not an LLM — stated as its own `DecisionArtifact` in the
  built chapter (TKT-31 AC 7).
- **No automated tests**: `README.md:98` "There is no separate lint or unit-test script configured" —
  disclosed in the built-chapter prose and as the evaluation artifact's `limitation` (TKT-31 AC 8).
- **Domain reasoning, not fieldwork**: the discovery chapter states plainly that Nuptis is "a
  grounding/exploration project," that apparel-side interviews were "planned, not yet run" at the
  time, and that no wedding-specific interviews are separately attributed to Tushar.
- **Team-pooled interviews / secondary research** (shared with Velora's own honesty notes): not
  restated here as Nuptis's own fieldwork.
- **Still live, but killed as a bet**: the outcome chapter is careful to distinguish "still deployed
  at nuptis.vercel.app" (a fact) from "retired as a product decision on day seven" (also a fact) —
  neither overwrites the other.
- **Status "Live (mock data)"** (TKT-31 AC 9), unchanged from the card record.
- **Cut-list content not fabricated**: the PRD's §7 cut list exists and is reasoned, but no specific
  cut item is quoted (none was located verbatim in the inventory) — the bet chapter describes the
  existence and reasoning framework only, never invented line items.

## Media placeholders (TKT-24 soft dependency)

- `nup-a-contingency-shot` and `nup-a-dashboard-shot` (`PrototypeArtifact`, `kind: 'placeholder'`)
  carry the real, sourced screenshot dimensions (1568×661, `NUP-SCREENSHOTS`) but no image file yet —
  `PrototypeFrame.tsx` renders a labelled `ImageOff` placeholder for this kind, never a broken `<img>`.
  When TKT-24 lands the actual files at `/media/nuptis/{dashboard,contingency}.jpg`, only `media.kind`
  needs to flip to `'image'` (paths already match the eventual real location).

## Excluded (forbidden-strings / PII, EVAL-013)

- No `.env` key names, phone numbers, DOB, or local paths. Repo is private (AUDIT §3) →
  `repoPublic:false`, `github` populated but not `repoPublic:true`. `forbidden-strings.ts --bundle`
  reports 0 hits.

## DRAFT flags

**None.** Every chapter body, artifact and thinking node is sourced to CONTENT_INVENTORY §8.4 / AUDIT
§3. `metrics: []` is deliberate (see "No `MetricCard`s" above), not a gap.
