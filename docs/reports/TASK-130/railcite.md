# TASK-130 · RailCite: audit and narrative (spec §51 steps 1–5)

RailCite sets the benchmark for the system. Sources: `data/projects.ts` (`railcite`), CONTENT_INVENTORY §8.2, `docs/trace/railcite.md`, and `docs/case-study-sources/railcite/` (only `bholu.jpg`, the mascot, so no product UI image exists).

## 1. Audit (spec §40)

| # | Question | Answer from the records |
|---|---|---|
| 1 | Strongest problem | A Chief Commercial Inspector defends demurrage and wharfage decisions by walking yearly PDF lists and scanned circulars and guessing the current version. "One wrong/superseded citation damages the inspector's credibility — not the tool's." (RC-DISCOVERY-PRD) |
| 2 | Strongest decision | "Refuse is a first-class success state, never an error" (RC-DESIGN), enforced in code by the P0 validator (RC-VALIDATE) |
| 3 | Strongest evidence | Threshold calibration: 5 relevant + 3 irrelevant queries, gap → 0.32 (down from 0.45), nonsense query refused (RC-CALIBRATE) |
| 4 | Strongest measured outcome | Live corpus 5,760 documents / 14,406 chunks on 2026-09-15 (RC-API-STATS); 68 % of ingested PDFs needed OCR, 7 Sep 2026 (RC-FINAL-PRD) |
| 5 | Most interesting system | The cite-or-refuse query pipeline: embed + domain classify → top-k 8 → threshold 0.32 → Sonnet 5 forced `answered \| refused` tool → citation validator → supersession lineage (RC-PIPELINE) |
| 6 | Most memorable learning | "The feature is a citation. The product is trust." and "Staleness is … a correctness bug" |
| 7 | Screenshots / videos | No product screenshots. Two public YouTube videos in `data/portfolio.ts` (pitch `nI3EqDXd5Io`, demo `B3x-I1J8JW8`). The live site can't be captured from the cloud sandbox (proxy 403). The hand-authored SVG cover (TASK-127) serves as the poster |
| 8 | PRDs / research / evals | Discovery PRD, Final PRD, Design North Star, calibration script + QA report, impeccable critique, test run, nightly-crawl design, build ledger (all private: listed, not linked). `/api/stats` is the one public source |

## 2. Narrative

- **Problem:** one wrong circular can damage an inspector's credibility. Even the Railway Board won't settle what's in force (the Master Circular caveat).
- **Product:** ask in plain language; get the governing circular with number, date and lineage, or a clear refusal.
- **Decision:** cite-or-refuse. Refusal is a success state, validated in code, not the prompt.
- **Evidence:** the calibrated threshold, live corpus size, lineage links, and an honest list of what is not measured.
- **Learning:** refusal is a feature; trust belongs in code; freshness is correctness.

Dominant story (spec §41): **trust.**

## 3. Metaphor

A railway field notebook and an official circular archive (spec §8), kept to RailCite only:
- engineering-paper grid in the hero;
- a rust-and-steel line down the page with station stops as section numbers, drawn as you scroll;
- ticket-like proof cards;
- one "Refusal = success" stamp, one "Cite. Don't guess." note.

Accents: rust, steel, kraft.

## 4. Sections

1. Hero: tagline "Research on track.", proposition, three proofs (5,760 ● · 0 ◇ · 68 % ●), pitch video on the cover poster.
2. Problem (anchors 01–03): headline, one context line, a six-stop manual workflow, the Master Circular quote.
3. Product: the demo video, plus the recorded output contract (answered / refused) as two cards.
4. Decisions (anchor 04): three "could have / chose / because" cards.
5. How trust works (anchor 05): seven-step pipeline and three key rules.
6. Evidence (anchors 06–07): four proof cards with badges, plus the gaps.
7. Learnings (anchor 08): three.

Then the evidence drawer, the action strip (live product, pitch, demo), and next project.

## 5. Cut or shortened

- **Cut:**
  - the 30-second overview (two long paragraphs);
  - the eight-chapter deep dive and the thinking chain;
  - the five-item learnings list, reduced to three;
  - the per-chapter artifact cards;
  - the "Hero media coming" tag;
  - the shared scene opener;
  - the Role/Duration header meta, which moved to the footer line.
- **Moved into the evidence drawer:**
  - the test count (345/1/2);
  - the stack detail (Voyage-3, pgvector, Haiku classifier), which shrinks to step notes;
  - the Cohort-8 context.
- **Kept honest:**
  - "0 invented citations" is ◇ Structural with its "by construction" note;
  - the critique's P0 and the missing usage, latency and groundedness evals are named in the gaps.

## Claims → sources

| Claim on the page | Source id |
|---|---|
| Proposition | RC-DISCOVERY-PRD |
| 5,760 documents, 14,406 chunks (2026-09-15) | RC-API-STATS |
| 0 invented citations (structural) | RC-VALIDATE |
| 68 % of ingested PDFs needed OCR; 193 lineage links (2026-09-07) | RC-FINAL-PRD |
| Problem line, workflow, Master Circular quote | RC-DISCOVERY-PRD |
| Answered / refused output | RC-SYNTHESIZE |
| Refusal as success | RC-DESIGN |
| Validator drops unresolved citations | RC-VALIDATE |
| Hard domain filter ("bleed has to be impossible") | RC-FINAL-PRD |
| Pipeline steps | RC-PIPELINE |
| Threshold 0.45 → 0.32 | RC-CALIBRATE |
| 22/40 critique, P0 | RC-IMPECCABLE |
| Nightly crawl / freshness | RC-CRON-SPEC |
| Gaps (no usage, latency, groundedness, logged CCI sessions) | RC-FINAL-PRD |
