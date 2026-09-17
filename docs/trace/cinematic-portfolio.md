# Trace — Cinematic Portfolio (TKT-54 / TSK-29, M-005)

Every field in the Cinematic Portfolio `Project` record (`data/projects.ts`, slug
`cinematic-portfolio`) traces to a source below. Sources are the `SourceRef.id`s declared in
`cinematicPortfolio.sources[]`; every source resolves to CONTENT_INVENTORY §8.11.

**This is the currently-live site** (`https://tushar-pathak.vercel.app/`) — a separate, already-
shipped repository (`~/…/portfolio/cinematic`, public GitHub `007U5H4R/cinematic-portfolio`). This
ticket only writes a card record that **links to it as live** on this new clay portfolio's `/work`
grid and `/playground`; it does **not** rebuild, re-theme, or modify that site or its repository in
any way. No file under the sibling `portfolio/` project was read or touched while authoring this
record.

**Depth decision.** Cinematic Portfolio stays a **card, not a case study**
(`overview.deepDive: false`, `chapters: EMPTY_CHAPTERS`, `thinking: []`) — its own decision chain is
short (4 stages: Observation → decision → evaluation → outcome), so a full 8-chapter case study would
pad thin evidence into a bigger narrative than the pack supports. All of this ticket's real content
lives in `overview.thirtySecond` (2 paragraphs) plus one header `metrics[]` entry and `learnings`.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `CN-PRD` | Cinematic portfolio PRD | `CN/PRD.md` | §8.11 |
| `CN-LEDGER` | Cinematic build ledger | `CN/ledger.md` (2026-08-26) | §8.11 |

## Fields → source

| Field | Rendered claim | Source | Inventory basis |
|---|---|---|---|
| `tagline` | Scroll-driven film portfolio, AI-generated footage, Apple-product-page style, no build step | `CN-PRD` | §8.11 Name/tagline |
| `role` | "Solo build" | `CN-PRD` | §8.11 Role: "Author: Tushar Pathak (with Claude)" |
| `links.live` / `links.github` / `repoPublic:true` | `https://tushar-pathak.vercel.app/`; `github.com/007U5H4R/cinematic-portfolio` public | `CN-PRD` | §8.11 Live/Repo (PUBLIC) |
| `overview.thirtySecond[0]` | Site description | `CN-PRD` | §8.11 Name/tagline |
| `overview.thirtySecond[1]` | Recruiter-question framing, QA-A/B/C pass counts, scrub benchmark, live-since date | `CN-LEDGER` | §8.11 Decision chain (Observation, Evaluation, Outcome) |
| `metrics[0]` (film generation cost) | "197" Higgsfield credits, `kind:'measured'`, `asOf:'2026-08-26'` | `CN-LEDGER` | §8.11 Metrics: "film cost 197 credits exactly as preflighted" |
| `learnings[0]` | Higgsfield plan gating / refunds / start_image vs. reference | `CN-LEDGER` | §8.11 Learnings |

## Honesty / hedges preserved (not omitted, not softened)

- **"7+ · 40+ · 180+ · 30%" stats not repeated here**: those career-resume figures are shown on the
  live cinematic site itself (self-reported, sourced to `RESUME`); this card does not restate them,
  so no `kind:'self-reported'` hedge is owed on this page.
- **Film cost stated as a build-tooling cost, not a product metric** — the `context` field says so
  explicitly, so a reader cannot mistake it for a usage or business metric.
- **No screen-recording exists yet for this site** — the CONTENT_INVENTORY MISSING note ("screen-
  recording MISSING") is respected: `links.demoVideo` stays unset.

## Media

None yet — see `content/media/cinematic-portfolio/SOURCES.md` (real stills/posters/clips exist in the
source project; landing them is TKT-26's scope, a soft dependency). `hero: {}` renders "Hero media
coming" even though the live site itself is public — the placeholder reflects what's copied into
*this* repo's `public/`, not what exists on the live domain.

## Excluded (forbidden-strings / PII, EVAL-013)

No `.env` key names, phone numbers, DOB, or local paths. `forbidden-strings.ts --bundle` reports 0
hits.

## DRAFT flags

**None.** Every sentence in `overview.thirtySecond`, the metric, and the learning trace to a source
declared in `sources[]`.
