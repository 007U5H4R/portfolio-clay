# Trace — Nuptis → Velora full case study (TKT-30, M-005)

Every number, metric and load-bearing claim in the Velora `Project` record (`data/projects.ts`,
slug `velora`, display name "Nuptis → Velora") and its 8 chapters / thinking chain traces to a source
below. Sources are the `SourceRef.id`s declared in `velora.sources[]`; every source resolves to
CONTENT_INVENTORY §8.5 (+ §8.4 pivot, §1.4/§1.5) and AUDIT §3. **No figure is invented.**

**Carry-forward from TKT-12 (PRD-line swap — DONE):** `overview.thirtySecond` previously used the
§8.5 discovery insight ("Onboarding routinely takes 15–30 business days…") as a STAND-IN because the
PRD's own problem line was not quoted in the inventory. That exact line has since been located at
`CS3/Velora/PRD.md:11` and quoted verbatim in §8.5 (line 392); it now opens the 30-second overview
and the `user-problem` thinking node (source `V-PRD`). The stand-in insight moved into the discovery
chapter and the `insight` thinking node, **attributed to the team** (`CS3-TEAM-PRD`), per §1.5
"VERIFIED (attribute to team)". No DRAFT flag is required.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `V-PRD` | Velora PRD | `CS3/Velora/PRD.md:3 / :5 / :11 / :23-24 / :80` | §8.5 |
| `V-DISCOVERY-PRD` | Apparel Vendor Onboarding Discovery PRD | `CS3/Apparel-Vendor-Onboarding-Discovery-PRD.docx (H1; confidence tags)` | §8.5 |
| `CS3-TEAM-PRD` | Case Study 3 team PRD | `CS3/CASE STUDY 3 PRD.pdf p.7 / p.10 / pp.11-12 / p.18` | §8.5 |
| `CS3-9DAY-SERIES` | Case Study 3 — nine-day LinkedIn series | `CS3/Case-Study-3-LinkedIn-9-Day-Series.docx (Day 7, Day 9)` | §8.5 |
| `V-README` | Velora README & package.json | `CS3/Velora/README.md:76-81; CS3/Velora/app/package.json` | §8.5 |
| `V-SUPABASE` | Velora Supabase notes | `CS3/Velora/SUPABASE.md:67-71` | §8.5 |
| `V-REVIEW` | Velora task-6.3 final review | `CS3/Velora/.superpowers/sdd/2026-08-11-velora-mvp/reports/task-6.3-review.md` | §8.5 |
| `V-LIVE` | Velora live app | `https://velora-nu-eight.vercel.app/` (HTTP 200, 2026-09-15) | §8.5 |

## Metrics (header) → source

Only build-quality figures exist — **no usage / pilot / product-outcome metric is claimed** (§8.5
AC 3). The team onboarding-delay baseline is NOT a `MetricCard` (see Honesty below).

| Where | Value | Label | kind | asOf | Source | Inventory basis |
|---|---|---|---|---|---|---|
| header | `2` | Products in nine days | structural | 2026-09-09 | `CS3-9DAY-SERIES` | §8.5 "Nine days. Two products. One survived" (Day 9); Nuptis killed Day 7 |
| header | `10/10` | Unit tests passing | measured | 2026-09-15 | `V-REVIEW` | §8.5 Metrics "10/10 unit tests (2026-09-15)"; task-6.3 review |
| header | `156 kB` | Gzipped bundle | measured | 2026-08-11 | `V-REVIEW` | §8.5 Evaluation "bundle 500.63 kB / 156 kB gzip", "0 horizontal overflow at 375 and 768" |

## Chapters → source (EVAL-003 / EVAL-011 anchor mapping)

| Chapter (anchor) | Key claim | Artifact(s) | Source | Inventory basis |
|---|---|---|---|---|
| 01 context (`#01-context`) | CS3 Cohort 8 Week 4; team = TrustBridge; Tushar built Nuptis then Velora solo, nine days | `v-a-two-products` (generic) | `CS3-9DAY-SERIES` / `V-PRD` | §8.5 Role ("Owner: Tushar"), Team submission TrustBridge; AUDIT §3 |
| 02 problem (`#02-problem`) | Exact PRD problem line "Discovery today is broken…" | `v-a-interviews` (insight, team) | `V-PRD` (line); `CS3-TEAM-PRD` (interviews) | §8.5 Problem (PRD.md:11), Users (PRD.md:23-24), interviews p.10 |
| 03 discovery (`#03-discovery`) | Idle queue-time insight (team, vs APQC ~3 days); team-pooled interviews; baseline = secondary research; confidence tags | `v-a-queue-time` (insight, team), `v-a-h1` (hypothesis) | `CS3-TEAM-PRD`, `V-DISCOVERY-PRD` | §8.5 Insight (team PDF p.7), Metrics ("do not present as own data"), Hypothesis (H1; tags) |
| 04 bet (`#04-product-bet`) | Kill Nuptis (shallow pool) → pivot to apparel; Red/Blue Ocean + ERRC | `v-a-kill` (decision), `v-a-errc` (generic) | `CS3-9DAY-SERIES`, `CS3-TEAM-PRD` | §8.5 Product decision (LinkedIn Day 7); ERRC team PDF pp.11-12 |
| 05 built (`#05-what-i-built`) | One-day build; React 19 / router 7 / Zustand / env-gated Supabase + mock fallback; 7-table schema; no AI; Trust Scores authored; live path not run | `v-a-stack` (generic), `v-a-trust-scores` (decision) | `V-README`, `V-PRD` | §8.5 Stack; AUDIT §3 README:76-81; PRD.md:80; SUPABASE.md:67-71 |
| 06 evaluation (`#06-evaluation`) | 10/10 vitest, 0 overflow (375/768), 156 kB gz, 2 MUST-FIX + 2 SHOULD cleared; no pilot/users | `v-a-review` (evaluation) | `V-REVIEW` | §8.5 Evaluation (task-6.3 review); AUDIT §3 memory.md:77 |
| 07 outcome (`#07-outcome`) | Live on mock data; "Nine days. Two products. One survived."; no users; link to `/work/nuptis` | `v-a-nuptis-link` (generic link) | `CS3-9DAY-SERIES` | §8.5 Outcome (Day 9); §8.5 Status "Live (mock data)"; SUPABASE.md |
| 08 learned (`#08-what-i-learned`) | Kill without flinching; attack queue-time not effort; label mock/authored honestly | `v-a-kill-without-flinching` (insight) | `CS3-9DAY-SERIES` | §8.5 Learned ("learning to kill Nuptis without flinching", Day 9) |

## Thinking chain (8 nodes) → source

| Stage | Source | href | Inventory basis (§8.5 Show-the-Thinking) |
|---|---|---|---|
| observation | `CS3-TEAM-PRD` | `#01-context` | procurement interviews team-pooled ("I find out where a vendor is by asking around…") p.10 |
| user-problem | `V-PRD` | `#02-problem` | PRD.md:11 problem line |
| insight | `CS3-TEAM-PRD` | `#03-discovery` | idle queue-time vs APQC ~3 days (team PDF p.7) |
| hypothesis | `V-DISCOVERY-PRD` | `#03-discovery` | H1 coordination-not-speed; confidence tags |
| product-decision | `CS3-9DAY-SERIES` | `#04-product-bet` | "Weddings were blue — but a shallow pool" pivot (Day 7) |
| prototype | `V-README` | `#05-what-i-built` | one-day live build; stack; all 40+ commits 2026-08-11 |
| evaluation | `V-REVIEW` | `#06-evaluation` | 10/10 vitest, 0 overflow, 156 kB gz, MUST-FIX cleared |
| outcome | `CS3-9DAY-SERIES` | `#07-outcome` | "Nine days. Two products. One survived." (Day 9); no users |

## Honesty / hedges preserved (not omitted, not softened)

- **Team baseline is secondary research, never own data** (§8.5 AC 1): 15–30 days / <10% active work /
  2–5× resubmission is marked "verify before external use" (team PDF p.18) — shown as team background
  in the discovery chapter, and NOT rendered as a `MetricCard`.
- **Trust Scores are authored, not verified** (§8.5 AC 2): "real government-API verification" is out of
  scope (PRD.md:80) — stated in the built chapter + `v-a-trust-scores` decision + the 30-sec overview.
- **No users / pilot / usage data** (§8.5 AC 3): stated in evaluation + outcome chapters and every
  metric context; the only figures are build-quality signals.
- **Live path built but not run**: "The live path was built but not run against a real project"
  (SUPABASE.md:67-71) — the app runs on mock data ("Live (mock data)").
- **Team-pooled interviews**: Tushar's individual fieldwork share is not separately recorded — the
  interview quote is attributed to the team PRD, not to him.
- **Insight attributed to team**: the idle-queue-time insight is team research (§1.5 "attribute to
  team"), not presented as Velora's own discovery.

## Excluded (forbidden-strings / PII, EVAL-013 / EVAL-016)

- No `.env` key names, phone numbers, DOB, or local paths. Repo is private (S5) → no github link,
  `repoPublic:false`. `forbidden-strings.ts --bundle` reports 0 hits.

## EVAL-003 (product-leader questions) — Velora rows

Velora's artifacts are reachable at `/work/velora#<anchor>` for the discovery-, decision-,
evaluation- and outcome-oriented product-leader questions (e.g. "How do you approach product
discovery?" → `#03-discovery`; "Tell me about a decision you reversed / a product you killed" →
`#04-product-bet` / `#07-outcome`). The consolidated 8/8 mapping across the three featured studies is
finalised in TKT-39; this record supplies the Velora rows (§8.5 AC 4).

## DRAFT flags

**None.** Every chapter body, metric and thinking node is sourced to CONTENT_INVENTORY §8.5 / AUDIT
§3. The PRD-line swap resolved cleanly (exact line located at PRD.md:11), so no stand-in or DRAFT
placeholder remains.
