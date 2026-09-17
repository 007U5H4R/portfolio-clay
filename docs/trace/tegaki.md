# Trace — Tegaki (TKT-54 / TSK-27, M-005)

Every field in the Tegaki `Project` record (`data/projects.ts`, slug `tegaki`) traces to a source
below. Sources are the `SourceRef.id`s declared in `tegaki.sources[]`; every source resolves to
CONTENT_INVENTORY §8.9.

**Depth decision.** Tegaki stays a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`) for this ticket, even though CONTENT_INVENTORY §8.9 has a
pre-mapped 8-stage Show-the-Thinking chain with real quotes. Per PB2/TKT-54's scope ("one ticket, one
context window, five short honest pages"), depth here matches the other four lighter builds rather
than a sixth full deep dive; the sourced chain is preserved in this trace file so a later ticket can
promote it without re-research. All of this ticket's real content lives in `overview.thirtySecond`
(2 paragraphs).

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `GR-README` | Tegaki README | `GR/README.md` | §8.9 |
| `GR-SOLUTION-PRD` | Tegaki Solution PRD | `GR/Solution-PRD.md` §1 | §8.9 |

## Fields → source

| Field | Rendered claim | Source | Inventory basis |
|---|---|---|---|
| `tagline` | "What your handwriting suggests about you — read and written by hand." | `GR-README` | §8.9 Name/tagline |
| `role` | "Solo build" | `GR-README` | §8.9 Role: "Owner: Tushar Pathak · Scribe: Claude" |
| `overview.thirtySecond[0]` | Pilot question framing | `GR-SOLUTION-PRD` | §8.9 Problem ("would a stranger trust and pay…", Solution-PRD §1) |
| `overview.thirtySecond[1]` | "No AI in product"; checkout confirms without charging; no pilot users recorded | `GR-README`, `GR-SOLUTION-PRD` | §8.9 Stack ("No AI in product… manual/offline"); Status ("the checkout confirms an order without charging for it"); Show-the-Thinking "Outcome" (no pilot users recorded) |

## Honesty / hedges preserved (not omitted, not softened)

- **No AI in the product**: stated plainly, distinguishing the product itself from the (separately
  AI-assisted) build process — never implied to be an AI feature.
- **Checkout confirms without charging**: disclosed as a deliberate pilot-safety measure, not glossed
  over as a completed transaction flow.
- **No pilot/order counts**: `metrics: []`, matching the pack's explicit MISSING note ("pilot user/
  order counts").
- **Master Prompt never described**: no reference to "Master Prompt" anywhere on the page — sidesteps
  the "internal IP" disclosure requirement entirely by not naming it, rather than risking an
  under-hedged mention.

## Not promoted to this ticket (documented, not invented)

The full 8-stage Show-the-Thinking chain in CONTENT_INVENTORY §8.9 (Observation → Outcome, each with
a quote and file citation) is real and sourced but was not written into `thinking[]` in this ticket —
`ShowTheThinking` is only reachable inside the deep-dive view, which this card intentionally does not
expose (see Depth decision above). A future ticket that promotes Tegaki to a full case study can lift
this chain directly from CONTENT_INVENTORY §8.9 without new research.

## Media

None yet — see `content/media/tegaki/SOURCES.md` (six screenshots exist in the source project;
landing them is TKT-26's scope, a soft dependency).

## Excluded (forbidden-strings / PII, EVAL-013)

No `.env` key names, phone numbers, DOB, or local paths. `forbidden-strings.ts --bundle` reports 0
hits.

## DRAFT flags

**None.** Every sentence in `overview.thirtySecond` traces to a source declared in `sources[]`.
