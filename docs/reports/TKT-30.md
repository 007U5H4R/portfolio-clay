# TKT-30 · Velora (Nuptis → Velora) full case study content — implementer report

**Milestone:** M-005 · **Priority:** P1 · **Branch:** `m-005-content` · **Type:** content/data.
**Scope:** flesh the `velora` record in `data/projects.ts` from card-fidelity to a full deep-dive case
study (8 chapters, header metrics, thinking chain, `deepDive:true`, sources) + author
`docs/trace/velora.md`. Reference pattern: TeachSpark (TKT-28) / RailCite (TKT-29).

## What changed

- **`data/projects.ts`** — `velora` extended to a full case study:
  - `deepDive:true`; 8 chapters (context → learned) with the **Nuptis kill / Velora pivot as the
    spine**; 8-node thinking chain; 4 learnings.
  - **3 header metrics**, all honest build-quality signals (no usage/pilot claimed): `2` Products in
    nine days (structural, `CS3-9DAY-SERIES`, asOf 2026-09-09), `10/10` Unit tests passing (measured,
    `V-REVIEW`, 2026-09-15), `156 kB` Gzipped bundle (measured, `V-REVIEW`, 2026-08-11).
  - **Artifacts:** `InsightCard` team-pooled interview quote (attributed to team) + idle-queue-time
    insight (team); `HypothesisCard` H1 coordination-not-speed; `DecisionCard` "Kill Nuptis, build
    Velora" + "Trust Scores authored, not verified"; `EvaluationCard` task-6.3 review; generic
    architecture + ERRC + internal link to `/work/nuptis`.
  - **8 sources** declared: `V-PRD`, `V-DISCOVERY-PRD`, `CS3-TEAM-PRD`, `CS3-9DAY-SERIES`,
    `V-README`, `V-SUPABASE`, `V-REVIEW`, `V-LIVE`.
- **`docs/trace/velora.md`** — full trace table (sources, metrics, chapters→anchors, thinking chain,
  honesty/hedges, EVAL-003 Velora rows, DRAFT flags).
- **`tests/e2e/case-study.spec.ts`** — the test-side maintenance TKT-28/29 established for a slug
  becoming deep-dive: (1) added `"velora"` to `DEEP_DIVE`; (2) added a dedicated velora deep-dive
  block (TC-075/076/077 parity with TeachSpark/RailCite); (3) moved the JS-off static-content test
  off velora (now deep-dive) to the still-thin `cubicle` slug.

## PRD-line swap (carry-forward from TKT-12) — DONE

`overview.thirtySecond` previously used the §8.5 discovery insight as a STAND-IN. The **exact PRD
problem line was located at `CS3/Velora/PRD.md:11`** (quoted verbatim in CONTENT_INVENTORY §8.5:392):
*"Discovery today is broken: founders find manufacturers through cold referrals, trade fairs, or
Alibaba-style directories where trust is unverified and non-portable."* It now opens the 30-second
overview + the `user-problem` thinking node (source `V-PRD`). The stand-in insight moved to the
discovery chapter/`insight` node, **attributed to the team**. No DRAFT flag needed.

## Acceptance criteria (tickets.md TKT-30)

1. Team baseline (15–30 days, <10% active work) presented as secondary research, never own data — ✓
   (discovery chapter body; NOT a `MetricCard`).
2. "Trust Scores are authored, not verified" disclosed — ✓ (built chapter + `v-a-trust-scores` +
   overview).
3. No users/pilot claimed — ✓ (evaluation + outcome chapters; every metric context; only
   build-quality figures).
4. EVAL-003 rows for Velora filled — ✓ (trace file; consolidated 8/8 finalised in TKT-39).

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✓ pass |
| `pnpm lint` | ✓ pass |
| `pnpm test` | ✓ 188 passed / 1 skipped (content-gate incl.) |
| `pnpm build` | ✓ content-gate passes; `all routes static (9)`; `/work/velora` prerendered (SSG) |
| `forbidden-strings --bundle` | ✓ 0 hits in 149 files (incl. .next bundle) |
| `pnpm test:e2e --grep case-study` | ✓ 53 passed / 55 skipped (velora deep-dive block passes) |
| `pnpm eval --only EVAL-003,EVAL-011,EVAL-013,EVAL-014` | ✓ 3 pass · 0 fail · 13 skip · 1 manual — **no regression** vs baseline; EVAL-003 manual (trace supplied) |

## Notes / deferred

- **No image PrototypeFrames.** The featured reference records (TeachSpark/RailCite) use text
  artifacts only; Velora screenshots are the media lane's job (TKT-24, soft) and `public/media/velora`
  does not exist yet, so image artifacts were omitted to avoid broken assets. Prototype/screenshots
  described in body text; hero stays `{}` ("Hero media coming" placeholder).
- Commit stages **explicit paths only**; re-rendered `docs/screenshots/**` and `evals/results/*.json`
  left unstaged per brief.
- **DRAFT flags: none.**
