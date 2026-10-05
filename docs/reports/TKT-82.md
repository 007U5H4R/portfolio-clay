# TKT-82 (TASK-77) — What I learned + Sources (S18) — implementer report

Branch `m009/tkt-82` · model Opus 5.5 (standard tier) · 2026-09-25.

## AC checklist
| AC | Status | Evidence |
|---|---|---|
| 1 · teachspark shows `learnings[]` verbatim; `[]` → no section | ✅ | TC-157 unit (`tests/unit/case-study-learnings.test.tsx`, 5 tests incl. negative control + teachspark data) · e2e `case-study-learned.spec.ts` (each of 4 strings once in rendered text, `getByText(exact)` = 1; `/work/tegaki` has no `section.learned`) at w390 + w1440 |
| 2 · Sources: unique labels once, link only for a public URL, byte-equal labels | ✅ | TC-158 unit (`tests/unit/case-study-sources.test.ts`, 6 tests: de-dup + first-appearance order, label === `sources[].label`, `href` iff `url`, every real project checked, `ref` never rendered) · e2e: teachspark 10 rows / 0 links; railcite exactly 1 link → `https://railcite.vercel.app` |
| 3 · EVAL-018: learned 1 (`torn`), sources 0 | ✅ | unit asserts `section.learned` owns exactly `[data-decor="torn"]` as first child and `<Sources>` markup has no `data-decor`; e2e asserts both counts; `eval-018.spec.ts` green on all `/work/*` slugs |
| 4 · crawler: source links resolve | ✅ | the only link (RailCite) was already crawled via `SourceCaption`; `pnpm eval --only EVAL-011,EVAL-013,EVAL-018` → 3 pass · 0 fail (`evals/results/tkt-82-gate.json`, git-ignored, local only) |
| 5 · regression tests named TCs, green | ✅ | TC-157 + TC-158 as above |

## Files changed
- new `lib/sources.ts` — `projectSources(project)`: metrics[].source → chapter artifact `source` (+ metric artifact's `metric.source`), de-duplicated by id, first-appearance order; `href` only when the `SourceRef` has `url`.
- new `components/case-study/Learnings.tsx` — `section.learned`, `TornEdge fill="paper-2"` first child, grid `1fr 1.35fr`, notebook `Sheet` + `<ol>`, numerals `<Hand kind="label">01</Hand>`; `null` for `[]`.
- new `components/case-study/Sources.tsx` — `section.sources`, dashed rule, h2 "Where every line on this page comes from", 2-col `<ol>`, `ExternalLink` for URL sources; `null` when nothing is cited.
- new tests: `tests/unit/case-study-learnings.test.tsx`, `tests/unit/case-study-sources.test.ts`, `tests/e2e/case-study-learned.spec.ts`.
- `app/work/[slug]/page.tsx` — 3 imports + 3 JSX lines (see merge notes).

## Shared-file edits
`app/globals.css` — one appended block `/* TKT-82 · learned + sources … */ … /* end TKT-82 */` (an `@layer components` block for `.learned*` / `.sources*` plus one unlayered rule `.sources-list a[data-inline-link] { color: var(--color-terracotta) }`). Tokens only.

## Deviations (flag for Stage 8)
- **Sources link colour is terracotta, not rust**: rust on paper-2 measured 4.3:1 (axe serious on `/work/railcite`, caught by the gate); terracotta clears AA. Unlayered so it beats `ExternalLink`'s `text-rust` utility.
- **Sources list at 14 px** (mockup 13.5) for the EVAL-008 floor; list counters are Inter `::marker`s, not Caveat pseudo-content.
- **Mockup's sticky ("not on the live site yet") and hand aside ("twelve labels, one live link") not built** — §3.3 budget learned 1 · sources 0, and the aside would exceed the 3-word hand-label limit.
- **Help line** is "From the project file, kept short enough to remember." (mockup's "Four lines from…" hard-codes a count that differs per project).
- **teachspark lists 10 sources, mockup shows 12**: the plan derives from what the page cites (metrics + artifacts); two declared SourceRefs (incl. the Railway live-pilot URL) aren't cited by any metric/artifact/thinking node, so they are not listed. Thinking-chain sources add nothing beyond metrics+artifacts on any slug today.
- Sources is omitted when the page cites nothing (4 thin slugs with no metrics/artifacts: token-toli, pratyasa, tegaki, dino-arcade-pwa; cinematic-portfolio shows 1). Learnings render on 9 of 11 slugs (tegaki and dino-arcade-pwa have `[]`).
- The page now has both chapter 08 "What I learned" (deep dive) and the new `section.learned` h2 "What I learned" — as Design §7.3 specifies; worth a look at Stage 8 for duplicate heading names.

## Gate outputs
Run 1 (locked): typecheck ✗ (my spec called `noOverflow()` without `page` — fixed) · lint 0 · tokens 13/13 · vitest 52 files / 480 passed, 2 skipped · build ✓ all routes static (13) · e2e (case-study-learned + case-study + eval-018, w390+w1440) 108 passed / 4 failed / 10 skipped — failures: my spec counted the RSC flight payload in `textContent` (fixed → `innerText` + `getByText(exact)`), railcite axe contrast (fixed, above) · eval `--only EVAL-011,EVAL-013,EVAL-018` → 3 pass · 0 fail.
Run 2 (fix re-run, locked): typecheck 0 · lint 0 · build ✓ all routes static (13) · e2e (same 3 specs, w390+w1440) **112 passed / 0 failed** / 10 skipped (skips are the pre-existing `/dev/primitives` + positive-control cases gated off in prod builds).

## Merge notes
- `app/work/[slug]/page.tsx` (TKT-81/83 own the structure): my edit is 3 imports under `// TKT-82 · …` after the `NextProject` import, and between `</Container>` and `<NextProject>` a `{/* TKT-82 · §7.3 order … */}` … `{/* end TKT-82 */}` block with `<Learnings learnings={project.learnings} />` and `<Sources sources={projectSources(project)} />`. On merge keep that block after the deep dive and before next-project.
- New e2e file `tests/e2e/case-study-learned.spec.ts` (instead of editing TKT-81's `case-study.spec.ts`); its order check accepts either the current `a[aria-label^="Next project"]` or TKT-81's `section.next`.
- No screenshots taken (orchestrator's Phase-B sweep, TKT-85).
