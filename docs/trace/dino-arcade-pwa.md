# Trace — Dino Arcade (TKT-54 / TSK-28, M-005)

Every field in the Dino Arcade `Project` record (`data/projects.ts`, slug `dino-arcade-pwa`) traces
to a source below. Sources are the `SourceRef.id`s declared in `dinoArcadePwa.sources[]`; every
source resolves to CONTENT_INVENTORY §8.10.

**Depth decision.** Dino Arcade stays a **card, not a case study** (`overview.deepDive: false`,
`chapters: EMPTY_CHAPTERS`, `thinking: []`) — a personal/hobby PWA with a minimal chain ("Observation
→ decision → prototype → evaluation → outcome," no user-problem/insight/hypothesis stages), never a
full case study per the pack's own framing. All of this ticket's real content lives in
`overview.thirtySecond` (2 paragraphs).

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `DN-README` | Dino Arcade README | `DN/README.md` | §8.10 |

## Fields → source

| Field | Rendered claim | Source | Inventory basis |
|---|---|---|---|
| `tagline` | "strictly BYO-ROM, no game data ships or uploads" | `DN-README` | §8.10 Problem/decision: "This app ships no game data. No ROM or BIOS is included…" |
| `role` | "Solo build" | `DN-README` | §8.10 Role: "Owner: Tushar Pathak · Personal / hobby project" |
| `links.repoPublic` | `true` | `DN-README` | §8.10 Live/repo: GitHub Pages, `007U5H4R/dino-arcade-pwa` public |
| `overview.thirtySecond[0]` | Cabinet framing + BYO-ROM decision | `DN-README` | §8.10 Name/tagline; Problem/decision |
| `overview.thirtySecond[1]` | Stack (EmulatorJS, FBNeo, IndexedDB, service worker, no backend/accounts/analytics); test results not reviewed | `DN-README` | §8.10 Stack; Chain "evaluation (`DN/test/` exists; results MISSING)" |

## Honesty / hedges preserved (not omitted, not softened)

- **"BYO-ROM" used verbatim** as sanctioned product framing (brief's explicit note: not a banned
  string) — never softened into vaguer language that could imply game data ships with the app.
- **No `Game/` or `neogeo` reference anywhere** on the page — the planning workspace and its BIOS/ROM
  files stay excluded per this project's cross-cutting rules (tickets.md §0.6) and CONTENT_INVENTORY's
  own instruction ("do not link that folder").
- **No test-result numbers**: the pack marks `DN/test/` results as MISSING; this page states plainly
  that test results exist but were not reviewed, rather than inventing a pass count.
- **`metrics: []`**: the pack records no metrics for this project at all.

## Media

None yet — see `content/media/dino-arcade/SOURCES.md` (the source repo has no UI screenshot; a
cabinet-UI recording + screenshot, with no ROM/BIOS ever loaded, is TKT-26's scope, a soft
dependency).

## Excluded (forbidden-strings / PII, EVAL-013)

No `.env` key names, phone numbers, DOB, local paths, or `Game/`/`neogeo` reference.
`forbidden-strings.ts --bundle` reports 0 hits.

## DRAFT flags

**None.** Every sentence in `overview.thirtySecond` traces to `DN-README`.
