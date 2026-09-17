# Trace — RailCite full case study (TKT-29, M-005)

Every number, metric and load-bearing claim in the RailCite `Project` record (`data/projects.ts`)
and its 8 chapters / thinking chain traces to a source below. Sources are the `SourceRef.id`s
declared in `railcite.sources[]`; every source resolves to CONTENT_INVENTORY §8.2 and AUDIT §5.
**No figure is invented.** Corpus figures follow the decided **"live, with as-of date"** policy:
the live count is dated 2026-09-15 from `/api/stats`; the Final-PRD ingest figures are shown only
tied to **7 Sep 2026**, never as the current corpus. `railcite-cron` is the canonical newer checkout;
`CS5/railcite` is a stale clone (AUDIT §5).

## Source IDs → provenance

| Source id | Label (rendered) | ref (traceability only) | Inventory |
|---|---|---|---|
| `RC-DISCOVERY-PRD` | RailCite Discovery PRD | `CS5/Discovery-PRD.md L3-5/L25-28/L38-51` | §8.2 |
| `RC-FINAL-PRD` | RailCite Final PRD | `CS5/docs/final-prd.docx §0/§6/§7.1/§8` | §8.2 |
| `RC-DESIGN` | RailCite Design North Star | `CS5/Design.md L21-24` | §8.2 |
| `RC-SYNTHESIZE` | RailCite synthesis prompt | `RC/lib/synthesize.ts L8-21` | §8.2 |
| `RC-VALIDATE` | RailCite citation validator | `RC/lib/validate.ts` | §8.2 |
| `RC-PIPELINE` | RailCite query pipeline | `RC/app/api/query/route.ts; RC/lib/embeddings.ts L12` | §8.2 |
| `RC-CALIBRATE` | RailCite threshold calibration | `RC/scripts/calibrate.ts; CS5/docs/superpowers/reports/QA-phase2.md P2-5/P2-10` | §8.2 |
| `RC-IMPECCABLE` | RailCite impeccable critique | `CS5/railcite/.impeccable/critique/2026-08-31T14-59-19Z__components-caseconsole-tsx.md` | §8.2 |
| `RC-TESTS` | RailCite test run (railcite-cron) | `railcite-cron vitest run 2026-09-15 (AUDIT §5)` | §8.2 |
| `RC-API-STATS` | RailCite live /api/stats | `https://railcite.vercel.app/api/stats (2026-09-15)` | §8.2 |
| `RC-CRON-SPEC` | RailCite nightly-crawl design doc | `RC/docs/superpowers/specs/2026-09-03-daily-crawl-cron-design.md L16-19` | §8.2 |
| `RC-BUILD-LEDGER` | RailCite build ledger | `CS5/docs/superpowers/BUILD-LEDGER.md L207/L234/L253` | §8.2 |
| `RC-LINKEDIN` | RailCite 9-day LinkedIn series | `CS5/docs/linkedin/railcite-9day-linkedin-series.md (Day 5)` | §8.2 |

## Metrics (header + inline) → source

| Where | Value | Label | kind | asOf | Source | Inventory basis |
|---|---|---|---|---|---|---|
| header | `5,760` | Documents indexed | measured | 2026-09-15 | `RC-API-STATS` | §8.2 "Live 2026-09-15: 5,760 documents" (`/api/stats`) |
| header | `0` | Invented citations | structural | 2026-09-15 | `RC-VALIDATE` | §7 "100% citation validity enforced by `lib/validate.ts` — by construction"; §8.2 validator |
| header | `68%` | Ingested PDFs needing OCR | measured | 2026-09-07 | `RC-FINAL-PRD` | §8.2 "3,865 OCR (68%)" of 5,687 ingested, Final PRD 7 Sep |
| ch. built | `193` | Supersession lineage links | measured | 2026-09-07 | `RC-FINAL-PRD` | §8.2 "193 lineage links" (Final PRD 7 Sep) |
| ch. evaluation | `345 / 1 / 2` | Tests: passed / failed / skipped | measured | 2026-09-15 | `RC-TESTS` | §8.2 / AUDIT §5 "345 passed / 1 failed / 2 skipped (348 tests, 48 files)" |
| ch. outcome | `14,406` | Chunks indexed (live) | measured | 2026-09-15 | `RC-API-STATS` | §8.2 "Live 2026-09-15: … 14,406 chunks" (`/api/stats`) |

## Chapters → source

| Chapter | Key claim | Source | Inventory basis |
|---|---|---|---|
| 01 context | Case Study 5, Cohort 8, Government/Public Sector; solo MVP (104/105 commits); built with Claude Code | `RC-FINAL-PRD` | §8.2 role; AUDIT §5 "solo-built MVP", "104/105 commits by Tushar" |
| 01 context | Builder's father is a serving CCI; he + colleagues ran real freight/demurrage cases | `RC-FINAL-PRD` | §8.2 Show-the-Thinking Observation; AUDIT §5 Final PRD §6 |
| 02 problem | Demurrage/wharfage defence problem statement (verbatim) | `RC-DISCOVERY-PRD` | §8.2 Problem (`Discovery-PRD.md` L38-41) |
| 02 problem | Persona "Ravi" (composite CCI); "low tolerance for a tool that sounds confident and is wrong" | `RC-DISCOVERY-PRD` | §8.2 Users (quoted, `Discovery-PRD.md` L45-51) |
| 03 discovery | Master-Circular caveat; reframe search-led → accountability-led; "officer who sanctions is the officer who defends" | `RC-DISCOVERY-PRD` | §8.2 Insight (`Discovery-PRD.md` L25-28); AUDIT §5 reframe |
| 03 discovery | Honesty: father+colleagues testing real but unrecorded; HITL "3 real CCI cases" pending; A1–A8 written before build | `RC-FINAL-PRD` | §8.2 MISSING; AUDIT §5 "Interviews: MISSING", BUILD-LEDGER L65 |
| 03 discovery | Central hypothesis (believe/knowWhen), status `unmeasured` | `RC-FINAL-PRD` | §8.2 Hypothesis (Final PRD §7.1) — knowWhen condition not recorded → unmeasured |
| 04 bet | "Refuse is a first-class success state, never an error… the single most important design decision" | `RC-DESIGN` | §8.2 Product decision (`Design.md` L21-24) |
| 04 bet | Cite-or-refuse contract; extractive-only prompt "never invent circular numbers, dates, or provisions" | `RC-SYNTHESIZE` | §8.2 Pipeline system prompt (`synthesize.ts` L8-21) |
| 05 built | Pipeline: auth → embed + domain classify → scope-aware cache → match k=8 → threshold 0.32 → Sonnet 5 forced-tool → validate → lineage → cache | `RC-PIPELINE` | §8.2 Pipeline (`app/api/query/route.ts`) |
| 05 built | Voyage-3 (1024-dim) + pgvector; Haiku classifier; hard SQL domain filter; no reranker; P0 validator; nightly crawl | `RC-PIPELINE` | §8.2 Stack; AUDIT §5 embeddings/classifier/validator |
| 05 built | Cite-or-refuse contract enforced in code (validator drops unresolved blocks; all-dropped → refuse) | `RC-VALIDATE` | §8.2 / AUDIT §5 `lib/validate.ts` |
| 06 evaluation | Threshold calibration: 5 relevant + 3 irrelevant; irrelevant ≤0.25, relevant 0.29–0.66; 0.45 → 0.32; nonsense refused ≤0.20 | `RC-CALIBRATE` | §8.2 Evaluation; AUDIT §5 calibrate.ts / QA-phase2 P2-5/P2-10 |
| 06 evaluation | Impeccable critique 22/40 "Acceptable", 1 P0 "Flagship starter refuses", 4 P1; fix record MISSING | `RC-IMPECCABLE` | §8.2 Evaluation; AUDIT §5 impeccable critique |
| 06 evaluation | Citation validity "by construction," not sampled; no groundedness/retrieval/latency/usage eval | `RC-VALIDATE` / `RC-FINAL-PRD` | §7 "by construction"; §8.2 MISSING (Final PRD §7.4) |
| 06 evaluation | Tests 345/1/2 across 48 files 2026-09-15; the 1 failure disclosed as a "stale expectation" | `RC-TESTS` | §8.2 / AUDIT §5 (stale poppler-utils expectation after self-hosted runner move) |
| 07 outcome | Live (HTTP 200); `/api/stats` 5,760 docs / 14,406 chunks 2026-09-15; Final-PRD 7 Sep ingest figures (6,333/5,687/3,865/14,078/193) | `RC-API-STATS` / `RC-FINAL-PRD` | §8.2 Metrics (dated) |
| 07 outcome | Cross-domain bleed fix "bleed has to be impossible, not merely unlikely" → hard SQL filter + per-PDF traceability + scope-aware cache (2026-09-03) | `RC-FINAL-PRD` | §8.2 Outcome; AUDIT §5 Final PRD §8 |
| 07 outcome | MISSING demand side: no usage, no measured time-to-cited-answer, no logged real-CCI session | `RC-FINAL-PRD` | §8.2 MISSING; AUDIT §5 (Final PRD §7.4) |
| 08 learned | "The feature is a citation. The product is trust." | `RC-LINKEDIN` | §8.2 Learnings (9-day series Day 5) |
| 08 learned | "Staleness is not a missing feature — it is a correctness bug…" (why the nightly crawl exists) | `RC-CRON-SPEC` | §8.2 Learnings (cron design doc L16-19) |
| 08 learned | Sonnet 5 rejecting `temperature` caught only by live smoke; threshold 0.45 → 0.32 | `RC-BUILD-LEDGER` | §8.2 Learnings (BUILD-LEDGER L234/L253) |

## Thinking chain (8 nodes) → source

| Stage | Source | Inventory basis (§8.2 Show-the-Thinking) |
|---|---|---|
| observation | `RC-FINAL-PRD` | "the builder's father is a serving CCI" (Final PRD §6) |
| user-problem | `RC-DISCOVERY-PRD` | Discovery-PRD L38-41 |
| insight | `RC-DISCOVERY-PRD` | Master-Circular caveat / accountability-led reframe (L25-28) |
| hypothesis | `RC-FINAL-PRD` | central hypothesis (Final PRD §7.1) |
| product-decision | `RC-DESIGN` | "Refuse is a first-class success state" (`Design.md` L21-24) |
| prototype | `RC-PIPELINE` | live pipeline (route.ts) + Voyage-3/pgvector + nightly crawl |
| evaluation | `RC-CALIBRATE` | threshold calibration → 0.32; nonsense refused; 345 tests; "by construction" |
| outcome | `RC-API-STATS` | live 5,760 docs / 14,406 chunks (2026-09-15); bleed fix |

## Truth rules honoured (TC-090 · RailCite)

- Citation validity is **"0 invented citations by construction"** — never a percentage over N queries
  (no `\d+% … citation` phrasing anywhere).
- Decks' **"148 tests / 5,687 docs" as current** are never used: current corpus is always `5,760` /
  `14,406` dated 2026-09-15; `5,687` appears only tied to "7 Sep 2026" + OCR/ingest context.
- The failing test is disclosed as a **"stale expectation"** (345 passed / 1 failed / 2 skipped), not
  hidden.
- The impeccable P0 **"Flagship starter refuses"** is stated as found, with the fix record noted
  **MISSING**.
- Authorship = **"built with Claude Code"** (context chapter); product-model facts (Claude Sonnet 5 /
  Haiku, Voyage-3) stated separately.
- Corpus follows the **"live, with as-of date"** policy on every figure.

## MISSING → omitted or labelled (never paraphrased into existence)

- CCI user-testing record ("father + colleagues") — stated as real but **unrecorded** (no count/
  names/dates); HITL "3 real CCI cases" **pending**.
- Usage / Mixpanel numbers · measured time-to-cited-answer · groundedness/retrieval/latency evals —
  **omitted**, and their absence is stated in the evaluation + outcome chapters.
- Mentor feedback · P0 fix record · refreshed deck figures — **omitted** / disclosed as missing.
- Product screenshots + demo video — **MISSING** (TKT-23 soft): hero renders the labelled
  "Hero media coming" placeholder; no `PrototypeArtifact` fabricated (no real media asset exists).

## Excluded (forbidden-strings / PII, EVAL-013/016)

- No `.env` key names (ANTHROPIC/SUPABASE_/VOYAGE_ literals) — stack described in prose only.
- No phone/DOB PII; no "AI Product Manager" title. Forbidden-strings scan: **0 hits**.

## DRAFT flags

**None.** Every chapter body, metric and thinking node traces to CONTENT_INVENTORY §8.2 / AUDIT §5;
nothing required omission-with-DRAFT beyond the MISSING items above (which are omitted or labelled,
not drafted into existence).
