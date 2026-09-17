# TKT-54 · Five lighter-build case entries — implementer report

**Milestone:** M-005 · **Priority:** P2 · **Branch:** `m-005-content` · **Type:** content/data.
**Scope:** finalize the `token-toli`, `pratyasa`, `tegaki`, `dino-arcade-pwa`, `cinematic-portfolio`
records in `data/projects.ts` at card-level/thin depth (not full deep dives) + author
`docs/trace/<slug>.md` and `content/media/<slug>/SOURCES.md` for each. Reference pattern: the six
full deep dives (TKT-28…33) show what a *promoted* page looks like; this ticket deliberately does
**not** promote any of the five.

## Depth decision: all five stay cards, none promoted to a case study

`tests/e2e/case-study.spec.ts` (already in the repo, maintained by TKT-33) locks this in structurally:
its `DEEP_DIVE` set excludes all five of these slugs, and its JS-off test explicitly uses
`token-toli` as the permanently-thin fixture ("token-toli stays thin permanently — TKT-54 authors it
as a deliberately short 'Discovery only' page … never a full case study"). The page component itself
(`app/work/[slug]/page.tsx`) only shows the `OverviewToggle`/`ChapterNav`/`ShowTheThinking` deep-dive
path when a project has **at least one non-empty chapter** (`hasChapters`); writing any prose into
`chapters[]` — even one sentence — would have flipped the page into the deep-dive layout and broken
this locked contract. So for all five: `chapters: EMPTY_CHAPTERS`, `thinking: []`, and
`overview.deepDive: false` are **unchanged**, and every real, sourced fact this ticket adds lives in
`overview.thirtySecond` (always visible regardless of the toggle) plus `metrics[]` (rendered
independently in the header) and `learnings[]`.

This also resolves an apparent tension with `technical-plan.md`'s per-task prose ("Chapters: Context,
Problem, Discovery…"), which reads as if each task should populate chapter bodies. Given the explicit,
already-committed e2e contract plus the ticket's own instruction ("card-level/thin is CORRECT, do not
inflate"), the chapter-shaped facts from CONTENT_INVENTORY §8.7–8.11 were folded into the 30-second
overview paragraphs instead of `chapters[]`. Tegaki's pack actually pre-maps a genuinely sourced
8-stage Show-the-Thinking chain (unlike the other four, whose chains are visibly incomplete — e.g.
token-toli's "Prototype — none," pratyasa's "Hypothesis — n/a"); it was **not** written into
`thinking[]` because `ShowTheThinking` only renders inside the deep-dive view this ticket keeps
closed, so populating it would have added risk with zero visible effect. It's documented in
`docs/trace/tegaki.md` for a future ticket to lift directly.

## What changed

- **`data/projects.ts`** (5 records touched, no chapters/thinking touched):
  - **token-toli**: fixed a content-integrity bug — the tagline claimed "four tested hypotheses" but
    the pack names exactly three (H1.1/H1.2/H1.3, p.30); corrected to "three." Expanded
    `overview.thirtySecond` to 3 paragraphs (11 named respondents vs. the team's separately-logged 44
    interviews, explicitly attributed to the team PRD; the bet not selected by the cohort; the pod's
    own self-critique on interview count). Added 1 learning, 3 new sources.
  - **pratyasa**: expanded `overview.thirtySecond` to 2 paragraphs adding the co-inventor contribution
    quote and the verbatim rights/safety line ("Patent owned by NIT–Calicut; research prototype, not
    an approved diagnostic," AUDIT §4.7 VERIFIED). Added 1 learning (ffmpeg/Chrome-headless), 1 new
    source.
  - **tegaki**: expanded `overview.thirtySecond` to 2 paragraphs stating "No AI in product" and that
    the checkout confirms an order without charging, plus "no pilot users recorded." No new sources
    needed (existing GR-README/GR-SOLUTION-PRD cover both facts).
  - **dino-arcade-pwa**: tagline now uses the literal, sanctioned "BYO-ROM" framing (brief confirmed
    this is not a banned string). Expanded `overview.thirtySecond` to 2 paragraphs adding the stack
    (EmulatorJS/FBNeo/IndexedDB/service worker, no backend/accounts/analytics) and disclosing that
    test results exist but were not reviewed.
  - **cinematic-portfolio**: expanded `overview.thirtySecond` to 2 paragraphs (recruiter-question
    framing, QA-A/B/C pass counts 8/8·11/11·12/12, scrub benchmark, live-since date). Added the one
    metric the pack calls out explicitly — film generation cost 197 Higgsfield credits,
    `kind:'measured'`, `asOf:'2026-08-26'`, sourced to the existing `CN-LEDGER` — and 1 learning
    (Higgsfield gating/refunds/start_image). **This is the live site
    (`tushar-pathak.vercel.app`) — only a card record + honest description was written; the separate
    `cinematic-portfolio` repo and the sibling `portfolio/` project were never read or touched.**
- **`content/media/{token-toli,pratyasa,tegaki,dino-arcade,cinematic-portfolio}/SOURCES.md`** (5 new
  files) — each documents that no media has landed in this repo yet (only avatar media exists
  pre-M-005), where the real assets live in the source projects (or that none exist, for token-toli),
  and that landing them is TKT-26's soft-dependency scope, not this ticket's.
- **`docs/trace/{token-toli,pratyasa,tegaki,dino-arcade-pwa,cinematic-portfolio}.md`** (5 new files) —
  full source-id tables, field→source mapping, honesty/hedges preserved, and DRAFT-flag status (none)
  for each record.

## Acceptance criteria (tickets.md TKT-54 + TSK-25…29 + shared M-005 contract)

1. Every chapter/artifact/metric/thinking node/learning traces to CONTENT_INVENTORY §8.7–8.11 — ✓,
   per-record trace tables in `docs/trace/`.
2. Every metric has value/label/context/asOf/kind/source — ✓ (only one metric exists across all five:
   cinematic-portfolio's film cost).
3. Every MISSING item omitted or a labelled placeholder, never paraphrased into existence — ✓ (no
   interview total beyond 11 for token-toli; no product-metric kinds for pratyasa; no pilot/order
   counts for tegaki; no test-result numbers for dino-arcade; no unsourced "7+/40+/180+/30%" repeat for
   cinematic-portfolio).
4. Token Toli / Pratyasa roles per AUDIT — ✓ "Team discovery" / "Solo build," no solo claim on the
   team PRD's 44 interviews.
5. dino-arcade "BYO-ROM" framing used, no `Game/`/`neogeo` reference — ✓.
6. cinematic-portfolio linked as the live site, not rebuilt — ✓ (see above).
7. None of the five renders a `MetricCard` not in its pack (AC g) — ✓ (only cinematic-portfolio has
   one, and it's the pack's own named metric).
8. Schema gate green; `/work/<slug>` axe clean 390/1440; anchors resolve; `pnpm eval --only
   EVAL-011,EVAL-013,EVAL-014` no regression (AC h) — ✓, below.

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ pass |
| `pnpm lint` | ✓ pass |
| `pnpm test` | ✓ 188 passed / 1 skipped (content-gate + forbidden-strings incl.) |
| `pnpm build` | ✓ content-gate passes (`projects:14`); all routes static |
| `pnpm test:e2e --grep case-study` | ✓ 57 passed / 59 skipped (all five slugs render "Deep dive coming" + no ChapterNav; token-toli JS-off fixture unchanged) |
| `pnpm eval --only EVAL-011,EVAL-013,EVAL-014` | ✓ 3 pass · 0 fail · 14 skip · 0 manual — no regression, `regressions: []`; `evals/results/eval-run-0.2.0-87556dd.json` |

## Notes / deferred

- **`tests/unit/content-rules.test.ts` and `tests/fixtures/metric-allowlist.json`** (referenced by
  `test-cases.md` TC-091) do not exist yet — no ticket, including this one, is assigned to author
  them, and no other content ticket (TKT-28…33) created them either. Out of scope for TKT-54; flagged
  here rather than silently skipped.
- Commit stages **explicit paths only**; re-rendered `evals/results/*.json` left unstaged per brief.
- **DRAFT flags: none** — every added sentence, metric, and learning across all five records traces to
  a declared source.
- No media files were created or copied (TKT-26 is a soft dependency); all five `hero: {}` and no
  `links.demoVideo`, so every page renders the standard "Hero media coming" placeholder.
