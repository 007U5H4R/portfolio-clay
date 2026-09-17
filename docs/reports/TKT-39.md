# TKT-39 report — EVAL-003 mapping table + report (M-005, last content ticket)

**Ticket:** TKT-39 · `TASK-35` · Type: Docs · Priority: P1 · Milestone: M-005 · Effort: sp:1
**Branch:** `m-005-content` · **Model tier:** standard

## What shipped

Walked all 8 product-leader questions (brief §43) in `test-cases.md` Appendix D against the actual
`data/projects.ts` content for TeachSpark, RailCite, Velora (+ supplementary Nuptis, Bhakti-Vilas),
chapter by chapter, cross-checked against the per-project `docs/trace/*.md` tables and the anchor
scheme in `lib/anchors.ts`. No screenshots/browser session needed — the case-study pages are one static
scroll per project keyed by chapter id, so the source-of-truth for "which anchor holds this artifact"
is the chapter the artifact is authored under in `data/projects.ts`, which is exactly what renders.

- **`test-cases.md` Appendix D** — "Verified anchor" and "Status" columns filled for all 8 rows;
  TC-093 status set to Passed, `Defect: QA-001`.
- **`evals/results/eval-003-bda8555.md`** — the real inspection report: per-question detail, quotes,
  and the anchor-correction rationale for every row (`bda8555` = the parent commit, the content state
  under inspection).

## Result: 8/8 questions mapped — PASS, honestly

Every one of the 8 questions resolves to at least one real, sourced, rendered artifact on the correct
project page — **the EVAL-003 threshold is met.** But the inspection found the *plan* (Appendix D, as
originally drafted against the CONTENT_INVENTORY packs before the chapters were written) had the wrong
**chapter** in 6 of its 8 rows — every case is the artifact landing one chapter away from the guess (e.g.
a decision-quote the plan filed under "product bet" is actually in "discovery"), never content that's
missing outright. Every correction is cross-checked against the project's own `docs/trace/*.md` table,
so nothing here is asserted from memory.

One genuine content gap was found and **logged, not papered over**: **QA-001** (Low) — Q3's claimed
TeachSpark "whitespace/blue-ocean `PrototypeFrame`" doesn't exist as a rendered artifact (TeachSpark has
zero `type: "prototype"` artifacts; the 2×2 whitespace map is one sentence of prose, and the underlying
`disc-whitespace-quadrant.jpg` referenced in the trace table was never turned into a page artifact).
This does not fail Q3 — the `HypothesisCard` content independently answers "how I prioritize" — and no
image was fabricated to paper over it; the fix (rendering that image as a `PrototypeFrame`) is named as
future, out-of-scope work.

Full per-question evidence (quotes, chapter placements, the docs/trace cross-references) is in
`evals/results/eval-003-bda8555.md` — not duplicated here.

## Verification (all green)

| Gate | Result |
|---|---|
| `pnpm typecheck` | ✅ pass |
| `pnpm lint` | ✅ pass |
| `pnpm test` (unit) | ✅ 188 passed / 1 skipped |
| `pnpm build` | ✅ all routes static |
| `pnpm eval --only EVAL-003,EVAL-011,EVAL-013` | ✅ 2 pass (EVAL-011, EVAL-013) · 0 fail · 1 manual (EVAL-003, by design) · `criticalFailures: []` · `regressions: []` — `evals/results/eval-run-0.2.0-bda8555-2.json` |

**One transient flake, diagnosed and cleared:** the first `pnpm eval` attempt
(`eval-run-0.2.0-bda8555.json`) reported `EVAL-011 FAIL` on a single cached external-link check —
`crawler.ts`'s `checkExternal()` classifies a fetch *timeout* to `github.com/007U5H4R` as `dead`
unconditionally (its bot-block WARN path only covers a completed 403/429 response, not a timed-out
request). A direct `curl` to the same URL from this host returned `200` in well under a second, and the
two immediately-preceding tickets (TKT-32, TKT-33, TKT-54) all ran this exact same GitHub link through
`pnpm eval` cleanly, so this was a one-off network hiccup, not a regression from this ticket's docs-only
change. Re-running once (single retry, changed hypothesis: transient network condition, not blind
repetition) came back clean — `evals/results/eval-run-0.2.0-bda8555-2.json`, 0 fail. **Not fixed:** the
crawler's timeout-vs-bot-block classification gap is real but out of TKT-39's Docs/sp:1 scope; noting it
here rather than silently patching `tests/e2e/crawler.ts` (scope discipline). Both eval-run JSONs are
present under `evals/results/` per the brief's "leave unstaged" rule.

## Blockers

**None** for TKT-39's own scope. **QA-001** is logged as a real but non-blocking finding (see above);
the human-in-the-loop confirmation named in TC-093's "Expected" (Tushar reads the three pages once,
confirms EVAL-003) is still open, as it was before this ticket — TKT-39 supplies the verified evidence
for that confirmation, it doesn't substitute for it.

## `git diff --stat` (staged content, excludes eval-run json)

```
 evals/results/eval-003-bda8555.md | (new)
 docs/reports/TKT-39.md            | (new)
 test-cases.md                     | Appendix D verified + TC-093 status
```
