# Trace — Pratyasa (TKT-54 / TSK-26, M-005)

Every field in the Pratyasa `Project` record (`data/projects.ts`, slug `pratyasa`) traces to a
source below. Sources are the `SourceRef.id`s declared in `pratyasa.sources[]`; every source resolves
to CONTENT_INVENTORY §8.8 (cross-checked against AUDIT.md §4.7 for the patent/rights facts).

**Depth decision.** Pratyasa stays a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`). It is a live, shipped static site — a credible record of
a patent, not a product with a discovery/build/evaluation narrative worth a full case study; the
pack itself frames it as "a general credibility page," not a sales pitch. All of this ticket's real
content lives in `overview.thirtySecond` (2 paragraphs) plus `learnings` and `sources`.

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `PT-DISCOVERY-PRD` | Pratyasa Discovery PRD (FACT-LOCK) | `PT/discoveryPRD.md` Goal, §4 | §8.8 |
| `PT-GLOBAL-CONSTRAINTS` | Pratyasa discovery PRD — Global Constraints (rights line, tooling notes) | `PT/discoveryPRD.md` Global Constraints L199 | §8.8 |

## Fields → source

| Field | Rendered claim | Source | Inventory basis |
|---|---|---|---|
| `tagline` | "granted patent IN 429867 — a point-of-care sepsis-biomarker biosensor — with certificate, paper and footage" | `PT-DISCOVERY-PRD` | §8.8 Name/tagline; AUDIT §4.7 patent row |
| `role` | "Solo build" (site author); co-inventor of the patent (2nd of 5) | `PT-DISCOVERY-PRD` | §8.8 Role: "co-inventor (2nd of 5)…"; page author "Tushar Pathak (with Claude)" |
| `overview.thirtySecond[0]` | Site goal | `PT-DISCOVERY-PRD` | §8.8 Name/tagline (Goal) |
| `overview.thirtySecond[1]` | Co-inventor contribution quote + verbatim rights/safety line | `PT-DISCOVERY-PRD`, `PT-GLOBAL-CONSTRAINTS` | §8.8 Role (L192 quote); AUDIT §4.7 "Rights/safety line" row (VERIFIED) |
| `learnings[0]` | ffmpeg/drawtext → Chrome headless workaround | `PT-GLOBAL-CONSTRAINTS` | §8.8 Learnings ("Global Constraints") |

## Honesty / hedges preserved (not omitted, not softened)

- **Contributor, not owner**: the rights line is quoted verbatim exactly as AUDIT.md marks it
  VERIFIED — "Patent owned by NIT–Calicut; research prototype, not an approved diagnostic" — never
  softened to imply personal ownership of the patent.
- **No product-metric kinds**: `metrics: []`. The device metrics in the pack (LOD, linear range, RSD,
  signal retention) are explicitly labelled "device, from paper — not product metrics" (§8.8) and are
  deliberately not surfaced as a `MetricCard`, which would blur device science with product
  performance.
- **"IN 429867" everywhere, never "044152784"**: the tagline and overview use only the certificate
  patent number; the SL-number/patent-number conflict flagged in AUDIT §E is never repeated here.

## Media

None yet — see `content/media/pratyasa/SOURCES.md` (real device/certificate/demo assets exist in the
source project; landing them is TKT-26's scope, a soft dependency).

## Excluded (forbidden-strings / PII, EVAL-013)

No `.env` key names, phone numbers, DOB, or local paths. `forbidden-strings.ts --bundle` reports 0
hits.

## DRAFT flags

**None.** Every sentence in `overview.thirtySecond` and the `learnings` entry traces to a source
declared in `sources[]`.
